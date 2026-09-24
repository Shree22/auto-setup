/**
 * Builds the preview of a generated project: its file tree, dependencies,
 * prerequisites and setup commands. Runs on the server, behind
 * /api/setup/preview.
 *
 * Note: this describes what WOULD be generated. Writing the real files is
 * still to come.
 */
import type {
  FileNode,
  Prerequisite,
  ProjectPreview,
  SetupSelection,
  SetupStep,
} from "./types";

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
  browsers: string[];
  has: (addonId: string) => boolean;
  pom: boolean;
  advanced: boolean;
};

export function buildPreview(sel: SetupSelection): ProjectPreview {
  const addons = new Set(sel.addonIds);
  const structure = sel.structureId ?? "basic";
  const ctx: Ctx = {
    tool: sel.toolId ?? "selenium",
    lang: sel.languageId ?? "python",
    framework: sel.frameworkId ?? "pytest",
    structure,
    browsers: sel.browserIds,
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
    prerequisites: prerequisitesFor(ctx),
    setupSteps: setupStepsFor(ctx),
    runCommand: runCommandFor(ctx),
    ...(reportCommandFor(ctx) ? { reportCommand: reportCommandFor(ctx)! } : {}),
  };
}

function pythonTree(c: Ctx): (FileNode | false)[] {
  const pageDir = c.tool === "appium" ? "screens" : "pages";
  const pageSuffix = c.tool === "appium" ? "_screen" : "_page";
  const bdd = c.framework === "behave";

  const web = c.tool !== "appium";

  const pages =
    c.pom &&
    folder(pageDir, [
      file("__init__.py"),
      file(`base${pageSuffix}.py`),
      file(`login${pageSuffix}.py`),
      web && file(`products${pageSuffix}.py`),
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
        web && file("test_sorting.py"),
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
        !api && !mobile && file(`Products${pageSuffix}.java`),
      ]),
    api && folder("models", [file("User.java")]),
    bdd
      ? folder("steps", [file(`${subject}Steps.java`)])
      : folder("tests", [
          file(`${subject}Test.java`),
          !api && !mobile && file("SortingTest.java"),
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
        folder("e2e", [
          file(`login.cy.${ext}`),
          file(`sorting.cy.${ext}`),
          c.advanced && file(`data-driven.cy.${ext}`),
        ]),
        c.pom &&
          folder("pages", [
            file(`base.page.${ext}`),
            file(`login.page.${ext}`),
            file(`products.page.${ext}`),
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
    folder("tests", [
      file(`login.spec.${ext}`),
      file(`sorting.spec.${ext}`),
      c.advanced && file(`data-driven.spec.${ext}`),
    ]),
    c.pom &&
      folder("pages", [
        file(`base.page.${ext}`),
        file(`login.page.${ext}`),
        file(`products.page.${ext}`),
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
    folder("tests", [
      file("login.robot"),
      file("sorting.robot"),
      c.advanced && file("data_driven.robot"),
    ]),
    folder("resources", [
      file("common.resource"),
      c.pom &&
        folder("pages", [file("login_page.resource"), file("products_page.resource")]),
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
      toolPkg[c.tool] ?? false,
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
      // The config files are YAML, and the Appium driver factory reads them.
      (c.pom || c.tool === "appium") && "PyYAML"
    );
  } else if (c.lang === "java") {
    const toolPkg: Record<string, string> = {
      selenium: "selenium-java",
      playwright: "playwright (Java)",
      appium: "appium java-client",
      "rest-assured": "rest-assured",
    };
    deps.push(
      toolPkg[c.tool] ?? false,
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

const BROWSER_NAMES: Record<string, string> = {
  chrome: "Google Chrome",
  firefox: "Mozilla Firefox",
  edge: "Microsoft Edge",
  safari: "Safari",
};

function prerequisitesFor(c: Ctx): Prerequisite[] {
  const list: Prerequisite[] = [];

  if (c.lang === "python") {
    list.push({
      name: "Python",
      version: "3.10+",
      reason: "Runs your tests. Includes pip for installing packages.",
      url: "https://www.python.org/downloads/",
    });
  }

  if (c.lang === "java") {
    list.push(
      {
        name: "Java JDK",
        version: "17+",
        reason: "Compiles and runs your tests.",
        url: "https://adoptium.net/",
      },
      {
        name: "Apache Maven",
        version: "3.9+",
        reason: "Installs dependencies and runs the suite.",
        url: "https://maven.apache.org/download.cgi",
      }
    );
  }

  if (c.lang === "typescript" || c.lang === "javascript") {
    list.push({
      name: "Node.js",
      version: "20 LTS+",
      reason: "Runs your tests. Includes npm for installing packages.",
      url: "https://nodejs.org/en/download",
    });
  }

  if (c.tool === "appium") {
    list.push(
      {
        name: "Node.js",
        version: "20 LTS+",
        reason: "Needed to install the Appium server.",
        url: "https://nodejs.org/en/download",
      },
      {
        name: "Android Studio or Xcode",
        version: "latest",
        reason: "Provides the emulator or simulator your tests drive.",
      }
    );
  }

  // Selenium drives browsers installed on your machine; Playwright and Cypress
  // download their own.
  if (c.tool === "selenium" || c.tool === "robot") {
    for (const id of c.browsers) {
      const name = BROWSER_NAMES[id];
      if (name) list.push({ name, version: "latest", reason: "Your tests run in this browser." });
    }
  }

  if (c.has("allure")) {
    list.push({
      name: "Allure CLI",
      version: "2.x",
      reason: "Turns test results into the Allure report.",
      url: "https://allurereport.org/docs/install/",
      optional: true,
    });
  }

  if (c.has("docker")) {
    list.push({
      name: "Docker Desktop",
      version: "latest",
      reason: "Runs the suite inside a container.",
      url: "https://www.docker.com/products/docker-desktop/",
      optional: true,
    });
  }

  return list;
}

function setupStepsFor(c: Ctx): SetupStep[] {
  const steps: SetupStep[] = [];

  if (c.lang === "python") {
    steps.push(
      { label: "Create a virtual environment", command: "python -m venv .venv" },
      {
        label: "Activate it",
        command: ".venv\\Scripts\\activate",
        note: "On macOS or Linux: source .venv/bin/activate",
      },
      { label: "Install dependencies", command: "pip install -r requirements.txt" }
    );
    if (c.tool === "playwright") {
      steps.push({ label: "Download the browsers", command: "playwright install" });
    }
    if (c.framework === "robot-browser") {
      steps.push({ label: "Initialise Browser Library", command: "rfbrowser init" });
    }
  } else if (c.lang === "java") {
    steps.push({
      label: "Download dependencies",
      command: "mvn clean install -DskipTests",
      note: "Maven caches them, so this is slow only the first time.",
    });
    if (c.tool === "playwright") {
      steps.push({
        label: "Download the browsers",
        command: 'mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"',
      });
    }
  } else {
    steps.push({ label: "Install dependencies", command: "npm install" });
    if (c.tool === "playwright") {
      steps.push({ label: "Download the browsers", command: "npx playwright install" });
    }
  }

  if (c.tool === "appium") {
    steps.push(
      { label: "Install the Appium server", command: "npm install -g appium" },
      {
        label: "Add the driver for your platform",
        command: "appium driver install uiautomator2",
        note: "For iOS use: appium driver install xcuitest",
      },
      { label: "Start the server, then run your tests", command: "appium" }
    );
  }

  return steps;
}

/** How the user opens the report their chosen add-on produces. */
function reportCommandFor(c: Ctx): string | null {
  if (c.has("allure")) return "allure serve reports/allure-results";

  if (c.has("html-report")) {
    if (c.tool === "cypress") return "npx marge reports/mochawesome/*.json -o reports/html";
    if (c.lang === "java") return "open reports/extent-report.html";
    if (c.lang === "python") return "open reports/report.html";
  }

  if (c.tool === "robot") return "open reports/report.html";
  if (c.tool === "playwright" && c.lang !== "python" && c.lang !== "java")
    return "npx playwright show-report reports/html";

  return null;
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
