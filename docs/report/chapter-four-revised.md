# CHAPTER FOUR: SYSTEM IMPLEMENTATION, RESULTS AND DISCUSSION OF FINDINGS

## 4.1 System Implementation

### 4.1.1 Introduction

This section presents the implemented system through screenshots of its main features, each linked to the functional requirement it satisfies and accompanied by the source code that produces it. It then reports the results of the questionnaire and usability evaluation, discusses those results in relation to the literature reviewed in Chapter Two, and documents the software testing carried out on the system.

## 4.2 Graphical View of the Project

### 4.2.1 Screenshots with Description

**Search and filter (FR01–FR03).** The Explore page (Figure 4.1) lets any user search published entries by keyword and narrow them by category and destination without signing in. This addresses the difficulty, identified in the problem statement, of locating information relevant to a particular destination.

[FIGURE 4.1: Explore page with search box and category and destination filters — use docs/testing/responsiveness/1366-explore.png, cropped to remove the DevTools bar.]

A keyword search returns entries whose content contains the term, even when it does not appear in the title, and a search with no matches shows a clear message (Figure 4.2).

[FIGURE 4.2 (a–b): docs/testing/functional/fr02-search-keyword-match.png and fr02-search-no-match.png]

The query logic is implemented in the API view below. Public users only ever receive published entries; the search covers English fields and any translation marked as reviewed; and the destination filter matches a commune, province, or country.

```python
# backend/information/views.py
def get_queryset(self):
    if self.request.user and self.request.user.is_staff:
        queryset = InformationEntry.objects.all()
    else:
        queryset = InformationEntry.objects.filter(is_published=True)

    search = self.request.query_params.get('search')
    category = self.request.query_params.get('category')
    destination = self.request.query_params.get('destination')

    if search:
        condition = Q(title__icontains=search) | Q(summary__icontains=search) | Q(content__icontains=search)
        for language in ('rn', 'rw', 'sw'):
            translated_match = Q()
            for field in ('title', 'summary', 'content'):
                translated_match |= Q(**{f'translations__{language}__{field}__icontains': search})
            condition |= Q(**{f'translations__{language}__reviewed': True}) & translated_match
        queryset = queryset.filter(condition)
    if category:
        queryset = queryset.filter(category__name__iexact=category)
    if destination:
        queryset = queryset.filter(
            Q(destination__commune__iexact=destination)
            | Q(destination__province__iexact=destination)
            | Q(destination__country__iexact=destination)
        )
    return queryset
```

**Entry details with source and dates (FR04).** Each entry page (Figure 4.3) shows the category and destination, the content, the cited source with a link, the source's publication date (or "Unknown"), and the date the entry was last checked. The last-checked date is not entered by hand: it is derived from the most recent review marked suitable for the entry's current version, so it disappears automatically when the content is edited.

[FIGURE 4.3: Entry detail page showing source, source publication date, and last-checked date — use docs/testing/responsiveness/1366-article.png, cropped.]

```python
# backend/information/models.py
@property
def current_source_check_date(self):
    review = self.source_reviews.filter(entry_version=self.content_version, outcome='suitable').first()
    return review.reviewed_at.date() if review else None
```

**Reporting a problem (FR06).** From any entry, a user can report that information is outdated, incorrect, or incomplete, with an optional comment and no account or personal details (Figure 4.4).

[FIGURE 4.4: Report form — use docs/testing/responsiveness/1366-report.png, cropped.]

**Administrator login and dashboard (FR07, FR08).** Administrators sign in (Figure 4.5) and reach a dashboard (Figure 4.6) listing entries and open reports, from which they can add or edit entries.

[FIGURE 4.5: Login page — 1366-login.png. FIGURE 4.6: Administrator dashboard — 1366-admin-dashboard.png.]

**Source review and publication control (FR09, FR10, FR12).** The entry form (Figure 4.7) is where administrators edit content and publish. Publication is enforced on the server rather than in the interface, so it cannot be bypassed. The serializer below rejects publication unless the entry has a source name and a review marked suitable for the exact version that will be saved. If the same request also changes substantive content, the version that will be saved is checked, so an edit cannot be published under an earlier review.

