# Chapter Three diagrams (Mermaid)

To create each image: copy the code inside one block (without the ``` lines), paste it at https://mermaid.live, then use Actions → PNG (or SVG) to download. Insert into Word with the figure caption below it.

## Figure 3.2: Content review and publication workflow

```mermaid
flowchart TD
    A([Administrator drafts entry<br/>with source details]) --> B[Save entry<br/>version N]
    B --> C{Source review<br/>for version N}
    C -- Revision required --> D[Edit entry] --> E[Version increases to N+1] --> C
    C -- Suitable --> F{Publish?}
    F -- Yes --> G[(Published:<br/>visible to public)]
    G --> H{Trigger}
    H -- Substantive edit --> E
    H -- User report --> I[Investigate report]
    I -- Correction needed --> D
    I -- No change needed --> J[Resolve report<br/>with notes]
    H -- Source outdated --> K[Unpublish or<br/>mark outdated] --> D
```

## Figure 3.3: System architecture

```mermaid
flowchart LR
    U([Information user]) --> W
    U --> M
    AD([Administrator]) --> W
    subgraph Presentation tier
        W[React + TypeScript<br/>web app<br/><i>Vercel</i>]
        M[Expo / React Native<br/>mobile prototype]
    end
    subgraph Application tier
        API[Django REST Framework API<br/>validation · permissions · publication rules<br/><i>Render</i>]
    end
    subgraph Data tier
        DB[(PostgreSQL<br/><i>Render</i>)]
    end
    W -- HTTPS / JSON --> API
    M -- HTTPS / JSON --> API
    API -- read / write --> DB
    EXT[/External publications/] -. consulted manually .-> AD
```

## Figure 3.4: Use case diagram

```mermaid
flowchart LR
    IU([Information user])
    AD([Administrator])
    subgraph Nuru
        direction TB
        U1((Browse by category))
        U2((Search and filter<br/>by destination))
        U3((Read entry, source<br/>and dates))
        U4((Follow step guide))
        U5((Save entry))
        U6((Change language))
        U7((Report a problem))
        A1((Sign in))
        A2((Manage entries, categories<br/>and destinations))
        A3((Record source review))
        A4((Publish or unpublish))
        A5((View revision history))
        A6((Resolve reports))
    end
    IU --- U1 & U2 & U3 & U4 & U5 & U6 & U7
    AD --- A1 & A2 & A3 & A4 & A5 & A6
```

## Figure 3.5: Entity–relationship diagram

```mermaid
erDiagram
    CATEGORY ||--o{ INFORMATION_ENTRY : groups
    DESTINATION ||--o{ INFORMATION_ENTRY : "applies to"
    INFORMATION_ENTRY ||--o{ SOURCE_REVIEW : "reviewed in"
    INFORMATION_ENTRY ||--o{ ENTRY_REVISION : "versioned as"
    INFORMATION_ENTRY ||--o{ REPORT : "reported in"
    USER ||--o{ SOURCE_REVIEW : records
    USER ||--o{ REPORT : resolves

    CATEGORY {
        int id PK
        string name
    }
    DESTINATION {
        int id PK
        string country
        string province
        string commune
    }
    INFORMATION_ENTRY {
        int id PK
        int category_id FK
        int destination_id FK
        string title
        text summary
        text content
        string source_name
        string source_url
        date source_publication_date
        json translations
        json guide
        json guide_translations
        string verification_status
        bool is_published
        int content_version
        datetime created_at
        datetime updated_at
    }
    SOURCE_REVIEW {
        int id PK
        int entry_id FK
        int entry_version
        int reviewed_by FK
        datetime reviewed_at
        string outcome
        text notes
    }
    ENTRY_REVISION {
        int id PK
        int entry_id FK
        int version
        json snapshot
        datetime captured_at
    }
    REPORT {
        int id PK
        int information_entry_id FK
        string reason
        text comment
        string status
        text resolution_notes
        int resolved_by FK
        datetime resolved_at
        datetime created_at
    }
    USER {
        int id PK
        string username
        string password_hash
        bool is_staff
    }
```

## Figure 3.6: Publication sequence diagram

```mermaid
sequenceDiagram
    actor A as Administrator
    participant D as Admin dashboard (React)
    participant API as Django REST API
    participant DB as PostgreSQL
    A->>D: Tick "Published" and save entry
    D->>API: PUT /api/information/{id}/ (entry with is_published: true) + JWT
    API->>API: Check token belongs to staff user
    API->>DB: Load entry and current content_version
    API->>DB: Find review for this version with outcome "suitable"
    alt Source name present and suitable review found
        API->>DB: Save is_published = true
        API-->>D: 200 OK (updated entry)
        D-->>A: Entry shown as published
    else Missing source or review
        API-->>D: 400 Bad Request (error message)
        D-->>A: Explain what is required before publishing
    end
```
