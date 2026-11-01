from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from pathlib import Path

OUT = Path('docs/technical-report.pdf')
OUT.parent.mkdir(parents=True, exist_ok=True)
green = colors.HexColor('#1a3c2e')
muted = colors.HexColor('#52616b')
light = colors.HexColor('#edf3f0')
orange = colors.HexColor('#9a5b15')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleN', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=25, leading=29, textColor=green, spaceAfter=7))
styles.add(ParagraphStyle(name='SubN', parent=styles['Normal'], fontSize=10, leading=14, textColor=muted, spaceAfter=11))
styles.add(ParagraphStyle(name='H1N', parent=styles['Heading1'], fontSize=15, leading=18, textColor=green, spaceBefore=5, spaceAfter=7))
styles.add(ParagraphStyle(name='H2N', parent=styles['Heading2'], fontSize=10.5, leading=13, textColor=green, spaceBefore=6, spaceAfter=3))
styles.add(ParagraphStyle(name='BodyN', parent=styles['BodyText'], fontSize=8.5, leading=11.4, spaceAfter=5))
styles.add(ParagraphStyle(name='SmallN', parent=styles['BodyText'], fontSize=7.1, leading=9, textColor=muted))
styles.add(ParagraphStyle(name='CellN', parent=styles['BodyText'], fontSize=7.1, leading=8.8, spaceAfter=0))
styles.add(ParagraphStyle(name='HeadCell', parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=7.2, leading=8.8, textColor=colors.white, spaceAfter=0))

P = lambda text, style='BodyN': Paragraph(text, styles[style])
def footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(colors.HexColor('#d9e4de'))
    canvas.line(18*mm, 14*mm, w-18*mm, 14*mm)
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(muted)
    canvas.drawString(18*mm, 9*mm, 'NURU | Technical product report | Evidence checked against repository')
    canvas.drawRightString(w-18*mm, 9*mm, f'{doc.page}')
    canvas.restoreState()

def make_table(rows, widths, font=7.1):
    t = Table(rows, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),green), ('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('GRID',(0,0),(-1,-1),0.35,colors.HexColor('#d7e0db')),
        ('VALIGN',(0,0),(-1,-1),'TOP'), ('LEFTPADDING',(0,0),(-1,-1),5),
        ('RIGHTPADDING',(0,0),(-1,-1),5), ('TOPPADDING',(0,0),(-1,-1),4),
        ('BOTTOMPADDING',(0,0),(-1,-1),4), ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,light]),
    ]))
    return t

