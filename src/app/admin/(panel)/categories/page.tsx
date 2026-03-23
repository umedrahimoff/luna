import { db } from "@/lib/db";
import {
  adminCreateCategory,
  adminDeleteCategory,
} from "@/app/actions/admin-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ e?: string }> };

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const { e: error } = await searchParams;
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { events: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-lg font-semibold tracking-tight">Категории</h2>

      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
          {(() => {
            try {
              return decodeURIComponent(error);
            } catch {
              return error;
            }
          })()}
        </p>
      ) : null}

      <form
        action={adminCreateCategory}
        className="bg-card flex max-w-md flex-col gap-4 rounded-2xl border p-5 ring-1 ring-black/5"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Новая категория</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={80}
            placeholder="Например, Митапы"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Добавить
        </Button>
      </form>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 font-medium">Название</th>
              <th className="p-3 font-medium">Slug</th>
              <th className="p-3 font-medium">Событий</th>
              <th className="p-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3 font-medium">{c.name}</td>
                <td className="text-muted-foreground p-3 font-mono text-xs">
                  {c.slug}
                </td>
                <td className="p-3 tabular-nums">{c._count.events}</td>
                <td className="p-3">
                  <form action={adminDeleteCategory.bind(null, c.id)}>
                    <button
                      type="submit"
                      className={cn(
                        buttonVariants({
                          variant: "outline",
                          size: "sm",
                        }),
                      )}
                    >
                      Удалить
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