[FIGURE 4.7: Entry form with source fields and publish option — 1366-admin-form.png.]

Figure 4.8 shows the rule in operation during testing. An attempt to publish a test entry without a suitable review for its current version was rejected with an explanation (a). After a suitable review was recorded, publication succeeded (b). When the content was then edited, the version advanced to 3 and publication was rejected again until a new review was recorded (c), after which it succeeded (d).

[FIGURE 4.8 (a–d): docs/testing/functional/fr09-publish-rejected-no-review-v2.png, fr09-publish-accepted-after-review.png, fr09-edit-requires-new-review-v3.png, fr09-republish-accepted-after-new-review.png]

Every saved version is kept as a snapshot that administrators can inspect (Figure 4.9), which satisfies FR12.

[FIGURE 4.9: docs/testing/functional/fr12-revision-version-3.png and fr12-revision-version-4.png side by side — two stored versions of the same entry.]

```python
# backend/information/serializers.py
publishing = attrs.get('is_published', getattr(self.instance, 'is_published', False))
if publishing:
    errors = {}
    source_name = attrs.get('source_name', getattr(self.instance, 'source_name', ''))
    if not (source_name or '').strip():
        errors['source_name'] = 'A source name is required before publishing. ...'
    if self.instance:
        current_version = self.instance.content_version
        # Validate the version that will be saved, not the pre-edit version.
        if any(field in attrs and attrs[field] != getattr(self.instance, field)
               for field in SUBSTANTIVE_FIELDS):
            current_version += 1
        review = self.instance.source_reviews.filter(
            entry_version=current_version, outcome='suitable').first()
        if not review:
            errors['is_published'] = (f'A source review marked "suitable for publication" is '
                                      f'required for version {current_version} of this entry. ...')
    else:
        errors['is_published'] = 'Save the entry first, then record a source review before publishing.'
    if errors:
        raise serializers.ValidationError(errors)
```

**Resolving reports (FR11).** Administrators move reports from open to in progress to resolved. A report cannot be resolved without notes, and the system, not the administrator, records who resolved it and when.

In testing, an attempt to resolve a report without notes was rejected (Figure 4.10a). With notes entered, the report was resolved and the system recorded the administrator and time (b), and returning the report to "In progress" cleared that attribution (c). Administrators can also change a report's status from the web dashboard (d).

[FIGURE 4.10 (a–d): docs/testing/functional/fr11-resolve-without-notes-rejected.png, fr11-resolved-with-attribution.png, fr11-in-progress-no-attribution.png, fr11-dashboard-report-status.png]

```python
# backend/reports/models.py
def clean(self):
    super().clean()
    if self.status == 'resolved' and not self.resolution_notes.strip():
        raise ValidationError({'resolution_notes': 'Explain the outcome before resolving this report.'})
```

**Language selection (FR14) and mobile access (FR16).** The language menu switches the interface to Kirundi, Kinyarwanda, or Kiswahili, and reviewed translations of entries are shown where available (Figure 4.11). The same functions are available in the mobile prototype (Figure 4.12), and the web interface adapts to phone screens (Figure 4.13).

[FIGURE 4.11: docs/testing/functional/kirundi-entry.png — interface in Kirundi. FIGURE 4.12: docs/testing/functional/mobile-app.jpeg — home screen of the mobile prototype with language selection. FIGURE 4.13: 360-explore.png and 360-article.png side by side.]

## 4.3 Results

This section reports the findings from the questionnaire (n = 25) and the usability sessions (n = 5). Percentages are given for completeness but should be read against the small, purposive sample.

**Participant familiarity.** Nineteen participants (76%) described themselves as very familiar with information needs relating to voluntary return to Burundi, one as somewhat familiar, and five as not familiar.

**Information needs (Research Question 1).** Safety and changing local conditions was the most frequently selected need, chosen by 22 participants (88%), followed by documentation and official procedures (13, 52%) and housing, land and property (10, 40%) (Figure 4.14). Government or official websites (23, 92%) and UNHCR or other humanitarian staff (17, 68%) were the sources participants expected people to consult most, well ahead of relatives and community members (7, 28%) and social media (4, 16%) (Figure 4.15).

