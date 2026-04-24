import sys
import json
import re
from statistics import mean
from datetime import datetime

import cv2
import pytesseract
pytesseract.pytesseract.tesseract_cmd = r'/opt/homebrew/bin/tesseract'
from PIL import Image
from dateutil import parser as date_parser


def preprocess_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError("Could not open image")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    blur = cv2.GaussianBlur(gray, (3, 3), 0)
    processed = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return processed


def run_ocr(image):
    rgb = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    data = pytesseract.image_to_data(
        rgb,
        output_type=pytesseract.Output.DICT,
        config="--oem 3 --psm 6"
    )
    return data


def clean_text(s):
    return re.sub(r"\s+", " ", s).strip()


def build_lines(data):
    rows = {}
    n = len(data["text"])

    for i in range(n):
        text = clean_text(data["text"][i])
        conf = data["conf"][i]

        if not text:
            continue

        try:
            conf = float(conf)
        except:
            conf = -1

        if conf < 0:
            continue

        key = (
            data["page_num"][i],
            data["block_num"][i],
            data["par_num"][i],
            data["line_num"][i]
        )

        rows.setdefault(key, []).append({
            "text": text,
            "conf": conf,
            "left": int(data["left"][i]),
            "top": int(data["top"][i])
        })

    lines = []
    for _, words in rows.items():
        words = sorted(words, key=lambda x: x["left"])
        line_text = " ".join(w["text"] for w in words)
        line_conf = mean(w["conf"] for w in words)
        avg_top = mean(w["top"] for w in words)
        min_left = min(w["left"] for w in words)

        lines.append({
            "text": clean_text(line_text),
            "confidence": round(line_conf / 100, 3),
            "top": avg_top,
            "left": min_left
        })

    lines.sort(key=lambda x: (x["top"], x["left"]))
    return lines


def parse_date(text):
    try:
        dt = date_parser.parse(text, fuzzy=True)
        if dt.year < 1950 or dt.year > 2100:
            return None
        return dt.strftime("%Y-%m-%d")
    except:
        return None


def parse_money(text):
    match = re.search(r"\$?\s*([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{2})?)", text)
    if not match:
        return None
    value = match.group(1).replace(",", "")
    try:
        return float(value)
    except:
        return None


def find_first(lines, patterns):
    for line in lines:
        t = line["text"]
        for pattern in patterns:
            m = re.search(pattern, t, re.IGNORECASE)
            if m:
                return {
                    "value": clean_text(m.group(1)) if m.lastindex else t,
                    "confidence": line["confidence"],
                    "source_text": t
                }
    return None

def normalize_vendor_text(text):
    text = text.lower()
    text = text.replace("¥", "y")
    text = text.replace("$", "s")
    text = text.replace("§", "s")
    text = re.sub(r"[^a-z0-9\s]", "", text)
    text = clean_text(text)
    return text

def extract_vendor(lines):
    vendor_aliases = {
        "sysco": "Sysco",
        "us foods": "US Foods",
        "gordon food service": "Gordon Food Service",
        "chefs warehouse": "The Chefs' Warehouse",
        "restaurant depot": "Restaurant Depot"
    }

    for line in lines[:8]:
        normalized = normalize_vendor_text(line["text"])

        if "good things come from sysco" in normalized:
            return {"value": "Sysco", "confidence": line["confidence"]}

        for alias, canonical in vendor_aliases.items():
            if alias in normalized:
                return {"value": canonical, "confidence": line["confidence"]}

    for line in lines[:8]:
        text = line["text"]
        normalized = normalize_vendor_text(text)

        if re.search(r"invoice|deliver to|bill to|ship to|date|terms", normalized, re.IGNORECASE):
            continue
        if re.search(r"\d{1,6}", text):
            continue
        if "good things come from" in normalized:
            continue
        if len(normalized) >= 3:
            return {"value": text, "confidence": line["confidence"]}

    if lines:
        return {"value": lines[0]["text"], "confidence": lines[0]["confidence"]}
    return {"value": None, "confidence": 0.0}


