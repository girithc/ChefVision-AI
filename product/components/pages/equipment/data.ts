export type AssetStatus = "Operational" | "Under repair" | "Retired";

export type WorkOrderStatus = "Open" | "Assigned" | "In progress" | "Awaiting parts" | "Resolved";

export type Priority = "Low" | "Medium" | "High" | "Urgent";

export type SensorState = "Normal" | "Warning" | "Alert";

export type SensorLog = { time: string; value: number };

export type SensorReading = {
  metric: string;
  reading: string;
  target: string;
  state: SensorState;
  updatedAt: string;
  unit: string;
  /** Readings over the last several hours, chronological. */
  logs: SensorLog[];
};

export type ServiceRecord = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  type: "Repair" | "Service" | "Inspection";
  summary: string;
  by: string;
  cost: number;
};

export type Asset = {
  id: string; // "EQ-001"
  name: string;
  category: string;
  location: string;
  model: string;
  serial: string;
  purchasedAt: string;
  status: AssetStatus;
  warranty: { provider: string; expires: string; coverage: string };
  contract?: { vendor: string; cadence: string; nextVisit: string; costPerYear: string };
  sensor?: SensorReading;
  preventive: { task: string; cadence: string; lastDone: string; nextDue: string }[];
  history: ServiceRecord[];
  breakdowns12mo: number;
};

export type WorkOrder = {
  id: string; // "WO-1051"
  assetId: string;
  title: string;
  priority: Priority;
  status: WorkOrderStatus;
  assignee: string;
  openedAt: string; // ISO
  deadline: string; // ISO
  notes?: string;
};

export const staff = [
  "Marco (Maintenance tech)",
  "Sarah (Facilities)",
  "GasTech Services (vendor)",
  "ColdFix Ltd (vendor)",
];

