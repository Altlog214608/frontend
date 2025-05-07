import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const UsageCompareChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const labels = ['Label1', 'Label2', 'Label3', 'Label4', 'Label5'];


    // ================================================================
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.scale(ratio, ratio);
// =================================================================

    new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "사용자",
            data: [3.58, 3.58, 3.58, 2.81, 2.81],
            backgroundColor: "rgba(54, 162, 235, 0.6)"
          },
          {
            label: "산업 평균",
            data: [4.38, 4.38, 4.38, 4.38, 4.38],
            backgroundColor: "rgba(33, 37, 41, 0.8)"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: "사용량 (kWh)"
            }
          }
        }
      }
    });
  }, []);

  return <canvas ref={canvasRef} style={{ height: "200px" }} />;
};

export default UsageCompareChart;