[FIGURE 4.14: figures/fig4-needs.png — Return-related information most needed]
[FIGURE 4.15: figures/fig4-sources.png — Where participants would expect people to look for information]

**Difficulties in using information (Research Question 2).** Outdated information (17, 68%) and conflicting information between sources (15, 60%) were the most common difficulties, followed by difficult wording (7, 28%) and unclear sources or authors (6, 24%) (Figure 4.16). When asked what they would do first if two sources disagreed, the largest group (10, 40%) said they would be unsure what to do, seven (28%) would ask trusted community contacts, four (16%) would compare the sources' dates and credibility, and two (8%) would seek confirmation from an official or humanitarian service (Figure 4.17).

[FIGURE 4.16: figures/fig4-difficulties.png — Difficulties in using return-related information]
[FIGURE 4.17: figures/fig4-conflict.png — First response when two sources disagree]

**Importance of sources and dates.** Twenty participants (80%) rated showing the original source beside each entry as important or very important (4 or 5 on a five-point scale; mean 4.0), and 18 (72%) rated showing when information was published or last checked as important or very important (mean 3.9) (Figure 4.18).

[FIGURE 4.18: figures/fig4-importance.png — Importance of showing the source and the date]

**Access, language, and features (Research Question 3).** Nine participants would use a smartphone, six a tablet, and five a laptop or desktop, while five (20%) said they would not have access to an internet-capable device (Figure 4.19). High mobile data costs (16, 64%), unreliable internet (14, 56%), and language or literacy barriers (10, 40%) were the access needs most often identified (Figure 4.20). Kirundi and Kinyarwanda were each selected by 23 participants (92%), while Kiswahili was selected by two. Search by keyword (17, 68%) and browsing by category (16, 64%) were the most wanted features, followed by filtering by destination (8, 32%) (Figure 4.21). For the preferred way of accessing information, 13 participants (52%) chose a messaging service, eight (32%) a mobile-friendly website, three (12%) in-person assistance, and one a combination of channels.

[FIGURE 4.19: figures/fig4-devices.png — Device participants would use]
[FIGURE 4.20: figures/fig4-access.png — Access needs the website should accommodate]
[FIGURE 4.21: figures/fig4-features.png — Most useful website features]

**Open-ended responses.** Written answers on trust converged on the same cues: a clear source, the organisation responsible, and the date the information was last verified or updated, with several participants also wanting confirmation from an official or trusted humanitarian organisation. One participant said they would trust information "if a relative who lives in Burundi can confirm it." Asked what the website should avoid, participants repeatedly named publishing outdated, misleading, or unverified information, pressuring people to return, and making decisions on users' behalf. Suggestions emphasised simple language, several languages, and mobile-friendly design for people with different educational and technological backgrounds.

**Usability results (Research Question 4).** All five usability participants completed all five tasks, with or without help. Of the 25 task attempts, 18 (72%) were completed without help, below the target of 80% (Figure 4.22). Identifying an entry's source and last-checked date (T3) was completed without help by all five participants. The original protocol also asked participants to find a limitation notice, but because neither the interface nor the demonstration entries contained one, that part of the task could not be tested and was excluded. By contrast, submitting a report (T4) needed help in three of five sessions and using search with the destination filter (T2) in two.

[FIGURE 4.22: figures/fig4-tasks.png — Usability task completion]

The comprehension checks produced the most important result of the evaluation (Table 4.1). Asked whether a last-checked date means that Nuru has independently verified current conditions in a destination, no participant gave the correct answer: four answered "yes" and one was unsure. The target of 80% was therefore not met. In contrast, four of five participants correctly said that the appropriate next step for outdated or conflicting information was to seek clarification from an official or humanitarian information service; one chose to treat the website as a personalised return recommendation.

**Table 4.1: Comprehension Check Results (n = 5)**

| Question | Correct answer | Correct responses | Other responses |
|---|---|---|---|
| Does a last-checked date mean Nuru has independently verified current conditions in a destination? | No | 0 | Yes (4), Unsure (1) |
| What is an appropriate next step if information appears outdated or conflicting? | Seek clarification from an official or humanitarian service | 4 | Treat the website as a personalised recommendation (1) |

