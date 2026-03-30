# Mesa de Ayuda de Mantenimiento – Zamorano University

## Power Platform Help Desk Solution (Code Apps)

---

### Overview

A comprehensive Help Desk system built on **Microsoft Power Platform** for managing maintenance requests at Zamorano University. The three front-end applications are implemented as **Power Apps Code Apps** — TypeScript / React 19 single-page applications that run inside Power Apps and interact with Dataverse through auto-generated typed services.

The system follows ITIL best practices and is designed to scale across multiple departments (Maintenance, IT, Transport, Security, etc.).

---

### Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Data Layer** | Dataverse | 13 custom tables (`cr_` prefix) with relationships, business rules, security roles |
| **Requester App** | Code App – TypeScript / React 19 / Vite 6 | Mobile-first ticket creation, tracking, and satisfaction surveys |
| **Technician App** | Code App – TypeScript / React 19 / Vite 6 | Work-order management, time logging, material requests |
| **Supervisor App** | Code App – TypeScript / React 19 / Vite 6 | Desktop sidebar layout: operations dashboard, queue, approvals, analytics, config |
| **Automation** | Power Automate | 7 cloud flows for auto-assignment, SLA monitoring, approvals, escalation, reports |
| **Analytics** | Power BI Embedded | 3 dashboards: Operations, SLA Performance, Cost Analysis |

**Key SDK / tooling:**

- `@microsoft/power-apps` ^1.0.4 — Code Apps runtime (context, navigation, services)
- `pac code init` / `pac code add-data-source` / `pac code push` — PAC CLI for scaffolding, data-source binding, and deployment
- React Router DOM 7 — client-side routing inside each app
- Vite 6 — build tooling

---

### Project Structure

```
COAPHelpsDesk/
├── README.md
│
├── shared/                          # Shared across all 3 apps
│   └── types/
│       ├── entities.ts              # TS interfaces, enums, lookups for all 13 tables
│       └── index.ts                 # Barrel export
│
├── dataverse/
│   ├── tables/                      # 13 YAML schema definitions
│   │   ├── department.yaml
│   │   ├── location.yaml
│   │   ├── category.yaml
│   │   ├── subcategory.yaml
│   │   ├── ticket.yaml
│   │   ├── work-order.yaml
│   │   ├── sla-policy.yaml
│   │   ├── sla-instance.yaml
│   │   ├── material-request.yaml
│   │   ├── time-log.yaml
│   │   ├── asset.yaml
│   │   ├── knowledge-article.yaml
│   │   └── survey-response.yaml
│   ├── business-rules/
│   │   └── ticket-rules.yaml        # 8 business rules
│   └── security-roles/
│       └── roles.yaml                # 4 security roles with CRUD matrices
│
├── apps/
│   ├── requester-app/                # Code App – Requester (mobile-first)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx               # 5 routes: /, /create, /tickets, /tickets/:id, /survey/:id
│   │       ├── theme.ts              # Zamorano brand tokens (#00643E)
│   │       ├── assets/styles/global.css
│   │       ├── hooks/useAppContext.tsx
│   │       ├── components/           # Header, BottomNav, StatusBadge, PriorityBadge,
│   │       │                         # TicketCard, StarRating, LoadingSpinner
│   │       └── pages/                # HomeScreen, CreateTicketScreen, TicketDetailScreen,
│   │                                 # MyTicketsScreen, SurveyScreen
│   │
│   ├── technician-app/               # Code App – Technician (mobile-first)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx               # 6 routes: /, /tickets/:id, work-order, time-log, materials, close
│   │       └── pages/                # DashboardScreen, TicketDetailScreen, WorkOrderScreen,
│   │                                 # TimeLogScreen, MaterialRequestScreen, CloseTicketScreen
│   │
│   └── supervisor-app/               # Code App – Supervisor (desktop sidebar)
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx               # Sidebar layout + 6 routes
│           └── pages/                # OperationsDashboard, QueueManagement, TicketDetailScreen,
│                                     # ApprovalCenter, AnalyticsScreen, ConfigurationScreen
│
├── flows/                            # Power Automate flow definitions (YAML)
│   ├── 01-auto-assignment.yaml       # Auto-assign technician on ticket creation
│   ├── 02-sla-timer-monitor.yaml     # Scheduled SLA breach detection (every 15 min)
│   ├── 03-material-approval.yaml     # Material approval workflow (auto < L 500)
│   ├── 04-ticket-closure-survey.yaml # Trigger survey on ticket closure
│   ├── 05-emergency-cascade-escalation.yaml  # 3-level escalation for critical tickets
│   ├── 06-weekly-summary-report.yaml # Weekly KPI email to supervisors
│   └── 07-on-hold-monitor.yaml       # Detect stuck on-hold tickets (48h/72h)
│
└── analytics/                        # Dashboard configurations (YAML)
    ├── operations-dashboard.yaml     # KPIs, status/priority charts, workload table
    ├── sla-performance.yaml          # SLA compliance trend, heatmap, technician table
    └── cost-analysis.yaml            # Cost trend, category breakdown, variance analysis
```

---

### How Code Apps Work

Power Apps Code Apps are **TypeScript / React SPAs** that run inside the Power Apps player. They use the `@microsoft/power-apps` SDK to access user context and Dataverse data through auto-generated typed services.

**Key concepts:**

1. **Initialize** — `pac code init` creates the Vite + React scaffold.
2. **Add data sources** — `pac code add-data-source -a dataverse -t <table>` generates:
   - `generated/models/<Table>Model.ts` — TypeScript interface matching table schema
   - `generated/services/<Table>Service.ts` — CRUD service (`create`, `get`, `getAll`, `update`, `delete`)
