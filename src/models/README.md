# DATABASE TIER (Mongoose Models & Data Layer)

This directory defines the 10 data models and Mongoose ODM schemas stored in the MongoDB database for VALORA.

- **`User.js`**: Core account identity (Patients, Doctors, Administrators).
- **`Patient.js`**: Medical health profile (Blood group, allergies, chronic conditions, emergency contact).
- **`Doctor.js`**: Medical credentials (License ID, specialty, OPD fee, consultation hours, rating).
- **`Appointment.js`**: Clinical appointments and scheduling records.
- **`MedicalRecord.js`**: Encrypted medical vault records (X-rays, MRI scans, CT scans, blood lab panels).
- **`Consultation.js`**: Recorded clinical consultations (Diagnosis, symptoms, vitals, physician assessment notes).
- **`Prescription.js`**: Electronic prescriptions with medication schedules, dosages, and instructions.
- **`Review.js`**: Verified patient feedback and official doctor replies.
- **`DoctorPatientAccess.js`**: Secure medical record sharing and access permissions.
- **`AuditLog.js`**: Immutable audit trails for medical compliance and data security.
