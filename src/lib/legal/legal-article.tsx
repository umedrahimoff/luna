type Block = {
  title: string;
  paragraphs: string[];
  list?: string[];
};

type Props = {
  heading: string;
  effectiveLabel: string;
  effectiveDate: string;
  intro: string;
  blocks: Block[];
};

export function LegalArticle({
  heading,
  effectiveLabel,
  effectiveDate,
  intro,
  blocks,
}: Props) {
  return (
    <article className="text-foreground max-w-3xl pb-12">
      <header className="border-border mb-8 border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {heading}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          {effectiveLabel}: {effectiveDate}
        </p>
      </header>
      <p className="text-muted-foreground mb-10 text-sm leading-relaxed">
        {intro}
      </p>
      <div className="flex flex-col gap-10">
        {blocks.map((block) => (
          <section key={block.title} className="scroll-mt-24">
            <h2 className="text-foreground mb-4 text-base font-semibold tracking-tight">
              {block.title}
            </h2>
            <div className="text-muted-foreground space-y-4 text-sm leading-relaxed">
              {block.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {block.list && block.list.length > 0 ? (
                <ul className="border-border bg-muted/30 list-disc space-y-2 rounded-xl border py-3 pr-4 pl-8">
                  {block.list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
