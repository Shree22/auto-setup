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

## Sample tests

| Test | What it shows |
|---|---|
| Login | Typing into fields, clicking, asserting the result |
| Sorting | Choosing an option from a \`<select>\` dropdown${
    c.pom ? "\n| Page objects | Locators kept out of the test files |" : ""
  }
${c.advanced ? "| Data-driven | One test, many sets of input |\n" : ""}
${reportsSection(c)}
## Project structure

\`\`\`
${treeText(c.preview.tree)}\`\`\`

## Next steps

The sample tests point at a demo site. Replace the URL and locators with your
own application, then add tests beside the samples.
`;
}

function reportsSection(c: Ctx): string {
  if (!c.preview.reportCommand) return "";

  const where = c.has("allure")
    ? "Results are written to `reports/allure-results`."
    : "The report is written into `reports/`.";

  return `## Reports

${where} After a run, open it with:

\`\`\`bash
${c.preview.reportCommand}
\`\`\`
${
  c.has("allure")
    ? "\n> `allure serve` needs the Allure CLI (see Required software above).\n"
    : ""
}`;
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
  return `Feature: Login and sorting

  Background:
    Given I am on the login page

  Scenario: A valid user can log in
    When I log in as "standard_user"
    Then I should see the products page

  Scenario Outline: Products can be sorted
    When I log in as "standard_user"
    And I sort the products by "<option>"
    Then I should see the products page

    Examples:
      | option |
      | az     |
      | za     |
      | lohi   |
      | hilo   |
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

  if (c.tool === "appium") {
    return `"""Shared pytest fixtures. The Appium server must already be running."""
import pytest

from utils.driver_factory import create_driver


@pytest.fixture
def driver():
    driver = create_driver()
    yield driver
    driver.quit()
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

  if (base === "driver_factory.py" && c.tool === "appium") {
    return `"""Creates the Appium driver the tests run against."""
import yaml
from appium import webdriver
from appium.options.android import UiAutomator2Options


def create_driver(config_path: str = "config/capabilities.yaml"):
    """Connect to a running Appium server using the saved capabilities."""
    with open(config_path, encoding="utf-8") as handle:
        capabilities = yaml.safe_load(handle)

    options = UiAutomator2Options().load_capabilities(capabilities)
    return webdriver.Remote("http://127.0.0.1:4723", options=options)
`;
  }

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

  if (base === "base_screen.py") {
    return `"""Base class for all screen objects."""
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


class BaseScreen:
    def __init__(self, driver, timeout: int = 15):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def find(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))

    def tap(self, locator):
        self.wait.until(EC.element_to_be_clickable(locator)).click()

    def type(self, locator, text: str):
        element = self.find(locator)
        element.clear()
        element.send_keys(text)
`;
  }

  if (base === "login_screen.py") {
    return `"""Login screen object."""
from appium.webdriver.common.appiumby import AppiumBy

from screens.base_screen import BaseScreen


class LoginScreen(BaseScreen):
    USERNAME = (AppiumBy.ACCESSIBILITY_ID, "test-Username")
    PASSWORD = (AppiumBy.ACCESSIBILITY_ID, "test-Password")
    SUBMIT = (AppiumBy.ACCESSIBILITY_ID, "test-LOGIN")

    def login(self, username: str, password: str):
        self.type(self.USERNAME, username)
        self.type(self.PASSWORD, password)
        self.tap(self.SUBMIT)
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

    def select_option(self, selector: str, value: str):
        """Choose an option from a <select> dropdown by its value."""
        self.page.select_option(selector, value)
`
      : `"""Base class for all page objects."""
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select, WebDriverWait


class BasePage:
    def __init__(self, driver, timeout: int = 10):
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def find(self, locator):
        return self.wait.until(EC.presence_of_element_located(locator))

    def find_all(self, locator):
        self.find(locator)
        return self.driver.find_elements(*locator)

    def click(self, locator):
        self.wait.until(EC.element_to_be_clickable(locator)).click()

    def type(self, locator, text: str):
        element = self.find(locator)
        element.clear()
        element.send_keys(text)

    def text_of(self, locator) -> str:
        return self.find(locator).text

    def select_option(self, locator, value: str):
        """Choose an option from a <select> dropdown by its value."""
        Select(self.find(locator)).select_by_value(value)

    def selected_option(self, locator) -> str:
        return Select(self.find(locator)).first_selected_option.text
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

  if (base === "products_page.py" || base === "home_page.py") {
    return playwright
      ? `"""Products page object: the sort dropdown lives here."""
from pages.base_page import BasePage


class ProductsPage(BasePage):
    SORT_DROPDOWN = ".product_sort_container"
    PRICES = ".inventory_item_price"
    TITLE = ".title"

    def sort_by(self, value: str):
        """value: az, za, lohi or hilo."""
        self.select_option(self.SORT_DROPDOWN, value)

    def prices(self) -> list[float]:
        return [
            float(text.replace("$", ""))
            for text in self.page.locator(self.PRICES).all_inner_texts()
        ]
`
      : `"""Products page object: the sort dropdown lives here."""
from selenium.webdriver.common.by import By

from pages.base_page import BasePage


class ProductsPage(BasePage):
    SORT_DROPDOWN = (By.CLASS_NAME, "product_sort_container")
    PRICES = (By.CLASS_NAME, "inventory_item_price")
    TITLE = (By.CLASS_NAME, "title")

    def sort_by(self, value: str):
        """value: az, za, lohi or hilo."""
        self.select_option(self.SORT_DROPDOWN, value)

    def prices(self) -> list[float]:
        return [float(item.text.replace("$", "")) for item in self.find_all(self.PRICES)]
`;
  }

  if (base === "products_screen.py") {
    return `"""Screen object for the product list."""
from appium.webdriver.common.appiumby import AppiumBy

from screens.base_screen import BaseScreen


class ProductsScreen(BaseScreen):
    TITLE = (AppiumBy.ACCESSIBILITY_ID, "test-PRODUCTS")

    def is_loaded(self) -> bool:
        return self.find(self.TITLE).is_displayed()
`;
  }

  if (base === "test_sorting.py") {
    const fixture = playwright ? "page" : "driver";
    if (!c.pom) {
      return playwright
        ? `"""Dropdown sample: sorting the products list."""


def test_sort_by_price_low_to_high(page):
    page.fill("#user-name", "standard_user")
    page.fill("#password", "secret_sauce")
    page.click("#login-button")

    # Selecting an option from a <select> dropdown:
    page.select_option(".product_sort_container", "lohi")

    prices = [
        float(text.replace("$", ""))
        for text in page.locator(".inventory_item_price").all_inner_texts()
    ]
    assert prices == sorted(prices)
`
        : `"""Dropdown sample: sorting the products list."""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select


def test_sort_by_price_low_to_high(driver):
    driver.find_element(By.ID, "user-name").send_keys("standard_user")
    driver.find_element(By.ID, "password").send_keys("secret_sauce")
    driver.find_element(By.ID, "login-button").click()

    # Selecting an option from a <select> dropdown:
    Select(driver.find_element(By.CLASS_NAME, "product_sort_container")).select_by_value("lohi")

    prices = [
        float(item.text.replace("$", ""))
        for item in driver.find_elements(By.CLASS_NAME, "inventory_item_price")
    ]
    assert prices == sorted(prices)
`;
    }

    return `"""Dropdown sample: sorting the products list."""
import pytest

from pages.login_page import LoginPage
from pages.products_page import ProductsPage


@pytest.fixture
def products_page(${fixture}):
    LoginPage(${fixture}).login("standard_user", "secret_sauce")
    return ProductsPage(${fixture})


def test_sort_by_price_low_to_high(products_page):
    products_page.sort_by("lohi")
    prices = products_page.prices()
    assert prices == sorted(prices)


def test_sort_by_price_high_to_low(products_page):
    products_page.sort_by("hilo")
    prices = products_page.prices()
    assert prices == sorted(prices, reverse=True)


@pytest.mark.parametrize("option", ["az", "za", "lohi", "hilo"])
def test_every_sort_option_is_selectable(products_page, option):
    products_page.sort_by(option)
`;
  }

  if (base === "test_login.py" && c.framework === "unittest") {
    return `"""Sample login tests using Python's built-in unittest."""
import unittest

${c.pom ? "from pages.login_page import LoginPage\n" : ""}from utils.driver_factory import create_driver

BASE_URL = "https://www.saucedemo.com"


class LoginTest(unittest.TestCase):
    def setUp(self):
        self.driver = create_driver("${c.browsers[0] ?? "chrome"}")
        self.driver.get(BASE_URL)

    def tearDown(self):
        self.driver.quit()

    def test_valid_login_shows_products(self):
${
      c.pom
        ? `        LoginPage(self.driver).login("standard_user", "secret_sauce")`
        : `        # TODO: log in using self.driver`
    }
        self.assertIn("inventory", self.driver.current_url)

    def test_invalid_login_shows_error(self):
${
      c.pom
        ? `        page = LoginPage(self.driver)
        page.login("wrong_user", "wrong_password")
        self.assertIn("do not match", page.error_message())`
        : `        self.assertIsNotNone(self.driver)  # TODO: assert the error message`
    }


if __name__ == "__main__":
    unittest.main()
`;
  }

  if (base === "test_sorting.py" && c.framework === "unittest") {
    return `"""Dropdown sample using unittest: sorting the products list."""
import unittest

from pages.login_page import LoginPage
from pages.products_page import ProductsPage
from utils.driver_factory import create_driver


class SortingTest(unittest.TestCase):
    def setUp(self):
        self.driver = create_driver("${c.browsers[0] ?? "chrome"}")
        self.driver.get("https://www.saucedemo.com")
        LoginPage(self.driver).login("standard_user", "secret_sauce")
        self.products = ProductsPage(self.driver)

    def tearDown(self):
        self.driver.quit()

    def test_sort_by_price_low_to_high(self):
        self.products.sort_by("lohi")
        prices = self.products.prices()
        self.assertEqual(prices, sorted(prices))


if __name__ == "__main__":
    unittest.main()
`;
  }

  if (base === "test_login.py" && c.tool === "appium") {
    return `"""Sample mobile test. Start the Appium server before running."""
${c.pom ? "from screens.login_screen import LoginScreen\nfrom screens.products_screen import ProductsScreen\n" : ""}

def test_valid_login_opens_products(driver):
${
      c.pom
        ? `    LoginScreen(driver).login("standard_user", "secret_sauce")
    assert ProductsScreen(driver).is_loaded()`
        : `    # TODO: drive the app through the driver fixture.
    assert driver is not None`
    }
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

  if (path.includes("steps/") && !c.pom) {
    return `"""Behave step definitions."""
from behave import given, then, when
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select


@given("I am on the login page")
def step_open_login(context):
    context.driver.get("https://www.saucedemo.com")


@when('I log in as "{username}"')
def step_login(context, username):
    context.driver.find_element(By.ID, "user-name").send_keys(username)
    context.driver.find_element(By.ID, "password").send_keys("secret_sauce")
    context.driver.find_element(By.ID, "login-button").click()


@when('I sort the products by "{option}"')
def step_sort(context, option):
    # Choosing an option from a <select> dropdown:
    dropdown = context.driver.find_element(By.CLASS_NAME, "product_sort_container")
    Select(dropdown).select_by_value(option)


@then("I should see the products page")
def step_check_products(context):
    assert "inventory" in context.driver.current_url
`;
  }

  if (path.includes("steps/")) {
    return `"""Behave step definitions."""
from behave import given, then, when

from pages.login_page import LoginPage
from pages.products_page import ProductsPage


@given("I am on the login page")
def step_open_login(context):
    context.login_page = LoginPage(context.driver)


@when('I log in as "{username}"')
def step_login(context, username):
    context.login_page.login(username, "secret_sauce")


@when('I sort the products by "{option}"')
def step_sort(context, option):
    # Choosing an option from a <select> dropdown:
    ProductsPage(context.driver).sort_by(option)


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

  if (base.startsWith("products.page.") || base.startsWith("home.page.")) {
    if (c.tool === "cypress") {
      return `import { BasePage } from "./base.page";

/** Products page: the sort dropdown lives here. */
export class ProductsPage extends BasePage {
  readonly sortDropdown = ".product_sort_container";
  readonly prices = ".inventory_item_price";

  /** value: az, za, lohi or hilo. */
  sortBy(value${ts ? ": string" : ""}) {
    cy.get(this.sortDropdown).select(value);
  }
}
`;
    }
    return `import { BasePage } from "./base.page";

/** Products page: the sort dropdown lives here. */
export class ProductsPage extends BasePage {
  readonly sortDropdown = ".product_sort_container";
  readonly prices = ".inventory_item_price";

  /** value: az, za, lohi or hilo. */
  async sortBy(value${ts ? ": string" : ""}) {
    await this.page.selectOption(this.sortDropdown, value);
  }

  async priceList()${ts ? ": Promise<number[]>" : ""} {
    const texts = await this.page.locator(this.prices).allInnerTexts();
    return texts.map((text${ts ? ": string" : ""}) => Number(text.replace("$", "")));
  }
}
`;
  }

  if (base.startsWith("sorting.cy.")) {
    const usePom = c.pom;
    return `${usePom ? 'import { LoginPage } from "../pages/login.page";\nimport { ProductsPage } from "../pages/products.page";\n\n' : ""}describe("Sorting", () => {
  ${usePom ? "const loginPage = new LoginPage();\n  const productsPage = new ProductsPage();\n\n  " : ""}beforeEach(() => {
    ${usePom ? 'loginPage.login("standard_user", "secret_sauce");' : 'cy.visit("/");\n    cy.get("#user-name").type("standard_user");\n    cy.get("#password").type("secret_sauce");\n    cy.get("#login-button").click();'}
  });

  it("sorts products by price, low to high", () => {
    // Choosing an option from a <select> dropdown:
    ${usePom ? 'productsPage.sortBy("lohi");' : 'cy.get(".product_sort_container").select("lohi");'}

    cy.get(".inventory_item_price").then((items) => {
      const prices = [...items].map((item) => Number(item.innerText.replace("$", "")));
      expect(prices).to.deep.equal([...prices].sort((a, b) => a - b));
    });
  });

  ["az", "za", "lohi", "hilo"].forEach((option) => {
    it(\`offers the "\${option}" sort option\`, () => {
      ${usePom ? "productsPage.sortBy(option);" : 'cy.get(".product_sort_container").select(option);'}
      cy.get(".product_sort_container").should("have.value", option);
    });
  });
});
`;
  }

  if (base.startsWith("sorting.spec.")) {
    const usePom = c.pom;
    return `import { expect, test } from "@playwright/test";
${usePom ? 'import { LoginPage } from "../pages/login.page";\nimport { ProductsPage } from "../pages/products.page";\n' : ""}
test.describe("Sorting", () => {
  test.beforeEach(async ({ page }) => {
    ${usePom ? 'await new LoginPage(page).login("standard_user", "secret_sauce");' : 'await page.goto("/");\n    await page.fill("#user-name", "standard_user");\n    await page.fill("#password", "secret_sauce");\n    await page.click("#login-button");'}
  });

  test("sorts products by price, low to high", async ({ page }) => {
    ${
      usePom
        ? `const products = new ProductsPage(page);

    // Choosing an option from a <select> dropdown:
    await products.sortBy("lohi");

    const prices = await products.priceList();`
        : `// Choosing an option from a <select> dropdown:
    await page.selectOption(".product_sort_container", "lohi");

    const texts = await page.locator(".inventory_item_price").allInnerTexts();
    const prices = texts.map((text) => Number(text.replace("$", "")));`
    }
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  for (const option of ["az", "za", "lohi", "hilo"]) {
    test(\`offers the "\${option}" sort option\`, async ({ page }) => {
      ${usePom ? "await new ProductsPage(page).sortBy(option);" : 'await page.selectOption(".product_sort_container", option);'}
      await expect(page.locator(".product_sort_container")).toHaveValue(option);
    });
  }
});
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

  if (base === "DriverFactory.java" && c.tool === "appium") {
    return `package com.autosetup.utils;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import java.net.URL;

/** Connects to a running Appium server. */
public final class DriverFactory {
    private DriverFactory() {}

    public static AndroidDriver create() throws Exception {
        UiAutomator2Options options = new UiAutomator2Options()
                .setDeviceName("Android Emulator")
                .setApp(System.getProperty("user.dir") + "/app.apk");

        return new AndroidDriver(new URL("http://127.0.0.1:4723"), options);
    }
}
`;
  }

  if (base === "DriverFactory.java" && c.tool === "playwright") {
    return `package com.autosetup.utils;

import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserType;
import com.microsoft.playwright.Playwright;

/** Launches a Playwright browser. */
public final class DriverFactory {
    private DriverFactory() {}

    public static Browser create(Playwright playwright, String browser) {
        BrowserType.LaunchOptions options = new BrowserType.LaunchOptions().setHeadless(true);

        return switch (browser.toLowerCase()) {
            case "firefox" -> playwright.firefox().launch(options);
            case "safari" -> playwright.webkit().launch(options);
            default -> playwright.chromium().launch(options);
        };
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

  if (base === "BaseTest.java" && c.tool === "playwright") {
    return `package com.autosetup.base;

import com.autosetup.utils.ConfigReader;
import com.autosetup.utils.DriverFactory;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Playwright;
import ${annotationPkg}.${afterAnnotation};
import ${annotationPkg}.${beforeAnnotation};

/** Shared setup and teardown for every test. */
public class BaseTest {
    protected Playwright playwright;
    protected Browser browser;
    protected Page page;

    @${beforeAnnotation}
    public void setUp() {
        playwright = Playwright.create();
        browser = DriverFactory.create(playwright, ConfigReader.get("browser"));
        page = browser.newPage();
        page.navigate(ConfigReader.get("base.url"));
    }

    @${afterAnnotation}
    public void tearDown() {
        if (browser != null) {
            browser.close();
        }
        if (playwright != null) {
            playwright.close();
        }
    }
}
`;
  }

  if (base === "BaseTest.java" && c.tool === "appium") {
    return `package com.autosetup.base;

import com.autosetup.utils.DriverFactory;
import io.appium.java_client.android.AndroidDriver;
import ${annotationPkg}.${afterAnnotation};
import ${annotationPkg}.${beforeAnnotation};

/** Shared setup and teardown. The Appium server must already be running. */
public class BaseTest {
    protected AndroidDriver driver;

    @${beforeAnnotation}
    public void setUp() throws Exception {
        driver = DriverFactory.create();
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
import org.openqa.selenium.support.ui.Select;
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

    /** Choose an option from a <select> dropdown by its value. */
    protected void select(By locator, String value) {
        new Select(find(locator)).selectByValue(value);
    }

    protected String selectedOption(By locator) {
        return new Select(find(locator)).getFirstSelectedOption().getText();
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

  if (base === "ProductsPage.java" || base === "HomePage.java") {
    return `package com.autosetup.pages;

import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/** Products page: the sort dropdown lives here. */
public class ProductsPage extends BasePage {
    private final By sortDropdown = By.className("product_sort_container");
    private final By prices = By.className("inventory_item_price");

    public ProductsPage(WebDriver driver) {
        super(driver);
    }

    /** value: az, za, lohi or hilo. */
    public void sortBy(String value) {
        select(sortDropdown, value);
    }

    public String selectedSort() {
        return selectedOption(sortDropdown);
    }

    public List<Double> prices() {
        return driver.findElements(prices).stream()
                .map(WebElement::getText)
                .map(text -> Double.parseDouble(text.replace("$", "")))
                .toList();
    }
}
`;
  }

  if (base === "SortingTest.java") {
    const assertSorted =
      c.framework === "junit5"
        ? `        assertEquals(sorted, prices);`
        : `        assertEquals(prices, sorted);`;

    if (!c.pom) {
      return `package com.autosetup.tests;

import com.autosetup.base.BaseTest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;
import ${testAnnotation};
import static org.${c.framework === "junit5" ? "junit.jupiter.api.Assertions" : "testng.Assert"}.*;

/** Dropdown sample: sorting the products list. */
public class SortingTest extends BaseTest {

    @Test
    public void sortsByPriceLowToHigh() {
        driver.findElement(By.id("user-name")).sendKeys("standard_user");
        driver.findElement(By.id("password")).sendKeys("secret_sauce");
        driver.findElement(By.id("login-button")).click();

        // Choosing an option from a <select> dropdown:
        Select sort = new Select(driver.findElement(By.className("product_sort_container")));
        sort.selectByValue("lohi");

        List<Double> prices = new ArrayList<>();
        for (WebElement item : driver.findElements(By.className("inventory_item_price"))) {
            prices.add(Double.parseDouble(item.getText().replace("$", "")));
        }
        List<Double> sorted = new ArrayList<>(prices);
        Collections.sort(sorted);
${assertSorted}
    }
}
`;
    }

    return `package com.autosetup.tests;

import com.autosetup.base.BaseTest;
import com.autosetup.pages.LoginPage;
import com.autosetup.pages.ProductsPage;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import ${testAnnotation};
import static org.${c.framework === "junit5" ? "junit.jupiter.api.Assertions" : "testng.Assert"}.*;

/** Dropdown sample: sorting the products list. */
public class SortingTest extends BaseTest {

    @Test
    public void sortsByPriceLowToHigh() {
        new LoginPage(driver).login("standard_user", "secret_sauce");

        ProductsPage products = new ProductsPage(driver);
        // Choosing an option from a <select> dropdown:
        products.sortBy("lohi");

        List<Double> prices = products.prices();
        List<Double> sorted = new ArrayList<>(prices);
        Collections.sort(sorted);
${assertSorted}
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

    @Test
    public void getUserReturnsTheRequestedId() {
        Response response = users.getUser(2);
        int id = response.jsonPath().getInt("id");
        ${c.framework === "junit5" ? "assertEquals(2, id);" : "assertEquals(id, 2);"}
    }

    @Test
    public void unknownUserReturnsNotFound() {
        Response response = users.getUser(99999);
        ${c.framework === "junit5" ? "assertEquals(404, response.statusCode());" : "assertEquals(response.statusCode(), 404);"}
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
    const loginBody = c.pom
      ? `        new LoginPage(driver).login(username, "secret_sauce");`
      : `        driver.findElement(By.id("user-name")).sendKeys(username);
        driver.findElement(By.id("password")).sendKeys("secret_sauce");
        driver.findElement(By.id("login-button")).click();`;

    const sortBody = c.pom
      ? `        new ProductsPage(driver).sortBy(option);`
      : `        Select sort = new Select(driver.findElement(By.className("product_sort_container")));
        sort.selectByValue(option);`;

    return `package com.autosetup.steps;

import com.autosetup.utils.ConfigReader;
import com.autosetup.utils.DriverFactory;
${c.pom ? "import com.autosetup.pages.LoginPage;\nimport com.autosetup.pages.ProductsPage;\n" : ""}import io.cucumber.java.After;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.Select;

public class LoginSteps {
    private WebDriver driver;

    @Before
    public void setUp() {
        driver = DriverFactory.create(ConfigReader.get("browser"));
    }

    @After
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Given("I am on the login page")
    public void openLoginPage() {
        driver.get(ConfigReader.get("base.url"));
    }

    @When("I log in as {string}")
    public void login(String username) {
${loginBody}
    }

    @When("I sort the products by {string}")
    public void sortProducts(String option) {
        // Choosing an option from a <select> dropdown:
${sortBody}
    }

    @Then("I should see the products page")
    public void checkProducts() {
        if (!driver.getCurrentUrl().contains("inventory")) {
            throw new AssertionError("Expected the products page, got " + driver.getCurrentUrl());
        }
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
    const inlineLogin = (user: string, pass: string) =>
      library === "Browser"
        ? `Fill Text    id=user-name    ${user}
    Fill Secret    id=password    ${pass}
    Click    id=login-button`
        : `Input Text    id:user-name    ${user}
    Input Password    id:password    ${pass}
    Click Button    id:login-button`;

    return `*** Settings ***
Documentation     Sample login tests.
Resource          ../resources/common.resource
${c.pom ? "Resource          ../resources/pages/login_page.resource\n" : ""}Suite Setup       Open Test Browser
Suite Teardown    Close Test Browser

*** Test Cases ***
Valid User Can Log In
    ${c.pom ? "Login With    standard_user    secret_sauce" : inlineLogin("standard_user", "secret_sauce")}
    Page Should Show    Products

Wrong Password Shows An Error
    ${c.pom ? "Login With    standard_user    nope" : inlineLogin("standard_user", "nope")}
    Page Should Show    Epic sadface
`;
  }

  if (base === "data_driven.robot") {
    // Robot's built-in Test Template: one row per case, no extra library needed.
    return `*** Settings ***
Documentation     One login test per row. The same data also lives in
...               test_data/users.csv if you later switch to the DataDriver library.
Resource          ../resources/common.resource
Resource          ../resources/pages/login_page.resource
Suite Setup       Open Test Browser
Suite Teardown    Close Test Browser
Test Template     Login And Expect

*** Test Cases ***              USERNAME           PASSWORD        EXPECTED
Standard user can log in        standard_user      secret_sauce    Products
Locked out user is rejected     locked_out_user    secret_sauce    Epic sadface
Wrong password is rejected      standard_user      wrong_password  Epic sadface

*** Keywords ***
Login And Expect
    [Arguments]    \${username}    \${password}    \${expected}
    Go To    \${BASE_URL}
    Login With    \${username}    \${password}
    Page Should Show    \${expected}
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

Page Should Show
    [Documentation]    Assert the page contains this text, whichever library is in use.
    [Arguments]    \${text}
    ${
      library === "Browser"
        ? "Get Text    body    *=    ${text}"
        : "Page Should Contain    ${text}"
    }
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

  if (base === "products_page.resource" || base === "home_page.resource") {
    const selectKeyword =
      library === "Browser"
        ? "    Select Options By    \\${SORT_DROPDOWN}    value    \\${value}"
        : "    Select From List By Value    \\${SORT_DROPDOWN}    \\${value}";

    return `*** Variables ***
\${SORT_DROPDOWN}    ${library === "Browser" ? "css=.product_sort_container" : "class:product_sort_container"}
\${PRICE}            ${library === "Browser" ? "css=.inventory_item_price" : "class:inventory_item_price"}

*** Keywords ***
Sort Products By
    [Documentation]    value: az, za, lohi or hilo
    [Arguments]    \${value}
${selectKeyword}
`;
  }

  if (base === "sorting.robot") {
    const dropdown = library === "Browser" ? "css=.product_sort_container" : "class:product_sort_container";
    const selectInline = (value: string) =>
      library === "Browser"
        ? `Select Options By    ${dropdown}    value    ${value}`
        : `Select From List By Value    ${dropdown}    ${value}`;

    const setup = c.pom
      ? "Login With    standard_user    secret_sauce"
      : library === "Browser"
        ? `Fill Text    id=user-name    standard_user
...    AND    Fill Secret    id=password    secret_sauce
...    AND    Click    id=login-button`
        : `Run Keywords    Input Text    id:user-name    standard_user
...    AND    Input Password    id:password    secret_sauce
...    AND    Click Button    id:login-button`;

    return `*** Settings ***
Documentation     Dropdown sample: sorting the products list.
Resource          ../resources/common.resource
${c.pom ? "Resource          ../resources/pages/login_page.resource\nResource          ../resources/pages/products_page.resource\n" : ""}Suite Setup       Open Test Browser
Suite Teardown    Close Test Browser
Test Setup        ${setup}

*** Test Cases ***
Sort Products By Price Low To High
    ${c.pom ? "Sort Products By    lohi" : selectInline("lohi")}
    Page Should Show    Products

Sort Products By Name Z To A
    ${c.pom ? "Sort Products By    za" : selectInline("za")}
    Page Should Show    Products
`;
  }

  return `*** Keywords ***\n# TODO: implement ${base}\n`;
}
