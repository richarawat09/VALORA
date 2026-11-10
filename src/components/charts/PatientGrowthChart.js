'use client';

import './ChartSetup';
import { Line } from 'react-chartjs-2';

export default function PatientGrowthChart({ labels, data }) {
  const chartData = {
    labels: labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Patients Registered',
        data: data || [5, 12, 18, 25, 30, 42, 55, 68, 75, 88, 96, 110],
        fill: true,
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        borderColor: '#0284c7',
        tension: 0.4,
        pointBackgroundColor: '#0284c7',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b' },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', precision: 0 },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="h-72 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}

