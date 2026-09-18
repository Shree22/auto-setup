/**
 * Mock implementation of the AutoSetup backend.
 *
 * Mirrors what the real service will do so the UI can be built and
 * exercised end to end. Everything here is throwaway: once the backend
 * exists, lib/setup/api.ts stops calling these functions.
 */
import { mockCatalog } from "./mock-data";
import type {
  FileNode,
  GenerateProjectResult,
  ProjectPreview,
  SetupCatalog,
  SetupSelection,
} from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockGetCatalog(): Promise<SetupCatalog> {
  await delay(250);
  return structuredClone(mockCatalog);
}

export async function mockGetProjectPreview(
  selection: SetupSelection
): Promise<ProjectPreview> {
  await delay(600);
  return buildPreview(selection);
}

export async function mockGenerateProject(
  selection: SetupSelection
): Promise<GenerateProjectResult> {
  await delay(1600);
  const preview = buildPreview(selection);
  return {
    projectId: `mock-${Date.now().toString(36)}`,
    projectName: preview.projectName,
    fileCount: preview.fileCount,
    downloadUrl: null,
  };
}

// ---------------------------------------------------------------------------
// Preview builder
// ---------------------------------------------------------------------------

const file = (name: string): FileNode => ({ name, type: "file" });
const folder = (name: string, children: (FileNode | false | undefined)[]): FileNode => ({
  name,
  type: "folder",
  children: children.filter(Boolean) as FileNode[],
});

type Ctx = {
  tool: string;
  lang: string;
  framework: string;
  structure: string;
  has: (addonId: string) => boolean;
  pom: boolean;
  advanced: boolean;
};

function buildPreview(sel: SetupSelection): ProjectPreview {
  const addons = new Set(sel.addonIds);
  const structure = sel.structureId ?? "basic";
  const ctx: Ctx = {
    tool: sel.toolId ?? "selenium",
    lang: sel.languageId ?? "python",
    framework: sel.frameworkId ?? "pytest",
    structure,
    has: (id) => addons.has(id),
    pom: structure !== "basic",
    advanced: structure === "advanced",
  };

  const projectName = sel.projectName.trim() || "my-automation-project";

  const langTree =
    ctx.tool === "robot"
      ? robotTree(ctx)
      : ctx.lang === "java"
        ? javaTree(ctx)
        : ctx.lang === "python"
          ? pythonTree(ctx)
          : jsTree(ctx);

  const tree: FileNode[] = [
    ...langTree,
    (ctx.has("allure") || ctx.has("html-report")) && folder("reports", [file(".gitkeep")]),
    ctx.has("github-actions") &&
      folder(".github", [folder("workflows", [file("tests.yml")])]),
    ctx.has("docker") && file("Dockerfile"),
    ctx.has("docker") && file(".dockerignore"),
    ctx.has("env-config") && file(".env.example"),
    file(".gitignore"),
    file("README.md"),
  ].filter(Boolean) as FileNode[];

  return {
    projectName,
    fileCount: countFiles(tree),
    tree: [folder(projectName, tree)],
    dependencies: dependenciesFor(ctx),
    runCommand: runCommandFor(ctx),
  };
}

function pythonTree(c: Ctx): (FileNode | false)[] {
  const pageDir = c.tool === "appium" ? "screens" : "pages";
  const pageSuffix = c.tool === "appium" ? "_screen" : "_page";
  const bdd = c.framework === "behave";

  const pages =
    c.pom &&
    folder(pageDir, [
      file("__init__.py"),
      file(`base${pageSuffix}.py`),
      file(`login${pageSuffix}.py`),
      c.advanced && file(`home${pageSuffix}.py`),
    ]);

  const utils =
    (c.pom || c.has("logging") || c.has("screenshots")) &&
    folder("utils", [
      file("__init__.py"),
      c.tool !== "playwright" && file("driver_factory.py"),
      c.has("logging") && file("logger.py"),
      c.has("screenshots") && file("screenshot.py"),
      c.advanced && file("helpers.py"),
    ]);

  const config = folder("config", [
    file("config.yaml"),
    c.advanced && file("dev.yaml"),
    c.advanced && file("staging.yaml"),
    c.tool === "appium" && file("capabilities.yaml"),
  ]);

  const tests = bdd
    ? folder("features", [
        file("login.feature"),
        file("environment.py"),
        folder("steps", [file("login_steps.py")]),
      ])
    : folder("tests", [
        file("__init__.py"),
        file("test_login.py"),
        c.advanced && file("test_data_driven.py"),
      ]);

  return [
    tests,
    pages,
    utils,
    config,
    c.advanced && folder("test_data", [file("users.json")]),
    c.framework === "pytest" && file("conftest.py"),
    c.framework === "pytest" && file("pytest.ini"),
    bdd && file("behave.ini"),
    file("requirements.txt"),
  ];
}

