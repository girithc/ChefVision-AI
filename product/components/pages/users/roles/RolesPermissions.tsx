"use client";

import { useState } from "react";
import { KeyRound, Lock, Plus } from "lucide-react";
import { permissionGroups, type Role } from "../data";

type RolesPermissionsProps = {
  roles: Role[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
  userCounts: Record<string, number>;
  onTogglePermission: (roleId: string, permissionId: string) => void;
  onCreateRole: (name: string, description: string) => void;
};

export default function RolesPermissions({
  roles,
  selectedRoleId,
  onSelectRole,
  userCounts,
  onTogglePermission,
  onCreateRole,
}: RolesPermissionsProps) {
  const [newRoleName, setNewRoleName] = useState("");
  const [creating, setCreating] = useState(false);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center gap-2 pb-3">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors ${
                selectedRole?.id === role.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {role.name}
              <span className="ml-1.5 text-slate-400">{userCounts[role.id] ?? 0}</span>
            </button>
          ))}

          {creating ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Role name (e.g. Sous chef)"
                value={newRoleName}
                onChange={(event) => setNewRoleName(event.target.value)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] text-slate-700 outline-none focus:border-slate-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newRoleName.trim()) return;
                  onCreateRole(newRoleName.trim(), "Custom role — assign permissions below.");
                  setNewRoleName("");
                  setCreating(false);
                }}
                disabled={!newRoleName.trim()}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-slate-800 disabled:opacity-40"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreating(true)}
              aria-label="New role"
              title="New role"
              className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>

        {selectedRole && (
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  {selectedRole.name}
                  {selectedRole.system && (
                    <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      <Lock className="h-2.5 w-2.5" />
                      System
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">{selectedRole.description}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <KeyRound className="h-3.5 w-3.5" />
                {selectedRole.permissions.length} of {permissionGroups.reduce((sum, group) => sum + group.permissions.length, 0)} permissions
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {permissionGroups.map((group) => (
                <section key={group.category} className="rounded-xl border border-slate-100 p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{group.category}</div>
                  <div className="mt-2 space-y-2">
                    {group.permissions.map((permission) => {
                      const enabled = selectedRole.permissions.includes(permission.id);
                      return (
                        <button
                          key={permission.id}
                          type="button"
                          onClick={() => onTogglePermission(selectedRole.id, permission.id)}
                          className="flex w-full items-center justify-between gap-2 text-left"
                        >
                          <span className={`text-[11px] ${enabled ? "font-semibold text-slate-800" : "text-slate-500"}`}>
                            {permission.label}
                          </span>
                          <span
                            className={`relative h-4.5 w-8 shrink-0 rounded-full transition-colors ${enabled ? "bg-emerald-500" : "bg-slate-200"}`}
                            role="switch"
                            aria-checked={enabled}
                          >
                            <span
                              className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-all ${
                                enabled ? "left-4" : "left-0.5"
                              }`}
                            />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
