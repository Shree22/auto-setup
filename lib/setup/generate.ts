/**
 * Turns a selection into the actual files of a starter project.
 *
 * The files are a working skeleton: manifests, config and runnable sample
 * tests with TODO markers where the user writes their own. The file list
 * comes from buildPreview(), so the preview and the ZIP always match.
 */
import { catalog } from "./catalog";
import { buildPreview } from "./preview";
import type { FileNode, ProjectPreview, SetupSelection } from "./types";

export type GeneratedFile = { path: string; content: string };

type Ctx = {
  name: string;
  tool: string;
  toolName: string;
  lang: string;
  langName: string;
  framework: string;
  frameworkName: string;
  structureName: string;
  browsers: string[];
  has: (addon: string) => boolean;
  pom: boolean;
  advanced: boolean;
  preview: ProjectPreview;
};

export function generateProjectFiles(sel: SetupSelection): GeneratedFile[] {
  const preview = buildPreview(sel);
  const addons = new Set(sel.addonIds);
  const structureId = sel.structureId ?? "basic";

  const ctx: Ctx = {
    name: preview.projectName,
    tool: sel.toolId ?? "selenium",
    toolName: catalog.tools.find((t) => t.id === sel.toolId)?.name ?? "Selenium",
    lang: sel.languageId ?? "python",
    langName: catalog.languages.find((l) => l.id === sel.languageId)?.name ?? "Python",
    framework: sel.frameworkId ?? "pytest",
    frameworkName: catalog.frameworks.find((f) => f.id === sel.frameworkId)?.name ?? "Pytest",
    structureName: catalog.structures.find((s) => s.id === structureId)?.name ?? "Basic",
    browsers: sel.browserIds,
    has: (id) => addons.has(id),
    pom: structureId !== "basic",
    advanced: structureId === "advanced",
    preview,
  };

  const root = preview.tree[0];
  return flatten(root?.children ?? [], "").map((path) => ({
    path,
    content: contentFor(path, ctx),
  }));
}

function flatten(nodes: FileNode[], prefix: string): string[] {
  return nodes.flatMap((node) =>
    node.type === "file"
      ? [`${prefix}${node.name}`]
      : flatten(node.children ?? [], `${prefix}${node.name}/`)
  );
}

// ---------------------------------------------------------------------------
// Content routing
// ---------------------------------------------------------------------------

function contentFor(path: string, c: Ctx): string {
  const base = path.split("/").pop() ?? path;

  if (base === ".gitkeep" || base === "__init__.py") return "";
  if (base === "README.md") return readme(c);
  if (base === ".gitignore") return gitignore(c);
  if (base === ".env.example") return envExample(c);
  if (base === "Dockerfile") return dockerfile(c);
  if (base === ".dockerignore") return "node_modules\n.venv\ntarget\nreports\n.git\n";
  if (path.endsWith(".github/workflows/tests.yml")) return workflow(c);

  if (base === "requirements.txt") return `${c.preview.dependencies.join("\n")}\n`;
  if (base === "package.json") return packageJson(c);
  if (base === "tsconfig.json") return tsconfigJson(c);
  if (base === "pom.xml") return pomXml(c);
  if (base === "testng.xml") return testngXml(c);
  if (base === "pytest.ini") return pytestIni(c);
  if (base === "behave.ini") return "[behave]\nshow_timings = true\nformat = pretty\n";
  if (base === "allure.properties") return "allure.results.directory=reports/allure-results\n";
  if (base === "log4j2.xml") return log4j2Xml();
  if (base === "config.properties") return configProperties(c);
  if (base.endsWith(".yaml") || base.endsWith(".yml")) return configYaml(base, c);
  if (base === "capabilities.json") return capabilitiesJson();
  if (base === "users.json" || base === "testdata.json") return testData();
  if (base === "users.csv") return "username,password\nstandard_user,secret_sauce\nlocked_user,secret_sauce\n";

  if (base === "conftest.py") return conftestPy(c);
  if (base === "environment.py") return behaveEnvironmentPy(c);
  if (base.endsWith(".feature")) return featureFile();
  if (base.endsWith(".robot") || base.endsWith(".resource")) return robotFile(path, base, c);
  if (base === "variables.py") {
    return `BASE_URL = "https://www.saucedemo.com"
BROWSER = "${c.browsers[0] ?? "chrome"}"
TIMEOUT = 10
`;
  }
  if (base.endsWith(".py")) return pythonFile(path, base, c);
  if (base.endsWith(".java")) return javaFile(base, c);
  if (base.endsWith(".ts") || base.endsWith(".js")) return nodeFile(path, base, c);

  return `# ${base}\n# TODO: add content.\n`;
}

// ---------------------------------------------------------------------------
// Shared files
// ---------------------------------------------------------------------------

