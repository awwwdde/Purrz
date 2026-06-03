import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button } from "@/shared/ui";
import { adminApi, type AdminUser } from "@/shared/api/api";
import { formatDate } from "@/shared/lib/format";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [busy, setBusy] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const list = await adminApi.listUsers();
      setUsers(list);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function toggleBan(u: AdminUser) {
    setBusy((b) => ({ ...b, [u.id]: true }));
    try {
      await adminApi.banUser(u.id, !u.isActive);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy((b) => ({ ...b, [u.id]: false }));
    }
  }

  const roleTone: Record<AdminUser["role"], "default" | "info" | "accent" | "success"> = {
    user: "default",
    company_manager: "info",
    admin: "accent",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="heading-3 mb-1">Пользователи</h1>
        <p className="text-ink-600">Управление аккаунтами, ролями и блокировками</p>
      </div>

      {error && (
        <div className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
          {error}
        </div>
      )}

      <div className="rounded-card border border-ink-200 bg-white overflow-hidden">
        {users === null && <div className="p-6 text-sm text-ink-500">Загрузка…</div>}
        {users?.length === 0 && (
          <div className="p-10 text-center text-ink-500 text-sm">Пользователей нет</div>
        )}
        <ul className="divide-y divide-ink-200">
          {users?.map((u) => (
            <li key={u.id} className="flex items-center gap-4 p-4">
              <img
                src={u.avatar ?? ""}
                alt=""
                className="w-10 h-10 rounded-full border border-ink-200 bg-ink-100 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-display font-semibold truncate">{u.name || "—"}</div>
                  <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                  {!u.isActive && <Badge tone="default">banned</Badge>}
                </div>
                <div className="text-xs text-ink-500 truncate">{u.email}</div>
                <div className="text-xs text-ink-400 mt-0.5">
                  {formatDate(u.createdAt)}
                  {u.companyId != null && <span> · company #{u.companyId}</span>}
                </div>
              </div>
              {u.role !== "admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!busy[u.id]}
                  onClick={() => toggleBan(u)}
                >
                  {u.isActive ? "Бан" : "Разбан"}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
