# Nuru

Nuru is a source-linked return information service. Public users browse published guidance without an account; authorized staff review and publish content through a web administration workflow. The repository also contains an Expo/React Native mobile prototype.

| | |
|---|---|
| **Live app** | [nuru-kappa-jet.vercel.app](https://nuru-kappa-jet.vercel.app) |
| **Live API (health check)** | [nuru-q34v.onrender.com/api/health](https://nuru-q34v.onrender.com/api/health) |
| **Walkthrough video** | [Google Drive demo video](https://drive.google.com/file/d/1u7F_QXeKK7SQDPRc-dq_H22Wl6QGT_-i/view?usp=sharing) |
| **Technical report** | [Nuru technical report](https://docs.google.com/document/d/1dSrMpjhYrSkfQ1tBZKKT9QQ-faBzZjz20Vvo7e178H8/edit?usp=sharing) |
| **Figma designs** | [Nuru UI — web and mobile](https://www.figma.com/design/f4737lGzdytN9k3KqOwtzB) |
| **Repository** | [github.com/abu00123/Nuru](https://github.com/abu00123/Nuru) |

---

## Contents

1. [Project overview](#project-overview)
2. [Technical requirements](#technical-requirements)
3. [Installation](#installation)
4. [Running the tests](#running-the-tests)
5. [Repository structure](#repository-structure)
6. [Requirements traceability](#requirements-traceability)
7. [Deployment](#deployment)

---

## Project overview

People considering voluntary return often cannot find reliable, source-checked guidance in one place. Nuru gives that information a single reviewed home, with a clear editorial trail showing who checked each article, against which source, and when.

### Who uses it

| Role | What they can do |
|---|---|
| **Public user** | Browse published articles, search by keyword, filter by category and destination, read source details and step guides, choose a display language, submit a report without an account |
| **Staff (admin)** | Sign in with JWT, create and edit entries, record source reviews, publish only reviewed content, inspect revision history, manage and resolve reports with required notes |
| **Mobile user** | Browse, search, filter, read articles, save articles locally, submit reports — via the Expo/React Native companion app |

### How an entry moves through the system

1. A staff member creates a draft entry with title, summary, content, and a cited source.
2. The staff member records a source review, marking it suitable for publication and leaving notes.
3. The system ties the review to the current content version. Publication is only allowed when a suitable review exists for that version.
4. If the content is edited after review, the version increments and a new review is required before republishing.
5. Once published, the entry is visible to public users on the web and mobile app.

### Key features

- Search across title, summary, body, and reviewed translations in Kirundi, Kinyarwanda, and Kiswahili.
- Version-aware publication enforcement: substantive edits invalidate the previous review automatically.
- Revision snapshots: every substantive edit is stored as a JSON snapshot keyed by entry and version.
- Report resolution with required notes and server-recorded attribution.
- JWT authentication with automatic token refresh.
- Shared API serving both the web and mobile clients.

---

## Technical requirements

### Software

| Tool | Version | Notes |
|---|---|---|
| Python | 3.10 or newer | Required for the backend |
| Node.js | 22.13 or newer | Required for the web and mobile frontends |
| npm | 10 or newer | Comes with Node.js |
| PostgreSQL | 14 or newer | Required for local production-like backend; tests use SQLite |
| Android emulator or device | Any | Required for mobile prototype runtime checks |
| Git | Any recent version | To clone the repository |
| Web browser | Any current Chrome, Firefox, Edge | Mobile browsers supported |

### Hardware

Any machine running Python 3.10 and Node.js 22 will work. A minimum of 4 GB RAM and 1 GB of free disk space is recommended. An internet connection is needed for the deployed backend and database.

### Frameworks and packages

| Package | Version | Purpose |
|---|---|---|
| Django | 5.1 | Backend framework |
| Django REST Framework | 3.x | API serializers, views, permissions |
| djangorestframework-simplejwt | 5.x | JWT authentication |
| django-cors-headers | 4.x | CORS for browser clients |
| psycopg2 | 2.x | PostgreSQL adapter |
| React | 19 | Web UI |
| TypeScript | 6 | Type-checked frontend code |
| Vite | 8 | Web dev server and build tool |
| React Router | 7 | Client-side routing |
| Axios | 1.x | HTTP client with JWT interceptor |
| React Native | 0.88 | Mobile UI |
| Expo SDK | 58 | Mobile toolchain |

---

## Installation

### 1. Clone the repository

```powershell
git clone https://github.com/abu00123/Nuru.git
cd Nuru
```

### 2. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Set the following in `backend/.env`:

```
SECRET_KEY=<your-secret-key>
DEBUG=True
DB_NAME=nuru
DB_USER=postgres
DB_PASSWORD=<your-postgres-password>
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

Create the PostgreSQL database, then:

```powershell
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 3. Web frontend

```powershell
cd frontend
npm install
```

Set `VITE_API_BASE_URL=http://localhost:8000/api` in `frontend/.env.local`, then:

```powershell
npm run dev
```

Open `http://localhost:5173`.

### 4. Mobile prototype

Set `EXPO_PUBLIC_API_URL` in `nuru-mobile/.env`:

- Android emulator: `http://10.0.2.2:8000/api`
- Physical device: use the computer's LAN IP address

```powershell
cd nuru-mobile
npm install
npx expo start --clear
```

Press `a` to open on the Android emulator once it is running.

---

## Running the tests

```powershell
cd backend
venv\Scripts\Activate.ps1
python manage.py test --verbosity=2
```

The test suite uses isolated SQLite settings (`backend/config/test_settings.py`). A PostgreSQL-backed run discovered and passed all 28 tests in 549.276 seconds. Coverage includes publication workflow, permissions, public draft access, translated search, source dates, revision history, and report resolution.

---

## Repository structure

```text
backend/
├── config/                  Django settings, URLs, WSGI
├── information/
│   ├── models.py            InformationEntry, SourceReview, EntryRevision, Category, Destination
│   ├── serializers.py       Validation including version-aware publication enforcement
│   ├── views.py             Public and admin API views
│   ├── admin.py             Django admin with source review inline and read-only revision history
│   ├── urls.py              API URL patterns including /reviews/ endpoint
│   ├── migrations/          Database migrations
│   └── tests.py             28 automated tests
├── reports/
│   ├── models.py            Report and resolution fields
│   ├── serializers.py       Report validation and resolution enforcement
│   ├── views.py             Public report submission and staff resolution
│   └── tests.py             Report resolution tests
├── users/                   Custom user model
├── requirements.txt
└── .env.example

frontend/
├── src/
│   ├── pages/
│   │   ├── Explore.tsx          Browse, search, filter
│   │   ├── InformationDetail.tsx Article detail and source info
│   │   ├── ReportInformation.tsx Public report submission
│   │   ├── Login.tsx             Staff login with JWT storage
│   │   ├── AdminDashboard.tsx    Staff entry management
│   │   └── InformationForm.tsx   Create/edit with source review and publish enforcement
│   ├── services/
│   │   ├── api.ts               Axios instance with JWT refresh interceptor
│   │   └── informationService.ts API service functions
│   └── types/
│       └── information.ts        TypeScript interfaces
└── .env.example

nuru-mobile/
├── src/
│   ├── api.ts               Fetch-based API client
│   ├── types.ts             Shared TypeScript types
│   ├── i18n/                Kirundi, Kinyarwanda, Kiswahili UI catalogs
│   ├── ArticleActions.tsx   Save and share actions
│   ├── SavedArticles.tsx    AsyncStorage bookmark list
│   ├── StepGuide.tsx        Step-by-step guide renderer
│   └── LanguageSelector.tsx Language switcher
├── App.tsx                  Main app with navigation and screens
└── .env.example

docs/
├── screenshots/             UI screenshots
├── wireframes/              Design wireframes
├── mockups/                 Design mockups
└── Nuru Technical Product Report.pdf
```

---

## Requirements traceability

| Feature | Where it is implemented |
|---|---|
| Browse, search, and filter information | `frontend/src/pages/Explore.tsx`; `backend/information/views.py` — DRF filters published entries by keyword, category, and destination |
| Article detail and source information | `frontend/src/pages/InformationDetail.tsx`; `InformationEntry` model and serializer |
| Public report submission | `frontend/src/pages/ReportInformation.tsx`; `backend/reports/views.py` — anonymous POST allowed |
| Staff login and JWT authentication | `frontend/src/pages/Login.tsx`; `backend/users/`; SimpleJWT with refresh token interceptor in `api.ts` |
| Source review before publication | `backend/information/serializers.py` `validate()`; `SourceReview` model; `frontend/src/pages/InformationForm.tsx` |
| Content versioning | `InformationEntry.save()` in `backend/information/models.py` — increments `content_version` on substantive changes |
| Revision history | `EntryRevision` model; read-only Django admin view |
| Report resolution with attribution | `backend/reports/serializers.py` — requires notes; server records resolver and timestamp |
| Multilingual content | `translations` and `guide_translations` fields; reviewed-translation search in `views.py`; UI catalogs in `nuru-mobile/src/i18n/` |
| Mobile browse, search, save, report | `nuru-mobile/App.tsx`; `nuru-mobile/src/api.ts` — calls the same Django API |

---

## Source review API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/information/<id>/reviews/` | Admin | Record a source review for an entry version |

Publication is rejected unless the entry has a non-empty `source_name` and a `SourceReview` with `outcome=suitable` matching the current `content_version`.

---

## Deployment

The production backend runs on [Render](https://render.com) and the frontend on [Vercel](https://vercel.com).

### Backend (Render)

1. Create a new Web Service pointing to the repository root with `backend/` as the working directory.
2. Set the build command to `pip install -r requirements.txt && python manage.py migrate`.
3. Set the start command to `gunicorn config.wsgi:application`.
4. Add environment variables: `SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`.

### Frontend (Vercel)

1. Import the repository into Vercel and set the root directory to `frontend`.
2. Add `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api` as an environment variable.
3. Deploy.

---

## Scope and known limits

The scope expanded from a web-only MVP to include a mobile companion and stronger editorial controls. The mobile app is a prototype; physical device validation, APK distribution, offline support, and push notifications remain future work. Browser and device compatibility testing was conducted on Chrome and the Android emulator only. No performance benchmarks were measured.

---

## Screenshots

UI screenshots are in [`docs/screenshots/`](docs/screenshots/). They illustrate selected web screens and do not establish cross-browser or device compatibility.

---

*Abraham Garang · Supervisor: Simeon Nsabiyumva*