function readme(c: Ctx): string {
  const steps = c.preview.setupSteps
    .map((s, i) => `${i + 1}. ${s.label}\n\n   \`\`\`bash\n   ${s.command}\n   \`\`\`${s.note ? `\n\n   > ${s.note}` : ""}`)
    .join("\n\n");

  const prereqs = c.preview.prerequisites
    .map((p) => `- **${p.name}** ${p.version}${p.optional ? " _(optional)_" : ""} — ${p.reason ?? ""}`)
    .join("\n");

  return `# ${c.name}

Test automation project generated with [AutoSetup](https://github.com/).

## Stack

| | |
|---|---|
| Tool | ${c.toolName} |
| Language | ${c.langName} |
| Framework | ${c.frameworkName} |
| Structure | ${c.structureName} |
${c.browsers.length ? `| Browsers | ${c.browsers.join(", ")} |\n` : ""}
## Required software

${prereqs}

## Setup

${steps}

## Run the tests

\`\`\`bash
${c.preview.runCommand}
\`\`\`

## Project structure

\`\`\`
${treeText(c.preview.tree)}\`\`\`

## Next steps

The sample tests point at a demo site. Replace the URL and locators with your
own application, then add tests beside the samples.
`;
}

function treeText(nodes: FileNode[], indent = ""): string {
  return nodes
    .map((node, i) => {
      const last = i === nodes.length - 1;
      const branch = indent === "" ? "" : last ? "└── " : "├── ";
      const line = `${indent}${branch}${node.name}${node.type === "folder" ? "/" : ""}\n`;
      const childIndent = indent === "" ? "  " : indent + (last ? "    " : "│   ");
      return node.type === "folder" && node.children?.length
        ? line + treeText(node.children, childIndent)
        : line;
    })
    .join("");
}

function gitignore(c: Ctx): string {
  const common = "reports/\nallure-results/\nscreenshots/\nvideos/\n.env\n.idea/\n.vscode/\n.DS_Store\n";
  if (c.lang === "python") return `.venv/\nvenv/\n__pycache__/\n*.pyc\n.pytest_cache/\n${common}`;
  if (c.lang === "java") return `target/\n*.class\n${common}`;
  return `node_modules/\ntest-results/\nplaywright-report/\ncypress/downloads/\n${common}`;
}

function envExample(c: Ctx): string {
  return `# Copy to .env and adjust
BASE_URL=https://www.saucedemo.com
USERNAME=standard_user
PASSWORD=secret_sauce
${c.browsers.length ? `BROWSER=${c.browsers[0]}\n` : ""}HEADLESS=true
`;
}

function dockerfile(c: Ctx): string {
  if (c.lang === "python") {
    return `FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["sh", "-c", "${c.preview.runCommand}"]
`;
  }
  if (c.lang === "java") {
    return `FROM maven:3.9-eclipse-temurin-17

WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY . .

CMD ["mvn", "test"]
`;
  }
  return `FROM node:20-slim

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["sh", "-c", "${c.preview.runCommand}"]
`;
}

function workflow(c: Ctx): string {
  const setup =
    c.lang === "python"
      ? `      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt`
      : c.lang === "java"
        ? `      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"
      - run: mvn -B dependency:go-offline`
        : `      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci || npm install`;

  return `name: Tests

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
${setup}
      - name: Run tests
        run: ${c.preview.runCommand}
      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-reports
          path: reports/
`;
}

function configYaml(base: string, c: Ctx): string {
  const env = base.replace(".yaml", "").replace(".yml", "");
  const host =
    env === "staging" ? "https://staging.saucedemo.com" : "https://www.saucedemo.com";
  if (base === "capabilities.yaml") return capabilitiesJson();
  return `# ${env} settings
base_url: ${host}
browser: ${c.browsers[0] ?? "chrome"}
headless: true
timeout: 10
`;
}

function configProperties(c: Ctx): string {
  return `base.url=https://www.saucedemo.com
browser=${c.browsers[0] ?? "chrome"}
headless=true
timeout=10
`;
}

function capabilitiesJson(): string {
  return `{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Android Emulator",
  "appium:app": "/path/to/your/app.apk"
}
`;
}

function testData(): string {
  return `{
  "validUser": { "username": "standard_user", "password": "secret_sauce" },
  "lockedUser": { "username": "locked_out_user", "password": "secret_sauce" }
}
`;
}

function featureFile(): string {
  return `Feature: Login

  Scenario: A valid user can log in
    Given I am on the login page
    When I log in as "standard_user"
    Then I should see the products page
`;
}

// ---------------------------------------------------------------------------
// Python
// ---------------------------------------------------------------------------

function pytestIni(c: Ctx): string {
  const addopts = [
    "-v",
    c.has("html-report") && "--html=reports/report.html --self-contained-html",
    c.has("allure") && "--alluredir=reports/allure-results",
  ]
    .filter(Boolean)
    .join(" ");

  return `[pytest]
testpaths = tests
addopts = ${addopts}
markers =
    smoke: quick checks that must always pass
`;
}

