# ConformalGuard - Module 4: Calibration & Inference Dashboard

An interactive monitoring and calibration workspace for ConformalGuard, facilitating real-time nonconformity risk score telemetry, empirical coverage evaluation, threshold ($\hat{q}$) tuning, and structured audit traceability.

---

## Key Features

- **Inference Dashboard**: Live streaming table of incoming model queries, non-conformity scores, triage stages (Pass/Flag/Reject), and detailed execution traces.
- **Calibration Dashboard**: Interactive quantile threshold calculation for target empirical coverage ($1 - \alpha$), calibration set file ingestion, histogram analysis, and score distribution breakdown.
- **Drift & Recalibration Tracking**: Automated detection of population drift across calibration batches with instant action triggers.
- **Audit Logging System**: Structured event logging recording actor, action, timestamp, and target resource metadata for compliance and auditability.
- **Quantile Export**: One-click JSON export of computed quantile weights and calibration parameters.

---

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS & Vanilla CSS
- **Visualization**: Recharts
- **Icons**: Lucide React

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
# Navigate to Module 4 directory
cd "MOD 4"

# Install dependencies
npm install
```

### Development Server

Start the local development server with hot module replacement:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### Build & Preview

Compile production-optimized static assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Project Structure

```text
MOD 4/
├── docs/
│   └── api.md               # REST API specification for calibration & inference endpoints
├── src/
│   ├── components/          # Reusable UI widgets & dashboards
│   │   ├── AuditLogModal.tsx
│   │   ├── CalibrationDashboard.tsx
│   │   ├── ExecutionTraceModal.tsx
│   │   ├── Header.tsx
│   │   ├── InferenceDashboard.tsx
│   │   ├── MetricsOverview.tsx
│   │   ├── PipelineStepper.tsx
│   │   ├── RequestHistoryTable.tsx
│   │   └── SelectedRequestInspector.tsx
│   ├── services/            # Telemetry stream simulation & audit logger
│   │   ├── auditLogger.ts
│   │   └── mockData.ts
│   ├── types/               # TypeScript data models & domain interfaces
│   │   └── inference.ts
│   ├── App.tsx              # Root application component with view routing
│   ├── index.css            # Global styles & theme utility variables
│   └── main.tsx             # Application entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## API Specification

Detailed endpoint descriptions, sample request payloads, response schemas, and status codes are available in [`docs/api.md`](docs/api.md).
