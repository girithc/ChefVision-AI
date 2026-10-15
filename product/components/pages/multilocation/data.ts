export type HealthTrend = "up" | "down" | "flat";

export type LocationHealth = {
  name: string;
  region: string;
  score: number;
  trend: HealthTrend;
  sales: number;
  foodPct: number;
  laborPct: number;
  checklistCompletion: number;
  overdueChecklists: number;
  openIssues: number;
};

export type RecurringProblem = {
  id: string;
  problem: string;
  locations: string[];
  occurrences: number;
  lastSeen: string;
};

export type IssueStatus = "Open" | "Due soon" | "Overdue" | "Escalated" | "Closed";

export type Issue = {
  id: string;
  title: string;
  location: string;
  owner: string;
  dueDate: string;
  status: IssueStatus;
  reminder: string;
  recurring: boolean;
  closedAt?: string;
};

export type ChatChannel = { name: string; kind: string; connected: boolean; detail: string };

export type PosConnection = { name: string; mode: string; connected: boolean; detail: string };

export const locationHealth: LocationHealth[] = [
  { name: "Downtown", region: "West", score: 88, trend: "up", sales: 87130, foodPct: 31.4, laborPct: 29.0, checklistCompletion: 96, overdueChecklists: 1, openIssues: 2 },
  { name: "Riverside", region: "West", score: 93, trend: "up", sales: 62300, foodPct: 30.2, laborPct: 27.4, checklistCompletion: 98, overdueChecklists: 0, openIssues: 0 },
  { name: "Airport (licensed)", region: "Travel", score: 71, trend: "down", sales: 44890, foodPct: 34.8, laborPct: 31.2, checklistCompletion: 84, overdueChecklists: 3, openIssues: 4 },
];

export const recurringProblems: RecurringProblem[] = [
  { id: "rp1", problem: "Walk-in temperature breach", locations: ["Downtown", "Airport (licensed)"], occurrences: 7, lastSeen: "Today" },
  { id: "rp2", problem: "Late invoice entry (>24h)", locations: ["Downtown", "Riverside", "Airport (licensed)"], occurrences: 11, lastSeen: "2 days ago" },
  { id: "rp3", problem: "Closing checklist skipped on Sundays", locations: ["Airport (licensed)"], occurrences: 4, lastSeen: "Yesterday" },
];

export const initialIssues: Issue[] = [
  { id: "ISS-201", title: "Re-train AM crew on FIFO labeling", location: "Downtown", owner: "Dario Ferrari", dueDate: "Oct 16", status: "Due soon", reminder: "Daily 8:00 AM", recurring: true },
  { id: "ISS-198", title: "Replace ice machine water pump", location: "Downtown", owner: "Marco (Maintenance)", dueDate: "Oct 15", status: "Escalated", reminder: "Every 6h", recurring: false },
  { id: "ISS-195", title: "Fix recurring Sunday closing gap", location: "Airport (licensed)", owner: "Priya Nair", dueDate: "Oct 20", status: "Open", reminder: "Weekly Mon 9:00 AM", recurring: true },
  { id: "ISS-190", title: "Over-portioning on fish tacos — re-card recipe", location: "Riverside", owner: "Dario Ferrari", dueDate: "Oct 10", status: "Closed", reminder: "—", recurring: true, closedAt: "Oct 11" },
  { id: "ISS-188", title: "Negotiate chicken price with 2nd supplier", location: "Company-wide", owner: "Marianne Cole", dueDate: "Oct 18", status: "Open", reminder: "Weekly Mon 9:00 AM", recurring: false },
];

export const weeklyReport = {
  week: "Oct 6–12",
  sections: [
    { title: "Sales", lines: ["Company: $187.3k (+4.1% WoW, +16.2% YoY)", "Downtown led growth; Saturday dipped 3.8% (weather)"] },
    { title: "Food cost", lines: ["Blended 31.9% (target ≤ 32%)", "Chicken +8% and romaine +9.6% were the drivers"] },
    { title: "Labor", lines: ["29.1% of sales — on budget", "Airport overtime is the watch item"] },
    { title: "Operations", lines: ["Checklist completion 96% / 98% / 84%", "2 overdue checklists at Airport; ice machine WO escalated"] },
  ],
};

export const chatChannels: ChatChannel[] = [
  { name: "Slack", kind: "Chat", connected: true, detail: "#chefvision-bot — ask costs, stock, checklists" },
  { name: "Microsoft Teams", kind: "Chat", connected: false, detail: "Bot framework available" },
  { name: "WhatsApp Business", kind: "Messaging", connected: false, detail: "For manager alerts + Q&A" },
];

export const posConnections: PosConnection[] = [
  { name: "Toast POS", mode: "Read-only", connected: true, detail: "Sales, covers, PMIX — nightly pull. No writes." },
  { name: "Square", mode: "Read-only", connected: false, detail: "Available — sales + tender data." },
];
