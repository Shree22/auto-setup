import type { SetupSelection } from "../setup/types";

export type Example = {
  slug: string;
  title: string;
  description: string;
  tag: string;
  /** What this example is worth reading for. */
  highlights: string[];
  /** Files worth opening first, in order. */
  featuredFiles: string[];
  selection: SetupSelection;
};

const base: Pick<SetupSelection, "applicationType" | "browserIds" | "structureId"> = {
  applicationType: "web",
  browserIds: ["chrome"],
  structureId: "pom",
};

export const examples: Example[] = [
  {
    slug: "selenium-python-pytest",
    title: "Selenium + Python + Pytest",
    description:
      "The most common starting point. Page objects, fixtures in conftest.py and Allure reporting.",
    tag: "Beginner Friendly",
    highlights: [
      "Fixtures create and close the browser for every test",
      "Locators live in page objects, not in tests",
      "A dropdown test using Selenium's Select class",
    ],
    featuredFiles: [
      "tests/test_login.py",
      "tests/test_sorting.py",
      "pages/login_page.py",
      "pages/products_page.py",
      "conftest.py",
    ],
    selection: {
      ...base,
      toolId: "selenium",
      languageId: "python",
      frameworkId: "pytest",
      addonIds: ["allure", "screenshots", "logging"],
      projectName: "selenium-python-pytest",
    },
  },
  {
    slug: "playwright-typescript",
    title: "Playwright + TypeScript",
    description:
      "Modern end-to-end testing with automatic waiting, tracing and Playwright's own runner.",
    tag: "Modern",
    highlights: [
      "Auto-waiting removes most flaky-test problems",
      "Browsers configured per project in playwright.config.ts",
      "Video and trace captured on failure",
    ],
    featuredFiles: [
      "tests/login.spec.ts",
      "tests/sorting.spec.ts",
      "pages/products.page.ts",
      "playwright.config.ts",
    ],
    selection: {
      ...base,
      toolId: "playwright",
      languageId: "typescript",
      frameworkId: "playwright-test",
      addonIds: ["allure", "video", "env-config"],
      projectName: "playwright-typescript",
    },
  },
  {
    slug: "selenium-java-testng",
    title: "Selenium + Java + TestNG",
    description:
      "The enterprise standard: Maven, TestNG suites, page objects and Allure.",
    tag: "Enterprise",
    highlights: [
      "Maven pom.xml with pinned dependency versions",
      "BaseTest handles driver setup and teardown",
      "testng.xml controls which suite runs",
    ],
    featuredFiles: [
      "src/test/java/com/autosetup/tests/LoginTest.java",
      "src/test/java/com/autosetup/tests/SortingTest.java",
      "src/test/java/com/autosetup/pages/ProductsPage.java",
      "pom.xml",
    ],
    selection: {
      ...base,
      toolId: "selenium",
      languageId: "java",
      frameworkId: "testng",
      addonIds: ["allure", "screenshots", "logging"],
      projectName: "selenium-java-testng",
    },
  },
  {
    slug: "cypress-typescript",
    title: "Cypress + TypeScript",
    description:
      "Runs inside the browser, with custom commands and fixtures for test data.",
    tag: "Front-end friendly",
    highlights: [
      "A custom cy.login() command in support/commands.ts",
      "Test data kept in fixtures",
      "Dropdown handling with cy.select()",
    ],
    featuredFiles: [
      "cypress/e2e/login.cy.ts",
      "cypress/e2e/sorting.cy.ts",
      "cypress/support/commands.ts",
      "cypress.config.ts",
    ],
    selection: {
      ...base,
      toolId: "cypress",
      languageId: "typescript",
      frameworkId: "cypress-mocha",
      addonIds: ["html-report", "video", "screenshots"],
      projectName: "cypress-typescript",
    },
  },
  {
    slug: "robot-framework",
    title: "Robot Framework + Selenium",
    description:
      "Keyword-driven tests that read like documentation, backed by Selenium.",
    tag: "No-code friendly",
    highlights: [
      "Tests written as readable keywords, not code",
      "Reusable keywords kept in resource files",
      "Robot's own HTML report out of the box",
    ],
    featuredFiles: [
      "tests/login.robot",
      "tests/sorting.robot",
      "resources/pages/products_page.resource",
      "resources/common.resource",
    ],
    selection: {
      ...base,
      toolId: "robot",
      languageId: "python",
      frameworkId: "robot-selenium",
      addonIds: ["allure", "screenshots"],
      projectName: "robot-framework",
    },
  },
  {
    slug: "rest-assured-api",
    title: "REST Assured + Java",
    description: "API testing with a fluent syntax, JUnit 5 and request clients.",
    tag: "API testing",
    highlights: [
      "No browser needed, so tests run in seconds",
      "Requests wrapped in client classes",
      "Status code and JSON body assertions",
    ],
    featuredFiles: [
      "src/test/java/com/autosetup/tests/UserTest.java",
      "src/test/java/com/autosetup/clients/UserClient.java",
      "pom.xml",
    ],
    selection: {
      applicationType: "api",
      toolId: "rest-assured",
      languageId: "java",
      frameworkId: "junit5",
      browserIds: [],
      structureId: "pom",
      addonIds: ["allure", "logging"],
      projectName: "rest-assured-api",
    },
  },
];

export function getExample(slug: string): Example | undefined {
  return examples.find((example) => example.slug === slug);
}
