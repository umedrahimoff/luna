import { PublicEventList } from "@/components/public-event-list";

export const dynamic = "force-dynamic";

type Search = { category?: string };

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { category: categorySlug } = await searchParams;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Discover</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          All upcoming events. Filter by category or open a card to register.
        </p>
      </div>

      <PublicEventList categorySlug={categorySlug} listBasePath="/discover" />
    </div>
  );
}
