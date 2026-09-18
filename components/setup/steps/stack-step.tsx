import { Info } from "lucide-react";
import { OptionCard } from "@/components/setup/option-card";
import { StepHeader, StepSection } from "@/components/setup/step-section";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  findTool,
  getFrameworks,
  getLanguagesForTool,
  type SelectionAction,
} from "@/lib/setup/selection";
import type { SetupCatalog, SetupSelection } from "@/lib/setup/types";
import { cn } from "@/lib/utils";

type Props = {
  catalog: SetupCatalog;
  selection: SetupSelection;
  dispatch: (action: SelectionAction) => void;
};

export function StackStep({ catalog, selection, dispatch }: Props) {
  const tool = findTool(catalog, selection.toolId);
  const languages = getLanguagesForTool(catalog, selection.toolId);
  const frameworks = getFrameworks(catalog, selection.toolId, selection.languageId);

  if (!tool) return null;

  return (
    <div className="space-y-10">
      <StepHeader
        title={`Build your ${tool.name} stack`}
        description="We've pre-selected the most common choices. Change anything you like."
      />

      <StepSection
        id="language-label"
        title="Programming language"
        help="The language you'll write your tests in. Pick one your team already uses, or Python if you're just starting."
      >
        <div
          role="radiogroup"
          aria-labelledby="language-label"
          className="grid grid-cols-2 gap-3 md:grid-cols-4"
        >
          {languages.map((lang) => (
            <OptionCard
              key={lang.id}
              selected={selection.languageId === lang.id}
              onSelect={() => dispatch({ type: "language", id: lang.id })}
              title={lang.name}
              description={lang.version}
              className="p-4 sm:p-4"
            />
          ))}
        </div>
      </StepSection>

      <StepSection
        id="framework-label"
        title="Test framework"
        help="A test framework finds your tests, runs them and reports which passed or failed."
      >
        <div
          role="radiogroup"
          aria-labelledby="framework-label"
          className="grid gap-3 md:grid-cols-2"
        >
          {frameworks.map((fw) => (
            <OptionCard
              key={fw.id}
              selected={selection.frameworkId === fw.id}
              onSelect={() => dispatch({ type: "framework", id: fw.id })}
              title={fw.name}
              description={fw.description}
              aside={
                fw.recommended && (
                  <Badge className="rounded-full bg-success/10 text-success">Recommended</Badge>
                )
              }
            />
          ))}
        </div>
      </StepSection>

      {tool.supportsBrowsers ? (
        <StepSection
          title="Browsers"
          description="Choose where your tests should run. You can add more later."
          help="Your tests will be configured to launch these browsers."
        >
          <div className="flex flex-wrap gap-2.5">
            {catalog.browsers.map((browser) => {
              const checked = selection.browserIds.includes(browser.id);
              return (
                <Label
                  key={browser.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-lg border bg-card px-3.5 py-2.5 font-medium shadow-xs transition-colors hover:border-primary/40",
                    checked && "border-primary bg-primary/5"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => dispatch({ type: "toggleBrowser", id: browser.id })}
                  />
                  {browser.name}
                </Label>
              );
            })}
          </div>
          {selection.browserIds.length === 0 && (
            <p className="text-sm text-destructive">Select at least one browser.</p>
          )}
        </StepSection>
      ) : (
        <div className="flex gap-3 rounded-xl border bg-muted/40 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          {tool.applicationType === "mobile"
            ? "Device and platform settings (Android / iOS) are added to the project config so you can point tests at an emulator or real device."
            : "API tests don't need a browser. Base URL and auth settings go in the project config."}
        </div>
      )}
    </div>
  );
}
