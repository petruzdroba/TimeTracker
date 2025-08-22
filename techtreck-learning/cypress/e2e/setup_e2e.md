# Cypress E2E Testing

This document describes how to set up and run end-to-end (E2E) tests using Cypress for this project.

---

## 🛠️ Installation

1. **Clone the repository** (if not already done):

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

2. **Navigate to the frontend folder** (where Cypress is installed):

```bash
cd techtreck-learning
```

3. **Install dependencies**:

```bash
npm ci
npm install cypress --save-dev
```

> Note: `npm ci` is recommended for CI environments to install exact versions.

---

## ⚙️ Configuration

If your application requires environment variables:

1. Create an environment file 

```
  setup_env.md
```

2. Or, modify `src/environments/environment.ts` as needed:

```ts
export const environment = {
  production: false,
  apiUrl: "https://your-api-url.com" //-> or http://127.0.0.1:8000 for local running of django
};
```

---

## 🧪 Running Tests

### Prepare
* This activates the FE 
  ```bash
  ng serve 
  ```

* This will activate local 
  ```bash
  cd backend
  source myenv/bin/activate
  python manage.py runserver
  ```

### Open Cypress Test Runner (Interactive Mode)

```bash
npx cypress open
```

* This opens the Cypress UI.
* You can run individual test flows interactively in the browser.

### Run Tests in Headless Mode (CI / CLI)

```bash
npx cypress run
```

* Generates test output in the terminal.
* Can be integrated into CI pipelines.

### Run Specific Test File

```bash
npx cypress run --spec "cypress/e2e/<test-file>.cy.js"
```

---

## 📄 Test Structure

* `cypress/e2e/` – contains all E2E test flows
* `cypress/support/` – reusable commands and helpers
* `cypress/fixtures/` – test data files

---

## 💡 Tips

* Use `npx cypress open` for debugging and writing new flows.
* Keep test flows independent and idempotent.
* Use environment variables for API endpoints to switch between dev/staging/prod easily.

---

## 📚 References

* [Cypress Official Documentation](https://docs.cypress.io)
* [Writing E2E Tests](https://docs.cypress.io/guides/core-concepts/writing-and-organizing-tests)
