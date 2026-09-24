/**
 * Setup wizard domain types.
 *
 * These describe the shapes the AutoSetup backend is expected to return.
 * The UI only depends on these types, so swapping the mock data layer
 * (lib/setup/api.ts) for real API calls should not require UI changes.
 */

export type ApplicationTypeId = "web" | "mobile" | "api";

export type ApplicationType = {
  id: ApplicationTypeId;
  name: string;
  description: string;
};

export type Tool = {
  id: string;
  name: string;
  description: string;
  applicationType: ApplicationTypeId;
  /** Key into the client-side icon map; backend sends a key, never markup. */
  icon: string;
  /** Language ids this tool can be set up with. */
  languageIds: string[];
  /** Whether the stack step should ask for target browsers. */
  supportsBrowsers: boolean;
  tag?: string;
};

export type Language = {
  id: string;
  name: string;
  /** Version shown as a hint, e.g. "3.12+". */
  version: string;
};

export type Framework = {
  id: string;
  name: string;
  description: string;
  languageIds: string[];
  toolIds: string[];
  recommended?: boolean;
};

export type Browser = {
  id: string;
  name: string;
};

export type ProjectStructure = {
  id: string;
  name: string;
  description: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  highlights: string[];
  recommended?: boolean;
};

export type AddonCategory = "Reporting" | "Debugging" | "Utilities" | "CI/CD";

export type Addon = {
  id: string;
  name: string;
  description: string;
  category: AddonCategory;
  /** Restrict to these tools / languages. Omitted means available for all. */
  toolIds?: string[];
  languageIds?: string[];
  defaultSelected?: boolean;
};

/** Everything the wizard needs to render its options — one backend call. */
export type SetupCatalog = {
  applicationTypes: ApplicationType[];
  tools: Tool[];
  languages: Language[];
  frameworks: Framework[];
  browsers: Browser[];
  structures: ProjectStructure[];
  addons: Addon[];
};

/** What the user has chosen. This is the request body for preview/generate. */
export type SetupSelection = {
  applicationType: ApplicationTypeId;
  toolId: string | null;
  languageId: string | null;
  frameworkId: string | null;
  browserIds: string[];
  structureId: string | null;
  addonIds: string[];
  projectName: string;
};

export type FileNode = {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
};

/** Software the user must install on their machine before running the project. */
export type Prerequisite = {
  name: string;
  /** Minimum version, e.g. "3.10+". */
  version: string;
  /** Why it's needed, shown under the name. */
  reason?: string;
  /** Official download page. */
  url?: string;
  /** Only needed for an add-on the user picked. */
  optional?: boolean;
};

/** One command in the "get running" sequence, in order. */
export type SetupStep = {
  label: string;
  command: string;
  /** Platform caveat or extra hint. */
  note?: string;
};

export type ProjectPreview = {
  projectName: string;
  fileCount: number;
  tree: FileNode[];
  dependencies: string[];
  /** Software to install before the commands below will work. */
  prerequisites: Prerequisite[];
  /** Commands to run once, in order, to set the project up. */
  setupSteps: SetupStep[];
  /** Command to run tests once the project is set up. */
  runCommand: string;
  /** Command to open the test report, when a reporting add-on is selected. */
  reportCommand?: string;
};

export type GenerateProjectResult = {
  projectId: string;
  projectName: string;
  fileCount: number;
  /** Will point at the ZIP once the backend exists. */
  downloadUrl: string | null;
};
