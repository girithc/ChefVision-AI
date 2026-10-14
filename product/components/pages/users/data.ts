export type UserStatus = "Active" | "Invited" | "Suspended";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: UserStatus;
  lastActive: string;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  /** System roles can't be deleted. */
  system: boolean;
  permissions: string[];
};

export type PermissionGroup = {
  category: string;
  permissions: Array<{ id: string; label: string }>;
};

export const permissionGroups: PermissionGroup[] = [
  {
    category: "Inventory",
    permissions: [
      { id: "inventory.view", label: "View stock & counts" },
      { id: "inventory.edit", label: "Edit stock & perform counts" },
      { id: "inventory.waste", label: "Approve waste & variances" },
    ],
  },
  {
    category: "Invoices & Purchases",
    permissions: [
      { id: "purchases.view", label: "View invoices & prices" },
      { id: "purchases.upload", label: "Upload & extract invoices" },
      { id: "purchases.match", label: "Confirm ingredient matches" },
      { id: "purchases.po", label: "Send purchase orders" },
    ],
  },
  {
    category: "Recipes",
    permissions: [
      { id: "recipes.view", label: "View recipes & costs" },
      { id: "recipes.edit", label: "Edit recipes & portions" },
      { id: "recipes.price", label: "Set menu prices" },
    ],
  },
  {
    category: "Checklists & SOPs",
    permissions: [
      { id: "checklists.complete", label: "Complete checklists" },
      { id: "checklists.manage", label: "Manage SOPs & schedules" },
    ],
  },
  {
    category: "Equipment",
    permissions: [
      { id: "equipment.view", label: "View equipment & sensors" },
      { id: "equipment.report", label: "Report breakdowns" },
      { id: "equipment.manage", label: "Manage work orders" },
    ],
  },
  {
    category: "Reports",
    permissions: [
      { id: "reports.view", label: "View financial reports" },
      { id: "reports.export", label: "Export to accounting" },
    ],
  },
  {
    category: "Administration",
    permissions: [
      { id: "admin.users", label: "Invite & manage users" },
      { id: "admin.roles", label: "Define roles & permissions" },
      { id: "admin.settings", label: "Edit restaurant settings" },
    ],
  },
];

export const initialRoles: Role[] = [
  {
    id: "owner",
    name: "Owner / Admin",
    description: "Full access to every module, billing, and user management.",
    system: true,
    permissions: permissionGroups.flatMap((group) => group.permissions.map((permission) => permission.id)),
  },
  {
    id: "manager",
    name: "General Manager",
    description: "Runs day-to-day operations; no admin-level access.",
    system: true,
    permissions: [
      "inventory.view", "inventory.edit", "inventory.waste",
      "purchases.view", "purchases.upload", "purchases.match", "purchases.po",
      "recipes.view", "recipes.price",
      "checklists.complete", "checklists.manage",
      "equipment.view", "equipment.report", "equipment.manage",
      "reports.view",
    ],
  },
  {
    id: "chef",
    name: "Chef / Kitchen Lead",
    description: "Owns recipes, counts, and kitchen workflows.",
    system: true,
    permissions: [
      "inventory.view", "inventory.edit", "inventory.waste",
      "purchases.view", "purchases.match",
      "recipes.view", "recipes.edit",
      "checklists.complete", "checklists.manage",
      "equipment.view", "equipment.report",
    ],
  },
  {
    id: "line-cook",
    name: "Line Cook",
    description: "Completes checklists and views stock.",
    system: true,
    permissions: ["inventory.view", "checklists.complete", "equipment.report"],
  },
  {
    id: "accountant",
    name: "Accountant",
    description: "Reads invoices and financial reporting; exports to accounting.",
    system: false,
    permissions: ["purchases.view", "reports.view", "reports.export"],
  },
];

export const initialUsers: UserRow[] = [
  { id: "u1", name: "Marianne Cole", email: "marianne@chefvision.ai", roleId: "owner", status: "Active", lastActive: "Online now" },
  { id: "u2", name: "Dario Ferrari", email: "dario@chefvision.ai", roleId: "chef", status: "Active", lastActive: "12 min ago" },
  { id: "u3", name: "Priya Nair", email: "priya@chefvision.ai", roleId: "manager", status: "Active", lastActive: "1 hr ago" },
  { id: "u4", name: "Tom Okafor", email: "tom@chefvision.ai", roleId: "line-cook", status: "Active", lastActive: "Yesterday" },
  { id: "u5", name: "Elena Petrova", email: "elena@books.io", roleId: "accountant", status: "Invited", lastActive: "—" },
  { id: "u6", name: "Josh Rivera", email: "josh.r@oldmail.com", roleId: "line-cook", status: "Suspended", lastActive: "3 weeks ago" },
];