Participants' ratings were positive across all five statements, with means between 4.0 and 4.6 on a five-point scale (Figure 4.23). Navigation received the highest rating (4.6) and source and date labels and the explanation of limitations the lowest (4.0 each). Written feedback noted that some category labels were unclear or seemed to overlap, asked for larger and more visible buttons, particularly for older or first-time users, and in one case reported difficulty judging whether information was legitimate.

[FIGURE 4.23: figures/fig4-ratings.png — Mean agreement with usability statements]

## 4.4 Discussion of Findings

**Information needs and sources.** The dominance of safety and changing local conditions among participants' needs is consistent with Alrababah and Casalis (2024) and Alrababah et al. (2023), who identify conditions in the place of origin, and safety in particular, as central to return decisions. It also confirms that the information people most need is the kind that changes quickly, which strengthens the case for showing when each entry was produced and checked. Participants' strong expectation that people would turn to official websites and humanitarian staff, rather than relatives or social media, differs in emphasis from Oduntan and Ruthven (2021), who found that refugees met their needs largely through people. This difference may reflect the sample: participants were university students, most of whom described themselves as very familiar with return information. The open-ended answers suggest that personal networks still matter for confirmation, as when one participant described relying on a relative in Burundi.

**Barriers to access.** The difficulties participants identified map closely onto the intervening variables in Wilson's (1999) model. Environmental barriers, chiefly data costs and unreliable internet, and source characteristics, chiefly outdated and conflicting information, were cited far more often than personal barriers. The finding that one in five participants would lack an internet-capable device, and that data cost was the most common access need, echoes UNHCR (2016) and the physical-access stage of van Dijk's (2020) model of the digital divide. It supports UNHCR's (2022) position that digital services should complement, not replace, in-person support, and it marks a limit on what a website alone can achieve.

**Credibility and the meaning of "checked".** Participants valued visible sources and dates and, in their own words, named exactly the cues that Metzger (2007) and Hilligoss and Rieh (2008) describe: who published the information, which organisation stands behind it, and when it was last updated. Yet when sources conflicted, the largest group did not know what to do, and the next largest would ask community contacts, a social heuristic of the kind Metzger et al. (2010) describe, rather than compare sources systematically. This suggests that displaying cues is necessary but not sufficient; users also need guidance on what to do with them.

The comprehension result shows the same gap from the system's side. Nuru was designed to separate source checking from verification of conditions on the ground, but every participant interpreted the last-checked date as confirmation of current conditions or was unsure. A review of the interface after testing points to a likely cause. Entries displayed a "Verified ✓" badge, the home page invited users to search "verified information", and no notice explained what a source check does not establish. The badge was also set manually by administrators and was not linked to the version-specific review, so an entry could show "Verified ✓" beside "Not yet checked for this version". In the terms of Hilligoss and Rieh's (2008) framework, these interaction-level cues overrode the distinction the system was built to make. This illustrates the point made by Winkel and Friedrichs-Liesenkötter (2022) that displaying trust signals is different from establishing accuracy, and that the signals themselves can mislead. The finding is a clear design lesson rather than a failure of the underlying model: the version-linked review worked as intended in testing, but the labels presented to users did not communicate it.

**Channels and languages.** A review of the Kirundi interface after testing found that navigation, search, and filters were translated, but the home-page banner remained in English, and one translated entry still carried the credit line of the machine-translation tool used to draft it. This confirms that translated content needs review by native speakers before publication, rather than a simple "reviewed" flag. Half of the participants preferred a messaging service, compared with a third who preferred a website. This aligns with the design of Julisha.Info and Refugee.Info, which combine published content with messaging channels, and with UNHCR's (2022) multi-channel approach. Nuru currently offers web and mobile access only, so this preference identifies an important direction for future work. The near-universal selection of Kirundi and Kinyarwanda supports the decision to provide both, while the low selection of Kiswahili suggests it is a lower priority for this group.

