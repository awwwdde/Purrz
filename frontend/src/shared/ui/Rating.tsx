import { cn } from "@/shared/lib/cn";

interface RatingProps {
  /** Значение от 0 до 5 (поддерживает дробные, например 4.3) */
  value: number;
  /** Количество отзывов рядом со звёздами */
  reviews?: number;
  /** Размер */
  size?: "sm" | "md" | "lg";
  /** Скрыть числовое значение */
  hideNumber?: boolean;
  /** Скрыть звёзды (оставить только число) */
  hideStars?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { star: 14, gap: "gap-0.5", text: "text-xs" },
  md: { star: 18, gap: "gap-0.5", text: "text-sm" },
  lg: { star: 22, gap: "gap-1", text: "text-base" },
} as const;

/**
 * Звёздная 5-балльная оценка с частичной заливкой.
 * 4.3 → 4 полные звезды + одна на ~30% заполнена.
 */
export function Rating({
  value,
  reviews,
  size = "md",
  hideNumber,
  hideStars,
  className,
}: RatingProps) {
  const clamped = Math.max(0, Math.min(5, value));
  const cfg = sizeMap[size];

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {!hideStars && (
        <div className={cn("inline-flex items-center", cfg.gap)} aria-label={`Рейтинг ${clamped.toFixed(1)} из 5`}>
          {[0, 1, 2, 3, 4].map((i) => {
            // Сколько процентов заливки у этой звезды
            const fill = Math.max(0, Math.min(1, clamped - i));
            return <Star key={i} size={cfg.star} fill={fill} />;
          })}
        </div>
      )}
      {!hideNumber && (
        <span
          className={cn(
            "font-semibold font-display text-ink-950 tabular-nums",
            cfg.text,
          )}
        >
          {clamped.toFixed(1)}
        </span>
      )}
      {reviews !== undefined && (
        <span className={cn("text-ink-500", cfg.text)}>
          · {reviews} {pluralReviews(reviews)}
        </span>
      )}
    </div>
  );
}

function pluralReviews(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "отзыв";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "отзыва";
  return "отзывов";
}

const STAR_PATH =
  "M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.6l-5.9 3.07 1.13-6.57L2.45 9.44l6.6-.96L12 2.5z";

/**
 * Одна звезда с двойным слоем:
 *  - серый контур всегда
 *  - жёлтая заливка, обрезаемая clip-path по проценту fill
 */
function Star({ size, fill }: { size: number; fill: number }) {
  // fill: 0..1
  const pct = Math.round(fill * 100);
  return (
    <span
      className="relative inline-block flex-shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* фон — пустая звезда */}
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="absolute inset-0 fill-ink-200 stroke-ink-950"
        strokeWidth="1.2"
      >
        <path d={STAR_PATH} />
      </svg>
      {/* заливка по проценту */}
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="absolute inset-0 fill-signal-yellow stroke-ink-950"
        strokeWidth="1.2"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      >
        <path d={STAR_PATH} />
      </svg>
    </span>
  );
}