function conftestPy(c: Ctx): string {
  if (c.tool === "playwright") {
    return `"""Shared pytest fixtures."""
import pytest


@pytest.fixture(scope="session")
def base_url():
    return "https://www.saucedemo.com"


@pytest.fixture
def page(page, base_url):
    """pytest-playwright provides \`page\`; we just navigate first."""
    page.goto(base_url)
    yield page
`;
  }

  const screenshotHook = c.has("screenshots")
    ? `

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Save a screenshot when a test fails."""
    outcome = yield
    report = outcome.get_result()
    if report.when == "call" and report.failed:
        driver = item.funcargs.get("driver")
        if driver:
            Path("reports/screenshots").mkdir(parents=True, exist_ok=True)
            driver.save_screenshot(f"reports/screenshots/{item.name}.png")`
    : "";

  return `"""Shared pytest fixtures."""
from pathlib import Path

import pytest

from utils.driver_factory import create_driver


@pytest.fixture(scope="session")
def base_url():
    return "https://www.saucedemo.com"


@pytest.fixture
def driver(base_url):
    driver = create_driver("${c.browsers[0] ?? "chrome"}")
    driver.get(base_url)
    yield driver
    driver.quit()${screenshotHook}
`;
}

function behaveEnvironmentPy(c: Ctx): string {
  return `"""Behave hooks: runs before and after each scenario."""
from utils.driver_factory import create_driver


def before_scenario(context, scenario):
    context.driver = create_driver("${c.browsers[0] ?? "chrome"}")
    context.driver.get("https://www.saucedemo.com")


def after_scenario(context, scenario):
    context.driver.quit()
`;
}

