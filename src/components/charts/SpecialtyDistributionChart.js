'use client';

import './ChartSetup';
import { Bar } from 'react-chartjs-2';

export default function SpecialtyDistributionChart({ data }) {
  const defaultData = {
    Cardiology: 6,
    Neurology: 4,
    Orthopedics: 5,
    Pediatrics: 3,
    'General Medicine': 8,
    Dermatology: 4,
  };

  const specialtyMap = data && Object.keys(data).length > 0 ? data : defaultData;
  const labels = Object.keys(specialtyMap);
  const counts = Object.values(specialtyMap);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Active Specialists',
        data: counts,
        backgroundColor: [
          '#0ea5e9',
          '#14b8a6',
          '#8b5cf6',
          '#f59e0b',
          '#10b981',
          '#ec4899',
        ],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // horizontal bar chart
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { color: '#64748b', precision: 0 },
        beginAtZero: true,
      },
      y: {
        grid: { display: false },
        ticks: { color: '#475569', font: { weight: '500' } },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}

