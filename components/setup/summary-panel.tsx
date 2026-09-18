import { CircleCheck, CircleDashed } from "lucide-react";
import { ToolIcon } from "@/components/setup/tool-icon";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { findTool } from "@/lib/setup/selection";
import { getSelectedAddonNames, getSummaryItems } from "@/lib/setup/summary";
import type { SetupCatalog, SetupSelection } from "@/lib/setup/types";

type Props = {
  catalog: SetupCatalog;
  selection: SetupSelection;
};

export function SummaryPanel({ catalog, selection }: Props) {
  const tool = findTool(catalog, selection.toolId);
  const items = getSummaryItems(catalog, selection);
  const addons = getSelectedAddonNames(catalog, selection);
  const done = items.filter((i) => i.value).length;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {tool ? <ToolIcon icon={tool.icon} className="size-5" /> : <CircleDashed className="size-5" />}
        </span>
        <div>
          <p className="font-semibold">Project Summary</p>
          <p className="text-xs text-muted-foreground">
            {done} of {items.length} choices made
          </p>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            {item.value ? (
              <span className="flex min-w-0 items-center gap-1.5 font-medium">
                <span className="truncate">{item.value}</span>
                <CircleCheck className="size-4 shrink-0 text-primary" />
              </span>
            ) : (
              <span className="text-muted-foreground/70">Not selected</span>
            )}
          </li>
        ))}
      </ul>

      <Separator className="my-5" />

      <p className="text-sm text-muted-foreground">Add-ons</p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {addons.length ? (
          addons.map((name) => (
            <Badge key={name} variant="secondary" className="rounded-full">
              {name}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground/70">None yet</span>
        )}
      </div>
    </div>
  );
}
