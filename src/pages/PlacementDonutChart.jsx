import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PlacementDonutChart = ({ area, aiMaskArea }) => {
  const placementRatio = useMemo(() => {
    const placed = parseFloat(area);
    const recommended = parseFloat(aiMaskArea);
    if (isNaN(placed) || isNaN(recommended) || recommended === 0) return 0;
    return (placed / recommended) * 100;
  }, [area, aiMaskArea]);

  const cappedRatio = Math.min(placementRatio, 100);

  const chartData = [
    { name: "설치된 면적", value: cappedRatio },
    { name: "남은 면적", value: 100 - cappedRatio },
  ];

  return (
    <div style={{
      width: "100%",
      height: "250px",
      position: "relative", // ✅ 꼭 필요함
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5", // (필요시 삭제 가능)
      borderRadius: "12px",
    }}>
      <div style={{ width: "150px", height: "150px", position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              startAngle={90}
              endAngle={-270}
              innerRadius="60%"
              outerRadius="100%"
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              <Cell key="installed" fill="#82ca9d" />
              <Cell key="remaining" fill="#eeeeee" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* 도넛 중앙 텍스트 */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: "#333"
        }}>
          설치율<br />{placementRatio.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};

export default PlacementDonutChart;
