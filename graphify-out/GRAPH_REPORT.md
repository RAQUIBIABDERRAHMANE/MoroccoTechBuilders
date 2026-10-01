# Graph Report - .  (2026-10-01)

## Corpus Check
- 63 files · ~154,299 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 194 nodes · 283 edges · 14 communities (13 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Backend Auth & Event Registration API
- User Login & Pass Modal UI
- Node Dependencies & Build Tooling
- Access Control & QR Scanner Kiosk
- TypeScript Compiler Configuration
- User Session & Profile API
- Landing Page Sections & Program
- Hero, Countdown & Header Navigation
- Attendee Profile & Dynamic QR
- TypeScript Source & Type Definitions
- Calendar Sync & Digital Wallet Passes
- Root Layout & Next.js Conventions
- OFPPT Event Identity & Pedagogical Mission
- Next.js Build Configuration

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `getTursoClient()` - 11 edges
3. `initDb()` - 11 edges
4. `getUserProfileWithEvents()` - 10 edges
5. `getRegistrationByTicketId()` - 10 edges
6. `POST()` - 7 edges
7. `findUserByEmail()` - 7 edges
8. `findUserById()` - 7 edges
9. `getUserRegistrations()` - 7 edges
10. `verifyPassword()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Pass Numérique & QR Code` --references--> `GET()`  [INFERRED]
  README.md → app/api/qr/route.ts
- `n8n Webhook & Email Automation` --references--> `POST()`  [EXTRACTED]
  README.md → app/api/register/route.ts
- `Programme Pédagogique Stagiaires DD` --conceptually_related_to--> `Atelier Présence en Ligne`  [INFERRED]
  Demande d'autorisation - Présentation OFPPT (1).pdf → README.md
- `Demande d'Autorisation Présentation OFPPT` --conceptually_related_to--> `Atelier Présence en Ligne`  [INFERRED]
  Demande d'autorisation - Présentation OFPPT (1).pdf → README.md
- `Scanner d'Accès & Kiosk PIN (/scan)` --references--> `POST()`  [EXTRACTED]
  README.md → app/api/scan/route.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Morocco Tech Builders Event Lifecycle** — readme_presence_en_ligne_event, readme_digital_pass_system, readme_kiosk_scanner, readme_n8n_integration [EXTRACTED 1.00]

## Communities (14 total, 1 thin omitted)

### Community 0 - "Backend Auth & Event Registration API"
Cohesion: 0.22
Nodes (20): POST(), POST(), POST(), hashPassword(), setSessionCookie(), verifyPassword(), getTursoClient(), initDb() (+12 more)

### Community 1 - "User Login & Pass Modal UI"
Cohesion: 0.11
Nodes (6): AppleWalletModalProps, DigitalPassModalProps, PassData, GoogleWalletModalProps, MTBLogoProps, WalletPassButtonsProps

### Community 2 - "Node Dependencies & Build Tooling"
Cohesion: 0.10
Nodes (20): devDependencies, @types/canvas-confetti, @types/jszip, @types/node, @types/react, @types/react-dom, typescript, name (+12 more)

### Community 3 - "Access Control & QR Scanner Kiosk"
Cohesion: 0.10
Nodes (19): ScanPage(), ScanResult, canvas-confetti, html5-qrcode, jszip, @libsql/client, lucide-react, next (+11 more)

### Community 4 - "TypeScript Compiler Configuration"
Cohesion: 0.11
Nodes (19): dom, dom.iterable, esnext, compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules (+11 more)

### Community 5 - "User Session & Profile API"
Cohesion: 0.21
Nodes (12): POST(), GET(), POST(), generateMetadata(), PageProps, PublicProfilePage(), clearSessionCookie(), createSessionToken() (+4 more)

### Community 6 - "Landing Page Sections & Program"
Cohesion: 0.14
Nodes (8): FAQS, OBJECTIVES, Module, MODULES, ProgramAgenda(), SKILLS, STATS, StatsStrip()

### Community 7 - "Hero, Countdown & Header Navigation"
Cohesion: 0.19
Nodes (10): Countdown(), EVENT_DATE, getTimeLeft(), TimeLeft, Hero(), NAV_LINKS, Navbar(), RegistrationForm() (+2 more)

### Community 8 - "Attendee Profile & Dynamic QR"
Cohesion: 0.20
Nodes (8): GET(), EventReg, PRESET_SKILLS, ProfilePage(), UserProfile, qrcode, qrcode, Pass Numérique & QR Code

### Community 9 - "TypeScript Source & Type Definitions"
Cohesion: 0.22
Nodes (8): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 10 - "Calendar Sync & Digital Wallet Passes"
Cohesion: 0.39
Nodes (5): GET(), GET(), GET(), getRegistrationByTicketId(), Google & Apple Wallet Passes

### Community 11 - "Root Layout & Next.js Conventions"
Cohesion: 0.29
Nodes (5): Next.js 15 App Router Breaking Conventions, inter, metadata, viewport, CLAUDE Configuration Reference

### Community 12 - "OFPPT Event Identity & Pedagogical Mission"
Cohesion: 0.40
Nodes (5): Programme Pédagogique Stagiaires DD, Demande d'Autorisation Présentation OFPPT, Morocco Tech Builders, OFPPT Marrakech (Filière Dév Digital), Atelier Présence en Ligne

## Knowledge Gaps
- **76 isolated node(s):** `viewport`, `inter`, `metadata`, `UserProfile`, `EventReg` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Access Control & QR Scanner Kiosk` to `Attendee Profile & Dynamic QR`, `Node Dependencies & Build Tooling`, `Hero, Countdown & Header Navigation`?**
  _High betweenness centrality (0.266) - this node is a cross-community bridge._
- **Why does `jszip` connect `Access Control & QR Scanner Kiosk` to `Calendar Sync & Digital Wallet Passes`?**
  _High betweenness centrality (0.117) - this node is a cross-community bridge._
- **Why does `GET()` connect `Calendar Sync & Digital Wallet Passes` to `Access Control & QR Scanner Kiosk`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **What connects `viewport`, `inter`, `metadata` to the rest of the system?**
  _76 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User Login & Pass Modal UI` be split into smaller, more focused modules?**
  _Cohesion score 0.10952380952380952 - nodes in this community are weakly interconnected._
- **Should `Node Dependencies & Build Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Access Control & QR Scanner Kiosk` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._