import Badge from '@/components/ui/Badge';

const STATUS_CONFIG = {
  scheduled: { variant: 'info', label: 'Appointment Requested' },
  confirmed: { variant: 'success', label: 'Confirmed' },
  completed: { variant: 'primary', label: 'Completed' },
  rescheduled: { variant: 'warning', label: 'Rescheduled' },
  cancelled: { variant: 'danger', label: 'Cancelled' },
};

export default function AppointmentStatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}

