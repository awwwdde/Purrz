import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui";
import { adminApi, realApi } from "@/shared/api/api";
import type { Company } from "@/shared/types";
import { formatRelative } from "@/shared/lib/format";

interface FlatReview {
  reviewId: number;
  companyName: string;
  companyId: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export function AdminReviewsPage() {
  const [items, setItems] = useState<FlatReview[] | null>(null);
  const [busy, setBusy] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      // У нас нет /admin/reviews — собираем из публичного списка компаний:
      // GET /companies возвращает companies со встроенными reviews. Для demo
      // достаточно. Когда отзывов станет много — отдельный endpoint.
      const { items: companies } = await adminApi.listAllCompanies();
      const flat: FlatReview[] = [];
      companies.forEach((c: Company) => {
        c.reviews.forEach((r) =>
          flat.push({
            reviewId: Number(r.id),
            companyName: c.name,
            companyId: c.id,
            author: r.author,
            rating: r.rating,
            text: r.text,
            date: r.date,
          }),
        );
      });
      flat.sort((a, b) => +new Date(b.date) - +new Date(a.date));
      setItems(flat);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function remove(r: FlatReview) {
    if (!window.confirm(`Удалить отзыв на «${r.companyName}»?`)) return;
    setBusy((b) => ({ ...b, [r.reviewId]: true }));
    try {
      await adminApi.deleteReview(r.reviewId);
      setItems((xs) => (xs ?? []).filter((x) => x.reviewId !== r.reviewId));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy((b) => ({ ...b, [r.reviewId]: false }));
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="heading-3 mb-1">Модерация отзывов</h1>
        <p className="text-ink-600">Удаляйте спам и оскорбления; рейтинг компании пересчитается</p>
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
            Отзывов нет
          </div>
        )}
        {items?.map((r) => (
          <div
            key={r.reviewId}
            className="rounded-card border border-ink-200 bg-white p-4 flex items-start gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <span className="font-display font-semibold text-ink-950">{r.author}</span>
                <span>· {"★".repeat(r.rating)}</span>
                <span>· {r.companyName}</span>
                <span>· {formatRelative(r.date)}</span>
              </div>
              <p className="text-sm text-ink-700 mt-2 whitespace-pre-wrap">{r.text}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={!!busy[r.reviewId]}
              onClick={() => remove(r)}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
