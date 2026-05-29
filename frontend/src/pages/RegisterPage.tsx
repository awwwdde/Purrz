import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button, Container, Icon, Input } from "@/shared/ui";
import { useAuth } from "@/app/store/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuth((s) => s.register);
  const loading = useAuth((s) => s.loading);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    try {
      await register(name, email, password);
      navigate("/account");
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
            <h1 className="font-display text-3xl font-semibold mb-2">Создать аккаунт</h1>
            <p className="text-ink-600 text-sm">
              Это займёт меньше минуты — и не нужен email-подтверждение
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Input
              label="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Петров"
              required
            />
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
              placeholder="Минимум 6 символов"
              minLength={6}
              required
            />

            {err && (
              <div className="text-sm text-signal-red bg-signal-red/10 border border-signal-red/40 rounded-lg p-3">
                {err}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? "Создаём..." : "Создать аккаунт"}
            </Button>

            <div className="text-center text-sm text-ink-600">
              Уже есть аккаунт?{" "}
              <Link to="/login" className="font-semibold text-ink-950 underline">
                Войти
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-200 text-center">
            <p className="text-sm text-ink-600 mb-3">Вы — компания?</p>
            <Link
              to="/register-company"
              className="inline-flex items-center gap-1.5 font-display font-semibold text-ink-950 hover:gap-2 transition-all"
            >
              Разместить компанию <Icon name="arrow-right" size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}
