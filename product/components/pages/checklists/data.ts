export type CheckKind = "check" | "photo" | "temperature";

export type Frequency = "daily" | "weekly" | "monthly";

export type Sop = {
  title: string;
  steps: string[];
};

export type ChecklistItem = {
  id: string;
  label: string;
  kind: CheckKind;
  hint?: string;
  /** SOP that explains how to perform this check, viewable from the item. */
  sop?: Sop;
  /** Describes the required standard shown as the reference photo. */
  reference?: string;
};

export type Checklist = {
  id: string;
  title: string;
  frequency: Frequency;
  due: string;
  /** Outlet, department, and shift make checklists custom per place and time. */
  outlet: string;
  department: "Kitchen" | "Front of House" | "Facilities" | "Safety";
  shift: string;
  reminder: string;
  overdue?: boolean;
  items: ChecklistItem[];
};

export const checklists: Checklist[] = [
  {
    id: "daily-opening-kitchen",
    title: "Kitchen Opening",
    frequency: "daily",
    due: "Every day · 7:00 AM",
    outlet: "Downtown",
    department: "Kitchen",
    shift: "Opening",
    reminder: "Reminder 7:00 AM daily",
    items: [
      {
        id: "ok-1",
        label: "Walk-in cooler temperature",
        kind: "temperature",
        hint: "Target: 35–38°F",
        sop: {
          title: "Logging walk-in temperature",
          steps: [
            "Open the walk-in door and let the thermometer settle for 30 seconds.",
            "Read the built-in display or place the probe in a glass of water for the air-average reading.",
            "Record the reading in this check. Anything above 38°F twice in a row: notify the manager.",
          ],
        },
      },
      {
        id: "ok-2",
        label: "Freezer temperature",
        kind: "temperature",
        hint: "Target: 0°F or below",
        sop: {
          title: "Logging freezer temperature",
          steps: [
            "Read the external display — do not open the door to check.",
            "Log the reading. Above 10°F: do not restock until verified by a manager.",
          ],
        },
      },
      {
        id: "ok-3",
        label: "Sanitizer buckets at stations",
        kind: "check",
        hint: "200ppm chlorine or per label",
        sop: {
          title: "Mixing sanitizer buckets",
          steps: [
            "Fill the red bucket with clean hot water to the fill line.",
            "Add sanitizer per the label dose and stir 5 times.",
            "Test with a strip — it must read 150–300ppm. Replace every 2 hours or when dirty.",
          ],
        },
      },
      { id: "ok-4", label: "Handwash stations stocked", kind: "check", hint: "Soap + paper towels" },
      { id: "ok-5", label: "Prep surfaces cleaned & sanitized", kind: "check" },
      { id: "ok-6", label: "Smallwares and containers restocked", kind: "check" },
    ],
  },
  {
    id: "daily-opening-foh",
    title: "Front of House Opening",
    frequency: "daily",
    due: "Every day · 8:00 AM",
    outlet: "Downtown",
    department: "Front of House",
    shift: "Opening",
    reminder: "Reminder 8:00 AM daily",
    items: [
      { id: "of-1", label: "Dining room floors and tables", kind: "check" },
      { id: "of-2", label: "POS system on and logged in", kind: "check" },
      { id: "of-3", label: "Beverage station fully stocked", kind: "check" },
      { id: "of-4", label: "Restrooms clean and stocked", kind: "check" },
      { id: "of-5", label: "Lighting and music set for service", kind: "check" },
    ],
  },
  {
    id: "daily-closing-kitchen",
    title: "Kitchen Closing",
    frequency: "daily",
    due: "Every day · 11:00 PM",
    outlet: "Downtown",
    department: "Kitchen",
    shift: "Closing",
    reminder: "Reminder 10:45 PM daily",
    items: [
      { id: "ck-1", label: "Fryers off and filtered", kind: "check" },
      { id: "ck-2", label: "Flat-top griddle cleaned", kind: "check" },
      {
        id: "ck-3",
        label: "Walk-in shelves labeled and organized",
        kind: "photo",
        hint: "Photo of labeled shelves",
        reference: "Shelves labeled with product + date, oldest in front (FIFO).",
        sop: {
          title: "Labeling and FIFO rotation",
          steps: [
            "Every container gets a label with product name and prep date.",
            "Place older product in front of newer product on every shelf.",
            "Remove anything past its use-by date before taking the photo.",
          ],
        },
      },
      { id: "ck-4", label: "Dish pit drained and cleaned", kind: "check" },
      {
        id: "ck-5",
        label: "Final temperature log reading",
        kind: "temperature",
        hint: "Target: 35–38°F",
      },
    ],
  },
  {
    id: "daily-closing-foh",
    title: "Front of House Closing",
    frequency: "daily",
    due: "Every day · 11:30 PM",
    outlet: "Downtown",
    department: "Front of House",
    shift: "Closing",
    reminder: "Reminder 11:15 PM daily",
    items: [
      { id: "cf-1", label: "Cash drawer counted and dropped", kind: "check" },
      { id: "cf-2", label: "Chairs up and floors mopped", kind: "check" },
      { id: "cf-3", label: "Beverage station broken down", kind: "check" },
      { id: "cf-4", label: "Lock up and arm alarm", kind: "check" },
    ],
  },
  {
    id: "daily-haccp",
    title: "Food Safety — HACCP Checks",
    frequency: "daily",
    due: "Every day · before lunch service",
    outlet: "All outlets",
    department: "Kitchen",
    shift: "All shifts",
    reminder: "Reminder 10:30 AM daily",
    items: [
      {
        id: "hh-1",
        label: "Hot holding — soups & sauces",
        kind: "temperature",
        hint: "Target: 135°F or above",
        sop: {
          title: "Hot holding check",
          steps: [
            "Stir the product, then probe the center.",
            "Below 135°F: reheat to 165°F once, or discard if held hot over 2 hours.",
          ],
        },
      },
      {
        id: "hh-2",
        label: "Cold holding — salad & prep line",
        kind: "temperature",
        hint: "Target: 41°F or below",
      },
      {
        id: "hh-3",
        label: "Cooked protein final cook temps",
        kind: "temperature",
        hint: "Chicken 165°F · Ground beef 155°F · Fish 145°F",
        sop: {
          title: "Final cook temperature",
          steps: [
            "Probe the thickest part of the protein, away from bone.",
            "Clean and sanitize the probe between products.",
            "Log each protein's final temp before it leaves the line.",
          ],
        },
      },
      { id: "hh-4", label: "Date labeling on all prep containers", kind: "check" },
      { id: "hh-5", label: "Thermometer calibration (ice bath)", kind: "check", hint: "Should read 32°F" },
    ],
  },
  {
    id: "daily-temps",
    title: "Chiller & Freezer Temperature Log",
    frequency: "daily",
    due: "Every day · 3 times (9 AM / 2 PM / 9 PM)",
    outlet: "All outlets",
    department: "Facilities",
    shift: "All shifts",
    reminder: "Reminder at 9:00 AM, 2:00 PM, 9:00 PM",
    items: [
      { id: "tl-1", label: "Main chiller (morning reading)", kind: "temperature", hint: "Target: 35–38°F" },
      { id: "tl-2", label: "Main freezer (morning reading)", kind: "temperature", hint: "Target: 0°F or below" },
      { id: "tl-3", label: "Dairy reach-in", kind: "temperature", hint: "Target: 36–40°F" },
      { id: "tl-4", label: "Prep line lowboys", kind: "temperature", hint: "Target: 38–41°F" },
    ],
  },
  {
    id: "weekly-walkin",
    title: "Deep Clean — Walk-in Cooler",
    frequency: "weekly",
    due: "Every Sunday",
    outlet: "Downtown",
    department: "Kitchen",
    shift: "All shifts",
    reminder: "Reminder Sunday 8:00 AM",
    overdue: true,
    items: [
      { id: "ww-1", label: "Shelves emptied, cleaned, sanitized", kind: "check" },
      {
        id: "ww-2",
        label: "Clean shelves restocked FIFO",
        kind: "photo",
        hint: "Photo after restock",
        reference: "All containers labeled with date, oldest in front, no items on the floor.",
      },
      { id: "ww-3", label: "Floor drain flushed", kind: "check" },
      { id: "ww-4", label: "Door gaskets wiped", kind: "check" },
    ],
  },
  {
    id: "weekly-cleaning",
    title: "Cleaning & Sanitation Schedule",
    frequency: "weekly",
    due: "Every Wednesday",
    outlet: "All outlets",
    department: "Facilities",
    shift: "All shifts",
    reminder: "Reminder Wednesday 7:00 AM",
    items: [
      {
        id: "wc-1",
        label: "Hood and filter degrease",
        kind: "photo",
        hint: "Photo of clean filters",
        reference: "Filters free of grease build-up, light passes through evenly.",
      },
      { id: "wc-2", label: "Under-equipment floor cleaning", kind: "check" },
      { id: "wc-3", label: "Walls and splash zones wiped", kind: "check" },
      { id: "wc-4", label: "Mop heads laundered or replaced", kind: "check" },
    ],
  },
  {
    id: "weekly-equipment",
    title: "Equipment Maintenance Walk",
    frequency: "weekly",
    due: "Every Monday",
    outlet: "Downtown",
    department: "Facilities",
    shift: "Opening",
    reminder: "Reminder Monday 9:00 AM",
    items: [
      { id: "we-1", label: "Reach-in gaskets and hinges checked", kind: "check" },
      { id: "we-2", label: "Thermostats verified", kind: "temperature", hint: "Compare vs digital probe" },
      { id: "we-3", label: "Chemical inventory restocked", kind: "check" },
    ],
  },
  {
    id: "monthly-pest",
    title: "Pest Control Inspection",
    frequency: "monthly",
    due: "First week of the month",
    outlet: "All outlets",
    department: "Safety",
    shift: "All shifts",
    reminder: "Reminder on the 1st",
    items: [
      { id: "mp-1", label: "Vendor report reviewed and filed", kind: "check" },
      {
        id: "mp-2",
        label: "Trap stations inspected",
        kind: "photo",
        hint: "Photo of each station",
        reference: "Stations intact, sealed, and tagged with the last service date.",
      },
      { id: "mp-3", label: "Entry points sealed", kind: "check" },
    ],
  },
  {
    id: "monthly-safety",
    title: "Fire Safety & Emergency Check",
    frequency: "monthly",
    due: "Second week of the month",
    outlet: "All outlets",
    department: "Safety",
    shift: "All shifts",
    reminder: "Reminder on the 8th",
    items: [
      {
        id: "ms-1",
        label: "Extinguishers inspected and tagged",
        kind: "photo",
        hint: "Photo of gauge in the green zone",
        reference: "Gauge needle in the green zone, pin intact, tag current.",
      },
      { id: "ms-2", label: "Emergency exits clear and lit", kind: "check" },
      { id: "ms-3", label: "First aid kit restocked", kind: "check" },
    ],
  },
  {
    id: "monthly-ice",
    title: "Ice Machine Sanitize",
    frequency: "monthly",
    due: "Third week of the month",
    outlet: "Downtown",
    department: "Kitchen",
    shift: "Opening",
    reminder: "Reminder on the 15th",
    items: [
      {
        id: "mi-1",
        label: "Interior sanitized",
        kind: "photo",
        hint: "Photo after sanitize cycle",
        reference: "No scale or slime, scoop stored outside the bin, interior dry.",
      },
      { id: "mi-2", label: "Water filter replaced", kind: "check" },
      { id: "mi-3", label: "First batch discarded", kind: "check" },
    ],
  },
];
