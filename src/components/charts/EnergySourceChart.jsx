import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const EnergySourceChart = () => {
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

    fetch("/data/energy_sources.csv")
      .then(res => res.text())
      .then(csv => {
        const data = parseCSV(csv);
        const labels = data.map(d => d["에너지원"]);
        const values = data.map(d => d["비율"]);
        console.log(data);

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
          type: "doughnut",
          data: {
            labels,

            
            datasets: [{
              data: values,
              backgroundColor: [
                '#4e73df', '#1cc88a', '#36b9cc',
                '#f6c23e', '#e74a3b', '#858796', '#5a5c69'
              ]
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

export default EnergySourceChart;
