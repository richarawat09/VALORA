'use client';

import './ChartSetup';
import { Bar } from 'react-chartjs-2';

export default function MonthlyAppointmentsChart({ labels, data }) {
  const chartData = {
    labels: labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Appointments',
        data: data || [12, 19, 15, 22, 28, 35, 42, 38, 45, 52, 48, 60],
        backgroundColor: 'rgba(20, 184, 166, 0.75)',
        borderColor: '#0d9488',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 12,
        titleFont: { size: 13, weight: '600' },
        bodyFont: { size: 12 },
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
      <Bar data={chartData} options={options} />
    </div>
  );
}