export const assets: Asset[] = [
  {
    id: "EQ-001",
    name: "Walk-in Cooler",
    category: "Refrigeration",
    location: "Main kitchen",
    model: "ColdLine CL-40",
    serial: "CL40-88213",
    purchasedAt: "Mar 2023",
    status: "Operational",
    warranty: { provider: "ColdLine", expires: "Mar 2026", coverage: "Parts + compressor" },
    contract: { vendor: "ColdFix Ltd", cadence: "Quarterly service", nextVisit: "2025-11-04", costPerYear: "$960/yr" },
    sensor: {
      metric: "Chiller temp", reading: "37.2°F", target: "35–38°F", state: "Normal", updatedAt: "Today 9:02 AM", unit: "°F",
      logs: [
        { time: "6:02 AM", value: 36.8 }, { time: "6:32 AM", value: 37.1 }, { time: "7:02 AM", value: 36.9 },
        { time: "7:32 AM", value: 37.0 }, { time: "8:02 AM", value: 37.4 }, { time: "9:02 AM", value: 37.2 },
      ],
    },
    preventive: [
      { task: "Condenser coil cleaning", cadence: "Monthly", lastDone: "2025-09-28", nextDue: "2025-10-28" },
      { task: "Gasket inspection", cadence: "Quarterly", lastDone: "2025-08-11", nextDue: "2025-11-04" },
    ],
    history: [
      { id: "S-31", date: "2025-08-30", type: "Service", summary: "Quarterly service, refrigerant top-up", by: "ColdFix Ltd", cost: 180 },
      { id: "S-19", date: "2025-05-12", type: "Service", summary: "Quarterly service, fan motor checked", by: "ColdFix Ltd", cost: 180 },
    ],
    breakdowns12mo: 0,
  },
  {
    id: "EQ-002",
    name: "Reach-in Freezer",
    category: "Refrigeration",
    location: "Main kitchen",
    model: "ColdLine FR-22",
    serial: "FR22-10974",
    purchasedAt: "Mar 2023",
    status: "Operational",
    warranty: { provider: "ColdLine", expires: "Mar 2026", coverage: "Parts + compressor" },
    contract: { vendor: "ColdFix Ltd", cadence: "Quarterly service", nextVisit: "2025-11-04", costPerYear: "$540/yr" },
    sensor: {
      metric: "Freezer temp", reading: "-3.1°F", target: "0°F or below", state: "Normal", updatedAt: "Today 9:02 AM", unit: "°F",
      logs: [
        { time: "6:02 AM", value: -2.8 }, { time: "7:02 AM", value: -3.0 }, { time: "8:02 AM", value: -3.2 },
        { time: "9:02 AM", value: -3.1 },
      ],
    },
    preventive: [
      { task: "Coil cleaning + defrost check", cadence: "Monthly", lastDone: "2025-09-28", nextDue: "2025-10-28" },
    ],
    history: [{ id: "S-27", date: "2025-08-30", type: "Service", summary: "Quarterly service", by: "ColdFix Ltd", cost: 135 }],
    breakdowns12mo: 0,
  },
  {
    id: "EQ-003",
    name: "6-Burner Gas Range",
    category: "Cooking",
    location: "Hot line",
    model: "FlamePro X6",
    serial: "FP6-55201",
    purchasedAt: "Jan 2021",
    status: "Operational",
    warranty: { provider: "FlamePro", expires: "Expired Jan 2023", coverage: "—" },
    sensor: undefined,
    preventive: [
      { task: "Burner + gas line inspection", cadence: "Quarterly", lastDone: "2025-07-14", nextDue: "2025-10-14" },
    ],
    history: [
      { id: "S-41", date: "2025-10-10", type: "Repair", summary: "Igniter replacement on burner 3", by: "GasTech Services", cost: 220 },
      { id: "S-38", date: "2025-06-18", type: "Repair", summary: "Thermocouple replacement", by: "GasTech Services", cost: 190 },
      { id: "S-30", date: "2025-03-02", type: "Repair", summary: "Oven thermostat failure", by: "GasTech Services", cost: 340 },
      { id: "S-22", date: "2024-12-09", type: "Repair", summary: "Burner valve replacement", by: "GasTech Services", cost: 260 },
      { id: "S-15", date: "2024-11-20", type: "Inspection", summary: "Annual gas safety inspection", by: "GasTech Services", cost: 120 },
    ],
    breakdowns12mo: 4,
  },
  {
    id: "EQ-004",
    name: "Combi Oven",
    category: "Cooking",
    location: "Hot line",
    model: "Unox Bakertop",
    serial: "UX-77410",
    purchasedAt: "Jun 2022",
    status: "Under repair",
    warranty: { provider: "Unox", expires: "Jun 2025", coverage: "Expired" },
    contract: { vendor: "GasTech Services", cadence: "Semi-annual service", nextVisit: "2025-12-02", costPerYear: "$780/yr" },
    sensor: undefined,
    preventive: [
      { task: "Door seal + gasket check", cadence: "Monthly", lastDone: "2025-09-05", nextDue: "2025-10-05" },
      { task: "Descaling cycle", cadence: "Quarterly", lastDone: "2025-08-02", nextDue: "2025-11-02" },
    ],
    history: [
      { id: "S-44", date: "2025-10-05", type: "Repair", summary: "Door gasket + hinge assembly (open)", by: "GasTech Services", cost: 310 },
      { id: "S-36", date: "2025-07-22", type: "Repair", summary: "Steam generator descale", by: "GasTech Services", cost: 240 },
    ],
    breakdowns12mo: 2,
  },
  {
    id: "EQ-005",
    name: "Hood Dish Machine",
    category: "Dishwashing",
    location: "Dish pit",
    model: "Hobart AM15",
    serial: "HB-33028",
    purchasedAt: "Feb 2022",
    status: "Operational",
    warranty: { provider: "Hobart", expires: "Feb 2027", coverage: "Parts + labor" },
    contract: { vendor: "Hobart Care", cadence: "Quarterly service", nextVisit: "2025-10-21", costPerYear: "$1,140/yr" },
    sensor: {
      metric: "Wash temp", reading: "141°F", target: "140–150°F", state: "Normal", updatedAt: "Today 8:47 AM", unit: "°F",
      logs: [
        { time: "6:47 AM", value: 142 }, { time: "7:17 AM", value: 140 }, { time: "7:47 AM", value: 141 },
        { time: "8:17 AM", value: 143 }, { time: "8:47 AM", value: 141 },
      ],
    },
    preventive: [
      { task: "Descale + rinse arm check", cadence: "Monthly", lastDone: "2025-09-20", nextDue: "2025-10-20" },
    ],
    history: [{ id: "S-39", date: "2025-09-20", type: "Repair", summary: "Rinse arm replacement", by: "Hobart Care", cost: 165 }],
    breakdowns12mo: 1,
  },
  {
    id: "EQ-006",
    name: "Espresso Machine (2-group)",
    category: "Coffee",
    location: "Bar",
    model: "La Marzocco Linea",
    serial: "LM-90112",
    purchasedAt: "Sep 2020",
    status: "Operational",
    warranty: { provider: "La Marzocco", expires: "Expired Sep 2022", coverage: "—" },
    preventive: [
      { task: "Descale + group gasket", cadence: "Monthly", lastDone: "2025-10-01", nextDue: "2025-11-01" },
    ],
    history: [
      { id: "S-35", date: "2025-09-02", type: "Repair", summary: "Steam wand valve descale + repair", by: "Marco", cost: 95 },
      { id: "S-24", date: "2025-04-14", type: "Repair", summary: "Pump pressure regulator replaced", by: "Marco", cost: 210 },
    ],
    breakdowns12mo: 2,
  },
  {
    id: "EQ-007",
    name: "Ice Machine",
    category: "Refrigeration",
    location: "Back of house",
    model: "Hoshizaki KM-520",
    serial: "HZ-61884",
    purchasedAt: "Jul 2019",
    status: "Operational",
    warranty: { provider: "Hoshizaki", expires: "Expired Jul 2022", coverage: "—" },
    sensor: {
      metric: "Water temp", reading: "44°F", target: "36–40°F", state: "Alert", updatedAt: "Today 7:55 AM", unit: "°F",
      logs: [
        { time: "5:55 AM", value: 40.2 }, { time: "6:25 AM", value: 41.0 }, { time: "6:55 AM", value: 42.4 },
        { time: "7:25 AM", value: 43.3 }, { time: "7:55 AM", value: 44.0 },
      ],
    },
    preventive: [
      { task: "Sanitize + filter change", cadence: "Monthly", lastDone: "2025-09-15", nextDue: "2025-10-15" },
    ],
    history: [
      { id: "S-43", date: "2025-09-28", type: "Repair", summary: "Water pump replacement (open, awaiting part)", by: "ColdFix Ltd", cost: 285 },
      { id: "S-33", date: "2025-05-30", type: "Repair", summary: "Float switch replacement", by: "ColdFix Ltd", cost: 150 },
      { id: "S-26", date: "2025-02-11", type: "Repair", summary: "Compressor relay replaced", by: "ColdFix Ltd", cost: 320 },
    ],
    breakdowns12mo: 3,
  },
  {
    id: "EQ-008",
    name: "HVAC Rooftop Unit",
    category: "HVAC",
    location: "Roof",
    model: "Trane Precedent",
    serial: "TR-20455",
    purchasedAt: "May 2020",
    status: "Operational",
    warranty: { provider: "Trane", expires: "Expired May 2023", coverage: "—" },
    contract: { vendor: "AirFlow Systems", cadence: "Annual service", nextVisit: "2026-03-15", costPerYear: "$620/yr" },
    sensor: {
      metric: "Return air temp", reading: "76°F", target: "70–74°F", state: "Warning", updatedAt: "Today 9:02 AM", unit: "°F",
      logs: [
        { time: "6:02 AM", value: 73.0 }, { time: "7:02 AM", value: 74.2 }, { time: "8:02 AM", value: 75.1 },
        { time: "9:02 AM", value: 76.0 },
      ],
    },
    preventive: [
      { task: "Filter replacement", cadence: "Quarterly", lastDone: "2025-09-30", nextDue: "2025-12-30" },
    ],
    history: [{ id: "S-29", date: "2025-03-15", type: "Service", summary: "Annual service + belt replacement", by: "AirFlow Systems", cost: 240 }],
    breakdowns12mo: 0,
  },
];

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isPast(iso: string) {
  return new Date(`${iso}T23:59:59`) < new Date();
}

