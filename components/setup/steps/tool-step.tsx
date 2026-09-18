import { Clock } from "lucide-react";
import { OptionCard } from "@/components/setup/option-card";
import { StepHeader } from "@/components/setup/step-section";
import { ToolIcon } from "@/components/setup/tool-icon";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SelectionAction } from "@/lib/setup/selection";
import type { ApplicationTypeId, SetupCatalog, SetupSelection } from "@/lib/setup/types";

type Props = {
  catalog: SetupCatalog;
  selection: SetupSelection;
  dispatch: (action: SelectionAction) => void;
};

export function ToolStep({ catalog, selection, dispatch }: Props) {
  const tools = catalog.tools.filter((t) => t.applicationType === selection.applicationType);
  const activeType = catalog.applicationTypes.find((a) => a.id === selection.applicationType);

  return (
    <div>
      <StepHeader
        title="What do you want to automate?"
        description="Pick the type of application you test, then choose an automation tool."
      />

      <Tabs
        value={selection.applicationType}
        onValueChange={(id) => dispatch({ type: "applicationType", id: id as ApplicationTypeId })}
      >
        <TabsList className="h-10 w-full sm:w-auto">
          {catalog.applicationTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="px-3 sm:px-4">
              {type.name.replace(" Application", "")}
              <span className="ml-1 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">
                {catalog.tools.filter((t) => t.applicationType === type.id).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {activeType && (
        <p className="mt-3 text-sm text-muted-foreground">{activeType.description}</p>
      )}

      <div
        role="radiogroup"
        aria-label="Automation tool"
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      >
        {tools.map((tool) => (
          <OptionCard
            key={tool.id}
            selected={selection.toolId === tool.id}
            onSelect={() => dispatch({ type: "tool", tool })}
            title={tool.name}
            description={tool.description}
            icon={<ToolIcon icon={tool.icon} className="size-5" />}
          >
            <div className="mt-4 flex flex-wrap items-center gap-1.5 pl-[52px]">
              {tool.tag && (
                <Badge className="rounded-full bg-brand-purple/10 text-brand-purple">
                  {tool.tag}
                </Badge>
              )}
              {tool.languageIds.map((id) => (
                <span
                  key={id}
                  className="rounded-md border bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {catalog.languages.find((l) => l.id === id)?.name ?? id}
                </span>
              ))}
            </div>
          </OptionCard>
        ))}

        {tools.length < 3 && (
          <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
            <Clock className="size-5" />
            More {activeType?.name.toLowerCase() ?? ""} tools coming soon
          </div>
        )}
      </div>
    </div>
  );
}
