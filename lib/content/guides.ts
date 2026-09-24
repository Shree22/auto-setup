export type GuideSection = {
  heading: string;
  /** Paragraphs. */
  body?: string[];
  list?: string[];
  steps?: string[];
  code?: { label?: string; language: string; code: string };
  callout?: string;
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  level: "Beginner" | "Intermediate";
  minutes: number;
  /** Prefilled wizard link, when the guide leads somewhere. */
  setupHref?: string;
  sections: GuideSection[];
};

export const guides: Guide[] = [
  {
    slug: "manual-to-automation",
    title: "From manual testing to automation",
    description:
      "What actually changes when you start automating, which skills carry over, and a realistic first month.",
    level: "Beginner",
    minutes: 6,
    setupHref: "/setup",
    sections: [
      {
        heading: "Your testing skill is the hard part, and you already have it",
        body: [
          "Automation is often described as a different career. It is not. Knowing what to test, which edge cases matter and what 'correct' looks like for your product takes years to build, and none of it is replaced by code.",
          "What you are adding is a way to describe those checks so a machine can repeat them. That part is mechanical, and it is learnable in weeks.",
        ],
      },
      {
        heading: "What automation is good at, and what it is not",
        body: [
          "Automated tests are excellent at repeating the same checks quickly and identically: regression suites, smoke tests before a release, checks across several browsers.",
          "They are poor at judgement. Whether a layout looks wrong, whether an error message is understandable, whether a flow feels confusing — that stays with you.",
        ],
        list: [
          "Automate: repetitive regression checks, data setup, cross-browser runs, API checks",
          "Keep manual: exploratory testing, usability, first-time feature testing, anything visual",
        ],
      },
      {
        heading: "A realistic first month",
        steps: [
          "Week 1: get one test running on your machine. Not a suite — one test, green, repeatable.",
          "Week 2: convert three manual regression cases you run every release. Notice which ones fight you.",
          "Week 3: move your locators into page objects, so a UI change is a one-line fix.",
          "Week 4: get the suite running in CI on every pull request, and learn to read the report.",
        ],
        callout:
          "The most common mistake is trying to automate everything at once. A suite of five tests that always pass is worth more than fifty that people ignore.",
      },
      {
        heading: "The vocabulary you will hear",
        list: [
          "Locator / selector — how a test finds an element on the page, for example an id or CSS selector",
          "Assertion — the check that decides pass or fail",
          "Fixture / setup — the code that prepares state before a test, such as opening a browser",
          "Flaky test — a test that passes and fails without the app changing, usually a timing problem",
          "Page object — a class holding one page's locators and actions, kept out of the tests",
        ],
      },
      {
        heading: "Where AutoSetup fits",
        body: [
          "The first week is normally spent not on testing but on plumbing: which packages, which folder layout, how reports are wired in. AutoSetup does that part, so your first day is spent reading a working test rather than assembling one.",
        ],
      },
    ],
  },
  {
    slug: "choosing-your-first-tool",
    title: "Choosing your first automation tool",
    description:
      "Selenium, Playwright, Cypress or Robot Framework — an honest comparison for someone picking their first.",
    level: "Beginner",
    minutes: 7,
    setupHref: "/setup",
    sections: [
      {
        heading: "Start from your team, not from the tool",
        body: [
          "The best tool is usually the one someone near you already knows. A slightly worse tool with a colleague who can unblock you beats a better tool you use alone.",
          "If nobody around you automates anything yet, the language your developers use is the next best tiebreaker, because their code review and their help become available to you.",
        ],
      },
      {
        heading: "Selenium",
        body: [
          "The long-standing standard. It drives real browsers, works with almost every language, and has the largest pool of tutorials, courses and answered questions — which matters enormously when you are stuck.",
          "In exchange you handle more yourself: waiting for elements, managing the driver lifecycle and structuring the project. It is also what most job adverts still ask for.",
        ],
        list: ["Languages: Python, Java and others", "Best for: learning, wide hiring demand, legacy browser support"],
      },
      {
        heading: "Playwright",
        body: [
          "The modern alternative, from Microsoft. It waits for elements automatically, which removes the single biggest source of flaky tests, and it comes with tracing, video and an excellent test runner.",
          "It is newer, so there is less material aimed at beginners, but the official documentation is the best of any tool here.",
        ],
        list: ["Languages: TypeScript, JavaScript, Python, Java", "Best for: new projects, flaky-test problems, speed"],
      },
      {
        heading: "Cypress",
        body: [
          "Runs inside the browser, which gives an unusually good debugging experience: you watch each step and can time-travel through it. Developers often like it for that.",
          "The trade-off is that it is JavaScript or TypeScript only, and its in-browser design makes some scenarios, such as multiple tabs, harder.",
        ],
        list: ["Languages: JavaScript, TypeScript", "Best for: front-end teams, debugging-heavy work"],
      },
      {
        heading: "Robot Framework",
        body: [
          "Tests are written as readable keywords rather than code, which makes it the gentlest entry point if programming is the part you are least sure about. It uses Selenium or Playwright underneath.",
          "The readability has a cost: once your suite grows, you will still end up writing Python for the harder keywords.",
        ],
        list: ["Languages: Python underneath", "Best for: teams who want non-programmers to read the tests"],
      },
      {
        heading: "A short answer",
        callout:
          "No team preference and no developer language to match? Pick Selenium with Python to maximise the help available to you, or Playwright with TypeScript if you want the smoothest modern experience.",
      },
    ],
  },
  {
    slug: "page-object-model",
    title: "Page Object Model, explained simply",
    description:
      "Why every automation job advert mentions it, what it looks like in code, and when it is overkill.",
    level: "Beginner",
    minutes: 5,
    setupHref: "/setup?structure=pom",
    sections: [
      {
        heading: "The problem it solves",
        body: [
          "Write tests the obvious way and each one contains its own locators. When the login button's id changes, you edit twenty tests. That is the whole problem.",
          "The Page Object Model moves each page's locators and actions into one class. Tests then describe behaviour, and only the class knows how the page is built.",
        ],
      },
      {
        heading: "Without page objects",
        code: {
          label: "test_login.py",
          language: "python",
          code: `def test_login(driver):
    driver.find_element(By.ID, "user-name").send_keys("standard_user")
    driver.find_element(By.ID, "password").send_keys("secret_sauce")
    driver.find_element(By.ID, "login-button").click()
    assert "inventory" in driver.current_url`,
        },
      },
      {
        heading: "With page objects",
        code: {
          label: "pages/login_page.py",
          language: "python",
          code: `class LoginPage(BasePage):
    USERNAME = (By.ID, "user-name")
    PASSWORD = (By.ID, "password")
    SUBMIT = (By.ID, "login-button")

    def login(self, username, password):
        self.type(self.USERNAME, username)
        self.type(self.PASSWORD, password)
        self.click(self.SUBMIT)`,
        },
      },
      {
        heading: "The test then reads like a test",
        code: {
          label: "tests/test_login.py",
          language: "python",
          code: `def test_login(driver):
    LoginPage(driver).login("standard_user", "secret_sauce")
    assert "inventory" in driver.current_url`,
        },
        body: [
          "Anyone can read that, including people who do not write code. And when the button id changes, exactly one line changes.",
        ],
      },
      {
        heading: "Rules that keep it useful",
        list: [
          "Page objects hold locators and actions — never assertions. Assertions belong in tests.",
          "One class per page or per meaningful component, not one giant class.",
          "Methods describe intent (login, sortByPrice), not mechanics (clickButton3).",
          "Shared helpers such as click and type live in a BasePage the others extend.",
        ],
      },
      {
        heading: "When it is overkill",
        body: [
          "For a handful of tests against a page that rarely changes, page objects add ceremony for little gain. Start Basic, and restructure once the duplication annoys you — that moment usually arrives around the tenth test.",
        ],
      },
    ],
  },
  {
    slug: "understanding-test-reports",
    title: "Understanding test reports",
    description:
      "What Allure and HTML reports show, how to read a failure, and what to share with your team.",
    level: "Beginner",
    minutes: 5,
    setupHref: "/setup",
    sections: [
      {
        heading: "Why a report, when the terminal already says pass or fail",
        body: [
          "The terminal is fine while you work. A report matters when someone else needs the result: a developer who wants the failure without running anything, or a release decision that needs evidence.",
          "Reports also keep history and attachments, so a failure comes with the screenshot, the steps and the error in one place.",
        ],
      },
      {
        heading: "Allure",
        body: [
          "The richest of the common options and the one most teams use. A test run writes raw results into a folder, and the Allure command line tool turns them into a browsable site.",
        ],
        code: {
          language: "bash",
          code: `pytest --alluredir=reports/allure-results
allure serve reports/allure-results`,
        },
        callout:
          "Allure needs its own command line tool installed, separate from the Python or Node package. AutoSetup lists it under Required software when you select it.",
      },
      {
        heading: "Built-in HTML reports",
        body: [
          "Playwright and pytest-html produce a single self-contained page with no extra tooling. Less detail than Allure, but you can email the file to anyone.",
        ],
      },
      {
        heading: "How to read a failure well",
        steps: [
          "Read the assertion message first: it says what was expected versus what happened.",
          "Look at the screenshot or video if one is attached — most 'mysterious' failures are an unexpected dialog or a redirect to a login page.",
          "Check whether it failed at the same step on a rerun. Same step means a real bug; a different step usually means timing.",
          "Only then read the stack trace, from the top, for the line in your own code.",
        ],
      },
      {
        heading: "Make failures self-explanatory",
        list: [
          "Turn on screenshot-on-failure — it answers most questions before they are asked",
          "Keep test names descriptive: a name should say what broke without opening anything",
          "Attach videos for the flows that fail rarely and mysteriously",
          "Publish the report from CI so a link, not a rerun, is the shared artefact",
        ],
      },
    ],
  },
  {
    slug: "first-week-with-your-project",
    title: "Your first week with a generated project",
    description:
      "What each folder is for, how to point the tests at your own application, and what to add first.",
    level: "Beginner",
    minutes: 6,
    setupHref: "/setup",
    sections: [
      {
        heading: "Day 1: prove the setup works",
        body: [
          "Before changing anything, run the sample tests exactly as they are. They point at a public demo site, so a green run proves your machine, browser and dependencies are all fine.",
          "If they fail now, the problem is the environment, not your code — a much easier thing to debug.",
        ],
      },
      {
        heading: "What the folders are for",
        list: [
          "tests/ — your test files; the runner discovers them by name",
          "pages/ — page objects: locators and actions, one class per page",
          "utils/ — shared helpers such as the driver factory, logging and screenshots",
          "config/ — the base URL, browser and timeouts; no values hard-coded in tests",
          "reports/ — generated output, ignored by git",
        ],
      },
      {
        heading: "Day 2: point it at your application",
        steps: [
          "Change the base URL in the config file to your own environment.",
          "Open the login page object and replace the locators with your app's ids.",
          "Run again. A failing locator message tells you exactly which one to fix next.",
        ],
        callout:
          "Prefer ids and data-test attributes over long CSS or XPath chains. If your app has none, asking developers to add data-test attributes is the single highest-value request you can make.",
      },
      {
        heading: "Days 3 to 5: convert real test cases",
        body: [
          "Pick three regression cases you run by hand every release — ideally boring, stable and repetitive ones. Those give the best return and the least frustration.",
          "Write each as one test with one clear assertion. Resist the temptation to chain ten checks into a single test: when it fails you want to know which step broke.",
        ],
      },
      {
        heading: "What to add once it is running",
        list: [
          "Put it in CI so it runs on every change, not only when you remember",
          "Add screenshot-on-failure if you did not select it at generation time",
          "Move test data out of test files, into the test_data or fixtures folder",
          "Agree with your team which suite must be green before a release",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug);
}