function javaTree(c: Ctx): (FileNode | false)[] {
  const api = c.tool === "rest-assured";
  const mobile = c.tool === "appium";
  const bdd = c.framework === "cucumber";
  const pageDir = api ? "clients" : mobile ? "screens" : "pages";
  const pageSuffix = api ? "Client" : mobile ? "Screen" : "Page";
  const subject = api ? "User" : "Login";

  const pkg = folder("autosetup", [
    folder("base", [file("BaseTest.java")]),
    c.pom &&
      folder(pageDir, [
        file(`Base${pageSuffix}.java`),
        file(`${subject}${pageSuffix}.java`),
        c.advanced && !api && file(`Home${pageSuffix}.java`),
      ]),
    api && folder("models", [file("User.java")]),
    bdd
      ? folder("steps", [file(`${subject}Steps.java`)])
      : folder("tests", [
          file(`${subject}Test.java`),
          c.advanced && file(`${subject}DataDrivenTest.java`),
        ]),
    bdd && folder("runners", [file("TestRunner.java")]),
    (c.pom || c.has("screenshots")) &&
      folder("utils", [
        !api && file("DriverFactory.java"),
        file("ConfigReader.java"),
        c.has("screenshots") && !api && file("ScreenshotUtil.java"),
      ]),
  ]);

  return [
    folder("src", [
      folder("test", [
        folder("java", [folder("com", [pkg])]),
        folder("resources", [
          file("config.properties"),
          c.has("logging") && file("log4j2.xml"),
          c.has("allure") && file("allure.properties"),
          c.advanced && file("testdata.json"),
          mobile && file("capabilities.json"),
          bdd && folder("features", [file("login.feature")]),
        ]),
      ]),
    ]),
    c.framework === "testng" && file("testng.xml"),
    file("pom.xml"),
  ];
}

function jsTree(c: Ctx): (FileNode | false)[] {
  const ext = c.lang === "typescript" ? "ts" : "js";
  const withTs = c.lang === "typescript";

  if (c.tool === "cypress") {
    return [
      folder("cypress", [
        folder("e2e", [file(`login.cy.${ext}`), c.advanced && file(`data-driven.cy.${ext}`)]),
        c.pom &&
          folder("pages", [
            file(`base.page.${ext}`),
            file(`login.page.${ext}`),
            c.advanced && file(`home.page.${ext}`),
          ]),
        folder("fixtures", [file("users.json")]),
        folder("support", [file(`commands.${ext}`), file(`e2e.${ext}`)]),
      ]),
      file(`cypress.config.${ext}`),
      withTs && file("tsconfig.json"),
      file("package.json"),
    ];
  }

  return [
    folder("tests", [file(`login.spec.${ext}`), c.advanced && file(`data-driven.spec.${ext}`)]),
    c.pom &&
      folder("pages", [
        file(`base.page.${ext}`),
        file(`login.page.${ext}`),
        c.advanced && file(`home.page.${ext}`),
      ]),
    c.advanced && folder("fixtures", [file(`test-fixtures.${ext}`)]),
    (c.advanced || c.has("logging")) &&
      folder("utils", [c.has("logging") && file(`logger.${ext}`), c.advanced && file(`helpers.${ext}`)]),
    c.advanced && folder("test-data", [file("users.json")]),
    file(`playwright.config.${ext}`),
    withTs && file("tsconfig.json"),
    file("package.json"),
  ];
}

