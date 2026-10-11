from pathlib import Path
from uuid import uuid4

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def safe_upload_path(upload_dir: str, content_type: str | None) -> Path:
    suffix = ALLOWED_IMAGE_TYPES.get(content_type or "")
    if not suffix:
        raise ValueError("Only JPEG, PNG, and WebP images are supported")
    return Path(upload_dir) / f"{uuid4().hex}{suffix}"


async def write_limited_upload(upload, destination: Path, max_bytes: int) -> None:
    size = 0
    too_large = False
    with destination.open("wb") as buffer:
        while chunk := await upload.read(1024 * 1024):
            size += len(chunk)
            if size > max_bytes:
                too_large = True
                break
            buffer.write(chunk)
    if too_large:
        destination.unlink(missing_ok=True)
        raise OverflowError("Upload exceeds the configured size limit")
