# SOLVET System V1 - Stack Architecture

```mermaid
graph TB
    subgraph "COMPONENT 1: Asset Creation"
        A[Blender 4.5+]
        B[SOLVET Asset Management Add-on<br/>Internal Export Tool]
        A -->|Artist creates asset| B
        B -->|Exports| C[.blend file]
        B -->|Generates| D[.json metadata]
        B -->|Creates| E[.png thumbnails]
    end

    subgraph "COMPONENT 2: GitHub Repository Database"
        F[no3d-tools-library repo<br/>GitHub]
        C --> F
        D --> F
        E --> F
        G[JSON Schema Validation<br/>Python scripts]
        F --> G
    end

    subgraph "COMPONENT 3: Management Dashboard"
        H[Electron Desktop App]
        I[Express Server :3000<br/>Node.js]
        J[Product Dashboard UI<br/>HTML/JS]
        H --> I
        I --> J
        J -->|Edit products| I
    end

    subgraph "COMPONENT 4: E-Commerce Platform"
        K[Polar.sh]
        L[Product Management]
        M[Payment Processing]
        N[File Hosting<br/>.blend downloads]
        K --> L
        K --> M
        K --> N
    end

    subgraph "COMPONENT 5: Website"
        O[no3d-tools-website<br/>Vercel]
        P[index.html<br/>Static HTML5]
        Q[script.js<br/>Vanilla JS]
        R[styles.css<br/>Minimal Design]
        S[polar-products.js<br/>Price ID Mappings]
        O --> P
        P --> Q
        P --> R
        Q --> S
    end

    subgraph "COMPONENT 6: Automation"
        T[GitHub Actions]
        U[Content Sync Workflow]
        V[Price Update Workflow]
        W[Validation Workflow]
        T --> U
        T --> V
        T --> W
    end

    %% Main Data Flow
    F -->|GitHub API| O
    F -->|Read products| I
    I -->|Sync to| K
    I -->|Push changes| F
    I -->|Regenerate| S
    K -->|Price IDs| S
    O -->|Fetch prices| K
    F -->|Trigger| T
    T -->|Deploy| O
    T -->|Sync products| K

    %% Customer Flow
    X[Customer]
    X -->|Visit| O
    O -->|Browse products| X
    X -->|Click Download| Y[Polar Checkout SDK]
    Y -->|Open modal| K
    K -->|Process payment| Z[Customer Account]
    Z -->|Receive link| N

    %% Styling
    classDef blender fill:#EA7600,stroke:#333,stroke-width:2px,color:#fff
    classDef github fill:#333,stroke:#666,stroke-width:2px,color:#fff
    classDef dashboard fill:#2E86AB,stroke:#333,stroke-width:2px,color:#fff
    classDef polar fill:#8B5CF6,stroke:#333,stroke-width:2px,color:#fff
    classDef website fill:#F0FF00,stroke:#333,stroke-width:2px,color:#000
    classDef automation fill:#059669,stroke:#333,stroke-width:2px,color:#fff
    classDef customer fill:#DC2626,stroke:#333,stroke-width:2px,color:#fff

    class A,B,C,D,E blender
    class F,G github
    class H,I,J dashboard
    class K,L,M,N polar
    class O,P,Q,R,S website
    class T,U,V,W automation
    class X,Y,Z customer
```

## Technology Stack Summary:

**Frontend:**
- HTML5 + Vanilla JavaScript
- CSS Grid (minimal black/white + #f0ff00 accent)
- Three.js (3D preview)
- @polar-sh/checkout SDK

**Backend:**
- Node.js v20+
- Express.js
- Electron (dashboard)

**E-Commerce:**
- Polar.sh (@polar-sh/sdk v0.40.3)
- Embedded checkout modal

**Data Storage:**
- GitHub (repository as database)
- JSON metadata files
- Dropbox sync

**Automation:**
- GitHub Actions (CI/CD)
- Python validation scripts
- Node.js sync scripts

**Deployment:**
- Vercel (website hosting)
- GitHub Pages (potential)

## Component Descriptions:

### Component 1: Asset Creation (Orange)
SOLVET Asset Management Add-on (internal use, part of SOLVET workflow) that exports assets with metadata, thumbnails, and .blend files to the repository.

### Component 2: GitHub Repository Database (Dark Gray)
Central source of truth for all product data, using Git for version control and validation.

### Component 3: Management Dashboard (Blue)
Electron desktop app for editing products, syncing prices, and managing the catalog.

### Component 4: E-Commerce Platform (Purple)
Polar.sh handles payments, file hosting, and customer accounts.

### Component 5: Website (Yellow)
Static website deployed on Vercel that displays products and handles checkout.

### Component 6: Automation (Green)
GitHub Actions workflows that sync data between all components automatically.

### Customer Flow (Red)
Shows the customer journey from browsing to purchase to download.
