import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { adminAuthConfigured, isAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Вход администратора — Luna",
};

export default async function AdminLoginPage() {
  if (await isAdminSession()) {
    redirect("/admin");
  }

  const configured = adminAuthConfigured();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Админ-панель Luna
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Доступ только для глобальных администраторов: все события, категории и
          участники в одном месте.
        </p>
      </div>
      {!configured ? (
        <div className="rounded-xl border border-dashed p-4 text-sm">
          <p className="font-medium">Вход выключен</p>
          <p className="text-muted-foreground mt-2">
            В файле <code className="text-foreground">.env</code> задайте{" "}
            <code className="text-foreground">LUNA_ADMIN_SECRET</code> (не короче
            16 символов) и <code className="text-foreground">LUNA_ADMIN_PASSWORD</code>
            , затем перезапустите сервер.
          </p>
        </div>
      ) : (
        <AdminLoginForm />
      )}
    </div>
  );
}
