"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null;
  alt: string;
  className?: string;
  imgClassName?: string;
};

/** Square 1:1; placeholder if image URL fails. */
export function EventCoverImage({
  src,
  alt,
  className,
  imgClassName,
}: Props) {
  const [failed, setFailed] = useState(false);
  const showImg = src && !failed;

  return (
    <div
      className={cn(
        "relative aspect-square shrink-0 overflow-hidden rounded-lg bg-muted",
        className,
      )}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary organizer URLs
        <img
          src={src}
          alt={alt}
          className={cn("size-full object-cover", imgClassName)}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1 p-2 text-center"
          aria-hidden
        >
          <CalendarDays className="size-8 opacity-50" strokeWidth={1.25} />
          <span className="text-xs font-medium">1:1</span>
        </div>
      )}
    </div>
  );
}