function pythonFile(path: string, base: string, c: Ctx): string {
  const playwright = c.tool === "playwright";

  if (base === "driver_factory.py") {
    return `"""Creates the WebDriver instance the tests run against."""
from selenium import webdriver


def create_driver(browser: str = "chrome", headless: bool = True):
    """Return a ready-to-use WebDriver for the given browser."""
    if browser == "firefox":
        options = webdriver.FirefoxOptions()
        if headless:
            options.add_argument("-headless")
        driver = webdriver.Firefox(options=options)
    elif browser == "edge":
        options = webdriver.EdgeOptions()
        if headless:
            options.add_argument("--headless=new")
        driver = webdriver.Edge(options=options)
    else:
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument("--headless=new")
        driver = webdriver.Chrome(options=options)

    driver.implicitly_wait(10)
    driver.maximize_window()
    return driver
`;
  }

  if (base === "logger.py") {
    return `"""Project-wide logger."""
import logging
from pathlib import Path

Path("reports").mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    handlers=[logging.FileHandler("reports/test.log"), logging.StreamHandler()],
)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)
`;
  }

  if (base === "screenshot.py") {
    return `"""Screenshot helper."""
from datetime import datetime
from pathlib import Path

SCREENSHOT_DIR = Path("reports/screenshots")


def take_screenshot(driver, name: str) -> Path:
    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    path = SCREENSHOT_DIR / f"{name}-{stamp}.png"
    driver.save_screenshot(str(path))
    return path
`;
  }

  if (base === "helpers.py") {
    return `"""Small helpers shared by tests."""
import json
from pathlib import Path


def load_test_data(name: str = "users.json") -> dict:
    return json.loads((Path("test_data") / name).read_text(encoding="utf-8"))
`;
  }

  if (base === "base_page.py" || base === "base_screen.py") {
    return playwright
      ? `"""Base class for all page objects."""


class BasePage:
    def __init__(self, page):
        self.page = page

    def open(self, path: str = "/"):
        self.page.goto(path)

    def click(self, selector: str):
        self.page.click(selector)

    def type(self, selector: str, text: str):
        self.page.fill(selector, text)

    def text_of(self, selector: str) -> str:
        return self.page.inner_text(selector)
`
      : `"""Base class for all page objects."""
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class BasePage:
    def __init__(self, driver, timeout: int = 10):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def find(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))

    def click(self, locator):
        self.wait.until(EC.element_to_be_clickable(locator)).click()

    def type(self, locator, text: str):
        element = self.find(locator)
        element.clear()
        element.send_keys(text)

    def text_of(self, locator) -> str:
        return self.find(locator).text
`;
  }

  if (base === "login_page.py" || base === "login_screen.py") {
    return playwright
      ? `"""Login page object."""
from pages.base_page import BasePage


class LoginPage(BasePage):
    USERNAME = "#user-name"
    PASSWORD = "#password"
    SUBMIT = "#login-button"
    ERROR = "[data-test='error']"

    def login(self, username: str, password: str):
        self.type(self.USERNAME, username)
        self.type(self.PASSWORD, password)
        self.click(self.SUBMIT)

    def error_message(self) -> str:
        return self.text_of(self.ERROR)
`
      : `"""Login page object."""
from selenium.webdriver.common.by import By

from pages.base_page import BasePage


class LoginPage(BasePage):
    USERNAME = (By.ID, "user-name")
    PASSWORD = (By.ID, "password")
    SUBMIT = (By.ID, "login-button")
    ERROR = (By.CSS_SELECTOR, "[data-test='error']")

    def login(self, username: str, password: str):
        self.type(self.USERNAME, username)
        self.type(self.PASSWORD, password)
        self.click(self.SUBMIT)

    def error_message(self) -> str:
        return self.text_of(self.ERROR)
`;
  }

  if (base === "home_page.py" || base === "home_screen.py") {
    return `"""Products page object. TODO: add the elements your tests need."""
from pages.base_page import BasePage


class HomePage(BasePage):
    pass
`;
  }

  if (base === "test_login.py") {
    const fixture = playwright ? "page" : "driver";
    const build = c.pom ? `    login_page = LoginPage(${fixture})\n` : "";
    const imports = c.pom ? "from pages.login_page import LoginPage\n\n\n" : "";

    return `"""Sample login tests. Replace with your own application."""
${imports}def test_valid_login_shows_products(${fixture}):
${build}${
      c.pom
        ? `    login_page.login("standard_user", "secret_sauce")\n`
        : `    # TODO: interact with your app here\n`
    }    assert "inventory" in ${fixture}.${playwright ? "url" : "current_url"}


def test_invalid_login_shows_error(${fixture}):
${build}${
      c.pom
        ? `    login_page.login("wrong_user", "wrong_password")\n    assert "do not match" in login_page.error_message()`
        : `    assert ${fixture} is not None  # TODO: assert on the error message`
    }
`;
  }

  if (base === "test_data_driven.py") {
    return `"""Same test, many inputs."""
import pytest

CREDENTIALS = [
    ("standard_user", "secret_sauce", True),
    ("locked_out_user", "secret_sauce", False),
]


@pytest.mark.parametrize("username,password,should_pass", CREDENTIALS)
def test_login_combinations(${c.tool === "playwright" ? "page" : "driver"}, username, password, should_pass):
    # TODO: log in with these credentials and assert the outcome.
    assert isinstance(should_pass, bool)
`;
  }

  if (path.includes("steps/")) {
    return `"""Behave step definitions."""
from behave import given, then, when

from pages.login_page import LoginPage


@given("I am on the login page")
def step_open_login(context):
    context.login_page = LoginPage(context.driver)


@when('I log in as "{username}"')
def step_login(context, username):
    context.login_page.login(username, "secret_sauce")


@then("I should see the products page")
def step_check_products(context):
    assert "inventory" in context.driver.current_url
`;
  }

  return `"""TODO: implement ${base}."""\n`;
}

// ---------------------------------------------------------------------------
// Node (Playwright / Cypress)
// ---------------------------------------------------------------------------

const NODE_VERSIONS: Record<string, string> = {
  "@playwright/test": "^1.49.0",
  cypress: "^14.0.0",
  typescript: "^5.7.0",
  "allure-playwright": "^3.0.0",
  "allure-cypress": "^3.0.0",
  mochawesome: "^7.1.3",
  dotenv: "^16.4.0",
  winston: "^3.17.0",
};

function packageJson(c: Ctx): string {
  const devDeps: Record<string, string> = {};
  for (const dep of c.preview.dependencies) {
    devDeps[dep] = NODE_VERSIONS[dep] ?? "latest";
  }
  if (c.lang === "typescript") devDeps["@types/node"] = "^22.10.0";

  const scripts: Record<string, string> =
    c.tool === "cypress"
      ? { test: "cypress run", "test:open": "cypress open" }
      : { test: "playwright test", "test:ui": "playwright test --ui", report: "playwright show-report" };

  return `${JSON.stringify(
    {
      name: c.name,
      version: "1.0.0",
      private: true,
      description: `${c.toolName} + ${c.langName} test automation`,
      scripts,
      devDependencies: Object.fromEntries(Object.entries(devDeps).sort()),
    },
    null,
    2
  )}\n`;
}

function tsconfigJson(c: Ctx): string {
  return `${JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        module: "commonjs",
        moduleResolution: "node",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        types: c.tool === "cypress" ? ["cypress", "node"] : ["node"],
      },
      include: c.tool === "cypress" ? ["cypress/**/*.ts"] : ["**/*.ts"],
    },
    null,
    2
  )}\n`;
}

const PW_BROWSERS: Record<string, string> = {
  chrome: `    { name: "chromium", use: { ...devices["Desktop Chrome"] } },`,
  firefox: `    { name: "firefox", use: { ...devices["Desktop Firefox"] } },`,
  edge: `    { name: "edge", use: { ...devices["Desktop Edge"], channel: "msedge" } },`,
  safari: `    { name: "webkit", use: { ...devices["Desktop Safari"] } },`,
};

function nodeFile(path: string, base: string, c: Ctx): string {
  const ts = c.lang === "typescript";

  if (base.startsWith("playwright.config")) {
    const projects = c.browsers.map((b) => PW_BROWSERS[b]).filter(Boolean).join("\n");
    const reporters = [
      `["list"]`,
      c.has("html-report") && `["html", { outputFolder: "reports/html" }]`,
      c.has("allure") && `["allure-playwright", { resultsDir: "reports/allure-results" }]`,
    ]
      .filter(Boolean)
      .join(", ");

    return `import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: ${c.has("parallel")},
  retries: process.env.CI ? 2 : 0,
  reporter: [${reporters}],
  use: {
    baseURL: process.env.BASE_URL ?? "https://www.saucedemo.com",
    headless: true,
    screenshot: "${c.has("screenshots") ? "only-on-failure" : "off"}",
    video: "${c.has("video") ? "retain-on-failure" : "off"}",
    trace: "on-first-retry",
  },
  projects: [
${projects || `    { name: "chromium", use: { ...devices["Desktop Chrome"] } },`}
  ],
});
`;
  }

  if (base.startsWith("cypress.config")) {
    return `import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.BASE_URL ?? "https://www.saucedemo.com",
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",
    supportFile: "cypress/support/e2e.${ts ? "ts" : "js"}",
    screenshotOnRunFailure: ${c.has("screenshots")},
    video: ${c.has("video")},
    defaultCommandTimeout: 10_000,
    setupNodeEvents(on, config) {
      // TODO: register plugins and custom tasks here.
      return config;
    },
  },
});
`;
  }

  if (base.startsWith("e2e.")) {
    return `// Runs before every spec file.
