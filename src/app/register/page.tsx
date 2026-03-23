import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TelegramRegisterForm } from "@/components/auth/telegram-register-form";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";

export const metadata = { title: "Регистрация — Luna" };

export default async function RegisterPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const configured = userSessionConfigured();

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <Link
        href="/discover"
        className="text-zinc-400 hover:text-zinc-100 mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" aria-hidden />
        На главную
      </Link>
      <div className="mb-6">
        <h1 className="text-zinc-50 text-2xl font-semibold tracking-tight">
          Регистрация
        </h1>
        <p className="text-zinc-400 mt-3 text-sm leading-relaxed">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-zinc-100 underline underline-offset-4">
            Войти
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-zinc-400 text-sm">
          Задайте <code className="text-zinc-200">LUNA_SESSION_SECRET</code> в{" "}
          <code className="text-zinc-200">.env</code> (не менее 16 символов) и
          перезапустите сервер.
        </p>
      ) : (
        <TelegramRegisterForm />
      )}
      <footer className="text-zinc-500 mt-auto pt-12 text-center text-xs">
        <Link href="/discover" className="hover:text-zinc-300">
          Условия использования
        </Link>
        <span className="mx-2">·</span>
        <Link href="/discover" className="hover:text-zinc-300">
          Политика конфиденциальности
        </Link>
      </footer>
    </div>
  );
}
