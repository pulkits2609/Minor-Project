# Coal Mine Safety & Productivity Management System

An app and web-based software backend for the Productivity and Safety management of coal mines.

## Overview

Despite the thrust on energy transitions, coal remains pivotal to the energy security of India (targeting 1.5 Bt coal production by 2030). To achieve the target, improved productivity and safety in coal mining is strictly required.

This API serves as the backend infrastructure for digitizing two major operational roadblocks:

1. **Digital Shift Handover Logs:** Replaces manual paper logs to streamline the transition of responsibilities. Generates Statutory PDF Reports automatically containing production updates, equipment tracking, and safety red flags.
2. **DGMS Safety Management Plan (SMP):** Digitalizes hazard identification and automatically calculates mathematical risk scores (Probability x Consequence) to ensure that the shift-in-charges are proactively tracking control mechanisms.

## Tech Stack

- **Framework:** Python, Flask (Blueprints for scalability)
- **Database:** Supabase (PostgreSQL), utilizing `Flask-SQLAlchemy` ORM.
- **Authentication:** JWT (JSON Web Tokens)
- **Document Generation:** `ReportLab` (For generating Statutory PDF handovers)

## Features & Endpoints

### 1. Digital Shift Handover

Automates the conversion of shift logs into structured, shareable PDF formats.

- `POST /shifts/` - Start a digital log (Shift tracking).
- `POST /shifts/handover` - Logs the equipment status, flags, and creates the PDF statutory report.

### 2. DGMS SMP Adherence

Identifies hazards, assigns a Risk Score, and issues actions/alerts based on Directorate General of Mines Safety guidelines.

- `POST /incidents/smp/hazard` - Mathematically scores hazards.
- `GET /incidents/smp/dashboard` - Fetches active hazards for Safety Officers.

### 3. Core Role-Based Administration

Supports multiple user subtypes inheriting from a base user profile.

- **Subtypes:** Mine Admin, Safety Officer, Supervisor, Worker.

### 4. Worker Logistics & Audit Notifications

Tracks job assignments and maintains the emergency alert audit trail.

- `GET /shifts/worker/<id>` - Retrieve a specific worker's upcoming shift schedule roster.
- `GET /incidents/alerts` - Query an immutable audit log of broadcasted emergency notifications.
- `POST /tasks/` - Assign targeted maintenance/prep jobs to specific workers.

## Setup & Installation

**1. Clone the Repository:**

```bash
git clone https://github.com/pulkits2609/Minor-Project.git
cd Minor-Project
```

**2. Setup Virtual Environment:**

```bash
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

**3. Install Dependencies:**

```bash
pip install -r requirements.txt
```

**4. Environment Setup:**
For local SQLite development, the checked-in `.env.local` fallback is enough. To use Supabase, create a `.env` file in the `backend` directory or set these environment variables on the server:

```env
# Supabase PostgreSQL Database URI
DATABASE_URL=postgresql://[user]:[password]@db.[project_ref].supabase.co:5432/postgres

SECRET_KEY=your_secret_key
JWT_SECRET_KEY=your_jwt_secret_key
AUTO_CREATE_TABLES=true
```

Runtime environment variables override both `.env` and `.env.local`. The `.env` file overrides `.env.local`, so the tracked SQLite fallback will not mask your Supabase connection. Supabase connections automatically use `sslmode=require` unless the URL already includes an `sslmode` query parameter.

If you use a Supabase pooler URL such as `*.pooler.supabase.com`, copy the full connection string from the Supabase dashboard's Connect panel. Pooler usernames are not always just `postgres`; they commonly include the project reference, such as `postgres.[project_ref]`.

For SQLAlchemy with Supabase transaction pooler URLs on port `6543`, the backend uses `NullPool` so SQLAlchemy does not create a second application-side pool on top of Supavisor.

**5. Run the Server:**

```bash
python run.py
```

*The app will be active at `http://127.0.0.1:5000`.*
