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
  <div className="w-full">
    <div className="flex items-center mb-2">
      <h3 className="text-xl font-semibold text-purple-800">
        Real-Time Usage
      </h3>
      <span className="ml-3 text-base font-normal text-gray-500">
        {dataStructures.length} items
      </span>
    </div>
    <div className="h-96 w-full">
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