story=[]
story += [P('NURU', 'TitleN'), P('Final product technical report | Scope, implementation, validation, and limits', 'SubN')]
story += [P('<b>Project.</b> Nuru is a source-linked return information service. Public users browse information without accounts; authorized staff review and publish content through a web administration workflow. The repository also contains an Expo mobile prototype.', 'BodyN')]
story += [P('1. Scope alignment and feature validation', 'H1N')]
rows=[[P(x,'HeadCell') for x in ['Planned feature','Purpose','Current status','Evidence in repository']]]
scope=[
('Browse/search/filter','Find relevant guidance by keyword, category, or destination.','Implemented','frontend/src/pages/Explore.tsx; backend/information/views.py'),
('Article details and sources','Show full guidance and its cited source/date.','Implemented','frontend/src/pages/InformationDetail.tsx; InformationEntry model/serializer'),
('Public issue reports','Let readers flag possibly stale or incorrect entries.','Implemented','frontend/src/pages/ReportInformation.tsx; backend/reports/'),
('Admin authoring and publishing','Allow authorized staff to maintain public information.','Implemented','JWT login, admin pages, Django permissions'),
('Review, version history, resolution','Make publication evidence and editorial outcomes traceable.','Implemented','SourceReview, EntryRevision, report resolution fields; migrations and tests'),
('Multilingual content','Improve access in local languages.','Partial','rn/rw/sw UI catalogs, reviewed article/guide translation fields and fallback; content coverage/native review not established'),
('Mobile access','Extend core public tasks to phones.','Partial prototype','nuru-mobile/ implements browse, search, reports, bookmarks and guides; device validation/release not documented'),
('Offline/SMS/maps/push','Support low-connectivity channels and discovery.','Not implemented','Identified as future work; no production implementation found'),
]
for a,b,c,d in scope: rows.append([P(a,'CellN'),P(b,'CellN'),P(c,'CellN'),P(d,'CellN')])
story.append(make_table(rows,[31*mm,43*mm,27*mm,69*mm]))
story += [Spacer(1,5),P('<b>Scope change.</b> The project expanded beyond the web MVP with an experimental mobile client and stronger editorial controls (versioned review, revision snapshots, and report resolution attribution). Offline support and mobile distribution remain future work. The mobile branch is a prototype, not a validated release.', 'BodyN')]
story += [PageBreak(), P('2. Technical product demonstration', 'H1N')]
story += [P('<b>Walkthrough sequence.</b> Start at Home, search a keyword, filter by category/destination, open an article and source, change language, submit a report, sign in as staff, edit a draft, record a suitable source review, publish it, then resolve a report with notes. Show rejected publication without a current review and the empty search state. The same API powers web and mobile clients.', 'BodyN')]
story += [P('Core flows and technical logic', 'H2N')]
rows=[[P(x,'HeadCell') for x in ['Flow','Implementation and logic']]]
for a,b in [
('Discovery','URL-backed filters in React call Axios service functions. DRF filters published entries by title, summary, body and reviewed translations; category and commune filters are applied in the API.'),
('Editorial publishing','Staff-only JWT permissions protect create/update/review operations. A suitable review is tied to content_version; substantive edits advance the version, so old approval cannot authorize changed text. Source name is required.'),
('Reports','Anonymous users submit an open report. Staff resolution requires notes; the server records who resolved it and when. Reopening clears active resolution fields.'),
('History','InformationEntry.save() records JSON snapshots of substantive fields and labels, uniquely keyed by entry/version. Admin history views are read-only.'),
('Language and mobile','Reviewed translations are selected when complete; otherwise English fallback is shown. Mobile keeps saved article IDs in AsyncStorage and needs a live API to reopen their content.'),
]: rows.append([P(a,'CellN'),P(b,'CellN')])
story.append(make_table(rows,[36*mm,134*mm]))
story += [P('Technical architecture', 'H2N'),P('React + TypeScript web client and Expo/React Native prototype connect to an Axios/JSON API, then Django REST Framework serializers, views and permission classes, Django ORM, and PostgreSQL. Local backend tests override the database with in-memory SQLite. Frontend pages/components, service modules, typed domain models, backend apps, and persistence models separate presentation, transport, policy, and data concerns.', 'BodyN')]
story += [P('Code quality and problem solving', 'H2N'),P('Encapsulation and separation of concerns appear in model, serializer, view, service, component and page boundaries. Reusable typed UI components reduce duplicated rendering. The custom version-aware publication rule, reviewed-translation fallback/search, and versioned revision snapshots address domain-specific data integrity needs. Django models and React components provide reusable objects; inheritance/polymorphism are used mainly through framework base classes and are not forced into the domain model.', 'BodyN')]
story += [PageBreak(), P('3. Testing and validation evidence', 'H1N')]
story += [P('Approach 1: automated API and workflow tests', 'H2N'),P('<b>Why:</b> publication, access control, search and report transitions affect what users can trust and who can change data. <b>How:</b> Django REST Framework API tests exercise authenticated and anonymous requests; model and Django admin tests check revision snapshots and staff workflows. <b>Recorded results:</b> the submitted `python manage.py test --verbosity=2` run discovered 28 tests, applied all migrations to PostgreSQL test database `test_nuru_db`, reported no system-check issues, and finished with 28 passing tests in 549.276 seconds. Django warned that `backend/staticfiles/` was absent; this did not fail the run. The test database already existed, and the pasted output shows it was recreated after confirmation. <b>Improvements evidenced:</b> the publication validation checks the version that will be saved, preventing edits from reusing an old review; server-owned review/resolution attribution and public draft filtering are also tested.', 'BodyN')]
story += [P('Representative input/response cases', 'H2N')]
rows=[[P(x,'HeadCell') for x in ['Input / condition','Expected system response','Test evidence']]]
for a,b,c in [
('Publish with no suitable current-version review','400 validation error; remains unpublished','PublicationWorkflowTests'),
('Public GET for an unpublished entry','Entry omitted from list; detail returns 404','PublicationWorkflowTests'),
('Search case-insensitively across body or reviewed translation','Matching published entry returned','InformationSearchTests'),
('Resolve report with blank notes','400 validation error; status remains open','ReportResolutionTests'),
('Edit source content after review','Version increments; old review no longer authorizes publish','PublicationWorkflowTests / model history tests'),
]: rows.append([P(a,'CellN'),P(b,'CellN'),P(c,'CellN')])
story.append(make_table(rows,[45*mm,82*mm,43*mm]))
story += [P('Approach 2: visual interface review from captured screens', 'H2N'),P('<b>Why:</b> information access depends on readable screens and clear task steps. <b>How:</b> inspect the committed Home, Explore, detail, report, login, dashboard, and authoring screenshots in docs/screenshots. <b>Observed:</b> captures show the principal public and admin screens and give a baseline for a walkthrough. The walkthrough plan was updated to call out empty results, validation failures, language fallback, and device/browser identification. The captures do not document screen-reader use, measured usability, viewport sizes, or browser versions. This is visual coverage, not proof of compatibility; add a live cross-device walkthrough and record findings before claiming those results.', 'BodyN')]
story += [P('Testing status caveat', 'H2N'),P('The supplied Django run provides PostgreSQL-backed test evidence. It does not provide browser matrix results, mobile emulator/physical-device validation, stress/load results, or measured CPU/memory/FPS. The mobile README says mocked API contract tests pass and TypeScript syntax transpilation succeeds, while full dependency/type checking and live device/backend checks remain incomplete.', 'BodyN')]
story += [PageBreak(),P('4. Performance, compatibility, and submission evidence', 'H1N')]
story += [P('Performance and compatibility', 'H2N'),P('The responsive web layouts use CSS flex/grid and fluid sizing. This is a design implementation detail, not a measured compatibility result. No browser/OS/version matrix or low-end/high-end hardware metrics were found in the repository. No runtime performance numbers are claimed. For the final video, record device/browser/OS versions, viewport, API response conditions, and any observed failures; use the same scenario on at least one phone-class and one higher-capacity device if available.', 'BodyN')]
story += [P('Demonstration capture checklist', 'H2N')]
for line in [
'Show browser and app versions plus the test device/emulator; identify when the backend is local or deployed.',
'Demonstrate public search/filter/article/source/report, then admin review/publish and report resolution.',
'Include invalid inputs (missing review, blank resolution notes, no search match) and the visible response.',
'Show a second language with a reviewed translation and the English fallback when one is unavailable.',
'Capture a mobile browse/search/report flow and state clearly if it was performed on emulator or physical hardware.',
'State that performance metrics were not collected unless you measure and report them during the recording.'
]: story.append(P('• '+line,'BodyN'))
story += [P('Repository evidence and remaining submission steps', 'H2N'),P('Repository: https://github.com/abu00123/Nuru<br/>Walkthrough folder currently listed in README: https://drive.google.com/drive/folders/1zUbNJ20X7dENxw5n-wL5GDB7oSWUOisk?usp=drive_link<br/>Report source evidence: backend/information/tests.py, backend/reports/tests.py, backend/information/models.py, backend/information/views.py, frontend/src/, nuru-mobile/README.md, docs/screenshots/.', 'BodyN')]
story += [P('<b>Submission checks:</b> ensure the Drive folder contains the final accessible video; upload this PDF and replace the README report URL if a hosted link is required; include the video and, if required, a built APK in the Attempt 2 archive. The repository currently contains source code and a mobile prototype; an APK and a packaged walkthrough video were not identified during this review.', 'BodyN')]
story += [Spacer(1,5),P('Evidence basis: code and documentation present in the Nuru repository as of 1 November 2026. Status claims are limited to artifacts visible there; missing runtime evidence is marked as such.', 'SmallN')]

doc=SimpleDocTemplate(str(OUT),pagesize=A4,rightMargin=18*mm,leftMargin=18*mm,topMargin=15*mm,bottomMargin=20*mm,title='Nuru Technical Product Report',author='Nuru project')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
print(OUT.resolve())
