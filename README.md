# Tanishk Singhal — Engineering Portfolio

Engineering portfolio, research archive, and content management platform of Tanishk Singhal. This repository houses project case studies, academic publications, patent filings, research programs, and technical documentation across robotics manipulation, autonomous navigation, embedded hardware, and aerospace systems.

**Production Website**: [https://tanishksinghal.in/](https://tanishksinghal.in/)

---

## Focus Areas

- **Robotics & Manipulation**: Closed-loop inverse kinematics, serial manipulator trajectory generation, multi-axis joint control, and real-time actuator telemetry.
- **Autonomous Systems**: ROS 2 / Nav2 navigation, LiDAR SLAM, costmap layer fusion, dynamic obstacle avoidance, and global path planning.
- **AI & Perception**: Real-time computer vision, target pursuit kinematics, sensor fusion, and edge inference.
- **Embedded Systems & Firmware**: Microcontroller firmware (STM32, ESP32), RTOS task scheduling, motor drive hardware, and communication bus protocols (CAN, UART, I2C, SPI).
- **Aerospace & UAV Avionics**: Autonomous quadrotor flight control, state estimation, target tracking, and power architecture.
- **Space Systems**: Modular 3U CubeSat satellite power subsystems, telemetry architecture, and thermal modeling.
- **Research & Intellectual Property**: Peer-reviewed conference papers, technical preprints, and patent filings.

---

## Technology Stack

### Frontend & Client
- **Core**: React 18, TypeScript, Vite
- **Routing**: React Router v7
- **3D Graphics & Spatial Canvas**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Animation & UI**: Framer Motion, Tailwind CSS, Lucide React
- **Content & Markdown**: `react-markdown`, `remark-gfm`
- **Validation**: Zod

### Backend & Database
- **Database & Storage**: Supabase PostgreSQL with Row-Level Security (RLS)
- **API Runtime**: Supabase Edge Functions (Deno TypeScript)
- **Authentication**: Supabase Auth (Admin CMS access control)
- **Inquiry Handling**: Structured contact dispatch with anti-spam honeypot and rate limiting
- **Direct Scheduling**: Google Calendar appointment integration

### CI/CD & Infrastructure
- **Hosting**: GitHub Pages (Custom domain: `tanishksinghal.in`)
- **Automation**: GitHub Actions (`.github/workflows/deploy.yml`)
- **Testing**: Playwright Core, `tsx` security and integration test suite

---

## Application Architecture

```
[ Visitor / Browser ]
        │
        ▼
[ React 18 / Vite Single-Page Application ]
        │
        ├─── [ 3D Spatial Presentation Layer (Three.js / R3F) ]  ─── Scroll Choreography & Visual Archetypes
        │
        ├─── [ Public Content Client / Cache ]
        │             │
        │             ▼
        └─── [ Supabase Edge Functions & PostgreSQL ]  ─── RLS Enforced, 5-State Publication Lifecycle
```

```
[ Git Push to main ]
        │
        ▼
[ GitHub Actions Workflow (.github/workflows/deploy.yml) ]
        │
        ▼
[ Vite Production Build (TypeScript Compilation + Code Splitting) ]
        │
        ▼
[ GitHub Pages Deployment (tanishksinghal.in) ]
```

---

## Public & Administrative Routes

### Public Routes
| Route | Description |
|:---|:---|
| `/` | Homepage featuring the interactive 3D engineering presentation layer and accessible semantic summary |
| `/about` | Biography, engineering background, and academic trajectory |
| `/projects` | Engineering project archive with domain categorization |
| `/projects/:slug` | In-depth engineering case study monograph |
| `/experience` | Chronological engineering roles and technical milestones |
| `/research` | Research programs and problem formulations |
| `/publications` | Peer-reviewed papers, preprints, and technical reports |
| `/publications/:slug` | Publication monograph and citation details |
| `/patents` | Intellectual property and patent filings |
| `/patents/:slug` | Patent documentation and claims overview |
| `/achievements` | Honors, awards, hackathons, and fellowships |
| `/certifications` | Verified technical and academic certifications |
| `/skills` | Technical skills matrix across robotics disciplines, tools, and languages |
| `/blog` | Technical engineering notebook and articles |
| `/blog/:slug` | Markdown-rendered technical article view |
| `/resume` | Printable and interactive curriculum vitae |
| `/contact` | Direct communication dispatch and Google Calendar appointment booking |

### Administrative CMS Routes (`/admin/*`)
- `/admin` — Central CMS dashboard and publication overview
- `/admin/projects`, `/admin/projects/new`, `/admin/projects/:id/edit` — Case study management
- `/admin/research`, `/admin/publications`, `/admin/patents` — Academic and IP management
- `/admin/experience`, `/admin/skills`, `/admin/achievements`, `/admin/certifications` — Profile data editors
- `/admin/blog`, `/admin/blog/new`, `/admin/blog/:id/edit` — Technical article authoring
- `/admin/contact` — Inbound communication records
- `/admin/media`, `/admin/history`, `/admin/profile`, `/admin/organizations` — Asset and metadata configuration

---

## Content Management & CMS Architecture

The repository incorporates a data management layer backed by Supabase PostgreSQL:

1. **Single Source of Truth**: All dynamic portfolio records (projects, research programs, publications, patents, blog posts) are stored in structured PostgreSQL tables protected by Row-Level Security.
2. **5-State Content Lifecycle**: Content progresses through strict states (`draft` → `review` → `approved` → `published` / `archived`).
3. **Provenance Verification**: Records enforce provenance tags (`USER_PROVIDED`, `GITHUB_VERIFIED`, `PUBLIC_WEB_VERIFIED`). Unverified or probable items are quarantined from public endpoints.
4. **Isolated Administration**: Admin tools (`/admin/*`) are gated behind Supabase authentication and server-side Edge Function authorization, with separate bundle chunks that are excluded from public payload paths.
5. **Client-Side Fallback Cache**: The public content client gracefully falls back to structured static data if network or database connectivity is disrupted.

---

## 3D Interactive Environment

The homepage features a Three.js and React Three Fiber spatial canvas serving as an interactive discovery layer:

- **Spatial Zones**: Continuous camera flight corresponding to robotics manipulation, autonomous ground vehicles, aerospace systems, research domains, and project installations.
- **Data Connection**: Project pedestals link dynamically to authentic Supabase project records, opening `/projects/:slug` monographs upon selection.
- **Performance & Polish**: Linear studio fog, subdued architectural datum geometry, and studio lighting without high-cost visual artifacts.
- **Accessibility**: Native `prefers-reduced-motion` compliance, global keyboard zone jumps (`0`–`6`), and a complete semantic HTML summary for search engines and assistive screen readers.
- **Graceful WebGL Fallback**: If WebGL context creation fails on a client device, the homepage automatically renders an editorial typography layout with complete navigation and project links.

---

## Security

- **Zero-Secret Client Model**: Only public variables with the `VITE_` prefix are compiled into the client bundle.
- **Row-Level Security (RLS)**: Public client access is strictly limited to SELECT on published content (`publication_status = 'published'`) and INSERT on contact submissions. Admin tables and audit logs are fully restricted.
- **Serverless Edge Function Authorization**: Administrative endpoints verify incoming JWTs and enforce email whitelist checks server-side.
- **Input Sanitization & Rate Limiting**: Inbound messages on `/contact` are validated via Zod schemas, checked against honeypot fields, and rate-limited.
- **Private Secrets**: Service-role keys, email delivery tokens, and database credentials exist solely within the Supabase vault environment.

---

## Environment Variables

### Public Client Variables (`.env` / GitHub Actions)
Configured for client-side Vite builds:

| Variable | Description |
|:---|:---|
| `VITE_PUBLIC_SITE_URL` | Canonical site origin (`https://tanishksinghal.in`) |
| `VITE_SUPABASE_URL` | Supabase project API gateway |
| `VITE_SUPABASE_ANON_KEY` | Browser-safe public anon key |
| `VITE_CMS_BACKEND` | Backend selector (`supabase` or `local`) |
| `VITE_CMS_API_URL` | Supabase Edge Functions base endpoint |
| `VITE_GOOGLE_BOOKING_URL` | Public Google Calendar appointment schedule URL |

### Server-Only Secrets (Supabase Edge Runtime)
Configured exclusively within the Supabase dashboard (never committed to git):
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

---

## Local Development

```bash
# 1. Install dependencies
npm ci

# 2. Run test suite
npm test

# 3. Start local development server
npm run dev

# 4. Compile and verify production build
npm run build
```

---

## Deployment

Production deployment is fully automated via GitHub Actions:
- **Workflow**: `.github/workflows/deploy.yml` triggers on push to the `main` branch.
- **Build Pipeline**: Node.js 20 environment executes `npm ci` and `npm run build` with production environment flags.
- **Artifact Publishing**: The compiled `dist/` directory is deployed directly to GitHub Pages.
- **Canonical Domain**: Configured via `CNAME` pointing to `https://tanishksinghal.in/`.

---

## Repository Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions CI/CD deployment workflow
├── public/                         # Static assets and favicons
├── src/
│   ├── cms/                        # Supabase API clients, auth context, and Zod schemas
│   ├── components/
│   │   ├── 3d/                     # Three.js / R3F components, camera timeline, and spatial zones
│   │   ├── admin/                  # Admin CMS form controls and layout guards
│   │   ├── blog/                   # Markdown rendering components
│   │   ├── layout/                 # Navbar, footer, and navigation helpers
│   │   └── ui/                     # UI components, error boundaries, and buttons
│   ├── constants/                  # Domain taxonomies and skill classifications
│   ├── content/                    # Local fallback datasets
│   ├── context/                    # PublicContentContext provider and hooks
│   ├── pages/                      # Public page views and /admin management interfaces
│   ├── styles/                     # Typography tokens and CSS stylesheets
│   ├── types/                      # TypeScript domain models and content interfaces
│   ├── utils/                      # Helper utilities and date formatters
│   ├── App.tsx                     # Route definitions and application layout
│   └── main.tsx                    # Application entry point
├── supabase/
│   ├── functions/                  # Deno Edge Functions (admin-content, contact-submit, etc.)
│   ├── migrations/                 # PostgreSQL schema migrations and RLS policies
│   └── tests/                      # Automated test suite and live verification scripts
├── index.html                      # HTML entry with Open Graph & JSON-LD metadata
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind styling configuration
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build and manual chunking configuration
```

---

## Engineering Scope

- Autonomous Mobile Robots (AMR) & Differential Drive Kinematics
- Serial Manipulators & Inverse Kinematics Solvers
- ROS 2 (Humble / Iron) Node Architecture & Custom Message Interfaces
- 2D/3D LiDAR SLAM & Real-Time Costmap Navigation
- Microcontroller Firmware & Hardware-in-the-Loop Validation
- Autonomous UAV Flight Control & Avionics Architecture
- CubeSat Nanosatellite Subsystems & Telemetry Systems