import "./commands";
${c.has("allure") ? 'import "allure-cypress/commands";\n' : ""}`;
  }

  if (base.startsWith("commands.")) {
    return `${ts ? "export {};\n\n" : ""}// Custom Cypress commands.
Cypress.Commands.add("login", (username${ts ? ": string" : ""}, password${ts ? ": string" : ""}) => {
  cy.visit("/");
  cy.get("#user-name").type(username);
  cy.get("#password").type(password);
  cy.get("#login-button").click();
});
${
  ts
    ? `
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
    }
  }
}
`
    : ""
}`;
  }

  if (base.startsWith("logger.")) {
    return `import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "reports/test.log" })],
});
`;
  }

  if (base.startsWith("helpers.")) {
    return `// Small helpers shared by tests.
export function randomEmail()${ts ? ": string" : ""} {
  return \`user\${Date.now()}@example.com\`;
}
`;
  }

  if (base.startsWith("test-fixtures.")) {
    return `import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

// Fixtures give every test a ready-made page object.
export const test = base.extend<{ loginPage: LoginPage }>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

export { expect } from "@playwright/test";
`;
  }

  if (base.startsWith("base.page.")) {
    if (c.tool === "cypress") {
      return `// Shared helpers for all page objects.
export class BasePage {
  visit(path = "/") {
    cy.visit(path);
  }

  click(selector${ts ? ": string" : ""}) {
    cy.get(selector).click();
  }

  type(selector${ts ? ": string" : ""}, text${ts ? ": string" : ""}) {
    cy.get(selector).clear().type(text);
  }
}
`;
    }
    return `import type { Page } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page${ts ? ": Page" : ""}) {}

  async open(path = "/") {
    await this.page.goto(path);
  }

  async click(selector${ts ? ": string" : ""}) {
    await this.page.click(selector);
  }

  async type(selector${ts ? ": string" : ""}, text${ts ? ": string" : ""}) {
    await this.page.fill(selector, text);
  }
}
`;
  }

  if (base.startsWith("login.page.")) {
    if (c.tool === "cypress") {
      return `import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  private readonly username = "#user-name";
  private readonly password = "#password";
  private readonly submit = "#login-button";
  readonly error = "[data-test='error']";

  login(username${ts ? ": string" : ""}, password${ts ? ": string" : ""}) {
    this.visit("/");
    this.type(this.username, username);
    this.type(this.password, password);
    this.click(this.submit);
  }
}
`;
    }
    return `import { BasePage } from "./base.page";

export class LoginPage extends BasePage {
  private readonly username = "#user-name";
  private readonly password = "#password";
  private readonly submit = "#login-button";
  readonly error = "[data-test='error']";

  async login(username${ts ? ": string" : ""}, password${ts ? ": string" : ""}) {
    await this.open("/");
    await this.type(this.username, username);
    await this.type(this.password, password);
    await this.click(this.submit);
  }
}
`;
  }

  if (base.startsWith("home.page.")) {
    return `import { BasePage } from "./base.page";

// TODO: add the elements your tests need.
export class HomePage extends BasePage {}
`;
  }

  if (base.startsWith("login.cy.")) {
    const usePom = c.pom;
    return `${usePom ? 'import { LoginPage } from "../pages/login.page";\n\n' : ""}describe("Login", () => {
  ${usePom ? "const loginPage = new LoginPage();\n\n  " : ""}it("logs in a valid user", () => {
    ${usePom ? 'loginPage.login("standard_user", "secret_sauce");' : 'cy.visit("/");\n    // TODO: log in here'}
    cy.url().should("include", "inventory");
  });

  it("shows an error for a wrong password", () => {
    ${usePom ? 'loginPage.login("standard_user", "nope");\n    cy.get(loginPage.error).should("be.visible");' : "// TODO: assert the error message"}
  });
});
`;
  }

  if (base.startsWith("login.spec.")) {
    const usePom = c.pom;
    return `import { expect, test } from "@playwright/test";
${usePom ? 'import { LoginPage } from "../pages/login.page";\n' : ""}
test.describe("Login", () => {
  test("logs in a valid user", async ({ page }) => {
    ${usePom ? "const loginPage = new LoginPage(page);\n    await loginPage.login(\"standard_user\", \"secret_sauce\");" : 'await page.goto("/");\n    // TODO: log in here'}
    await expect(page).toHaveURL(/inventory/);
  });

  test("shows an error for a wrong password", async ({ page }) => {
    ${usePom ? "const loginPage = new LoginPage(page);\n    await loginPage.login(\"standard_user\", \"nope\");\n    await expect(page.locator(loginPage.error)).toBeVisible();" : "// TODO: assert the error message"}
  });
});
`;
  }

  if (base.startsWith("data-driven.")) {
    return `// The same test run with several inputs.
const users = [
  { username: "standard_user", password: "secret_sauce", valid: true },
  { username: "locked_out_user", password: "secret_sauce", valid: false },
];

// TODO: loop over \`users\` and assert each outcome.
export { users };
`;
  }

  return `// TODO: implement ${base}\n`;
}

