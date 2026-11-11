'use client';

import PatientMedicalProfileModal from '@/components/doctor/PatientMedicalProfileModal';
import ConsultationNoteModal from '@/components/forms/ConsultationNoteModal';
import PrescriptionModal from '@/components/forms/PrescriptionModal';
import MedicalRecordUploadModal from '@/components/forms/MedicalRecordUploadModal';

/**
 * Shared modal orchestrator for inspecting a patient's profile and launching
 * follow-up clinical actions (consultation note, prescription, record upload).
 */
export default function DoctorClinicalModalSuite({ modalState, setModalState }) {
  if (!modalState?.mode || !modalState?.patient) {
    return null;
  }

  const { mode, patient, appointment = null } = modalState;
  const closeModal = () => setModalState({ mode: null, patient: null, appointment: null });

  return (
    <>
      {mode === 'profile' && (
        <PatientMedicalProfileModal
          isOpen
          onClose={closeModal}
          patient={patient}
          onOpenConsultModal={(p) => setModalState({ mode: 'consult', patient: p, appointment })}
          onOpenRxModal={(p) => setModalState({ mode: 'rx', patient: p, appointment })}
          onOpenUploadModal={(p) => setModalState({ mode: 'upload', patient: p, appointment })}
        />
      )}

      {mode === 'consult' && (
        <ConsultationNoteModal
          isOpen
          onClose={closeModal}
          prefilledPatient={patient}
          prefilledAppointment={appointment}
        />
      )}

      {mode === 'rx' && (
        <PrescriptionModal
          isOpen
          onClose={closeModal}
          targetPatient={patient}
          appointmentId={appointment?._id || null}
        />
      )}

      {mode === 'upload' && (
        <MedicalRecordUploadModal
          isOpen
          onClose={closeModal}
          targetPatientId={patient._id}
        />
      )}
    </>
  );
}

