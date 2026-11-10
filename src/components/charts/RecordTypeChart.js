'use client';

import './ChartSetup';
import { Doughnut } from 'react-chartjs-2';

export default function RecordTypeChart({ recordTypeCounts }) {
  const counts = recordTypeCounts || {
    lab_report: 14,
    xray: 8,
    mri_scan: 5,
    ct_scan: 4,
    ultrasound: 6,
    prescription: 18,
  };

  const labels = Object.keys(counts).map((key) => {
    return key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  });

  const values = Object.values(counts);

  const chartData = {
    labels,
    datasets: [
      {
        data: values.length > 0 ? values : [1],
        backgroundColor: [
          '#06b6d4', // cyan
          '#3b82f6', // blue
          '#8b5cf6', // purple
          '#ec4899', // pink
          '#10b981', // emerald
          '#f59e0b', // amber
          '#64748b', // slate
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 12,
          font: { size: 11 },
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}

