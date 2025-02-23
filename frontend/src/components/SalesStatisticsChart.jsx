import React from "react";
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
function SalesStatisticsChart({ chartData }) {
  console.log(chartData);
  const saleData = {
    labels: chartData.map((s) => s.day),
    datasets: [
      {
        label: "Daily Sales in Ksh",
        data: chartData.map((s) => s.total_sales),
        borderColor: "rgb(75,192,192)",
      },
    ],
  };
  const options = {};
  const data = {};
  return <Line options={options} data={saleData} />;
}

export default SalesStatisticsChart;
