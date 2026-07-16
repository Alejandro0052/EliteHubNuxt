# E2E Testing — Elite Hub

_Generated: 2026-07-16 | Updated: 2026-07-16 (post-fix) | Source: `e2e/**` (all non-generated files read in full)_

## Structure

`e2e/` holds a Python + Playwright (pytest-playwright, sync API) UI test suite, consolidated as of this update into a single flat layout:

```
e2e/
├── venv/                      # Python virtualenv (local, not committed)
└── test/
    ├── conftest.py             # Session-scoped browser fixture (Chromium, headless=False), per-test context/page
    ├── pytest.ini              # Empty — no active pytest config, relies on defaults
    ├── requirements.txt        # playwright==1.49.1, pytest==8.3.4, pytest-playwright==0.6.2
    ├── package.json / playwright.config.ts / package-lock.json   # Unused TS @playwright/test scaffold — no .spec.ts files exist; testDir './e2e' doesn't resolve to anything. Safe to ignore or remove.
    ├── e2e/pages/               # Page Object Model
    │   ├── login_page.py        # LoginPage — added as part of this fix (see below)
    │   ├── athletes/athletes_page.py       → AthletesPage
    │   ├── brands/brands_page.py           → BrandsPage
    │   ├── nutritionists/nutritionists_page.py → NutritionistsPage
    │   └── sponsors/sponsors_page.py       → SponsorsPage
    ├── ui/                      # Test cases, one folder per user-type page
    │   ├── athletes/test_athletes.py       → TestAthletesFlow
    │   ├── brands/test_brands.py           → TestBrandsFlow
    │   ├── nutritionists/test_nutritionists.py → TestNutritionistsPageFlow
    │   └── sponsors/test_sponsors.py       → TestSponsorsFlow
    ├── api/                     # Empty — scaffolded, no API tests written yet
    └── data/                    # Empty — scaffolded, no fixtures written yet
```

**Still true:** `e2e/` is untracked by git (`git ls-files e2e` returns nothing). It exists locally but is not part of the committed repository — a fresh clone will not have it.

## What the tests do

Each `ui/<feature>/test_<feature>.py` file: logs in via `LoginPage`, asserts the session took (`is_logged_in()`), then drives a page-specific flow — click the feature's homepage card heading (e.g. `h2:has-text('deportistas')`, which matches the `<h2>Deportistas</h2>` card on `app/pages/index.vue` that links to `/deportistas`), scroll to the bottom of the resulting page, and click that page's CTA link (e.g. "Comenzar Ahora" on `/deportistas`, "Únete Ahora" on `/marcas`, "Contactar Ahora" on `/patrocinadores`). Verified against the actual page markup — the selectors correctly target real content (Playwright's `:has-text()` is case-insensitive, so `'deportistas'` matches `Deportistas`). Each test class has a "complete flow" convenience test and a "step by step" version of the same flow.

Test credentials are hardcoded in every test file: `email="mariaeugenialopez456@gmail.com", password="1234"` — a fixed seeded account, not parameterized via env var or `e2e/test/data/` (empty).

## Fix applied (2026-07-16)

**Problem found:** every `ui/**` test imported a nonexistent `nuxtjs` package (`from nuxtjs.login_page import LoginPage`, `from nuxtjs.athletes.athletes_page import AthletesPage`) and computed `sys.path` via `Path(__file__).parents[4] / "pages"`, which resolves to the **project root**, not anywhere `pages/` actually exists. `LoginPage` was never defined anywhere in the repo. Confirmed by actually running `pytest --collect-only`: all 4 test modules failed with `ModuleNotFoundError: No module named 'nuxtjs'`.

**Fix:**
1. Corrected `sys.path.insert` in all 4 test files from `parents[4] / "pages"` to `parents[2] / "e2e" / "pages"` — this now correctly resolves to `e2e/test/e2e/pages/`, where the page objects actually live.
2. Changed imports from the nonexistent `nuxtjs.*` namespace to flat imports matching the real layout: `from login_page import LoginPage`, `from athletes.athletes_page import AthletesPage` (and equivalents for brands/nutritionists/sponsors).
3. Added `e2e/test/e2e/pages/login_page.py` — a `LoginPage` class that didn't exist before:
   - `goto()` → navigates to `{BASE_URL}/login` (`BASE_URL` from `E2E_BASE_URL` env var, default `http://localhost:3000`, since `playwright.config.ts`'s `baseURL` is commented out and unused by this Python suite anyway)
   - `login(email, password)` → fills `#email`/`#password` (matching `app/pages/login.vue`'s actual input ids) and clicks the submit button
   - `is_logged_in()` → confirms the header's "Iniciar sesión" link (see `app/components/layout/header.vue`) is gone after login

**Verified:** re-ran `pytest ui/ --collect-only` after the fix (with stale `__pycache__` cleared) — all 8 tests now collect successfully with zero errors. **Not verified:** actually executing the tests end-to-end against a running app, which requires `pnpm dev` running on `localhost:3000` and the hardcoded test account (`mariaeugenialopez456@gmail.com` / `1234`) existing and active (`Usuario.activo = true`) in whatever database the suite points at. That's a runtime/data dependency outside what a documentation pass can confirm.

## How to run

```bash
cd e2e/test
pip install -r requirements.txt
# in a separate terminal: pnpm dev   (from the project root, so localhost:3000 is up)
../venv/Scripts/python.exe -m pytest ui/ -v   # or: python -m pytest ui/ -v, if venv is activated
```

## Relationship to the frontend app

Browser-driven UI tests against the running Nuxt app (`headless=False` Chromium) — not unit/integration tests of `server/api/**` or component tests. `e2e/test/api/` is scaffolded for future API-level tests but currently empty; `e2e/test/data/` is scaffolded for fixtures but currently empty.
