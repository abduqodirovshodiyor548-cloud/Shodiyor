import { useState, type KeyboardEvent } from "react";
import { Loader2, Plus } from "lucide-react";
import type { TagDto } from "@loiha/shared";
import { Input } from "@/components/ui";
import { planningApi, usePlanningMutation, useTags } from "@/lib/planning";
import { cn } from "@/lib/utils";

// S1-11: teglar — vazifa panelida tanlash/yaratish va ro'yxatlarda ko'rsatish.

export function TagChip({ tag, className }: { tag: TagDto; className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full bg-muted px-1.5 text-[11px] leading-4", className)}
      style={tag.color ? { backgroundColor: `${tag.color}26`, color: tag.color } : undefined}
    >
      #{tag.name}
    </span>
  );
}

/** Vazifa teglari: mavjudlarini bosib tanlash, yangisini yozib Enter bilan yaratish (va darhol tanlash). */
export function TagPicker({ value, onChange }: { value: string[]; onChange: (ids: string[]) => void }) {
  const tags = useTags();
  const [name, setName] = useState("");
  const create = usePlanningMutation(planningApi.createTag);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = name.trim().replace(/^#/, "");
    if (!trimmed) return;
    const existing = tags.data?.find((t) => t.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      if (!value.includes(existing.id)) onChange([...value, existing.id]);
      setName("");
      return;
    }
    create.mutate(
      { name: trimmed },
      {
        onSuccess: (tag) => {
          onChange([...value, tag.id]);
          setName("");
        },
      },
    );
  };

  return (
    <div className="space-y-2">
      {(tags.data?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.data!.map((t) => {
            const on = value.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(t.id)}
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs transition-colors",
                  on ? "border-primary bg-primary/12 text-primary" : "text-muted-foreground hover:bg-accent",
                )}
              >
                #{t.name}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex items-center gap-2">
        {create.isPending ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : (
          <Plus className="size-4 text-muted-foreground" />
        )}
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKey}
          placeholder="Yangi teg — yozib Enter bosing"
          aria-label="Yangi teg"
          className="h-8"
        />
      </div>
      {create.isError && <p className="text-xs text-destructive">{create.error.message}</p>}
    </div>
  );
}
