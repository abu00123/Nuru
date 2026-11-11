# Nuru Technical Report

## Scope, architecture, implementation, and validation

**Prepared by:** Abraham Garang  
**Supervisor:** Simeon Nsabiyumva  
**Date:** 7 November 2026

## Executive summary

Nuru is a source-linked information service that lets the public find guidance without creating an account and gives authorized staff a controlled workflow to review, publish, and maintain that information. Its production web application uses a React and TypeScript client, a Django REST Framework API, and PostgreSQL. An Expo and React Native mobile client uses the same API but remains a prototype.

The implemented web product covers public browsing, search and filtering, article details with source information, public issue reports, and staff authoring and review. Editorial safeguards connect source approval to a specific content version, preserve revision snapshots, and record who resolved a report and when. The supplied project record reports 28 passing backend tests on PostgreSQL. It does not establish a full browser/device compatibility matrix, mobile release readiness, performance benchmarks, or complete multilingual content review. Offline access, SMS, maps, and push notifications are future work.

## 1. Product scope and status

| Capability | Status | Implementation and evidence |
|---|---|---|
| Browse, search, and filter guidance | Implemented | Web Explore page and API filtering by text, category, and commune/destination. |
| Article details and source information | Implemented | Information detail page and source fields on the information entry. |
| Public issue reports | Implemented | Public report form and reports API. |
| Staff authoring and publication | Implemented | JWT-authenticated staff workflow, admin pages, and Django permissions. |
| Source review, revision history, and report resolution | Implemented | Versioned source reviews, entry revision snapshots, and report resolution attribution. |
| Multilingual interface and content | Partial | Kirundi, Kinyarwanda, and Kiswahili interface catalogs; translated content with review and English fallback. Overall content coverage and native-speaker review are not established. |
| Mobile access | Prototype | Expo/React Native client supports browsing, search, reports, bookmarks, and guides. Release and device validation are incomplete. |
| Offline, SMS, maps, and push notifications | Not implemented | Identified as future work; no production implementation is documented. |

The project grew beyond the original web MVP through an experimental mobile client and stronger editorial controls. Those controls include version-linked reviews, revision snapshots, and report-resolution attribution. The mobile work is not documented as a validated release.

## 2. System architecture

Nuru uses a three-tier architecture. The React web client and Expo mobile prototype communicate with a shared JSON API. The Django REST Framework API applies validation and permissions and stores application data in PostgreSQL. The clients do not share application code directly.

```text
React and TypeScript web client ─┐
                                ├── Django REST Framework API ── PostgreSQL
Expo and React Native prototype ┘
```

### Backend

The Django backend is organized into three applications:

- **information** manages entries, categories, destinations, source reviews, and revision history.
- **reports** manages public submissions and staff resolution.
- **users** provides the custom user model based on Django's `AbstractUser`.

Django REST Framework handles serialization, input validation, and permission enforcement. SimpleJWT provides access and refresh tokens. `django-cors-headers` supports browser clients calling the API, and WhiteNoise serves static assets without a separate static-file server.

### Web client

The web application is built with Vite, React, and TypeScript. React Router handles client-side navigation. Pages, reusable components, API service modules, and domain types are organized separately. Axios sends API requests; its response interceptor attempts to refresh an expired access token and retries the original request. If refresh fails, the user is redirected to login.

### Mobile prototype

The Expo/React Native application calls the same Django API through a fetch-based client in `nuru-mobile/src/api.ts`. AsyncStorage stores saved article IDs locally. The prototype includes Kirundi, Kinyarwanda, and Kiswahili interface catalogs. Screen state manages navigation. Saved IDs are local references; reopening saved content requires the live API.

### Deployment and configuration

The supplied project information identifies Render as the host for the production backend and managed PostgreSQL database, and Vercel as the frontend host. Environment variables hold secrets, database credentials, allowed hosts, and CORS origins. No credentials are reported as committed to the repository.

## 3. User workflows and system behavior

### Public discovery

