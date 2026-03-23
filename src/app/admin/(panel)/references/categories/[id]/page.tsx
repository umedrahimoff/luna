import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adminDeleteCategoryFromDetail,
  adminUpdateCategory,
} from "@/app/actions/admin-references";
import {
  AdminEntityLayout,
  adminDetailFormCardClass,
} from "@/components/admin-entity-layout";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { AdminTechnicalAside } from "@/components/admin-technical-aside";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAdminEntityDateTime } from "@/lib/admin-entity-meta";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { parseRecordId } from "@/lib/record-id";

export const dynamic = "force-dynamic";

const NOTE_AUDIT =
  "Shared reference data; row author is not stored in the database.";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ e?: string }>;
};

function decodeErr(e?: string) {
  if (!e) return null;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}

export default async function AdminCategoryDetailPage({
  params,
  searchParams,
}: Props) {
  const { id: idRaw } = await params;
  const id = parseRecordId(idRaw);
  if (id == null) notFound();
  const { e: error } = await searchParams;
  const category = await db.category.findUnique({
    where: { id },
    include: { _count: { select: { events: true } } },
  });
  if (!category) notFound();

  const canDelete = category._count.events === 0;

  const main = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/references/categories"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Categories
        </Link>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Admin
        </Link>
      </div>

      {decodeErr(error) ? (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
          {decodeErr(error)}
        </p>
      ) : null}

      <div>
        <h2 className="text-base font-semibold tracking-tight">
          {category.name}
        </h2>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          {category.slug}
        </p>
      </div>

      <ConfirmForm
        action={adminUpdateCategory.bind(null, category.id)}
        confirmMessage={confirmMessages.save}
        className={adminDetailFormCardClass}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={80}
            defaultValue={category.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            maxLength={120}
            defaultValue={category.slug}
            className="font-mono text-xs"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Save
        </Button>
      </ConfirmForm>

      <p className="text-muted-foreground max-w-lg text-sm leading-relaxed">
        Events using this category:{" "}
        <span className="text-foreground font-medium tabular-nums">
          {category._count.events}
        </span>
        . Delete from the{" "}
        <Link
          href="/admin/references/categories"
          className="text-primary underline"
        >
          list
        </Link>{" "}
        or with the button below (only when there are no events).
      </p>

      <div className="border-t pt-4">
        <ConfirmForm
          action={adminDeleteCategoryFromDetail.bind(null, category.id)}
          confirmMessage={confirmMessages.deleteCategory}
        >
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            title={
              canDelete
                ? "Delete category"
                : "Reassign or delete events first"
            }
          >
            Delete category
          </Button>
        </ConfirmForm>
        {!canDelete ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Deletion is blocked while events use this category.
          </p>
        ) : null}
      </div>
    </>
  );

  const aside = (
    <AdminTechnicalAside
      fields={[
        { label: "ID", value: category.id, mono: true },
        { label: "Slug", value: category.slug, mono: true },
        {
          label: "Created",
          value: formatAdminEntityDateTime(category.createdAt),
        },
        {
          label: "Updated",
          value: formatAdminEntityDateTime(category.updatedAt),
        },
        {
          label: "Events",
          value: String(category._count.events),
        },
      ]}
      note={NOTE_AUDIT}
    />
  );

  return <AdminEntityLayout main={main} aside={aside} />;
}