function robotTree(c: Ctx): (FileNode | false)[] {
  return [
    folder("tests", [file("login.robot"), c.advanced && file("data_driven.robot")]),
    folder("resources", [
      file("common.resource"),
      c.pom && folder("pages", [file("login_page.resource"), c.advanced && file("home_page.resource")]),
      file("variables.py"),
    ]),
    c.advanced && folder("test_data", [file("users.csv")]),
    file("requirements.txt"),
  ];
}

function countFiles(nodes: FileNode[]): number {
  return nodes.reduce(
    (n, node) => n + (node.type === "file" ? 1 : countFiles(node.children ?? [])),
    0
  );
}

function dependenciesFor(c: Ctx): string[] {
  const deps: (string | false)[] = [];

  if (c.lang === "python") {
    const toolPkg: Record<string, string> = {
      selenium: "selenium",
      playwright: c.framework === "pytest" ? "pytest-playwright" : "playwright",
      appium: "Appium-Python-Client",
      robot: "robotframework",
    };
    deps.push(
      toolPkg[c.tool],
      c.framework === "pytest" && "pytest",
      c.framework === "behave" && "behave",
      c.framework === "robot-selenium" && "robotframework-seleniumlibrary",
      c.framework === "robot-browser" && "robotframework-browser",
      c.has("allure") &&
        (c.tool === "robot" ? "allure-robotframework" : c.framework === "behave" ? "allure-behave" : "allure-pytest"),
      c.has("html-report") && c.framework === "pytest" && "pytest-html",
      c.has("webdriver-manager") && "webdriver-manager",
      c.has("env-config") && "python-dotenv",
      c.has("parallel") && (c.tool === "robot" ? "robotframework-pabot" : "pytest-xdist"),
      c.pom && "PyYAML"
    );
  } else if (c.lang === "java") {
    const toolPkg: Record<string, string> = {
      selenium: "selenium-java",
      playwright: "playwright (Java)",
      appium: "appium java-client",
      "rest-assured": "rest-assured",
    };
    deps.push(
      toolPkg[c.tool],
      c.framework === "testng" && "testng",
      c.framework === "junit5" && "junit-jupiter",
      c.framework === "cucumber" && "cucumber-java",
      c.has("allure") &&
        (c.framework === "junit5" ? "allure-junit5" : c.framework === "cucumber" ? "allure-cucumber7-jvm" : "allure-testng"),
      c.has("html-report") && "extentreports",
      c.has("webdriver-manager") && "webdrivermanager",
      c.has("logging") && "log4j-core",
      c.has("env-config") && "dotenv-java",
      c.tool === "rest-assured" && "jackson-databind"
    );
  } else {
    deps.push(
      c.tool === "cypress" ? "cypress" : "@playwright/test",
      c.lang === "typescript" && "typescript",
      c.has("allure") && (c.tool === "cypress" ? "allure-cypress" : "allure-playwright"),
      c.has("html-report") && c.tool === "cypress" && "mochawesome",
      c.has("env-config") && "dotenv",
      c.has("logging") && "winston"
    );
  }

  return deps.filter(Boolean) as string[];
}

function runCommandFor(c: Ctx): string {
  if (c.tool === "robot") {
    return `${c.has("parallel") ? "pabot" : "robot"} --outputdir reports tests`;
  }
  if (c.lang === "java") return "mvn clean test";
  if (c.tool === "cypress") return "npx cypress run";
  if (c.lang !== "python") return "npx playwright test";
  if (c.framework === "behave") return "behave";
  if (c.framework === "unittest") return "python -m unittest discover tests";

  return [
    "pytest",
    c.has("parallel") && "-n auto",
    c.has("allure") && "--alluredir=reports/allure-results",
  ]
    .filter(Boolean)
    .join(" ");
}
