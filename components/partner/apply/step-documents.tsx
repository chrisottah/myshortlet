"use client";

import { useRef } from "react";
import { PropertyApplicationData } from "@/lib/types/property-application";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, X, Upload } from "lucide-react";

interface StepDocumentsProps {
  data: PropertyApplicationData;
  onChange: (patch: Partial<PropertyApplicationData>) => void;
}

export function StepDocuments({ data, onChange }: StepDocumentsProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const names = Array.from(files).map((f) => f.name);
    onChange({ documentNames: [...data.documentNames, ...names] });

    // reset input so the same file can be re-selected if removed
    e.target.value = "";
  }

  function removeDocument(name: string) {
    onChange({
      documentNames: data.documentNames.filter((n) => n !== name),
    });
  }

  return (
    <div className="space-y-4">
      <Label>Supporting documents</Label>
      <p className="text-sm text-charcoal/50">
        Upload proof of ownership, floor plans, or recent photos. This is a
        demo — files aren&apos;t actually stored, only their names are
        recorded.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-charcoal/15 py-10 cursor-pointer hover:border-emerald/50 transition-colors"
      >
        <Upload className="h-6 w-6 text-charcoal/40" />
        <span className="text-sm text-charcoal/60">
          Click to select files
        </span>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      {data.documentNames.length > 0 && (
        <ul className="space-y-2">
          {data.documentNames.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between rounded-lg border border-charcoal/10 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-charcoal/40 shrink-0" />
                <span className="text-sm text-charcoal truncate">{name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeDocument(name)}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}