Users can search and browse published guidance, then narrow results by category and destination. Web filters are reflected in the URL and sent through Axios service functions. The API filters published entries across titles, summaries, bodies, and reviewed translations. Category and commune filters are also applied server-side.

Opening an entry displays its guidance and source information. When a complete reviewed translation is available, the application can show it. Otherwise, it falls back to English and displays a note about the fallback.

### Editorial review and publication

Authorized staff authenticate with JWT and can create or update entries, record source reviews, and publish content. Publication requires an appropriate source review for the exact content version being published. The source name is required.

Substantive changes advance the entry's content version. They include changes to the title, summary, body, source name or URL, source publication date, translations, guide, and guide translations. Category or destination reassignment does not advance the version under the documented rule.

When a request changes substantive fields and sets an entry to published at the same time, validation checks for a review against the version that will exist after the edit. A review of the previous text therefore cannot authorize changed text. Rejected publication returns a validation error and leaves the entry unpublished.

### Reports and resolution

Members of the public can submit reports without signing in. Staff can review reports and resolve them with notes. Resolution requires nonblank notes. The server records the resolving staff member and timestamp; clients cannot set those attribution fields. Reopening a report clears active resolution fields so stale attribution does not remain on an open report.

### Revision history

Each substantive save records a JSON snapshot of the persisted substantive fields, keyed by entry and version. The save process re-reads the saved data before capturing the snapshot, so a partial `update_fields` save does not record unsaved in-memory values. A uniqueness rule prevents duplicate snapshots for the same entry and version. History views are read-only.

## 4. Key design decisions

### Version-aware publication enforcement

Approval is tied to the content version reviewed. This prevents edits from inheriting an approval that was granted to older text, including when an edit and publication are submitted together. The substantive-field set defines which content changes invalidate a review.

### Persistent audit evidence

Revision snapshots preserve the versioned information staff reviewed. Resolution attribution records who closed a report and when. Together with version-linked reviews, these records provide traceability for content and issue handling.

### Token refresh for staff sessions

The web API client uses the stored refresh token after an access-token 401 response, then retries the original request. Failed refresh redirects the user to login. This supports continuity through access-token expiry while preserving a reauthentication path when refresh is not possible.

## 5. Data model

| Model | Key fields | Purpose |
|---|---|---|
| `InformationEntry` | title, summary, content, translations, guide, guide translations, content version, publication flag, verification status | Main guidance record. |
| `SourceReview` | entry, entry version, reviewer, review time, outcome, notes | Records a source review against a specific content version. |
| `EntryRevision` | entry, version, snapshot, capture time | Stores a snapshot for each substantive content version. |
| `Category` | name, description | Classifies entries for discovery. |
| `Destination` | country, province, commune | Supports geographic filtering. |
| `Report` | information entry, reason, comment, status, resolution notes, resolver, resolution time | Tracks public feedback and staff action. |

