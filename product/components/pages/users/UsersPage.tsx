"use client";

import { useState } from "react";
import { PageHeader } from "../../shared/ui";
import { initialRoles, initialUsers, type Role, type UserRow } from "./data";
import UserTable from "./users/UserTable";
import RolesPermissions from "./roles/RolesPermissions";

type Tab = "users" | "roles";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "users", label: "Users" },
  { id: "roles", label: "Roles & permissions" },
];

export default function UsersPage({ tab: tabProp, onTabChange }: { tab?: string; onTabChange?: (tab: string) => void }) {
  const [internalTab, setInternalTab] = useState<Tab>("users");
  const tab = (tabProp as Tab | undefined) ?? internalTab;
  const setTab = (next: Tab) => {
    setInternalTab(next);
    onTabChange?.(next);
  };
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoles[0]?.id ?? "");

  const userCounts = users.reduce<Record<string, number>>((counts, user) => {
    counts[user.roleId] = (counts[user.roleId] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & Permissions"
        action={
          <div role="group" className="inline-flex overflow-hidden rounded-lg border border-slate-200">
            {tabs.map((option, index) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTab(option.id)}
                className={`px-3.5 py-2 text-xs font-semibold transition-colors ${
                  index > 0 ? "border-l border-slate-200" : ""
                } ${tab === option.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      {tab === "users" && (
        <UserTable
          users={users}
          roles={roles}
          onRoleChange={(userId, roleId) =>
            setUsers((current) => current.map((user) => (user.id === userId ? { ...user, roleId } : user)))
          }
          onStatusToggle={(userId) =>
            setUsers((current) =>
              current.map((user) =>
                user.id === userId
                  ? { ...user, status: user.status === "Active" ? "Suspended" : "Active", lastActive: user.status === "Suspended" ? "Just now" : user.lastActive }
                  : user
              )
            )
          }
          onInvite={({ name, email, roleId }) =>
            setUsers((current) => [
              ...current,
              { id: `u-${Date.now()}`, name, email, roleId, status: "Invited", lastActive: "—" },
            ])
          }
        />
      )}

      {tab === "roles" && (
        <RolesPermissions
          roles={roles}
          selectedRoleId={selectedRoleId}
          onSelectRole={setSelectedRoleId}
          userCounts={userCounts}
          onTogglePermission={(roleId, permissionId) =>
            setRoles((current) =>
              current.map((role) =>
                role.id === roleId
                  ? {
                      ...role,
                      permissions: role.permissions.includes(permissionId)
                        ? role.permissions.filter((id) => id !== permissionId)
                        : [...role.permissions, permissionId],
                    }
                  : role
              )
            )
          }
          onCreateRole={(name, description) => {
            const newRoleId = `role-${Date.now()}`;
            setRoles((current) => [...current, { id: newRoleId, name, description, system: false, permissions: [] }]);
            setSelectedRoleId(newRoleId);
          }}
        />
      )}
    </div>
  );
}
