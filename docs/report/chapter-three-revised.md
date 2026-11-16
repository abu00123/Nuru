# CHAPTER THREE: SYSTEM ANALYSIS AND DESIGN

## 3.1 Introduction

This chapter describes how Nuru was analysed, designed, and built. It first presents the research design, including the participants, data collection instruments, the software development life cycle model, and the metrics used to evaluate the system. It then sets out the functional and non-functional requirements, the system design and its supporting diagrams, and the tools used in development. Where the final system differed from what was planned in the proposal, the chapter states the difference.

## 3.2 Research Design

The study combined an exploratory research design with an iterative software development process. Participant research was used to establish requirements and later to evaluate the prototype, while development proceeded in cycles that each produced a working, testable set of functions.

**Participants and sampling.** The proposal planned to recruit Burundian refugees in Mahama directly. Because physical fieldwork at Mahama was not conducted, participants were instead recruited from current African Leadership University students aged 18 or above who live or have previously lived in Mahama Refugee Camp or Settlement. Recruitment used purposive and convenience sampling through individual invitations and an ALU student channel. Twenty-five participants completed the online questionnaire between 10 and 15 November 2026, and five took part in remote usability sessions on 15 November 2026. Participants could take part in either or both activities. The sample provided exploratory design evidence and was not treated as representative of all Burundian refugees or current Mahama residents.

**Data collection instruments.** Two instruments were used. The first was an online questionnaire, delivered through a Google Apps Script web application, which took 10 to 15 minutes to complete. After giving consent, each participant received an automatically generated participant code and answered three eligibility questions before reaching fifteen research questions covering familiarity with return information, information needs, sources, difficulties, the importance of showing sources and dates, responses to conflicting information, devices, access needs, languages, preferred features, preferred channels, and three optional open-ended questions on trust, what the website should avoid, and other suggestions (Appendix C). The second instrument was a remote usability protocol conducted over Google Meet, lasting 20 to 25 minutes. Participants completed five tasks using demonstration content (Table 3.1; full protocol in Appendix D). The researcher recorded task outcomes and observations in a structured form, followed by two comprehension questions, five rating statements on a five-point agreement scale, and two optional feedback questions. No interviews were conducted and no sessions were audio- or video-recorded.

**Table 3.1: Usability Test Tasks**

| Task | Instruction to participant | Completion criterion |
|---|---|---|
| T1 | Open Documentation and find the demonstration entry about official requirements | Entry located and title identified |
| T2 | Use search and the destination filter to find the Education entry for Kirundo | Correct entry located using search and filtering |
| T3 | Identify the source and last-checked date | Both identified |
| T4 | Find the reporting option and submit "This is test feedback." | Demonstration report submitted without personal details |
| T5 | Return to the main categories and explain how to find another topic | Categories reached and navigation route described |

**Ethical considerations.** The study received ethics approval from the African Leadership University Senate's Research Ethics Committee on 5 November 2026 (approval code SEPT26-BSE-074), before recruitment began (Appendix A). In line with the committee's conditions, no rewards were offered for participation. Recruitment followed the approved procedure: invitations were sent individually or through an authorised student channel, interested students contacted the researcher privately, and no participant was pressured to take part. Participants read an information sheet and gave electronic consent before taking part (Appendix B), and consent for the usability session was obtained separately. Responses were identified only by participant codes, and no names, student identifiers, email addresses, legal status, or return intentions were requested. Participants could skip questions, stop at any time, and request removal of their responses within seven calendar days. Responses were stored in a private Google Sheet accessible only to the researcher and supervisor, and no participant data was stored in the project's code repository.

**Software development life cycle.** The project followed an iterative and incremental development model. Each iteration moved through requirements refinement, design, implementation, and testing, and its results informed the next cycle. The first iterations built the core public functions: browsing, searching, filtering, and displaying source-attributed entries. Later iterations added the administrator dashboard, source reviews linked to content versions, revision history, user reports and their resolution, multilingual content, accessibility and responsiveness fixes, and a mobile prototype. This model suited the project because requirements were expected to change after participant research, and because each iteration produced a working system that could be tested before more functions were added. Figure 3.1 shows the cycle.

[FIGURE 3.1: Iterative development cycle — reuse the iteration diagram from your proposal.]

### 3.2.1 Dataset and Dataset Description

The study did not use machine learning, so no training dataset was required. Two kinds of data were used instead. The research data consisted of 25 questionnaire responses, each with a participant code, timestamp, eligibility answers, and up to fifteen research answers, and five usability session records containing device type, outcomes for five tasks, observation notes, two comprehension answers, five ratings, and optional feedback. The system content consisted of information entries organised by category and destination, each with a cited source. Entries used in usability testing were demonstration content prepared for the sessions, and participants were told at the start of each session not to use it for real return decisions. The entries themselves did not carry an on-screen label identifying them as demonstration content, which is noted as a limitation of the test setup.