/** Unresolved work orders past their deadline are escalated. */
export function isEscalated(workOrder: WorkOrder) {
  return workOrder.status !== "Resolved" && isPast(workOrder.deadline);
}

export const initialWorkOrders: WorkOrder[] = [
  {
    id: "WO-1051",
    assetId: "EQ-004",
    title: "Combi oven door gasket + hinge assembly",
    priority: "Urgent",
    status: "In progress",
    assignee: "GasTech Services (vendor)",
    openedAt: "2025-10-05",
    deadline: "2025-10-08",
    notes: "Oven unusable above 200°C — steam leaking from door.",
  },
  {
    id: "WO-1050",
    assetId: "EQ-003",
    title: "Igniter replacement, burner 3",
    priority: "High",
    status: "Assigned",
    assignee: "GasTech Services (vendor)",
    openedAt: "2025-10-10",
    deadline: "2025-10-14",
  },
  {
    id: "WO-1049",
    assetId: "EQ-007",
    title: "Ice machine water pump replacement",
    priority: "Medium",
    status: "Awaiting parts",
    assignee: "ColdFix Ltd (vendor)",
    openedAt: "2025-09-28",
    deadline: "2025-10-06",
    notes: "Pump on order — ETA Oct 15.",
  },
  {
    id: "WO-1048",
    assetId: "EQ-005",
    title: "Dish machine rinse arm replacement",
    priority: "Medium",
    status: "Resolved",
    assignee: "Hobart Care",
    openedAt: "2025-09-14",
    deadline: "2025-09-20",
  },
  {
    id: "WO-1047",
    assetId: "EQ-006",
    title: "Espresso steam wand descale",
    priority: "Low",
    status: "Resolved",
    assignee: "Marco (Maintenance tech)",
    openedAt: "2025-08-30",
    deadline: "2025-09-02",
  },
];
