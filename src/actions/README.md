# BACKEND TIER (Server Actions & Business Logic Controllers)

This directory contains the backend application logic for the VALORA healthcare platform.

In Next.js App Router, each file in this directory uses the `'use server'` directive, functioning as a high-performance backend controller with built-in CSRF protection and server-side authentication:

- **`authActions.js`**: Login, registration, JWT session issuance, and logout controllers.
- **`doctorActions.js`**: Caseload retrieval, patient medical history inspection, consultation logging, and review response controllers.
- **`patientActions.js`**: Patient medical profile, vitals, upcoming appointments, and prescriptions controllers.
- **`appointmentActions.js`**: Slot booking, status management, and scheduling controllers.
- **`medicalRecordActions.js`**: Encrypted medical document upload and HIPAA audit logging controllers.
- **`prescriptionActions.js`**: Electronic prescription generation and medication dispensing controllers.
- **`adminActions.js`**: Doctor license verification, system analytics, and user moderation controllers.