// ---------------------------------------------------------------------------
// Java
// ---------------------------------------------------------------------------

const MAVEN_DEPS: Record<string, { g: string; a: string; v: string }> = {
  "selenium-java": { g: "org.seleniumhq.selenium", a: "selenium-java", v: "4.27.0" },
  "playwright (Java)": { g: "com.microsoft.playwright", a: "playwright", v: "1.49.0" },
  "appium java-client": { g: "io.appium", a: "java-client", v: "9.4.0" },
  "rest-assured": { g: "io.rest-assured", a: "rest-assured", v: "5.5.0" },
  testng: { g: "org.testng", a: "testng", v: "7.10.2" },
  "junit-jupiter": { g: "org.junit.jupiter", a: "junit-jupiter", v: "5.11.4" },
  "cucumber-java": { g: "io.cucumber", a: "cucumber-java", v: "7.20.1" },
  "allure-testng": { g: "io.qameta.allure", a: "allure-testng", v: "2.29.0" },
  "allure-junit5": { g: "io.qameta.allure", a: "allure-junit5", v: "2.29.0" },
  "allure-cucumber7-jvm": { g: "io.qameta.allure", a: "allure-cucumber7-jvm", v: "2.29.0" },
  extentreports: { g: "com.aventstack", a: "extentreports", v: "5.1.2" },
  webdrivermanager: { g: "io.github.bonigarcia", a: "webdrivermanager", v: "5.9.2" },
  "log4j-core": { g: "org.apache.logging.log4j", a: "log4j-core", v: "2.24.3" },
  "dotenv-java": { g: "io.github.cdimascio", a: "dotenv-java", v: "3.0.2" },
  "jackson-databind": { g: "com.fasterxml.jackson.core", a: "jackson-databind", v: "2.18.2" },
};

function pomXml(c: Ctx): string {
  const deps = c.preview.dependencies
    .map((name) => MAVEN_DEPS[name])
    .filter(Boolean)
    .map(
      (d) => `    <dependency>
      <groupId>${d!.g}</groupId>
      <artifactId>${d!.a}</artifactId>
      <version>${d!.v}</version>
      <scope>test</scope>
    </dependency>`
    )
    .join("\n");

  const suite =
    c.framework === "testng"
      ? `
        <configuration>
          <suiteXmlFiles>
            <suiteXmlFile>testng.xml</suiteXmlFile>
          </suiteXmlFiles>
        </configuration>`
      : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <groupId>com.autosetup</groupId>
  <artifactId>${c.name}</artifactId>
  <version>1.0-SNAPSHOT</version>

  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
${deps}
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.2</version>${suite}
      </plugin>
    </plugins>
  </build>
</project>
`;
}

function testngXml(c: Ctx): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE suite SYSTEM "https://testng.org/testng-1.0.dtd">
<suite name="${c.name}"${c.has("parallel") ? ' parallel="classes" thread-count="3"' : ""}>
  <test name="Regression">
    <packages>
      <package name="com.autosetup.tests"/>
    </packages>
  </test>
</suite>
`;
}

function log4j2Xml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="WARN">
  <Appenders>
    <Console name="Console" target="SYSTEM_OUT">
      <PatternLayout pattern="%d{HH:mm:ss} %-5level %logger{36} - %msg%n"/>
    </Console>
    <File name="File" fileName="reports/test.log">
      <PatternLayout pattern="%d %-5level %logger{36} - %msg%n"/>
    </File>
  </Appenders>
  <Loggers>
    <Root level="info">
      <AppenderRef ref="Console"/>
      <AppenderRef ref="File"/>
    </Root>
  </Loggers>
</Configuration>
`;
}

function javaFile(base: string, c: Ctx): string {
  const api = c.tool === "rest-assured";
  const testAnnotation = c.framework === "junit5" ? "org.junit.jupiter.api.Test" : "org.testng.annotations.Test";
  const beforeAnnotation = c.framework === "junit5" ? "BeforeEach" : "BeforeMethod";
  const afterAnnotation = c.framework === "junit5" ? "AfterEach" : "AfterMethod";
  const annotationPkg = c.framework === "junit5" ? "org.junit.jupiter.api" : "org.testng.annotations";

  if (base === "ConfigReader.java") {
    return `package com.autosetup.utils;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/** Reads values from src/test/resources/config.properties. */