## 6. API surface

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/api/information/` | Public; staff can see all entries | List information entries. |
| POST | `/api/information/` | Staff/admin | Create an entry. |
| GET | `/api/information/<id>/` | Public for published entries | Retrieve an entry. |
| PATCH | `/api/information/<id>/` | Staff/admin | Update an entry; publication rules are enforced. |
| DELETE | `/api/information/<id>/` | Staff/admin | Delete an entry. |
| POST | `/api/information/<id>/reviews/` | Staff/admin | Record a source review. |
| GET | `/api/categories/` | Public | List categories. |
| GET | `/api/destinations/` | Public | List destinations. |
| POST | `/api/reports/` | Public | Submit a report. |
| GET | `/api/reports/` | Staff/admin | List reports. |
| PATCH | `/api/reports/<id>/` | Staff/admin | Update report status and resolution. |
| POST | `/api/auth/token/` | Public | Obtain JWT access and refresh tokens. |
| POST | `/api/auth/token/refresh/` | Public | Refresh an access token. |
| GET | `/api/health` | Public | Check API health. |

## 7. Validation and test evidence

### Automated tests

The supplied run record states that `python manage.py test --verbosity=2` discovered 28 tests, applied migrations to a PostgreSQL test database named `test_nuru_db`, reported no Django system-check issues, and finished with 28 passing tests in 549.276 seconds. Django emitted a warning that `backend/staticfiles/` was absent; the warning did not fail the run.

Representative tested behavior includes:

| Scenario | Expected or recorded behavior |
|---|---|
| Publish without a suitable review for the current version | Validation error; entry remains unpublished. |
| Edit substantive content and publish in one request | Validation uses the post-edit version; old review is insufficient. |
| Public request for an unpublished entry | Entry is omitted from public list; detail request returns 404. |
| Search body or reviewed translation case-insensitively | Matching published entry is returned. |
| Search unreviewed translation | Entry is not returned on that basis. |
| Resolve report without notes | Validation error; report remains open. |
| Change source content after review | Version advances; old review no longer authorizes publication. |
| Partial save with `update_fields` | Snapshot reflects persisted fields only. |
| Save without substantive changes | No duplicate revision is created. |
| Non-staff attempts review or publication | Anonymous user receives 401; authenticated non-staff user receives 403. |

The test coverage emphasizes publication, permissions, search, report transitions, and revision history. These results are the supplied run evidence; they do not establish coverage of every production condition.

### Interface review

Screenshots in `docs/screenshots/` cover the Home, Explore, detail, report, login, dashboard, and authoring screens. They provide a visual baseline for a walkthrough. The screenshots do not document screen-reader testing, measured usability, viewport dimensions, or browser versions.

### Demonstration sequence

A product walkthrough can start at Home, search for a keyword, apply category and destination filters, open an entry and its source, change language, submit a report, sign in as staff, edit a draft, record a source review, and publish. It can then resolve a report with notes and demonstrate a rejected publication without a current review and an empty search state. The web and mobile clients use the same API.

## 8. Compatibility, performance, and known limitations

- The web layout uses responsive CSS flex and grid with fluid sizing. A complete browser, operating-system, and version matrix is not documented.
- Chrome and the Android emulator are identified in the supplied notes, but those notes do not provide a detailed compatibility matrix or device results. The mobile README says full dependency/type checking and live device/backend checks remain incomplete.
- No load, stress, CPU, memory, frame-rate, or other performance benchmarks were measured. No runtime performance figures are claimed.
- Mobile remains a prototype. APK distribution, offline access, and push notifications are not implemented.
- Multilingual interface catalogs exist, but translation coverage for all content and native-speaker review are not established.
- Figma designs cover web and mobile screens, but formal usability validation against the live application is not documented.
- The mobile app stores saved article IDs locally and requires API access to retrieve saved content.

## 9. Repository and project references

| Item | Location |
|---|---|
| Repository | [github.com/abu00123/Nuru](https://github.com/abu00123/Nuru) |
| Live application | [nuru-kappa-jet.vercel.app](https://nuru-kappa-jet.vercel.app) |
| Live API health endpoint | [nuru-q34v.onrender.com/api/health](https://nuru-q34v.onrender.com/api/health) |
| Figma designs | [Figma project](https://www.figma.com/design/f4737lGzdytN9k3KqOwtzB) |
| Backend tests | `backend/information/tests.py`, `backend/reports/tests.py` |
| Models | `backend/information/models.py`, `backend/reports/models.py` |
| Serializers and views | `backend/information/serializers.py`, `backend/information/views.py`, `backend/reports/views.py` |
| Web frontend | `frontend/src/` |
| Mobile prototype | `nuru-mobile/` |
| Screenshots | `docs/screenshots/` |
| Walkthrough video | Google Drive project materials |

## Conclusion

Nuru's web product implements the principal public information and staff editorial workflows, with backend safeguards that connect publication approval to the exact reviewed content version. The reported PostgreSQL-backed test run supports the core workflow implementation. The strongest outstanding work is to complete mobile validation before release, establish broader compatibility and performance evidence, and document multilingual content coverage and review. Offline channels and distribution remain future scope.
