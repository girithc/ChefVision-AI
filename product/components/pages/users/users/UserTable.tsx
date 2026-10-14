"use client";

import { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { StatusBadge, type Tone } from "../../../shared/ui";
import type { Role, UserRow, UserStatus } from "../data";

const statusTone: Record<UserStatus, Tone> = {
  Active: "emerald",
  Invited: "sky",
  Suspended: "rose",
};

type UserTableProps = {
  users: UserRow[];
  roles: Role[];
  onRoleChange: (userId: string, roleId: string) => void;
  onStatusToggle: (userId: string) => void;
  onInvite: (user: { name: string; email: string; roleId: string }) => void;
};

export default function UserTable({ users, roles, onRoleChange, onStatusToggle, onInvite }: UserTableProps) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState(roles.find((role) => !role.system)?.id ?? roles[0]?.id ?? "");

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-slate-400";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 pb-3">
          <div className="text-xs font-bold text-slate-800">Team — {users.length} users</div>
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <UserPlus className="h-4 w-4" />
            Invite user
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl bg-white">
          <table className="w-full text-left text-[11.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="px-5 pt-4 pb-3 font-medium">User</th>
                <th className="px-5 pt-4 pb-3 font-medium">Role</th>
                <th className="px-5 pt-4 pb-3 font-medium">Status</th>
                <th className="px-5 pt-4 pb-3 font-medium">Last active</th>
                <th className="px-5 pt-4 pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((user) => {
                const role = roles.find((item) => item.id === user.roleId);
                return (
                  <tr key={user.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                          {user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="mt-0.5 text-[10px] text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={user.roleId}
                        onChange={(event) => onRoleChange(user.id, event.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-slate-400"
                      >
                        {roles.map((item) => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge label={user.status} tone={statusTone[user.status]} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{user.lastActive}</td>
                    <td className="px-5 py-3.5 text-right">
                      {user.status === "Invited" ? (
                        <span className="text-[10px] text-slate-400">Awaiting reply</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStatusToggle(user.id)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          {user.status === "Active" ? "Suspend" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div aria-hidden="true" className="absolute inset-0 bg-slate-900/60" onClick={() => setInviteOpen(false)} />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Invite user</h3>
              </div>
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                aria-label="Close"
                className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 px-5 py-4">
              <input type="text" placeholder="Full name" value={inviteName} onChange={(event) => setInviteName(event.target.value)} className={inputClass} />
              <input type="email" placeholder="name@company.com" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} className={inputClass} />
              <select value={inviteRoleId} onChange={(event) => setInviteRoleId(event.target.value)} className={inputClass}>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!inviteName.trim() || !inviteEmail.trim()) return;
                  onInvite({ name: inviteName.trim(), email: inviteEmail.trim(), roleId: inviteRoleId });
                  setInviteName("");
                  setInviteEmail("");
                  setInviteOpen(false);
                }}
                disabled={!inviteName.trim() || !inviteEmail.trim()}
                className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
