"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";
import { cn } from "@/lib/utils";

// Column/row spans for the thumbnails, depending on how many there are.
const THUMB_SPANS: Record<number, string[]> = {
  1: ["sm:col-span-2 sm:row-span-2"],
  2: ["sm:col-span-2", "sm:col-span-2"],
  3: ["sm:col-span-2", "", ""],
  4: ["", "", "", ""],
};

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
    };
  }, [open, prev, next]);

  if (count === 0) return null;

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const visible = images.slice(0, 5);
  const thumbs = visible.slice(1);
  const hidden = count - visible.length;
  const spans = THUMB_SPANS[thumbs.length] ?? [];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:h-80 sm:grid-cols-4 sm:grid-rows-2">
        <button
          type="button"
          onClick={() => openAt(0)}
          className={cn(
            "relative h-64 cursor-pointer overflow-hidden rounded-card sm:h-full",
            thumbs.length === 0
              ? "col-span-2 sm:col-span-4 sm:row-span-2"
              : "col-span-2 sm:row-span-2"
          )}
        >
          <Image
            src={images[0]}
            alt={`${title} photo 1`}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
          {count > 1 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-charcoal/80 px-3 py-1.5 text-xs font-medium text-ivory">
              <Images className="h-3.5 w-3.5" />
              View all {count} photos
            </span>
          )}
        </button>

        {thumbs.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => openAt(i + 1)}
            className={cn("relative h-28 cursor-pointer overflow-hidden rounded-card sm:h-full", spans[i])}
          >
            <Image
              src={src}
              alt={`${title} photo ${i + 2}`}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
            {hidden > 0 && i === thumbs.length - 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-charcoal/60 font-display text-xl font-semibold text-ivory">
                +{hidden}
              </span>
            )}
          </button>
        ))}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photos`}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 text-ivory">
            <span className="text-sm">
              {index + 1} / {count}
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-full p-2 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[index]}
              alt={`${title} photo ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-ivory hover:bg-white/20"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-ivory hover:bg-white/20"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          <div
            className="flex justify-center gap-2 overflow-x-auto px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative h-12 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border-2",
                  i === index ? "border-emerald" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}