import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [events, registrations, categories] = await Promise.all([
    db.event.count(),
    db.registration.count(),
    db.category.count(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold tracking-tight">Обзор</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        <li className="bg-card rounded-2xl border p-5 ring-1 ring-black/5">
          <p className="text-muted-foreground text-sm">События</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{events}</p>
        </li>
        <li className="bg-card rounded-2xl border p-5 ring-1 ring-black/5">
          <p className="text-muted-foreground text-sm">Регистрации</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {registrations}
          </p>
        </li>
        <li className="bg-card rounded-2xl border p-5 ring-1 ring-black/5">
          <p className="text-muted-foreground text-sm">Категории</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {categories}
          </p>
        </li>
      </ul>
      <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
        Здесь вы управляете категориями и видите все события платформы. Редактировать
        любое событие можно со страницы «События» или через публичную ссылку
        «Редактировать», если вы вошли как админ.
      </p>
    </div>
  );
}
