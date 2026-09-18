import { Check } from "lucide-react";
import { OptionCard } from "@/components/setup/option-card";
import { StepHeader, StepSection } from "@/components/setup/step-section";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getAddons, type SelectionAction } from "@/lib/setup/selection";
import type { Addon, AddonCategory, ProjectStructure, SetupCatalog, SetupSelection } from "@/lib/setup/types";
import { cn } from "@/lib/utils";

type Props = {
  catalog: SetupCatalog;
  selection: SetupSelection;
  dispatch: (action: SelectionAction) => void;
};

const levelStyles: Record<ProjectStructure["level"], string> = {
  Beginner: "bg-success/10 text-success",
  Intermediate: "bg-primary/10 text-primary",
  Advanced: "bg-brand-purple/10 text-brand-purple",
};

export function StructureStep({ catalog, selection, dispatch }: Props) {
  const addons = getAddons(catalog, selection.toolId, selection.languageId);
  const grouped = addons.reduce<Partial<Record<AddonCategory, Addon[]>>>((acc, addon) => {
    (acc[addon.category] ??= []).push(addon);
    return acc;
  }, {});

  return (
    <div className="space-y-10">
      <StepHeader
        title="Shape your project"
        description="Choose how your code is organised and which extras to include."
      />

      <StepSection
        id="structure-label"
        title="Project structure"
        help="How files are organised. Page Object Model keeps page locators separate from tests, so a UI change only needs fixing in one place."
      >
        <div role="radiogroup" aria-labelledby="structure-label" className="grid gap-3 lg:grid-cols-3">
          {catalog.structures.map((s) => (
            <OptionCard
              key={s.id}
              selected={selection.structureId === s.id}
              onSelect={() => dispatch({ type: "structure", id: s.id })}
              title={s.name}
              description={s.description}
            >
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge className={cn("rounded-full", levelStyles[s.level])}>{s.level}</Badge>
                {s.recommended && (
                  <Badge className="rounded-full bg-success/10 text-success">Recommended</Badge>
                )}
              </div>
              <ul className="mt-4 space-y-1.5 border-t pt-4">
                {s.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-3.5 text-primary" strokeWidth={3} />
                    {h}
                  </li>
                ))}
              </ul>
            </OptionCard>
          ))}
        </div>
      </StepSection>

      <StepSection
        title="Additional tools"
        description="Optional extras. Our suggestions are pre-selected."
        help="These add packages, config and helper files to your project. Nothing here is required to run tests."
      >
        <div className="space-y-6">
          {(Object.keys(grouped) as AddonCategory[]).map((category) => (
            <div key={category}>
              <p className="mb-2.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {category}
              </p>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {grouped[category]!.map((addon) => {
                  const checked = selection.addonIds.includes(addon.id);
                  return (
                    <Label
                      key={addon.id}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border bg-card p-3.5 font-normal shadow-xs transition-colors hover:border-primary/40",
                        checked && "border-primary/60 bg-primary/5"
                      )}
                    >
                      <Checkbox
                        className="mt-0.5"
                        checked={checked}
                        onCheckedChange={() => dispatch({ type: "toggleAddon", id: addon.id })}
                      />
                      <span>
                        <span className="block text-sm font-medium">{addon.name}</span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {addon.description}
                        </span>
                      </span>
                    </Label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </StepSection>
    </div>
  );
}
