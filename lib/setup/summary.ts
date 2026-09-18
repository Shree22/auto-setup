import { findFramework, findLanguage, findStructure, findTool, type StepId } from "./selection";
import type { SetupCatalog, SetupSelection } from "./types";

export type SummaryItem = {
  label: string;
  /** null means "not chosen yet". */
  value: string | null;
  step: StepId;
};

export function getSummaryItems(c: SetupCatalog, sel: SetupSelection): SummaryItem[] {
  const tool = findTool(c, sel.toolId);
  const browsers = sel.browserIds
    .map((id) => c.browsers.find((b) => b.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const items: SummaryItem[] = [
    {
      label: "Application",
      value: c.applicationTypes.find((a) => a.id === sel.applicationType)?.name ?? null,
      step: "tool",
    },
    { label: "Tool", value: tool?.name ?? null, step: "tool" },
    { label: "Language", value: findLanguage(c, sel.languageId)?.name ?? null, step: "stack" },
    { label: "Framework", value: findFramework(c, sel.frameworkId)?.name ?? null, step: "stack" },
  ];

  if (!tool || tool.supportsBrowsers) {
    items.push({ label: "Browsers", value: browsers || null, step: "stack" });
  }

  items.push({
    label: "Structure",
    value: findStructure(c, sel.structureId)?.name ?? null,
    step: "structure",
  });

  return items;
}

export function getSelectedAddonNames(c: SetupCatalog, sel: SetupSelection): string[] {
  return sel.addonIds
    .map((id) => c.addons.find((a) => a.id === id)?.name)
    .filter((n): n is string => Boolean(n));
}
