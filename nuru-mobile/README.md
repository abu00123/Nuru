# NURU mobile

React Native + Expo + TypeScript companion to the existing NURU React web app. Both clients connect to the same Django REST API and PostgreSQL database. Add this folder as `mobile/` alongside your existing `frontend/` and `backend/` folders.

## First version

- Search published information and filter by category and destination commune.
- Read full entries, verification status, verification date, and source links.
- Submit a report using the existing anonymous report endpoint.
- Loading, empty, retry, pull-to-refresh, and report confirmation states.
- Android back button and safe area support.

Administration remains in the existing web app. No login is needed for these public mobile features. Offline storage, push notifications, deep links, and store releases are future work.

## Start

Use Node 22.13 or newer. From this directory:

```powershell
npm install
npx expo install --fix
Copy-Item .env.example .env
npm start
```

`expo install --fix` aligns native dependencies with the installed Expo SDK. Commit the generated package-lock.json after installation. If Windows selects a broken npm shim, use `& 'C:\Program Files\nodejs\npm.cmd' install`.

Set `EXPO_PUBLIC_API_URL` in `.env`:

- Android emulator: `http://10.0.2.2:8000/api`
- Physical phone: `http://YOUR_COMPUTER_LAN_IP:8000/api` with both devices on the same network.
- Deployed backend: `https://YOUR_BACKEND_HOST/api`

Restart Expo after editing `.env`. This public variable is bundled into the app; never put passwords or secrets in it. The app requires a reachable backend and contains no demo content.

## Connect your existing backend

Keep its existing PostgreSQL and environment configuration. From `backend/`, with its Python environment active:

```powershell
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Add your computer's LAN IP (or emulator host IP, as applicable) to the backend `.env` `ALLOWED_HOSTS`, preserving existing hosts, for example `localhost,127.0.0.1,10.0.2.2,192.168.1.20`. Allow local inbound access to port 8000 if Windows Firewall blocks the phone. Native clients do not need browser CORS changes. Production requires HTTPS and a production Django server.

Publish information using the existing web admin; unlisted drafts should never be shared with public clients. Destination filtering follows the existing API's commune-name contract; destinations with no commune appear under All destinations only. The API client accepts arrays and DRF `results` wrappers; it currently displays the first page if backend pagination is enabled.

## Checks

Verified in this workspace: all four mocked API contract tests pass and all TypeScript source files pass syntax transpilation. A live backend/device test and complete dependency/type check have not yet been completed. The archive contains no backend credentials or copy of the original private environment files.

```powershell
npm test
npm run typecheck
npx expo-doctor
```

On a phone/emulator: browse, search, filter, open an entry and source, submit a report, confirm it in web administration, refresh after editing an entry on the web, and test unavailable backend/retry and Android back navigation.

## Backend issues discovered during inspection

These exist in the supplied backend and have not been changed in this companion project:

1. `InformationEntryDetailView` uses `InformationEntry.objects.all()` with public GET access, so a known draft ID can be fetched publicly. Scope public detail queries to `is_published=True`, retaining full access for staff. The mobile UI declines unpublished detail responses, but the server must enforce this too.
2. `ReportSerializer` exposes all model fields, including `status`. Make moderation status read-only to prevent anonymous callers choosing a report's review status.

## Project structure

`App.tsx`: public browsing, detail and report screens.
`src/api.ts`: backend configuration and requests with a timeout.
`src/types.ts`: types derived from the supplied Django models.
`tests/api.test.mjs`: API contract checks with mocked responses.

Expo version compatibility reference: https://docs.expo.dev/versions/latest/