**Usability and acceptance.** Ratings of findability (4.2) and navigation (4.6) indicate that participants found the prototype easy to use and useful, the two beliefs that Davis (1989) identifies as central to acceptance. The task results qualify this picture. The reporting task and the combined search and filter task accounted for most of the assistance needed, which matches participants' comments about unclear labels and small buttons. The unassisted completion rate of 72% fell short of the 80% target, and with five participants, a single additional success would have changed the rate by four percentage points, so the result should be read as indicative only.

**Summary.** The findings answered the research questions within the limits of the sample. Participants needed current, destination-specific information above all, particularly on safety, and faced barriers of cost, connectivity, and conflicting information (Research Questions 1 and 2). They identified visible sources and dates, simple language, local languages, and mobile access as requirements, all of which Nuru implemented, while their preference for messaging services was not met (Research Question 3). The prototype met its functional requirements and was rated positively, but did not meet its unassisted completion or comprehension targets, and the comprehension failure traced to interface wording that contradicted the system's own source-checking design (Research Question 4).

## 4.5 Testing

### 4.5.1 Introduction

This section describes how Nuru was tested: the environments used, how errors were handled and recorded, and the results of unit, validation, integration, system, and acceptance testing. Evidence files are stored in the project repository under docs/testing.

**Environment configurations.** Table 4.2 summarises the environments in which the system was developed, tested, and deployed.

**Table 4.2: Testing Environments**

| Item | Configuration |
|---|---|
| Development machine | Windows 11 Pro (build 26300), Lenovo laptop |
| Backend runtime | Python 3.14, Django 5.1, Django REST Framework 3.14 |
| Frontend runtime | Node.js 24, Vite 8, React 19, TypeScript 6.0 |
| Automated test database | SQLite in-memory database (isolated test settings) |
| Production database | PostgreSQL on Render |
| Deployment | API on Render (free tier, Gunicorn, WhiteNoise); web client on Vercel; HTTPS on both |
| Browsers tested | Google Chrome (desktop), with Chrome DevTools device mode for 360, 768, and 1366 pixel widths |
| Mobile | Expo prototype run on the Android emulator |
| Usability sessions | Participants' own devices: four smartphones and one laptop, over Google Meet |

Compatibility testing was limited to Chrome and the Android emulator. Other browsers, such as Firefox and Safari, and physical Android and iOS devices were not systematically tested.

**Error tracking.** Input errors are handled through Django REST Framework validation. Invalid requests receive an HTTP 400 response containing field-specific messages, such as the publication error shown in Section 4.2, and the web client displays these messages to the user rather than a generic failure. Unauthenticated or unauthorised requests receive HTTP 401 or 403 responses, and the web client attempts to refresh an expired login token before redirecting the administrator to the login page. Server-side errors are written to the application log, which is available through the Render dashboard. No dedicated exception-monitoring service, such as Sentry, was configured; this is noted as future work.

### 4.5.2 Objective of Testing

The objectives of testing were to verify that each functional requirement in Table 3.3 behaved as specified; to confirm that unauthorised users could not view unpublished content or perform administrative actions; to check that the system remained usable across screen sizes and met selected accessibility criteria; to measure the response times of the deployed API; and to establish, with real participants, whether users could find, understand, and assess information as Objective 4 required.

### 4.5.3 Unit Testing Outputs

The backend has 30 automated tests written with Django's test framework. All 30 passed in the final run (Figure 4.24). Code coverage, measured with Coverage.py, was 77% across the application code, excluding test files and database migrations, and 86% when test files are included. Coverage was highest in the core models, serializers, and views (83–100%) and lowest in the Django admin configuration (63%), the guide validation helpers (13%), and an unused translation-validation module (0%) (Figure 4.25). Table 4.3 groups the tests by the behaviour they verify.

[FIGURE 4.24: docs/testing/functional/test-run.png — test runner output, 30 tests passed (full log: docs/testing/unit-integration/test-run-output.txt).]
[FIGURE 4.25: docs/testing/functional/coverage-report.png — coverage report (Files view).]

**Table 4.3: Automated Tests by Area**