def extract_date(lines):
    date_pattern = r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})"

    for line in lines:
        text = line["text"]
        if re.search(r"\bdate[:\s]", text, re.IGNORECASE):
            match = re.search(date_pattern, text)
            if match:
                parsed = parse_date(match.group(1))
                if parsed:
                    return {"value": parsed, "confidence": line["confidence"]}

    for line in lines:
        match = re.search(date_pattern, line["text"])
        if match:
            parsed = parse_date(match.group(1))
            if parsed:
                return {"value": parsed, "confidence": line["confidence"]}

    return {"value": None, "confidence": 0.0}


def extract_invoice_number(lines):
    result = find_first(lines, [
        r"invoice[:\s#]*([A-Za-z0-9\-\/]+)",
        r"inv[:\s#]*([A-Za-z0-9\-\/]+)",
        r"#\s*([A-Za-z0-9\-\/]+)"
    ])
    if result:
        return {"value": result["value"], "confidence": result["confidence"]}
    return {"value": None, "confidence": 0.0}


def extract_money_field(lines, labels, prefer_last=False):
    matches = []

    for line in lines:
        text = line["text"]
        for label in labels:
            if re.search(label, text, re.IGNORECASE):
                money_pattern = r"\$?\s*([0-9]+(?:,[0-9]{3})*\.[0-9]{2})"
                money_matches = re.findall(money_pattern, text)

                if money_matches:
                    value_str = money_matches[-1].replace(",", "")
                    try:
                        value = float(value_str)
                        matches.append({
                            "value": value,
                            "confidence": line["confidence"]
                        })
                    except:
                        pass

    if matches:
        return matches[-1] if prefer_last else matches[0]

    return {"value": None, "confidence": 0.0}


def fix_ocr_errors(text):
    text = re.sub(r"(\d+)(LB|KG|OZ)\b", r"\1 \2", text, flags=re.IGNORECASE)
    text = re.sub(r"(\d+)([A-Z]{2,})\b", r"\1 \2", text)

    text = re.sub(r"\b(\d{1,3})1[8B]\b", r"\1 LB", text)
    text = re.sub(r"\b(\d{1,3})I[8B]\b", r"\1 LB", text, flags=re.IGNORECASE)
    text = re.sub(r"\b(\d{1,3})L[8B]\b", r"\1 LB", text, flags=re.IGNORECASE)

    text = re.sub(r"\b(\d{1,3})\s+1[8B]\b", r"\1 LB", text)
    text = re.sub(r"\b(\d{1,3})\s+I[8B]\b", r"\1 LB", text, flags=re.IGNORECASE)

    return text

