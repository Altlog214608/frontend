import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const RenewableChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const parseCSV = (csvText) => {
      const [headerLine, ...lines] = csvText.trim().split("\n");
      const headers = headerLine.split(",");
      return lines.map(line => {
        const values = line.split(",");
        const entry = {};
        headers.forEach((header, i) => {
          entry[header.trim()] = isNaN(values[i]) ? values[i].trim() : parseFloat(values[i]);
        });
        return entry;
      });
    };

    fetch("/data/신재생에너지.csv")
      .then(res => res.text())
      .then(csv => {
        const data = parseCSV(csv);
        const labels = data.map(d => d["신재생에너지"]);
        const values = data.map(d => d["비율"]);

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
          type: "line",
          data: {
            labels,
            datasets: [{
              label: "신재생에너지 발전 비율 (%)",
              data: values,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "white",
              pointBorderColor: "rgba(75, 192, 192, 1)",
              pointRadius: 5,
              pointHoverRadius: 7
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      });
  }, []);

  return <canvas ref={canvasRef} style={{ height: "200px" }} />;
};

export default RenewableChart;