| Area | Tests | What is verified |
|---|---|---|
| Source and check dates | 4 | Unknown publication dates; check date set by a current suitable review and cleared by an edit; invalid dates rejected; manual check dates ignored |
| Search and filtering | 5 | Case-insensitive search of title, summary, and body; search of reviewed translations in each language; unreviewed translations and drafts excluded; empty results; destination filter by commune, province, or country |
| Revision history | 5 | Edits preserve earlier content; unchanged saves do not duplicate history; partial saves record only persisted changes; administrators can inspect snapshots and matching reviews |
| Publication control and access | 10 | Entries cannot be created as published; publication rejected without a review or source; unsuitable reviews do not permit publication; edits cannot reuse an earlier review; drafts hidden from the public; non-administrators cannot review or publish; deletion refused to preserve history |
| Report resolution | 6 | Resolution requires notes; resolver and date recorded by the server; reopening clears resolution; public users cannot resolve reports; Django admin enforces the same rules |

### 4.5.4 Validation Testing Outputs

Validation testing checked the system against the research objectives and functional requirements. Table 4.4 maps each objective to the tests that address it, and Table 4.5 compares expected and actual outcomes for the main workflows.

**Table 4.4: Requirements Traceability**

| Objective | Requirements | Validation evidence |
|---|---|---|
| 1. Investigate information needs and requirements | FR01–FR16 derived and refined | Questionnaire (n = 25), Section 4.3 |
| 2. Enable finding information by topic and destination, with source and dates | FR01–FR04, FR14 | Search, filter, and date tests (Table 4.3); usability tasks T1–T3 |
| 3. Implement administrative content, review, and report functions | FR07–FR12 | Publication, revision, and report tests (Table 4.3) |
| 4. Evaluate usability, comprehension, accessibility, and responsiveness | Non-functional requirements | Usability sessions (n = 5); Lighthouse audits; responsiveness screenshots |

Screenshots of cases V1, V2, V5, V6, and V9 being carried out are shown in Figures 4.2, 4.8, and 4.10.

**Table 4.5: Validation Test Cases**

| ID | Test case | Expected result | Actual result | Status |
|---|---|---|---|---|
| V1 | Search for a keyword in an entry body | Matching published entries returned, regardless of case | As expected | Pass |
| V2 | Search for a term with no matches | Empty result and clear message | As expected | Pass |
| V3 | Filter by a province name | Entries for that province and its communes returned | As expected | Pass |
| V4 | Public request for a draft entry | Not returned in lists; direct request returns 404 | As expected | Pass |
| V5 | Publish without a source review | Rejected with explanatory message | As expected | Pass |
| V6 | Publish with a suitable review, then edit content | Edit invalidates the review; republication requires a new review | As expected | Pass |
| V7 | Non-administrator attempts to record a review or publish | Rejected (401/403) | As expected | Pass |
| V8 | Submit a report without an account | Report saved and linked to entry | As expected | Pass |
| V9 | Resolve a report without notes | Rejected with explanatory message | As expected | Pass |
| V10 | Administrator login with invalid credentials | Rejected | HTTP 401 on the deployed API (checked 15 November 2026) | Pass |

### 4.5.5 Integration Testing Outputs

The automated tests in Table 4.3 are integration tests as well as unit tests: most send real HTTP requests through Django REST Framework's test client, so each request passes through URL routing, authentication, permission checks, serializer validation, and database queries before the response is checked. Table 4.6 lists the API endpoints and how each was exercised.

**Table 4.6: API Endpoints**

| Method and endpoint | Access | Purpose | Tested by |
|---|---|---|---|
| GET /api/information/ | Public (published only); staff (all) | List, search, and filter entries | Search and filtering tests; draft visibility tests |
| POST /api/information/ | Staff | Create an entry | Publication control tests |
| GET, PUT, PATCH /api/information/{id}/ | Public read (published); staff write | Retrieve or update an entry | Publication and revision tests |
| POST /api/information/{id}/reviews/ | Staff | Record a source review | Review and publication tests |
| GET /api/categories/, /api/destinations/ | Public read; staff create | Reference lists | Filter tests; live timing |
| GET, POST /api/reports/ | Public create; staff list | Submit and list reports | Report tests |
| GET, PUT, PATCH /api/reports/{id}/ | Staff | Resolve reports | Report resolution tests |
| POST /api/auth/token/, /api/auth/token/refresh/ | Public | Obtain and refresh login tokens | Access control tests |
| GET /api/health | Public | Deployment health check | Live timing |