def parse_line_item(text, confidence):
    text = fix_ocr_errors(text)
    text = clean_text(text)

    item_code_match = re.match(r"^(\d{4,6})\s+", text)
    item_code = item_code_match.group(1) if item_code_match else None

    money_matches = re.findall(r"\$?\s*([0-9]+\.[0-9]{2})", text)
    line_total = None
    if money_matches:
        line_total = float(money_matches[-1].replace("$", "").replace(",", ""))

    qty_unit_pattern = r"(\d+(?:\.\d+)?)\s*(LB|KG|OZ|CASE|EACH|EA|BOX|DOZEN|DOZ|PC|PCS|GAL|QT|PT)"
    qty_unit_matches = re.findall(qty_unit_pattern, text, re.IGNORECASE)

    weight_units = ["LB", "KG", "OZ", "GAL", "QT", "PT"]
    quantity = None
    unit = None

    for qty, unit_found in qty_unit_matches:
        if unit_found.upper() in weight_units:
            qty_value = float(qty)
            if 0.1 <= qty_value <= 500:
                quantity = qty_value
                unit = unit_found.upper()
                break

    if quantity is None and qty_unit_matches:
        qty, unit_found = qty_unit_matches[0]
        quantity = float(qty)
        unit = unit_found.upper()

    unit_price = None
    if quantity and line_total and quantity > 0:
        unit_price = round(line_total / quantity, 2)

    item_name = text

    if item_code:
        item_name = re.sub(r"^" + re.escape(item_code) + r"\s+", "", item_name)

    for qty, unit_found in qty_unit_matches:
        pattern = re.escape(f"{qty} {unit_found}") + r"|" + re.escape(f"{qty}{unit_found}")
        item_name = re.sub(pattern, "", item_name, flags=re.IGNORECASE)

    if money_matches:
        for price in money_matches:
            item_name = re.sub(r"\$?" + re.escape(price), "", item_name)

    item_name = re.sub(r"\b(case|each|ea|box|dozen|doz)\b", "", item_name, flags=re.IGNORECASE)
    item_name = clean_text(item_name)
    item_name = re.sub(r"^[^\w]+|[^\w]+$", "", item_name)

    if not item_name or len(item_name) < 2:
        if item_code:
            match = re.search(r"^" + re.escape(item_code) + r"\s+([A-Za-z\s]+)", text)
            if match:
                item_name = clean_text(match.group(1))

    return {
        "item_name": item_name,
        "quantity": quantity,
        "unit": unit,
        "unit_price": unit_price,
        "line_total": line_total,
        "confidence": confidence
    }


def extract_line_items(lines):
    items = []
    capture = False

    for line in lines:
        text = line["text"]

        if re.search(r"(item|description|product|qty|quantity|unit|amount)", text, re.IGNORECASE):
            capture = True
            continue

        if re.search(r"(subtotal|tax|total)", text, re.IGNORECASE):
            break

        if capture:
            has_item_code = re.match(r"^\d{4,6}\s+", text) is not None
            has_money = re.search(r"\$?\d+\.\d{2}", text) is not None
            has_letters = re.search(r"[A-Za-z]{2,}", text) is not None

            if (has_item_code or has_letters) and has_money:
                item = parse_line_item(text, line["confidence"])
                if item["item_name"]:
                    items.append(item)

    return items


def flag_fields(result):
    flagged = []

    for field in ["vendor", "date", "invoice_number", "subtotal", "tax", "total"]:
        if result[field]["value"] is None:
            flagged.append(field)
        elif result[field]["confidence"] < 0.6:
            flagged.append(field)

    if not result["line_items"]:
        flagged.append("line_items")

    for i, item in enumerate(result["line_items"]):
        if not item["item_name"]:
            flagged.append(f"line_items[{i}].item_name")
        if item["quantity"] is None:
            flagged.append(f"line_items[{i}].quantity")
        if item["unit"] is None:
            flagged.append(f"line_items[{i}].unit")
        if item["line_total"] is None:
            flagged.append(f"line_items[{i}].line_total")
        if item["confidence"] < 0.7:
            flagged.append(f"line_items[{i}]")

    return flagged


def extract_invoice(image_path):
    processed = preprocess_image(image_path)
    ocr_data = run_ocr(processed)
    lines = build_lines(ocr_data)

    result = {
        "vendor": extract_vendor(lines),
        "date": extract_date(lines),
        "invoice_number": extract_invoice_number(lines),
        "line_items": extract_line_items(lines),
        "subtotal": extract_money_field(lines, [r"\bsubtotal\b"]),
        "tax": extract_money_field(lines, [r"\btax\b", r"sales\s+tax"], prefer_last=True),
        "total": extract_money_field(lines, [r"\btotal\s+due\b", r"(?<!sub)\btotal\b"], prefer_last=True),
        "flagged_fields": []
    }

    result["flagged_fields"] = flag_fields(result)

    return {
        "status": "success",
        "image_path": image_path,
        "result": result,
        "ocr_text_lines": lines
    }


def main():
    if len(sys.argv) != 2:
        print("Usage: python ocr_invoice.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        output = extract_invoice(image_path)
        print(json.dumps(output, indent=2))
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": str(e)
        }, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()