3. **Context** — `import { getContext } from '@microsoft/power-apps/app'` returns `{ app, user, host }`.
4. **Build & deploy** — `npm run build && pac code push` publishes to the Power Apps environment.

```typescript
// Example: fetch all tickets assigned to the current user
import { getContext } from '@microsoft/power-apps/app';
import { TicketService } from '../generated/services/TicketService';

const ctx = getContext();
const tickets = await TicketService.getAll({
  filter: `cr_assigned_to eq '${ctx.user.objectId}'`,
  orderBy: 'cr_created_on desc',
});
```

> **Note:** All service imports in the current source code are marked with `// TODO: replace with generated service` comments. After running `pac code add-data-source` for each table, replace the stub data / placeholder calls with the generated services.

---

### Security Roles

| Role | Access Level |
|------|-------------|
| **Requester** | Create tickets, view own tickets, submit surveys |
| **Technician** | View assigned tickets, update work orders, log time, request materials |
| **Supervisor** | View all tickets, reassign, approve materials / cost overruns, access analytics |
| **Administrator** | Full CRUD on all tables, configure catalogs and SLA policies |

---

### SLA Matrix (Default)

| Priority | First Response | Diagnosis | Resolution |
|----------|---------------|-----------|------------|
| Critical | 1 h | 4 h | 8 h |
| High | 2 h | 8 h | 24 h |
| Medium | 4 h | 24 h | 72 h |
| Low | 8 h | 48 h | 120 h |

---

### Power Automate Flows

| # | Flow | Trigger | Description |
|---|------|---------|-------------|
| 1 | Auto-Assignment | Ticket created | Category → department → workload-balanced technician + SLA instance |
| 2 | SLA Timer Monitor | Every 15 min | Detects approaching and breached deadlines, sends escalations |
| 3 | Material Approval | Material status → Requested | Auto-approve < L 500, supervisor approval ≥ L 500 |
| 4 | Closure & Survey | Ticket → Closed | Finalizes SLA instance, emails survey link to requester |
| 5 | Emergency Escalation | Critical ticket created | 3-level cascade: 15 min → technician, 30 min → supervisor, 60 min → director |
| 6 | Weekly Summary | Monday 07:00 | Compiles KPIs (created, closed, SLA %, costs, satisfaction) into HTML email |
| 7 | On Hold Monitor | Every 6 hours | Warns at 48 h, auto-reopens + escalates at 72 h |

---

### Deployment Guide

#### Prerequisites

- **Node.js** ≥ 18
- **PAC CLI** — `npm install -g @microsoft/pac-cli` or via Power Platform Tools VS Code extension
- **Power Platform environment** with Dataverse enabled
- **System Administrator** or **System Customizer** role in the target environment

#### Step 1 — Dataverse Setup

```bash
# Import table schemas into your environment via the Maker Portal
# or use Dataverse solution import. The YAML files in dataverse/tables/
# document each table's columns, relationships, views, and sample data.
```

1. Create tables from `dataverse/tables/*.yaml` in Power Apps Maker Portal
2. Apply business rules from `dataverse/business-rules/ticket-rules.yaml`
3. Create security roles from `dataverse/security-roles/roles.yaml`

#### Step 2 — Code Apps Deployment

```bash
# For each app (requester-app, technician-app, supervisor-app):

cd apps/requester-app

# Install dependencies
npm install

# Add Dataverse tables as data sources (generates typed services)
pac code add-data-source -a dataverse -t cr_ticket
pac code add-data-source -a dataverse -t cr_category
pac code add-data-source -a dataverse -t cr_subcategory
pac code add-data-source -a dataverse -t cr_location
pac code add-data-source -a dataverse -t cr_surveyresponse
# ... add all tables referenced by the app

# Build and deploy
npm run build
pac code push
```

Repeat for `technician-app` and `supervisor-app`.

#### Step 3 — Power Automate Flows

Create the 7 flows in Power Automate using the YAML definitions in `flows/` as implementation blueprints. Each file documents triggers, steps, conditions, and email templates.

#### Step 4 — Analytics

Configure Power BI reports using the dashboard definitions in `analytics/`. Each YAML file specifies KPI cards, chart types, data sources, and color schemes.

---

### Environment Variables / Configuration

| Variable | Description |
|----------|-------------|
| `OrgUrl` | Dataverse organization URL (e.g., `https://org.crm.dynamics.com`) |
| `EmergencyChannelId` | Teams channel ID for emergency escalation notifications |
| `SupervisorGroupEmail` | Distribution list email for supervisor alerts |
| `MonthlyBudget` | Monthly maintenance budget in Lempiras (default: L 50,000) |
| `AutoApprovalThreshold` | Material auto-approval limit (default: L 500) |

---

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Power Apps Code Apps | GA |
| Framework | React | 19 |
| Language | TypeScript | 5.x |
| Build | Vite | 6 |
| SDK | `@microsoft/power-apps` | ^1.0.4 |
| Routing | React Router DOM | ^7 |
| Backend | Dataverse | Latest |
| Automation | Power Automate | Cloud flows |
| Analytics | Power BI | Embedded |
| CLI | PAC CLI | Latest |

---

### Version

- **Version:** 1.0.0
- **Platform:** Power Platform (Dataverse, Code Apps, Power Automate, Power BI)
- **Target:** Zamorano University – Maintenance Department
- **Language:** Spanish (UI), English (code comments)
