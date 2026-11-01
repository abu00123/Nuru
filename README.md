# Nuru

Nuru is a full-stack information service for people considering voluntary return. It helps public users find source-linked information and lets authorized staff review, publish, and maintain it.

## Submission links

- **Walkthrough video:** [Google Drive demo folder](https://drive.google.com/drive/folders/1zUbNJ20X7dENxw5n-wL5GDB7oSWUOisk?usp=drive_link) (confirm the video is uploaded and accessible before submission).
- **Technical report:** [Nuru technical report (PDF)](docs/technical-report.pdf).
- **Repository:** [github.com/abu00123/Nuru](https://github.com/abu00123/Nuru).

## Scope and current status

| Planned feature | Purpose | Status | Evidence |
|---|---|---|---|
| Browse, search, and filter information | Find relevant public guidance | Implemented | `frontend/src/pages/Explore.tsx`; `backend/information/views.py` |
| Read cited source and verification details | Assess context and currency | Implemented | `frontend/src/pages/InformationDetail.tsx`; source review models and serializer |
| Submit reports about information | Signal possible errors or stale content | Implemented | `frontend/src/pages/ReportInformation.tsx`; `backend/reports/` |
| Staff login and content administration | Restrict editorial actions | Implemented | `frontend/src/pages/Login.tsx`, `AdminDashboard.tsx`; Django JWT and permissions |
| Source review before publication | Tie publication to a reviewed content version | Implemented | `backend/information/serializers.py`, `models.py`; API tests |
| Revision history and resolution tracking | Preserve editorial changes and report outcomes | Implemented | `EntryRevision`, report resolution fields; Django admin and API tests |
| Kirundi, Kinyarwanda, and Kiswahili content support | Improve language access | Partial | Reviewed-translation display/search and UI catalogs exist; review and coverage are not established for all content. |
| React Native companion | Extend access to phones | Partial prototype | `nuru-mobile/`; device/emulator validation and release package are not documented. |
| Offline access, notifications, SMS/WhatsApp, maps | Support low-connectivity use | Not implemented | Listed as future work; no corresponding production feature found. |

The scope shifted from a web-only MVP toward a mobile companion and stronger editorial controls. The companion is a prototype; offline use and store distribution remain future work. See the report for details and validation limits.

## Features

**Public web and mobile:** browse published articles, search keywords, filter by category and destination, read source information and step guides, choose a language, save articles locally on mobile, and submit reports without an account.

**Staff web workflow:** sign in with JWT, edit entries, record source reviews, publish only reviewed content, inspect saved revisions, and manage reports with required resolution notes and server-recorded attribution.

## Architecture and stack

- **Web:** React 19, TypeScript 6, Vite 8, React Router 7, Axios.
- **Mobile prototype:** React Native 0.88, Expo SDK 58, TypeScript 5.9.
- **API:** Python 3.10+, Django 5.1, Django REST Framework, SimpleJWT.
- **Database:** PostgreSQL 14+ in deployment; isolated SQLite settings for the documented backend test suite.
- **Deployment configuration:** Vercel frontend and Render backend/database.

The browser and mobile clients call a shared JSON API. Django models and serializers own persistence and validation; API views apply public/admin permissions. React pages and reusable components are separated from API service modules and typed data models.

## Requirements

- Python 3.10 or newer; install backend packages from `backend/requirements.txt`.
- Node.js 22.13 or newer for the Expo mobile project. The web project's `package.json` defines its dependencies.
- PostgreSQL 14+ for a local production-like backend. Automated tests use the project's SQLite test settings.
- Android emulator or device for mobile runtime checks; Expo Go / SDK compatibility depends on the installed Expo SDK.

## Run locally

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `SECRET_KEY`, database connection values, `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS` in `backend/.env`. Create the PostgreSQL database, then:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Web frontend

```powershell
cd frontend
npm install
```

Set `VITE_API_BASE_URL=http://localhost:8000/api` in `frontend/.env.local`, then run `npm run dev`.

### Mobile prototype

Set `EXPO_PUBLIC_API_URL` in `nuru-mobile/.env` (Android emulator: `http://10.0.2.2:8000/api`; physical phone: use the computer's LAN address), then run `npm install` and `npm start` from `nuru-mobile/`. Follow the mobile README for network configuration.

## Validation and known limits

Backend validation: a PostgreSQL-backed run of `python manage.py test --verbosity=2` discovered and passed all 28 tests in 549.276 seconds. Coverage includes publication review and permissions, public draft access, translated search, source dates, revision history, and report resolution. Django recreated the pre-existing `test_nuru_db` after confirmation and reported no system-check issues. It emitted a non-blocking warning that `backend/staticfiles/` did not exist. Mobile mocked API tests and complete dependency/type checks are documented as not yet completed in `nuru-mobile/README.md`; browser/device compatibility, load, and performance evidence are also pending. See the [technical report](docs/technical-report.pdf) for details.

Before final submission, upload the final walkthrough video and report to accessible links, replace/confirm the links above, and capture real browser/device compatibility results. Do not claim performance metrics until measured on target hardware.

## Repository structure

```text
backend/       Django API, models, serializers, migrations, tests
frontend/      React web application, pages, components, services, types
nuru-mobile/   Expo/React Native companion prototype
docs/          screenshots, wireframes, mockups, technical report
```

## Screenshots

Existing UI screenshots are in [`docs/screenshots/`](docs/screenshots/). They illustrate selected web screens; they do not establish cross-browser or device compatibility.