On the deployed system, an invalid login and an unauthenticated attempt to record a review were both rejected with HTTP 401, and a request for a non-public entry returned HTTP 404. End-to-end data flow was confirmed on the deployed system: entries created and reviewed through the administrator dashboard were stored in PostgreSQL, appeared on the public Explore page once published, and disappeared when unpublished (Figure 4.26).

[FIGURE 4.26 (a–c): docs/testing/functional/e2e-1-published-admin.png (test entry published in the administrator dashboard), e2e-2-visible-public.png (the same entry returned by a public search), e2e-3-hidden-after-unpublish.png (the same search after unpublishing: "No information found").]

### 4.5.6 Functional and System Testing Results

**Response times.** Response times of the deployed API were measured on 15 November 2026 from the development machine, with eleven consecutive requests to each of four endpoints (Figure 4.27). The first request took 24.2 seconds, because Render's free tier suspends the service when idle and must restart it. Subsequent requests had median response times between 0.60 and 0.91 seconds, with a maximum of 1.81 seconds. These times include network travel from Rwanda to the hosting region. The planned test of full page loads at 1 Mbps and 150 ms latency was not carried out, and server resource use (CPU and memory) and throughput under load were not measured. The raw timings are saved in docs/testing/performance/api-response-times.csv.

[FIGURE 4.27: figures/fig4-latency.png — API response times (warm requests)]

**Responsiveness.** Seven screens (Home, Explore, entry detail, report form, login, administrator dashboard, and entry form) were checked at 360, 768, and 1366 pixels using Chrome DevTools device mode. During testing, the search button was found to be hidden on narrow phone screens and was fixed. After the fix, all 21 combinations displayed without overlapping controls, clipped essential text, or horizontal scrolling of ordinary content.

[FIGURE 4.28: Responsiveness evidence — a selection from docs/testing/responsiveness, e.g. 360-explore.png, 768-explore.png, 1366-explore.png side by side.]

**Accessibility.** Google Lighthouse accessibility audits were run before and after a set of fixes (Table 4.7). The audits identified insufficient colour contrast in navigation text and date labels, filter and search controls without accessible names, and slideshow buttons below the minimum touch-target size. All were corrected, raising the Home page score from 95 to 100 and the Explore page from 84 to 100; the entry detail page scored 100. Text remained usable at 200% browser zoom on the Home and entry pages. Lighthouse checks only a subset of accessibility criteria, and no screen-reader testing was carried out.

**Table 4.7: Lighthouse Accessibility Scores**

| Page | Before fixes | After fixes | Issues fixed |
|---|---|---|---|
| Home | 95 | 100 | Navigation text contrast |
| Explore | 84 | 100 | Unlabelled search and filter controls; contrast; slideshow touch targets |
| Entry detail | — | 100 | — |

[FIGURES 4.29–4.30: docs/testing/accessibility/lighthouse-home-before-fix.png and Lighthouse-explore-after-fix.png; zoom-200-home.png.]

### 4.5.7 Acceptance Testing Report

Acceptance testing was carried out through the remote usability sessions described in Section 3.2, with five participants, all current ALU students with lived experience of Mahama. This is below the guideline of 20 participants for acceptance testing. The approved ethics procedure required that participation be entirely voluntary and that no student be pressured or repeatedly approached, and within the time available only five eligible students volunteered for the usability session. The 25 questionnaire respondents informed the requirements but did not use the prototype. A custom five-item agreement scale was used instead of the System Usability Scale (SUS), so no SUS score is available.

Within these limits, the results in Section 4.3 indicate partial acceptance. Participants completed every task and rated the prototype positively, with mean ratings between 4.0 and 4.6, but 28% of task attempts needed help and no participant correctly understood what the last-checked date establishes. The main changes indicated by acceptance testing are to replace the "Verified" badge and wording with "Source checked" linked to the version-specific review, to add a short notice on every entry explaining what a source check does and does not establish, to simplify category labels and enlarge buttons, and to make the reporting option easier to find.

The anonymised questionnaire summary and usability session records are provided in Appendices E and F, and the instruments used are in Appendices C and D.
