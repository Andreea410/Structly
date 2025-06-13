"use client";

import { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function UsageChart({ dataStructures }) {
  const chartRef = useRef();

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [dataStructures]);

  const chartData = {
    labels: dataStructures.map((_, i) => `Item ${i + 1}`),
    datasets: [
      {
        label: "Usage Count",
        data: dataStructures.map(ds => ds.usageCount || 0),
        borderColor: "rgb(124, 58, 237)",
        backgroundColor: "rgba(124, 58, 237, 0.5)",
        tension: 0.1
      }
    ]
  };

  return (
  <div className="p-6 bg-white rounded-xl shadow-sm mb-8">
    <h3 className="text-lg font-semibold text-purple-800 mb-4">
      Real-Time Usage
      <span className="ml-2 text-sm font-normal text-gray-500">
        {dataStructures.length} items
      </span>
    </h3>
    <div className="h-64">
      <Line
        ref={chartRef}
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 1000 },
          scales: { y: { beginAtZero: true } }
        }}
      />
    </div>
  </div>
  );
}