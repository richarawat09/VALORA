'use client';

import './ChartSetup';
import { Doughnut } from 'react-chartjs-2';

export default function StatusDistributionChart({ statusCounts }) {
  const counts = statusCounts || { scheduled: 5, confirmed: 12, completed: 25, cancelled: 3 };

  const chartData = {
    labels: ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          counts.scheduled || 0,
          counts.confirmed || 0,
          counts.completed || 0,
          counts.cancelled || 0,
        ],
        backgroundColor: [
          '#38bdf8', // sky
          '#14b8a6', // teal
          '#22c55e', // green
          '#f43f5e', // rose
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 16,
          color: '#475569',
          font: { size: 12, weight: '500' },
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