### 3.2.2 Baseline Model Description

In place of a baseline model, the study took as its baseline the information channels available to potential returnees before Nuru. These included UNHCR Rwanda's voluntary-return web page, which explains the procedure and directs refugees in Mahama to the Registration Centre (UNHCR, n.d.); in-person counselling; and informal sources such as relatives, community members, and social media. The review in Chapter Two found that the official page provided procedures and contacts but not destination-specific information, and that informal sources did not show where information came from or when it was produced. These limitations defined what Nuru needed to add.

### 3.2.3 Proposed Model Description

Nuru was designed as a source-attributed return information system with two kinds of users. Information users browse, search, and filter published entries by category and destination without creating an account; read each entry together with its cited source, the source's publication date, and the date it was last checked; follow optional step-by-step guides with useful contacts; save entries; and report outdated, incorrect, or incomplete information. Administrators sign in to create and edit entries, record source reviews, publish or unpublish entries, inspect revision history, and resolve reports. The central design decision was to link each source review to a specific version of an entry. Any substantive edit increases the version number, so a review recorded for an earlier version no longer permits publication and a new review is required. This prevents edited content from appearing under an earlier approval.

### 3.2.4 Metrics for Evaluation

Table 3.2 lists the metrics used to evaluate Nuru. They were derived from the non-functional requirements set in the proposal.

**Table 3.2: Evaluation Metrics**

| Quality | Metric and target | Method |
|---|---|---|
| Functionality and access control | All automated tests pass, including tests that unauthorised users cannot modify content or view restricted records | Django automated test suite |
| Usability | At least 80% of attempted tasks completed without assistance | Remote usability sessions, Tasks T1–T5 |
| Information comprehension | At least 80% of participants understand that a last-checked date does not confirm current conditions | Usability comprehension questions |
| User perception | Mean agreement ratings on findability, label clarity, limitations, navigation, and reporting | Five-point rating scale |
| Responsiveness | Core screens usable at 360, 768, and 1366 pixels with no overlapping controls, clipped text, or horizontal scrolling | Screenshots of seven screens at each width |
| Accessibility | Keyboard navigation, visible focus, labelled controls, usable text at 200% zoom, contrast of at least 4.5:1 | Lighthouse audits before and after fixes; manual checks |
| Performance | Main content within five seconds at 1 Mbps and 150 ms latency in nine of ten trials | Planned; not measured |

## 3.3 System Analysis

### 3.3.1 Functional Requirements of the System

Table 3.3 lists the functional requirements defined in the proposal and the extent to which each was implemented. FR01 to FR12 were rated "Must" and FR13 "Should". Requirements FR14 to FR16 were added during development in response to questionnaire findings and later iterations.

**Table 3.3: Functional Requirements**

| ID | Requirement | Status | Implementation |
|---|---|---|---|
| FR01 | Browse information by category without an account | Implemented | Category view of published entries; empty state when none exist |
| FR02 | Search published entries by keyword | Implemented | Searches title, summary, content, and reviewed translations |
| FR03 | Filter by destination | Implemented | Destinations recorded at country, province, and commune level; filtering matches any level |
| FR04 | View sources and dates | Implemented | Source name and link, source publication date (or "unknown"), and last-checked date from the current version's review |
| FR05 | View limitations and support contacts | Partial | Support contacts provided in optional step guides; no dedicated limitations field |
| FR06 | Report an information problem without an account | Implemented | Report linked to an entry with a required reason (outdated, incorrect, incomplete, other) and optional comment |
| FR07 | Authenticate administrators | Implemented | JSON Web Token login; administrative endpoints restricted to staff accounts |
| FR08 | Manage content and reference records | Implemented | Create and edit entries, categories, and destinations; source details stored on each entry |
| FR09 | Record source checks and publish | Implemented | Publication blocked without a source name and a "suitable" review for the current version |
| FR10 | Update and withdraw entries | Partial | Entries can be unpublished or marked outdated, and substantive edits require a new review; no separate archive state |
| FR11 | Review user reports | Implemented | Open, in-progress, and resolved statuses; resolution requires notes and records the administrator and date |
| FR12 | Retain revision and review history | Implemented | Snapshot stored for every content version; reviews record version, reviewer, date, outcome, and notes |
| FR13 | Identify entries due for review | Not implemented | Deferred to future work |
| FR14 | Multilingual content | Added | Interface and reviewed content in Kirundi, Kinyarwanda, and Kiswahili, with English fallback |
| FR15 | Save entries | Added | Saved entries on web and mobile, stored on the user's device |
| FR16 | Mobile application | Added (prototype) | Expo and React Native client using the same API |

### 3.3.2 Non-functional Requirements of the System

Table 3.4 summarises the non-functional requirements. Their measurable targets appear in Table 3.2.

**Table 3.4: Non-functional Requirements**