public final class ConfigReader {
    private static final Properties PROPERTIES = new Properties();

    static {
        try (InputStream input = ConfigReader.class.getClassLoader()
                .getResourceAsStream("config.properties")) {
            PROPERTIES.load(input);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read config.properties", e);
        }
    }

    private ConfigReader() {}

    public static String get(String key) {
        return PROPERTIES.getProperty(key);
    }
}
`;
  }

  if (base === "DriverFactory.java") {
    return `package com.autosetup.utils;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;

/** Creates the WebDriver the tests run against. */
public final class DriverFactory {
    private DriverFactory() {}

    public static WebDriver create(String browser) {
        return switch (browser.toLowerCase()) {
            case "firefox" -> new FirefoxDriver();
            case "edge" -> new EdgeDriver();
            default -> {
                ChromeOptions options = new ChromeOptions();
                options.addArguments("--headless=new");
                yield new ChromeDriver(options);
            }
        };
    }
}
`;
  }

  if (base === "ScreenshotUtil.java") {
    return `package com.autosetup.utils;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

/** Saves a screenshot into reports/screenshots. */
public final class ScreenshotUtil {
    private ScreenshotUtil() {}

    public static void capture(WebDriver driver, String name) throws Exception {
        File source = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        Path target = Path.of("reports", "screenshots", name + ".png");
        Files.createDirectories(target.getParent());
        Files.copy(source.toPath(), target);
    }
}
`;
  }

  if (base === "BaseTest.java") {
    if (api) {
      return `package com.autosetup.base;

import com.autosetup.utils.ConfigReader;
import io.restassured.RestAssured;
import ${annotationPkg}.${beforeAnnotation};

/** Shared setup for every API test. */
public class BaseTest {

    @${beforeAnnotation}
    public void setUp() {
        RestAssured.baseURI = ConfigReader.get("base.url");
    }
}
`;
    }
    return `package com.autosetup.base;

import com.autosetup.utils.ConfigReader;
import com.autosetup.utils.DriverFactory;
import org.openqa.selenium.WebDriver;
import ${annotationPkg}.${afterAnnotation};
import ${annotationPkg}.${beforeAnnotation};

/** Shared setup and teardown for every UI test. */
public class BaseTest {
    protected WebDriver driver;

    @${beforeAnnotation}
    public void setUp() {
        driver = DriverFactory.create(ConfigReader.get("browser"));
        driver.get(ConfigReader.get("base.url"));
    }

    @${afterAnnotation}
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }
}
`;
  }

  if (base === "BasePage.java" || base === "BaseScreen.java") {
    return `package com.autosetup.pages;

import java.time.Duration;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/** Shared helpers for all page objects. */
public abstract class BasePage {
    protected final WebDriver driver;
    protected final WebDriverWait wait;

    protected BasePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    protected WebElement find(By locator) {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    }

    protected void click(By locator) {
        wait.until(ExpectedConditions.elementToBeClickable(locator)).click();
    }

    protected void type(By locator, String text) {
        WebElement element = find(locator);
        element.clear();
        element.sendKeys(text);
    }
}
`;
  }

  if (base === "LoginPage.java" || base === "LoginScreen.java") {
    return `package com.autosetup.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

/** Login page object. */
public class LoginPage extends BasePage {
    private final By username = By.id("user-name");
    private final By password = By.id("password");
    private final By submit = By.id("login-button");
    private final By error = By.cssSelector("[data-test='error']");

    public LoginPage(WebDriver driver) {
        super(driver);
    }

    public void login(String user, String pass) {
        type(username, user);
        type(password, pass);
        click(submit);
    }

    public String errorMessage() {
        return find(error).getText();
    }
}
`;
  }

  if (base === "HomePage.java" || base === "HomeScreen.java") {
    return `package com.autosetup.pages;

import org.openqa.selenium.WebDriver;

/** TODO: add the elements your tests need. */
public class HomePage extends BasePage {
    public HomePage(WebDriver driver) {
        super(driver);
    }
}
`;
  }

  if (base === "BaseClient.java") {
    return `package com.autosetup.clients;

import io.restassured.response.Response;
import static io.restassured.RestAssured.given;

/** Shared request setup for API clients. */
public abstract class BaseClient {

    protected Response get(String path) {
        return given().contentType("application/json").when().get(path);
    }
}
`;
  }

  if (base === "UserClient.java") {
    return `package com.autosetup.clients;

import io.restassured.response.Response;

/** Calls the /users endpoints. */
public class UserClient extends BaseClient {

    public Response getUser(int id) {
        return get("/users/" + id);
    }
}
`;
  }

  if (base === "User.java") {
    return `package com.autosetup.models;

