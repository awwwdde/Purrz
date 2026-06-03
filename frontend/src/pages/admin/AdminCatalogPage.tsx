import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Input } from "@/shared/ui";
import { adminApi, realApi } from "@/shared/api/api";
import type { Service, ServiceCategory } from "@/shared/types";
import { formatPrice } from "@/shared/lib/format";

export function AdminCatalogPage() {
  const [categories, setCategories] = useState<ServiceCategory[] | null>(null);
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState("");

  const reload = useCallback(async () => {
    setError(null);
    try {
      const [cats, svcs] = await Promise.all([
        realApi.listCategories(),
        realApi.listServices(),
      ]);
      setCategories(cats);
      setServices(svcs);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function addCategory() {
    if (!newCatName.trim()) return;
    const slug = newCatName
      .toLowerCase()
      .replace(/[^a-z0-9а-я]+/g, "-")
      .replace(/^-|-$/g, "");
    try {
      await adminApi.createCategory({
        slug,
        name: newCatName.trim(),
        icon: "tag",
        description: "",
      });
      setNewCatName("");
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function delCategory(c: ServiceCategory) {
    if (!window.confirm(`Удалить категорию «${c.name}»? Услуги внутри тоже удалятся.`)) return;
    try {
      await adminApi.deleteCategory(Number(c.id));
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function delService(s: Service) {
    if (!window.confirm(`Удалить услугу «${s.name}»?`)) return;
    try {
      await adminApi.deleteService(Number(s.id));
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="heading-3 mb-1">Каталог</h1>
        <p className="text-ink-600">Категории и услуги — то, из чего компании собирают свою витрину</p>
      </div>

      {error && (
        <div className="rounded-lg border border-signal-red/40 bg-signal-red/10 px-3 py-2 text-sm text-signal-red">
          {error}
        </div>
      )}

      {/* Категории */}
      <section className="rounded-card border border-ink-200 bg-white p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Категории</h2>
        <div className="flex gap-2 mb-5">
          <Input
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Название новой категории"
            className="flex-1"
          />
          <Button onClick={addCategory}>+ Добавить</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {categories?.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-3 rounded-lg border border-ink-200"
            >
              <div className="min-w-0">
                <div className="font-display font-semibold truncate">{c.name}</div>
                <div className="text-xs text-ink-500 font-mono truncate">{c.slug}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => delCategory(c)}>
                Удалить
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Услуги */}
      <section className="rounded-card border border-ink-200 bg-white p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Услуги</h2>
        <ul className="divide-y divide-ink-200">
          {services?.map((s) => (
            <li key={s.id} className="flex items-center gap-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold truncate">{s.name}</div>
                <div className="text-xs text-ink-500">
                  {formatPrice(s.minPrice)} — {formatPrice(s.maxPrice)}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => delService(s)}>
                Удалить
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </motion.div>
  );
}
