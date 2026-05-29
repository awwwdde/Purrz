import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Container, Icon, Input } from "@/shared/ui";
import { useAuth } from "@/app/store/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const login = useAuth((s) => s.login);
  const loading = useAuth((s) => s.loading);
  const [email, setEmail] = useState("demo@purrz.dev");
  const [password, setPassword] = useState("demo1234");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      const user = await login(email, password);
      if (next) {
        navigate(next);
        return;
      }
      // Если у пользователя уже есть компания — отправляем в её кабинет,
      // иначе — в обычный личный кабинет.
      navigate(user.companyId ? "/crm" : "/account");
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <Container className="py-16 lg:py-24">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-ink-200 rounded-card p-8 shadow-brutal"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-xl bg-accent grid place-items-center border border-ink-200 mb-4">
              <Icon name="user" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-2">С возвращением</h1>
            <p className="text-ink-600 text-sm">Войдите, чтобы продолжить работу</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            {err && (
              <div className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/40 rounded-lg p-3">
                {err}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Входим..." : "Войти"}
            </Button>

            <div className="text-center text-sm text-ink-600">
              Нет аккаунта?{" "}
              <Link to="/register" className="font-semibold text-ink-950 underline">
                Зарегистрироваться
              </Link>
            </div>
          </form>

          <div className="mt-6 p-3 bg-ink-50 border border-ink-200 rounded-lg text-xs text-ink-500 space-y-1">
            <div>
              <span className="font-semibold text-ink-700">DEMO:</span> любой email и пароль —
              вход выполнится в личный кабинет покупателя.
            </div>
            <div>
              Чтобы посмотреть кабинет владельца компании, войдите как{" "}
              <code className="bg-white px-1 rounded">manager@arctica-service.demo</code> — этот
              аккаунт уже привязан к компании «Арктика-Сервис».
            </div>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}
