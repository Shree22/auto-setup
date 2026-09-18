/**
 * Pure helpers for the setup wizard: option filtering, defaults,
 * validation and state transitions. Everything is derived from the
 * catalog, so compatibility rules live in backend data, not in the UI.
 */
import type {
  Addon,
  ApplicationTypeId,
  Framework,
  Language,
  SetupCatalog,
  SetupSelection,
  Tool,
} from "./types";

export const STEPS = [
  { id: "tool", title: "Choose Tool", description: "What will you automate?" },
  { id: "stack", title: "Choose Stack", description: "Language, framework and browsers" },
  { id: "structure", title: "Structure & Extras", description: "Project layout and add-ons" },
  { id: "review", title: "Review", description: "Check and generate" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export const emptySelection: SetupSelection = {
  applicationType: "web",
  toolId: null,
  languageId: null,
  frameworkId: null,
  browserIds: [],
  structureId: "pom",
  addonIds: [],
  projectName: "",
};

// --- Lookups ---------------------------------------------------------------

export const findTool = (c: SetupCatalog, id: string | null) =>
  c.tools.find((t) => t.id === id);
export const findLanguage = (c: SetupCatalog, id: string | null) =>
  c.languages.find((l) => l.id === id);
export const findFramework = (c: SetupCatalog, id: string | null) =>
  c.frameworks.find((f) => f.id === id);
export const findStructure = (c: SetupCatalog, id: string | null) =>
  c.structures.find((s) => s.id === id);

export function getLanguagesForTool(c: SetupCatalog, toolId: string | null): Language[] {
  const tool = findTool(c, toolId);
  if (!tool) return [];
  return tool.languageIds
    .map((id) => findLanguage(c, id))
    .filter((l): l is Language => Boolean(l));
}

export function getFrameworks(
  c: SetupCatalog,
  toolId: string | null,
  languageId: string | null
): Framework[] {
  if (!toolId || !languageId) return [];
  return c.frameworks.filter(
    (f) => f.toolIds.includes(toolId) && f.languageIds.includes(languageId)
  );
}

export function getAddons(
  c: SetupCatalog,
  toolId: string | null,
  languageId: string | null
): Addon[] {
  return c.addons.filter(
    (a) =>
      (!a.toolIds || (toolId !== null && a.toolIds.includes(toolId))) &&
      (!a.languageIds || (languageId !== null && a.languageIds.includes(languageId)))
  );
}

// --- Defaults --------------------------------------------------------------

function defaultFramework(c: SetupCatalog, toolId: string, languageId: string) {
  const options = getFrameworks(c, toolId, languageId);
  return (options.find((f) => f.recommended) ?? options[0])?.id ?? null;
}

function keepAvailableAddons(c: SetupCatalog, sel: SetupSelection): string[] {
  const available = new Set(getAddons(c, sel.toolId, sel.languageId).map((a) => a.id));
  return sel.addonIds.filter((id) => available.has(id));
}

function defaultAddons(c: SetupCatalog, toolId: string, languageId: string | null) {
  return getAddons(c, toolId, languageId)
    .filter((a) => a.defaultSelected)
    .map((a) => a.id);
}

export function suggestProjectName(c: SetupCatalog, sel: SetupSelection): string {
  const parts = [findTool(c, sel.toolId)?.id, sel.languageId].filter(Boolean);
  return parts.length ? `${parts.join("-")}-automation` : "my-automation-project";
}

// --- Validation ------------------------------------------------------------

const PROJECT_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{1,49}$/;

export function projectNameError(name: string): string | null {
  if (!name.trim()) return "Give your project a name.";
  if (!PROJECT_NAME_PATTERN.test(name))
    return "Use 2–50 lowercase letters, numbers, hyphens or underscores.";
  return null;
}

export function isStepComplete(step: StepId, c: SetupCatalog, sel: SetupSelection): boolean {
  switch (step) {
    case "tool":
      return Boolean(findTool(c, sel.toolId));
    case "stack": {
      const tool = findTool(c, sel.toolId);
      if (!tool || !sel.languageId || !sel.frameworkId) return false;
      return !tool.supportsBrowsers || sel.browserIds.length > 0;
    }
    case "structure":
      return Boolean(findStructure(c, sel.structureId));
    case "review":
      return projectNameError(sel.projectName) === null;
  }
}

/** Index of the furthest step the user may jump to. */
export function furthestReachableStep(c: SetupCatalog, sel: SetupSelection): number {
  let i = 0;
  while (i < STEPS.length - 1 && isStepComplete(STEPS[i].id, c, sel)) i++;
  return i;
}

// --- State transitions -----------------------------------------------------

export type SelectionAction =
  | { type: "applicationType"; id: ApplicationTypeId }
  | { type: "tool"; tool: Tool }
  | { type: "language"; id: string }
  | { type: "framework"; id: string }
  | { type: "toggleBrowser"; id: string }
  | { type: "structure"; id: string }
  | { type: "toggleAddon"; id: string }
  | { type: "projectName"; name: string }
  | { type: "reset"; selection: SetupSelection };

export function createSelectionReducer(c: SetupCatalog) {
  return function reducer(sel: SetupSelection, action: SelectionAction): SetupSelection {
    switch (action.type) {
      case "applicationType":
        return { ...sel, applicationType: action.id };

      case "tool": {
        if (action.tool.id === sel.toolId) return sel;
        const languageId = action.tool.languageIds[0] ?? null;
        return {
          ...sel,
          applicationType: action.tool.applicationType,
          toolId: action.tool.id,
          languageId,
          frameworkId: languageId ? defaultFramework(c, action.tool.id, languageId) : null,
          browserIds: action.tool.supportsBrowsers ? ["chrome"] : [],
          addonIds: defaultAddons(c, action.tool.id, languageId),
        };
      }

      case "language": {
        if (!sel.toolId || action.id === sel.languageId) return sel;
        const next = {
          ...sel,
          languageId: action.id,
          frameworkId: defaultFramework(c, sel.toolId, action.id),
        };
        return { ...next, addonIds: keepAvailableAddons(c, next) };
      }

      case "framework":
        return { ...sel, frameworkId: action.id };

      case "toggleBrowser":
        return { ...sel, browserIds: toggle(sel.browserIds, action.id) };

      case "structure":
        return { ...sel, structureId: action.id };

      case "toggleAddon":
        return { ...sel, addonIds: toggle(sel.addonIds, action.id) };

      case "projectName":
        return { ...sel, projectName: action.name };

      case "reset":
        return action.selection;
    }
  };
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

// --- Preselection from URL (?tool=&language=&framework=&structure=) ---------

type Params = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? null;

export function resolveInitialState(
  c: SetupCatalog,
  params: Params
): { selection: SetupSelection; step: number } {
  const reducer = createSelectionReducer(c);
  let sel = { ...emptySelection };

  const tool = findTool(c, first(params.tool));
  if (!tool) return { selection: sel, step: 0 };
  sel = reducer(sel, { type: "tool", tool });

  const languageId = first(params.language);
  if (languageId && tool.languageIds.includes(languageId)) {
    sel = reducer(sel, { type: "language", id: languageId });
  }

  const frameworkId = first(params.framework);
  if (getFrameworks(c, sel.toolId, sel.languageId).some((f) => f.id === frameworkId)) {
    sel = reducer(sel, { type: "framework", id: frameworkId! });
  }

  const structureId = first(params.structure);
  if (findStructure(c, structureId)) {
    sel = reducer(sel, { type: "structure", id: structureId! });
  }

  sel = { ...sel, projectName: suggestProjectName(c, sel) };

  // Land on the stack step so the preselected choices are visible.
  return { selection: sel, step: 1 };
}