| Requirement | Description |
|---|---|
| Usability | Core tasks can be completed without assistance by users with different levels of digital confidence |
| Information comprehension | Users can identify an entry's source and dates and understand what source checking does not establish |
| Responsiveness | Layouts adapt to mobile, tablet, and desktop widths |
| Accessibility | Keyboard access, visible focus, labelled controls, sufficient contrast, and usable text at 200% zoom |
| Performance | Pages remain usable on slow connections |
| Security | Administrative actions require authentication; passwords are hashed by the framework; the deployed system uses HTTPS; credentials are kept out of the repository |
| Privacy | Browsing and reporting require no account, name, or contact details; only administrators can read reports |
| Reliability and data integrity | Invalid submissions return clear errors without false success messages; edits are saved atomically and earlier versions are preserved |
| Maintainability | Setup instructions, an example configuration without credentials, database migrations, and automated tests |

### 3.3.3 Proposed Model Diagram

Figure 3.2 shows the content review and publication workflow, which is the core of the system model. An administrator drafts an entry with its source, records a source review for the current version, and can publish only after a review marked suitable. A substantive edit, a user report, or a change in the source returns the entry to review.

[FIGURE 3.2: Content review and publication workflow — see diagrams file.]

## 3.4 System Design

### 3.4.1 Architecture Diagram, Database Design, and Other Diagrams

**System architecture.** Nuru used a three-tier client-server architecture (Figure 3.3). The presentation tier consisted of a React and TypeScript web application, hosted on Vercel, and an Expo and React Native mobile prototype. Both clients communicated over HTTPS with a single JSON application programming interface built with Django REST Framework and hosted on Render. The API validated input, enforced permissions, and applied the publication rules before reading from or writing to a PostgreSQL database, also hosted on Render. External publications were consulted manually by administrators when preparing entries; the system had no automated connection to them.

[FIGURE 3.3: System architecture — see diagrams file.]

**Use cases.** The system had two actors (Figure 3.4). Information users could browse by category, search and filter by destination, read entries with their sources and dates, follow step guides, save entries, change language, and report a problem. Administrators could sign in, manage entries, categories, and destinations, record source reviews, publish or unpublish entries, view revision history, and resolve reports.

[FIGURE 3.4: Use case diagram — see diagrams file.]

**Database design.** The final database was simpler than the schema proposed in the proposal, which had separate tables for sources, support contacts, and many-to-many links between entries, sources, and destinations. During development, source details were stored directly on each entry, each entry was linked to a single destination, and support contacts were placed inside an optional structured guide. The final schema contained six main tables (Figure 3.5). Category and Destination organised entries; InformationEntry stored the content, source details, translations, publication status, and current content version; SourceReview recorded each review against a specific entry version; EntryRevision stored a snapshot of each version; and Report stored user reports and their resolution. User accounts were provided by Django's authentication system.

[FIGURE 3.5: Entity–relationship diagram — see diagrams file.]

**Publication sequence.** Figure 3.6 shows the sequence of interactions when an administrator publishes an entry. The dashboard sends the request to the API, which checks the administrator's token, confirms that a source name exists and that a suitable review exists for the current version, and either saves the change or returns an error explaining what is missing.

[FIGURE 3.6: Publication sequence diagram — see diagrams file.]

**Interface design.** The interface was designed first as wireframes and then as high-fidelity mock-ups in Figma for web and mobile screens. The main public screens were Home, Explore (search and filters), the entry detail page, the report form, and saved entries; the administrator screens were the login page, the dashboard, and the entry form.

[FIGURE 3.7: Selected interface designs — use images from docs/wireframes or docs/mockups.]

## 3.5 Development Tools

Table 3.5 lists the main tools and technologies used to build and test Nuru.

**Table 3.5: Development Tools**

| Layer | Tool or technology | Purpose |
|---|---|---|
| Backend | Python 3.14 (development; 3.10 or later supported), Django 5.1, Django REST Framework 3.14 | API, data models, validation, and permissions |
| Authentication | Simple JWT 5.5 | Access and refresh tokens for administrators |
| Database | PostgreSQL | Persistent storage |
| Web frontend | React 19, TypeScript 6.0, Vite 8, React Router 7, Axios | Public interface and administrator dashboard |
| Mobile | Expo 58, React Native 0.88, AsyncStorage | Mobile prototype and on-device saved entries |
| Deployment | Render (API and database), Vercel (web), Gunicorn, WhiteNoise | Hosting and serving |
| Testing | Django test framework, Google Lighthouse, Chrome DevTools device mode | Automated tests, accessibility audits, and responsiveness checks |
| Design | Figma | Wireframes and mock-ups |
| Research | Google Apps Script, Google Sheets, Google Meet, Google Forms | Questionnaire, response storage, and usability sessions |
| Project management | Git, GitHub, Visual Studio Code | Version control and development |
| Referencing | Zotero | Reference management |
