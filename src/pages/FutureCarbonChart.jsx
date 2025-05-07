import React, { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../components/common/css/FutureCarbonChart.css"; // (스타일 분리해도 됨)

const FutureCarbonChart = ({ treeEquivalent }) => {
  const chartRef = useRef(null);
  const [playChart, setPlayChart] = useState(false);

  const totalYears = 25;
  const carbonAbsorptionPerTreePerYear = 20; // kg
  const totalCarbonSaved = treeEquivalent * carbonAbsorptionPerTreePerYear;

  const yearlyReduction = totalCarbonSaved / totalYears;

  const data = Array.from({ length: totalYears }, (_, i) => ({
    year: `${i + 1}년`,
    carbon: Math.round(yearlyReduction * (i + 1)),
  }));

  const treeEquivalent25Years = Math.floor(totalCarbonSaved / carbonAbsorptionPerTreePerYear);

  const formatCarbonSaving = (totalCarbonSaved) => {
    if (totalCarbonSaved < 1000) {
      return `25년 동안 약 ${totalCarbonSaved.toLocaleString()} kg의 CO₂를 줄일 수 있어요!`;
    } else {
      const tons = (totalCarbonSaved / 1000).toFixed(1);
      return `25년 동안 약 ${tons}톤의 CO₂를 줄일 수 있어요!`;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setPlayChart(true);
        } else {
          setPlayChart(false);
        }
      });
    }, { threshold: 0.3 });

    if (chartRef.current) {
      observer.observe(chartRef.current);
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        background: "linear-gradient(to bottom, #e0f7fa, #ffffff)",
        padding: "2rem",
        borderRadius: "16px",
        position: "relative",
        marginTop: "3rem",
      }}
    >
      {/* 타이틀 */}

      <h2 style={{ fontSize: "2rem", marginBottom: "2rem" }}>
        {formatCarbonSaving(totalCarbonSaved)}
      </h2>


      {/* 차트 */}
      {playChart && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: "설치 후 경과 연도", position: "insideBottom", offset: -20 }} />
            <YAxis tickFormatter={(value) => `${value}kg`} />
            <Tooltip formatter={(value) => [`${value} kg`, "누적 절감량"]} />
            <Line
              type="monotone"
              dataKey="carbon"
              stroke="#00C49F"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 7 }}
              isAnimationActive={true}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* 누적 절감량 요약 */}
      <div style={{ marginTop: "2rem", fontSize: "1.2rem", fontWeight: "bold" }}>
        25년 후 예상 누적 절감량: {totalCarbonSaved.toLocaleString()} kg CO₂
      </div>
    </div>
  );
};

export default FutureCarbonChart;
