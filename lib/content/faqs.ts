export type Faq = {
  question: string;
  answer: string;
  category: "About AutoSetup" | "Choosing a stack" | "Your project" | "Running tests";
  /** Shown in the short list on the landing page. */
  featured?: boolean;
};

export const faqs: Faq[] = [
  {
    question: "Is AutoSetup only for beginners?",
    answer:
      "AutoSetup is designed to make framework setup easier for beginners while also providing structured starting points for experienced testers.",
    category: "About AutoSetup",
    featured: true,
  },
  {
    question: "Which automation tools will be supported?",
    answer:
      "The platform is designed to support popular tools such as Selenium, Playwright, Cypress, Robot Framework, Appium and API testing tools.",
    category: "About AutoSetup",
    featured: true,
  },
  {
    question: "Can I choose Python or Java?",
    answer:
      "Yes. The platform can provide different automation stacks based on your selected language and framework.",
    category: "Choosing a stack",
    featured: true,
  },
  {
    question: "Do I need to know automation before using AutoSetup?",
    answer:
      "No. The interface is designed to explain the available choices and help manual testers understand the setup.",
    category: "About AutoSetup",
    featured: true,
  },
  {
    question: "Will AutoSetup install software on my computer?",
    answer:
      "No. AutoSetup generates project files and configuration, which you download as a ZIP. Installing Python, Java or Node.js is something you do yourself — the review screen and the project README list exactly what you need.",
    category: "Your project",
    featured: true,
  },
  {
    question: "Is AutoSetup free to use?",
    answer:
      "Yes. You can generate as many projects as you like, and there is no sign-up.",
    category: "About AutoSetup",
  },
  {
    question: "Which stack should I pick if I have never automated anything?",
    answer:
      "Selenium with Python and Pytest is the gentlest starting point: the language reads almost like English, and there are more tutorials and Stack Overflow answers for it than for anything else. If your developers already write TypeScript, Playwright with TypeScript is an equally good choice.",
    category: "Choosing a stack",
  },
  {
    question: "What is the difference between Basic, Page Object Model and Advanced?",
    answer:
      "Basic puts everything in test files, which is the quickest way to see a test run. Page Object Model moves the locators and page actions into separate classes, so a UI change is fixed in one place. Advanced adds test data files and per-environment config for larger suites. You can start with Basic and restructure later.",
    category: "Choosing a stack",
  },
  {
    question: "Can I change my mind after generating a project?",
    answer:
      "Yes. Nothing is locked in. Run the wizard again with different choices and download a new ZIP, or edit the generated project by hand — it is ordinary code with no dependency on AutoSetup.",
    category: "Your project",
  },
  {
    question: "Does the generated project contain working tests?",
    answer:
      "It contains runnable sample tests written against the public demo site saucedemo.com: a login test and a test that picks an option from a dropdown. They exist to prove your setup works, and to show the patterns. Replace the URL and locators with your own application.",
    category: "Your project",
  },
  {
    question: "Where do my selections go? Is my data stored?",
    answer:
      "Your choices are used to build the ZIP and are not stored in an account or database. The download link carries the selection inside the URL itself, so nothing about your project is kept on the server.",
    category: "Your project",
  },
  {
    question: "How do I run the tests after downloading?",
    answer:
      "Unzip the folder and follow the Setup section of the README, which lists the exact commands for your stack — creating a virtual environment and installing dependencies for Python, npm install for Node, or a Maven build for Java. Then run the single test command shown on the review screen.",
    category: "Running tests",
  },
  {
    question: "How do I see a test report?",
    answer:
      "If you selected a reporting add-on, the review screen and the README both show the command to open the report, for example 'allure serve reports/allure-results'. Allure also needs its command line tool installed, which is listed under Required software.",
    category: "Running tests",
  },
  {
    question: "The tests fail with a browser or driver error. What now?",
    answer:
      "Modern Selenium versions download drivers for you, so the usual cause is that the browser itself is missing, or that a corporate proxy is blocking the download. Playwright and Cypress manage their own browsers, but Playwright needs one extra command after install: npx playwright install.",
    category: "Running tests",
  },
];

export const featuredFaqs = faqs.filter((faq) => faq.featured);

export const faqCategories = [
  "About AutoSetup",
  "Choosing a stack",
  "Your project",
  "Running tests",
] as const;
