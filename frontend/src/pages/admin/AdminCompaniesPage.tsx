import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Icon, Input } from "@/shared/ui";
import { adminApi } from "@/shared/api/api";
import type { Company } from "@/shared/types";

export function AdminCompaniesPage() {
  const [items, setItems] = useState<Company[] | null>(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<Record<string, string | undefined>>({});
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const { items } = await adminApi.listAllCompanies({ search });
      setItems(items);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [search]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function act(co: Company, action: "verify" | "unverify" | "ban" | "unban") {
    setBusy((b) => ({ ...b, [co.id]: action }));
    setError(null);
    try {
      const idNum = Number(co.id);
      if (action === "verify") await adminApi.verifyCompany(idNum, true);
      if (action === "unverify") await adminApi.verifyCompany(idNum, false);
      if (action === "ban") await adminApi.banCompany(idNum, false);
      if (action === "unban") await adminApi.banCompany(idNum, true);
      await reload();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy((b) => ({ ...b, [co.id]: undefined }));
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="heading-3 mb-1">Модерация компаний</h1>
        <p className="text-ink-600">Подтверждайте, верифицируйте и блокируйте компании</p>
      </div>

      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по названию или описанию"
          className="flex-1"
        />
        <Button variant="outline" onClick={() => void reload()}>
          Обновить
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items === null && <div className="text-ink-500 text-sm">Загрузка…</div>}
        {items?.length === 0 && (
          <div className="rounded-card border border-dashed border-ink-300 p-10 text-center text-ink-500">
            Компаний не найдено
          </div>
        )}
        {items?.map((co) => (
          <div
            key={co.id}
            className="rounded-card border border-ink-200 bg-white p-4 flex items-center gap-4"
          >
            <img
              src={co.logo}
              alt=""
              className="w-12 h-12 rounded-xl border border-ink-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="font-display font-semibold truncate">{co.name}</div>
                {co.verified ? (
                  <Badge tone="success">verified</Badge>
                ) : (
                  <Badge tone="default">unverified</Badge>
                )}
                <span className="text-xs text-ink-500">ИНН {co.inn}</span>
              </div>
              <div className="text-xs text-ink-500 truncate mt-0.5">{co.description}</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant={co.verified ? "outline" : "primary"}
                disabled={!!busy[co.id]}
                onClick={() => act(co, co.verified ? "unverify" : "verify")}
                iconLeft={<Icon name="shield-check" size={14} />}
              >
                {co.verified ? "Снять" : "Verify"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!!busy[co.id]}
                onClick={() => act(co, "ban")}
              >
                Бан
              </Button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
