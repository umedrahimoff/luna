import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TelegramLoginForm } from "@/components/auth/telegram-login-form";
import { getSessionUser } from "@/lib/user-session";
import { userSessionConfigured } from "@/lib/user-token";

export const metadata = { title: "Вход — Luna" };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) {
    redirect("/me");
  }
  const { next: nextRaw } = await searchParams;
  const nextPath =
    nextRaw?.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : undefined;

  const configured = userSessionConfigured();

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <div className="mb-2 flex justify-center sm:justify-start">
        <Link
          href="/discover"
          className="text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" aria-hidden />
          На главную
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-zinc-50 text-2xl font-semibold tracking-tight">
          Вход
        </h1>
        <p className="text-zinc-400 mt-3 text-sm">
          Нет аккаунта?{" "}
          <Link
            href="/register"
            className="text-zinc-100 font-medium underline underline-offset-4"
          >
            Регистрация
          </Link>
        </p>
      </div>
      {!configured ? (
        <p className="text-zinc-400 text-sm">
          Задайте <code className="text-zinc-200">LUNA_SESSION_SECRET</code> в{" "}
          <code className="text-zinc-200">.env</code> и перезапустите сервер.
        </p>
      ) : (
        <TelegramLoginForm nextPath={nextPath} />
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
