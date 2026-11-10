# VALORA – Healthcare Management & Digital Medical Records Platform

VALORA is an enterprise-grade, modern, responsive healthcare management and digital medical records platform connecting patients, licensed medical practitioners, and hospital administrators.

---

## 1. Technology Stack

- **Frontend & Framework:** Next.js (App Router), React.js
- **Programming Language:** JavaScript JSX (Strictly no TypeScript, no separate backend server, no Python/Flask, no SQL)
- **Styling:** Tailwind CSS with custom healthcare palette and glassmorphism
- **Database:** MongoDB Atlas / Local MongoDB with Mongoose ODM
- **Server Communication:** Next.js Server Actions (`'use server'`)
- **Authentication & Sessions:** Auth.js compatible session management with encrypted JWT cookies and bcryptjs
- **Visual Analytics:** Chart.js & `react-chartjs-2`
- **Medical File Storage:** Cloudinary integration with local fallback vault

---

## 2. Default Seed Credentials

For evaluation and testing, VALORA comes with pre-seeded demo accounts. Click **"Initialize Sample Data"** on the home page or login with:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@valora.health` | `Valora@123` | Institutional governance, doctor verification & platform analytics |
| **Physician (Cardiology)** | `dr.sharma@valora.health` | `Valora@123` | Verified cardiologist with active appointment queue |
| **Physician (Neurology)** | `dr.priya@valora.health` | `Valora@123` | Verified neurologist with consultation notes |
| **Patient** | `patient@valora.health` | `Valora@123` | Pre-configured medical records, vitals, prescriptions & bookings |

---

## 3. Project Structure

```
VALORA/
│
├── public/
│   ├── images/
│   ├── icons/
│   ├── logo/
│   └── uploads/                  # Medical vault document fallbacks
│
├── src/
│   │
│   ├── app/
│   │   ├── layout.js             # Root layout with user session provider & navigation
│   │   ├── page.js               # Landing page with portal cards & quick login
│   │   ├── globals.css           # Tailwind directives & medical design tokens
│   │   │
│   │   ├── login/                # Authentication page with 1-click demo logins
│   │   ├── register/             # Unified Patient and Doctor registration tabs
│   │   │
│   │   ├── patient/
│   │   │   ├── layout.js         # Patient protected layout & navigation sidebar
│   │   │   ├── dashboard/        # Patient overview & quick action modals
│   │   │   ├── profile/          # Health parameters, blood group & allergies
│   │   │   ├── doctors/          # Verified physician search directory
│   │   │   ├── appointments/     # Appointment scheduler & cancellation
│   │   │   ├── medical-records/  # Encrypted vault (X-rays, MRI, CT scans, Lab reports)
│   │   │   ├── prescriptions/    # Active electronic prescriptions & dosages
│   │   │   └── history/          # Longitudinal medical timeline
│   │   │
│   │   ├── doctor/
│   │   │   ├── layout.js         # Physician protected layout & sidebar
│   │   │   ├── dashboard/        # Daily OPD queue, patient metrics & stats
│   │   │   ├── profile/          # Qualifications, clinic address & OPD hours
│   │   │   ├── patients/         # Authorized patient chart reviews
│   │   │   ├── appointments/     # Schedule management & consultation launcher
│   │   │   ├── consultations/    # Clinical observations, vitals & diagnosis
│   │   │   └── prescriptions/    # Multi-drug electronic prescription generator
│   │   │
│   │   └── admin/
│   │       ├── layout.js         # Governance workspace layout & sidebar
│   │       ├── dashboard/        # Platform KPI cards & real-time audit stream
│   │       ├── patients/         # Patient account management & status toggling
│   │       ├── doctors/          # Physician license verification center
│   │       ├── appointments/     # Hospital-wide appointment supervision
│   │       └── analytics/        # Chart.js visualizations
│   │
│   ├── components/
│   │   ├── common/               # Navbar, Sidebar, Footer, NotificationBanner
│   │   ├── patient/              # Specialized patient UI widgets
│   │   ├── doctor/               # Clinical examination tools
│   │   ├── admin/                # Governance controls
│   │   ├── forms/                # Booking, Record Upload, Clinical Notes & Rx modals
│   │   ├── charts/               # Chart.js registration & reusable chart widgets
│   │   └── ui/                   # StatCard, Badge, Modal dialog
│   │
│   ├── actions/                  # Next.js Server Actions
│   │   ├── authActions.js
│   │   ├── patientActions.js
│   │   ├── doctorActions.js
│   │   ├── appointmentActions.js
│   │   ├── medicalRecordActions.js
│   │   ├── prescriptionActions.js
│   │   └── adminActions.js
│   │
│   ├── models/                   # Mongoose Database Collections
│   │   ├── User.js
│   │   ├── Patient.js
│   │   ├── Doctor.js
│   │   ├── Appointment.js
│   │   ├── MedicalRecord.js
│   │   ├── Consultation.js
│   │   ├── Prescription.js
│   │   ├── DoctorPatientAccess.js
│   │   └── AuditLog.js
│   │
│   ├── lib/
│   │   ├── mongodb.js            # Cached connection pool for Server Actions
│   │   ├── auth.js               # JWT session signing & password hashing
│   │   ├── cloudStorage.js       # Cloudinary / encrypted local vault storage
│   │   ├── seed.js               # Auto-seeder for sample healthcare network
│   │   └── validations.js        # Form validation schemas & specialty lists
│   │
│   ├── hooks/
│   ├── context/
│   └── utils/
│
├── .env.local                    # Local environment config
├── .env.example
├── .gitignore
├── package.json
├── next.config.js
└── README.md
```

---

## 4. Key Functional Modules

### A. Patient Module
- **Self-Service Registration & Onboarding:** Collects vital metrics, blood group, allergies, and emergency points of contact.
- **Find Doctors:** Search specialists by clinical domain (Cardiology, Neurology, Orthopedics, Pediatrics, etc.), city, and consult fee.
- **Appointment Scheduling:** Book conflict-free time slots for in-person or teleconsultation visits.
- **Diagnostic Vault:** Upload and review high-resolution X-rays, MRI scans, CT scans, sonographies, and PDF pathology reports.
- **Prescription Center:** Real-time view of active drug orders with frequencies (e.g. `1-0-1`) and dietary instructions.
- **Medical Timeline:** Longitudinal chronological audit trail of consultations, vital checks, and treatments.

### B. Doctor Module
- **OPD Workbench:** Live patient queue with quick action buttons to begin examinations.
- **Clinical Consultations & Vitals:** Log Blood Pressure, Heart Rate, Temperature, SpO2, and Weight alongside clinical observations.
- **Digital Rx Generator:** Prescribe multi-drug schedules with duration, dosage, and diagnostic lab recommendations.
- **Patient Chart Access:** Review permitted patient medical histories and previous hospital records.
- **Availability Management:** Customize consultation hours, operating days, and clinic address.

### C. Admin Governance Module
- **Doctor Verification:** Review medical practitioner license numbers (MCI/NMC) and grant verified status.
- **Account Governance:** Toggle account status (`active` / `suspended`) across patients and doctors.
- **Appointment Oversight:** Platform-wide oversight of bookings, reschedules, and cancellations.
- **Chart.js Analytics Dashboard:**
  - Monthly appointment volumes
  - Patient registration growth curves
  - Appointment status distribution (Doughnut)
  - Doctor specialty distribution (Horizontal bar)
  - Medical vault record categorization (Doughnut)

---

## 5. Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update your `MONGODB_URI` (MongoDB Atlas or local `mongodb://127.0.0.1:27017/valora`).

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Click **"Initialize Sample Data"** on the home page to immediately test all portals using the demo credentials!