/** Response model for a user. */
public record User(int id, String name, String email) {}
`;
  }

  if (base === "LoginTest.java" || base === "UserTest.java") {
    if (api) {
      return `package com.autosetup.tests;

import com.autosetup.base.BaseTest;
import com.autosetup.clients.UserClient;
import io.restassured.response.Response;
import ${testAnnotation};
import static org.${c.framework === "junit5" ? "junit.jupiter.api.Assertions" : "testng.Assert"}.*;

/** Sample API test. */
public class UserTest extends BaseTest {
    private final UserClient users = new UserClient();

    @Test
    public void getUserReturnsOk() {
        Response response = users.getUser(1);
        ${c.framework === "junit5" ? "assertEquals(200, response.statusCode());" : "assertEquals(response.statusCode(), 200);"}
    }
}
`;
    }
    const pomBody = c.pom
      ? `        LoginPage loginPage = new LoginPage(driver);
        loginPage.login("standard_user", "secret_sauce");`
      : `        // TODO: log in using the driver.`;
    return `package com.autosetup.tests;

import com.autosetup.base.BaseTest;
${c.pom ? "import com.autosetup.pages.LoginPage;\n" : ""}import ${testAnnotation};
import static org.${c.framework === "junit5" ? "junit.jupiter.api.Assertions" : "testng.Assert"}.*;

/** Sample login test. Replace with your own application. */
public class LoginTest extends BaseTest {

    @Test
    public void validUserSeesProducts() {
${pomBody}
        assertTrue(driver.getCurrentUrl().contains("inventory"));
    }
}
`;
  }

  if (base.endsWith("DataDrivenTest.java")) {
    return `package com.autosetup.tests;

import com.autosetup.base.BaseTest;
import ${testAnnotation};

/** TODO: feed several inputs into the same test. */
public class DataDrivenTest extends BaseTest {

    @Test
    public void placeholder() {
        // Add a DataProvider (TestNG) or ParameterizedTest (JUnit 5) here.
    }
}
`;
  }

  if (base === "TestRunner.java") {
    return `package com.autosetup.runners;

import io.cucumber.testng.AbstractTestNGCucumberTests;
import io.cucumber.testng.CucumberOptions;

@CucumberOptions(features = "src/test/resources/features", glue = "com.autosetup.steps")
public class TestRunner extends AbstractTestNGCucumberTests {}
`;
  }

  if (base.endsWith("Steps.java")) {
    return `package com.autosetup.steps;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class LoginSteps {

    @Given("I am on the login page")
    public void openLoginPage() {
        // TODO: open the login page.
    }

    @When("I log in as {string}")
    public void login(String username) {
        // TODO: log in.
    }

    @Then("I should see the products page")
    public void checkProducts() {
        // TODO: assert the products page is shown.
    }
}
`;
  }

  return `// TODO: implement ${base}\n`;
}

// ---------------------------------------------------------------------------
// Robot Framework
// ---------------------------------------------------------------------------

function robotFile(path: string, base: string, c: Ctx): string {
  const library = c.framework === "robot-browser" ? "Browser" : "SeleniumLibrary";

  if (base === "login.robot") {
    return `*** Settings ***
Documentation     Sample login tests.
Resource          ../resources/common.resource
${c.pom ? "Resource          ../resources/pages/login_page.resource\n" : ""}Suite Setup       Open Test Browser
Suite Teardown    Close Test Browser

*** Test Cases ***
Valid User Can Log In
    ${c.pom ? "Login With    standard_user    secret_sauce" : "Log    TODO: log in"}
    Page Should Contain    Products

Wrong Password Shows An Error
    ${c.pom ? "Login With    standard_user    nope" : "Log    TODO: try a bad password"}
    Page Should Contain    Epic sadface
`;
  }

  if (base === "data_driven.robot") {
    return `*** Settings ***
Resource          ../resources/common.resource
Library           DataDriver    ../test_data/users.csv

*** Test Cases ***
Login With ${"${username}"}
    [Template]    Login Scenario
`;
  }

  if (base === "common.resource") {
    return `*** Settings ***
Library    ${library}
Variables  variables.py

*** Keywords ***
Open Test Browser
    ${
      library === "Browser"
        ? "New Browser    chromium    headless=True\n    New Page    ${BASE_URL}"
        : "Open Browser    ${BASE_URL}    ${BROWSER}"
    }

Close Test Browser
    ${library === "Browser" ? "Close Browser" : "Close All Browsers"}
`;
  }

  if (base === "login_page.resource") {
    return `*** Variables ***
\${USERNAME_FIELD}    id:user-name
\${PASSWORD_FIELD}    id:password
\${LOGIN_BUTTON}      id:login-button

*** Keywords ***
Login With
    [Arguments]    \${username}    \${password}
    Input Text      \${USERNAME_FIELD}    \${username}
    Input Password  \${PASSWORD_FIELD}    \${password}
    Click Button    \${LOGIN_BUTTON}
`;
  }

  if (base === "home_page.resource") {
    return `*** Keywords ***
# TODO: add keywords for the products page.
`;
  }

  return `*** Keywords ***\n# TODO: implement ${base}\n`;
}
