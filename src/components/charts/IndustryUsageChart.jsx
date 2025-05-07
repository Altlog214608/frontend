import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const IndustryUsageChart = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const parseCSV = (csvText) => {
      const [headerLine, ...lines] = csvText.trim().split("\n");
      const headers = headerLine.split(",");

      return lines.map(line => {
        const values = line.split(",");
        const entry = {};
        headers.forEach((header, i) => {
          // 숫자 여부에 따라 parseFloat 적용
          entry[header.trim()] = isNaN(values[i]) ? values[i].trim() : parseFloat(values[i]);
        });
        return entry;
      });
    };

    // CSV를 fetch로 가져오기 (public 폴더의 /data/industry_usage.csv 경로)
    fetch("/data/industry_usage.csv")
      .then(res => res.text())
      .then(csv => {
        const data = parseCSV(csv);
        const labels = data.map(d => d["업종"]);
        const values = data.map(d => d["전력사용량"]);
        console.log(csv);
        console.log(parseCSV(csv));


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

        // chart.js 초기화
        new Chart(canvasRef.current, {
          type: "bar",
          data: {
            labels,
            datasets: [
              {
                label: "전력 사용량 (kWh)",
                data: values,
                backgroundColor: "rgba(255, 159, 64, 0.6)"
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  font: { size: 10 }
                }
              }
            }
          }
        });
      })
      .catch(err => {
        console.error("CSV 파일을 불러오는 중 오류가 발생했습니다:", err);
      });
  }, []);

  return <canvas ref={canvasRef} style={{ height: "200px" }} />;
};

export default IndustryUsageChart;
