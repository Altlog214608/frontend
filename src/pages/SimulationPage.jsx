import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import html2canvas from "html2canvas";
import "../components/common/css/Simulation_CSS.css";
import solarpanel1 from "../assets/SimulationPage/solarpanel1.png";
import solarpanel2 from "../assets/SimulationPage/solarpanel2.png";
import simulation_button from "../assets/SimulationPage/simulation_button.png";
import simulation_btn_mobile from "../assets/SimulationPage/simulation_btn_mobile.png";
import sunlight_btn from "../assets/SimulationPage/sun_icon_1.png";
import shadow_btn from "../assets/SimulationPage/shadow_icon_1.png";
import home_btn from "../assets/SimulationPage/home_icon_1.png";

import { useNavigate } from "react-router-dom";
import NaverMap from "../components/map/NaverMap";
import VMap from "../components/map/VMap";

import solar1 from '../assets/SimulationPage/solar-1.png';
import area1 from '../assets/SimulationPage/area-1.png';
import solar2 from '../assets/SimulationPage/solar-2.png';

//추
import LoadingAnimation from "./LodingAnimation";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
//   Cell, PieChart, Pie
// } from 'recharts';
// chart.js 기반 시각화 요소 추가
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  RadialLinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

import { Line, Radar, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  RadialLinearScale,
  Tooltip,
  Legend
);

const SimulationPage = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [aiDetections, setAiDetections] = useState([]);
  const navigate = useNavigate();
  // 모바일 화면
  const [isMobile, setIsMobile] = useState(false);

  // 지도 전환
  const [useVMap, setUseVMap] = useState(false);

  // 지도 좌표 동기화
  const [centerLat, setCenterLat] = useState("");
  const [centerLon, setCenterLon] = useState("");

  const [showSolarOverlay, setShowSolarOverlay] = useState(false);
  const [placingPanel, setPlacingPanel] = useState(null);
  const [placingSize, setPlacingSize] = useState({ width: 0, height: 0 });
  const [placedPanels, setPlacedPanels] = useState([]);
  const dragIndexRef = useRef(null);
  const resizeIndexRef = useRef(null);
  const resizeCornerRef = useRef(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false); // ✅ Shift 고정 여부
  const [placingRotation, setPlacingRotation] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const placingPanelRef = useRef(placingPanel);
  const [aiPlacementMode, setAiPlacementMode] = useState(false);
  const polygonRefs = useRef([]); // 🔵 모든 생성된 Polygon 저장
  //추
  const [isLoading, setIsLoading] = useState(false);
  const [energyOutput, setEnergyOutput] = useState({
    daily: "0.0",
    weekly: "0.0",
    monthly: "0.0",
    yearly: "0.0",
  });
  const [totalArea, setTotalArea] = useState(0);
  const [aiMaskArea, setAiMaskArea] = useState(0);
  const [animatedPlacementRatio, setAnimatedPlacementRatio] = useState(0);
  const isResizingRef = useRef(false); // 🔵 현재 리사이즈 중 여부

  // 총합 = 1.0, 각 시간대별 평균 발전 비율 (예시)
  const hourlyRatios = [
    0.03, // 08시
    0.06, // 09시
    0.10, // 10시
    0.14, // 11시
    0.17, // 12시
    0.14, // 13시
    0.10, // 14시
    0.08, // 15시
    0.07, // 16시
    0.06, // 17시
    0.05  // 18시
  ];

  const yearly = parseFloat(energyOutput.yearly);
  const seasonalData = {
    봄: (yearly * 0.31).toFixed(1),
    여름: (yearly * 0.26).toFixed(1),
    가을: (yearly * 0.27).toFixed(1),
    겨울: (yearly * 0.16).toFixed(1),
  };

  const installRatio = Math.round(Math.min(animatedPlacementRatio, 100));

  const handleResetToHome = () => {
    setUseVMap(false);
    setShowSolarOverlay(false);
  };

  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
      const { width, height, ctx } = chart;
      const ratio = chart.config.options.plugins.centerText?.value ?? 0;

      ctx.save();

      ctx.font = 'bold 16px sans-serif';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('설치율', width / 2, height / 2 - 12);

      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${ratio}%`, width / 2, height / 2 + 12);

      ctx.restore();
    }
  };



  const roundedPlacementRatio = Math.round(animatedPlacementRatio);

  const dailyProduction = parseFloat(energyOutput.daily); // ex. 50
  const hourlyLabels = ['08시', '09시', '10시', '11시', '12시', '13시', '14시', '15시', '16시', '17시', '18시'];
  const hourlyData = hourlyRatios.map(ratio => +(dailyProduction * ratio).toFixed(1));


  const cmToPx = (cm) => cm * 0.5;
  const MIN_WIDTH = 100;
  const MIN_HEIGHT = 40;
  const MAX_WIDTH = 500;
  const MAX_HEIGHT = 250;


  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setMousePosition({ x: e.clientX, y: e.clientY });

    const pos = { x: mouseX, y: mouseY };

    // 🔥 리사이즈 중이면 크기 조정
    if (isResizingRef.current && resizeIndexRef.current !== null && resizeCornerRef.current) {
      const panel = placedPanels[resizeIndexRef.current];
      if (!panel) return;

      let newWidth = panel.width;
      let newHeight = panel.height;
      let newX = panel.x;
      let newY = panel.y;

      const leftEdge = panel.x - panel.width / 2;
      const rightEdge = panel.x + panel.width / 2;
      const topEdge = panel.y - panel.height / 2;
      const bottomEdge = panel.y + panel.height / 2;

      if (resizeCornerRef.current.includes("left")) {
        newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, rightEdge - mouseX));
        newX = rightEdge - newWidth / 2;
      }
      if (resizeCornerRef.current.includes("right")) {
        newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, mouseX - leftEdge));
        newX = leftEdge + newWidth / 2;
      }
      if (resizeCornerRef.current.includes("top")) {
        newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, bottomEdge - mouseY));
        newY = bottomEdge - newHeight / 2;
      }
      if (resizeCornerRef.current.includes("bottom")) {
        newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, mouseY - topEdge));
        newY = topEdge + newHeight / 2;
      }

      if (isShiftPressed) {
        const ratio = panel.width / panel.height;
        if (newWidth / newHeight > ratio) newWidth = newHeight * ratio;
        else newHeight = newWidth / ratio;
      }

      setPlacedPanels((prev) =>
        prev.map((p, i) =>
          i === resizeIndexRef.current ? { ...p, width: newWidth, height: newHeight, x: newX, y: newY } : p
        )
      );
      return;
    }

    // 🔥 드래그 중이면 이동
    if (dragIndexRef.current !== null) {
      setPlacedPanels((prev) =>
        prev.map((p, i) => (i === dragIndexRef.current ? { ...p, x: mouseX, y: mouseY } : p))
      );
      return;
    }

    // 🔥 리사이즈 시작 감지 (마우스가 모서리에 오면)
    let foundCorner = false;
    placedPanels.forEach((panel, idx) => {
      const corner = isNearCorner(pos, panel);
      if (corner) {
        canvasRef.current.style.cursor = (corner.includes("left") || corner.includes("right")) ? "ew-resize" : "ns-resize";
        resizeIndexRef.current = idx;
        resizeCornerRef.current = corner;
        foundCorner = true;
      }
    });

    if (!foundCorner) {
      canvasRef.current.style.cursor = "move";
      resizeIndexRef.current = null;
      resizeCornerRef.current = null;
    }
  };





  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = false;
    placedPanels.forEach((panel, idx) => {
      const corner = isNearCorner({ x, y }, panel);
      if (corner) {
        handleResizeStart(idx, corner);
        found = true;
      }
    });

    if (!found) {
      placedPanels.forEach((panel, idx) => {
        // 중앙에 클릭했는지 확인 (여유 margin 있음)
        const margin = 10;
        if (
          x > panel.x - panel.width / 2 + margin &&
          x < panel.x + panel.width / 2 - margin &&
          y > panel.y - panel.height / 2 + margin &&
          y < panel.y + panel.height / 2 - margin
        ) {
          handleDragStart(idx);
          found = true;
        }
      });
    }
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Shift") setIsShiftPressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // 수정
  const computeDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const toRad = (val) => (val * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  const placementRatio = useMemo(() => {
    return aiMaskArea > 0 ? (totalArea / aiMaskArea) * 100 : 0;
  }, [totalArea, aiMaskArea]);

  // px → meter 비율 계산 개선 (지도 줌레벨 반영 + 정밀 보정 제거)
  const getPixelToMeterRatio = useCallback(() => {
    const map = window.naverMap;
    if (!map || !map.getProjection) return 0.25; // fallback

    const proj = map.getProjection();
    const center = map.getCenter();

    // 중심 기준으로 위도 고정, 경도 약 0.001도 차이 (약 90m)
    const offsetLng = center.lng() + 0.001;
    const point1 = proj.fromCoordToPoint(center);
    const point2 = proj.fromCoordToPoint(new window.naver.maps.LatLng(center.lat(), offsetLng));

    const pixelDistance = Math.abs(point2.x - point1.x);
    const meterDistance = computeDistance(center.lat(), center.lng(), center.lat(), offsetLng);

    const pxToMeter = meterDistance / pixelDistance;

    console.log("🧮 실제 픽셀당 미터 거리:", pxToMeter.toFixed(4));
    return pxToMeter;
  }, [computeDistance]);




  const calculateAIMaskArea = useCallback(() => {
    const map = window.naverMap;
    if (!map || !map.getProjection || !canvasRef.current) return;

    const proj = map.getProjection();
    const canvasRect = canvasRef.current.getBoundingClientRect();
    let totalMaskArea = 0;

    aiDetections.forEach((det) => {
      if (det.mask && det.mask.length > 2) {
        const offsetX = window.innerWidth * 0.2;

        const polygonPoints = det.mask.map(([y, x]) =>
          new window.naver.maps.Point(x + offsetX + canvasRect.left, y + canvasRect.top)
        );

        const geoCoords = polygonPoints.map((pt) =>
          proj.fromPageXYToCoord(pt)
        );

        const polygon = new window.naver.maps.Polygon({ paths: geoCoords, map });
        const area = polygon.getAreaSize();
        polygon.setMap(null); // 지도에 그리지 않음

        totalMaskArea += area;
      }
    });

    const finalArea = totalMaskArea; // mask 면적은 polygon 기준이므로 별도 보정 불필요
    console.log("🟩 AI 마스크 총 면적 (㎡):", finalArea.toFixed(2));
    setAiMaskArea(finalArea);
  }, [aiDetections]);




  const loadStationCSV = useCallback(async () => {
    const res = await fetch("/data/station.csv");
    const text = await res.text();
    const rows = text.trim().split("\n").slice(1);
    return rows.map((r) => {
      const [code, lat, lon, radiation] = r.split(",");
      return {
        code,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        radiation: parseFloat(radiation),
      };
    });
  }, []);

  const findClosestStation = useCallback((lat, lon, stations) => {
    let closest = null;
    let minDist = Infinity;
    for (const s of stations) {
      const d = computeDistance(lat, lon, s.lat, s.lon);
      if (d < minDist) {
        minDist = d;
        closest = s;
      }
    }
    return closest;
  }, [computeDistance]);

  const calculateEnergyProduction = useCallback((totalArea, radiationMJ) => {
    // 🔐 방어 코드: 면적 또는 일사량이 없으면 0으로 처리
    if (!totalArea || !radiationMJ) {
      return {
        daily: "0.0",
        weekly: "0.0",
        monthly: "0.0",
        yearly: "0.0",
      };
    }

    const radiationKWh = radiationMJ * 0.278;
    const panelCount = Math.floor(totalArea / 2);
    const panelEfficiency = 0.18;

    const daily = panelCount * radiationKWh * panelEfficiency;
    const weekly = daily * 7;
    const monthly = daily * 30;
    const yearly = [...Array(12)].reduce((sum, _, i) => {
      const degradation = 1 - i * 0.005;
      return sum + daily * 30 * degradation;
    }, 0);

    return {
      daily: daily.toFixed(1),
      weekly: weekly.toFixed(1),
      monthly: monthly.toFixed(1),
      yearly: yearly.toFixed(1),
    };
  }, []);

  useEffect(() => {
    console.log("📊 설치율 (%):", placementRatio.toFixed(2));
  }, [placementRatio]);

  const handleCalculateProduction = useCallback(async () => {
    const map = window.naverMap; // ✅ 선언이 필요함
    if (!map || !map.getCenter) return;

    const center = map.getCenter();
    const lat = center.lat();
    const lon = center.lng();

    const stations = await loadStationCSV();
    const closest = findClosestStation(lat, lon, stations);
    const result = calculateEnergyProduction(totalArea, closest.radiation);

    setEnergyOutput(result);
  }, [totalArea, loadStationCSV, findClosestStation, calculateEnergyProduction]);

  useEffect(() => {
    handleCalculateProduction();
  }, [totalArea, handleCalculateProduction]);

  // ✅ 패널 면적 계산: 픽셀 면적 * (1px당 m)^2 * 보정계수 → 실제 m^2
  // useEffect(() => {
  //   const map = window.naverMap;
  //   if (!map || !map.getProjection) return;
  //   const pxToMeter = getPixelToMeterRatio();

  //   const total = placedPanels.reduce((sum, panel) => {
  //     const pixelArea = panel.width * panel.height;
  //     const realArea = pixelArea * (pxToMeter ** 2); // ✅ 보정 계수 제거
  //     return sum + realArea;
  //   }, 0);

  //   setTotalArea(total);
  // }, [placedPanels, getPixelToMeterRatio]);

  // ✅ placingPanel 상태를 ref에 동기화
  useEffect(() => {
    placingPanelRef.current = placingPanel;
  }, [placingPanel]);

  // ✅ AI 배치 모드에 따라 지도 드래그/휠 설정
  useEffect(() => {
    const map = window.naverMap;
    if (!map) return;
    if (aiPlacementMode) {
      map.setOptions({ scrollWheel: false, draggable: false });
    } else {
      map.setOptions({ scrollWheel: true, draggable: true });
    }
  }, [aiPlacementMode]);

  // ✅ AI 배치 종료 시 설치 대기 패널 초기화
  useEffect(() => {
    if (!aiPlacementMode && placingPanel) {
      setPlacingPanel(null);
    }
  }, [aiPlacementMode, placingPanel]);

  // 모바일 화면 체크
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 420);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 스크롤바 제거
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  // AI 면적 확인
  useEffect(() => {
    window.onMapChanged = () => {
      setAiDetections([]);
    };
  }, []);


  // 실제 설치된 패널 면적 계산 개선
  useEffect(() => {
    const map = window.naverMap;
    if (!map || !map.getProjection || !canvasRef.current) return;

    const proj = map.getProjection();
    const canvasRect = canvasRef.current.getBoundingClientRect();

    const total = placedPanels.reduce((sum, panel) => {
      const rad = (panel.rotation * Math.PI) / 180;

      const corners = [
        { dx: -panel.width / 2, dy: -panel.height / 2 },
        { dx: panel.width / 2, dy: -panel.height / 2 },
        { dx: panel.width / 2, dy: panel.height / 2 },
        { dx: -panel.width / 2, dy: panel.height / 2 },
      ].map(({ dx, dy }) => {
        const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
        const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad);
        return new window.naver.maps.Point(
          panel.x + rotatedX + canvasRect.left,
          panel.y + rotatedY + canvasRect.top
        );
      });

      const geoCoords = corners.map((pt) =>
        proj.fromPageXYToCoord(new window.naver.maps.Point(pt.x, pt.y))
      );

      const polygon = new window.naver.maps.Polygon({ paths: geoCoords, map: null });
      const area = polygon.getAreaSize(); // ✅ 실제 지도상 m²로 자동 변환
      return sum + area;
    }, 0);

    console.log("🟦 총 패널 설치 면적 (㎡):", total.toFixed(2));
    setTotalArea(total);
  }, [placedPanels]);




  useEffect(() => {
    const map = window.naverMap;
    if (!map || !map.getProjection) return;

    const ratio = getPixelToMeterRatio();
    console.log("🧮 픽셀당 미터 거리:", ratio.toFixed(4));
  }, []);

  useEffect(() => {
    const mapContainer = document.querySelector('.simulation-canvas');
    const handleDblClick = (e) => {
      if (aiPlacementMode) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (mapContainer) {
      mapContainer.addEventListener("dblclick", handleDblClick, true);
    }

    return () => {
      if (mapContainer) {
        mapContainer.removeEventListener("dblclick", handleDblClick, true);
      }
    };
  }, [aiPlacementMode]);


  useEffect(() => {
    placingPanelRef.current = placingPanel;
  }, [placingPanel]);

  // useEffect(() => {
  //   const map = window.naverMap;
  //   if (!map) return;

  //   if (aiPlacementMode) {
  //     map.setOptions({ scrollWheel: false, draggable: false });
  //   } else {
  //     map.setOptions({ scrollWheel: true, draggable: true });
  //   }
  // }, [aiPlacementMode]);

  useEffect(() => {
    const map = window.naverMap;
    if (!map) return;

    map.setOptions({
      scrollWheel: !aiPlacementMode,
      draggable: !aiPlacementMode,
      disableDoubleClickZoom: aiPlacementMode,  // 🔥 추가!
    });
  }, [aiPlacementMode]);

  useEffect(() => {
    if (!aiPlacementMode && placingPanel) {
      setPlacingPanel(null);
    }
  }, [aiPlacementMode, placingPanel]);

  // 패널 도구 창 설정
  // const handleOpenPanel = () => setShowPanel(true);
  // const handleClosePanel = () => setShowPanel(false);
  // 검색창 버튼 토글기능 설정
  // const handleSlideToggle = () => setShowAddressSlide(!showAddressSlide);

  // ✅ 지도 변경 시 AI 윤곽선 초기화
  useEffect(() => {
    window.onMapChanged = () => {
      setAiDetections([]);
    };
  }, []);

  // ✅ 마우스 이동 추적 + 크기 조절
  useEffect(() => {
    // ✅ 키 입력 처리 (Shift, 회전)
    // ✅ 키 입력 처리 (회전 등)
    const handleKeyDown = (e) => {
      if (e.key === "Shift") setIsShiftPressed(true);

      if (placingPanelRef.current) {
        if (e.key.toLowerCase() === "r") {
          setPlacingRotation((prev) => (prev + 45) % 360);
          return;
        }
        if (e.key.toLowerCase() === "q") {
          setPlacingRotation((prev) => (prev - 45 + 360) % 360);
          return;
        }
      }

      if (dragIndexRef.current !== null) {
        if (e.key.toLowerCase() === "r") {
          setPlacedPanels((prev) =>
            prev.map((panel, idx) =>
              idx === dragIndexRef.current
                ? { ...panel, rotation: (panel.rotation + 45) % 360 }
                : panel
            )
          );
        } else if (e.key.toLowerCase() === "q") {
          setPlacedPanels((prev) =>
            prev.map((panel, idx) =>
              idx === dragIndexRef.current
                ? { ...panel, rotation: (panel.rotation - 45 + 360) % 360 }
                : panel
            )
          );
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    };

    // ✅ 휠 회전
    const handleWheel = (e) => {
      const delta = e.deltaY > 0 ? 3 : -3;

      if (placingPanelRef.current) {
        setPlacingRotation((prev) => (prev + delta + 360) % 360);
        return;
      }

      if (dragIndexRef.current !== null) {
        e.preventDefault();
        setPlacedPanels((prev) =>
          prev.map((panel, idx) =>
            idx === dragIndexRef.current
              ? { ...panel, rotation: (panel.rotation + delta + 360) % 360 }
              : panel
          )
        );
      }
    };

    // ✅ 이벤트 리스너 등록
    // window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", (e) => {
      if (e.key === "Shift") setIsShiftPressed(false);
    });
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      // window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isShiftPressed, placedPanels]);

  // ✅ AI 결과가 갱신될 때마다 면적 계산
  useEffect(() => {
    if (aiDetections.length > 0) {
      calculateAIMaskArea();
    } else {
      setAiMaskArea(0);
    }
  }, [aiDetections, calculateAIMaskArea]);

  useEffect(() => {
    let animationFrame;
    let start = animatedPlacementRatio;
    let startTime = null;
    const duration = 800; // 부드럽게 변화하는 시간 (ms)

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = start + (placementRatio - start) * progress;
      setAnimatedPlacementRatio(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [placementRatio]);

  const handleCaptureAndNavigate = async () => {
    const mapElement = document.querySelector(".simulation-canvas");
    if (!mapElement) return;

    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      width: mapElement.offsetWidth,
      height: mapElement.offsetHeight,
    });

    const imageData = canvas.toDataURL("image/png");

    navigate("/result", {
      state: {
        panelCount: placedPanels.length,
        area: totalArea.toFixed(2),
        energy: energyOutput,
        image: imageData, // ✅ 이미지 base64 추가
        aiMaskArea: aiMaskArea.toFixed(2), // ✅ 추가!
      },
    });
  };

  // ✅ 패널 설치
  const handleMapClick = (e) => {
    if (!placingPanel || !aiPlacementMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPlacedPanels((prev) => [
      ...prev,
      {
        x,
        y,
        src: placingPanel,
        rotation: placingRotation,
        width: placingSize.width,
        height: placingSize.height,
      },
    ]);
    setPlacingPanel(null);
    setPlacingRotation(0);
  };

  // 드래그 시작
  const handleDragStart = (index) => {
    dragIndexRef.current = index;
    isResizingRef.current = false;
  };

  // 리사이즈 시작
  const handleResizeStart = (index, corner) => {
    resizeIndexRef.current = index;
    resizeCornerRef.current = corner;
    isResizingRef.current = true;
  };

  const handleMouseUp = () => {
    dragIndexRef.current = null;
    resizeIndexRef.current = null;
    resizeCornerRef.current = null;
    isResizingRef.current = false;
  };


  const handleDrag = (e) => {
    if (dragIndexRef.current === null) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPlacedPanels((prev) =>
      prev.map((panel, idx) =>
        idx === dragIndexRef.current ? { ...panel, x, y } : panel
      )
    );
  };


  // ✅ 우클릭 삭제
  const handleRightClick = (e, index) => {
    e.preventDefault();
    setPlacedPanels((prev) => prev.filter((_, i) => i !== index));
  };

  const isNearCorner = (pos, panel) => {
    const margin = 10;
    const rad = (panel.rotation * Math.PI) / 180;
    const corners = [
      { dx: -panel.width / 2, dy: -panel.height / 2, name: "top-left" },
      { dx: panel.width / 2, dy: -panel.height / 2, name: "top-right" },
      { dx: panel.width / 2, dy: panel.height / 2, name: "bottom-right" },
      { dx: -panel.width / 2, dy: panel.height / 2, name: "bottom-left" },
    ].map(({ dx, dy, name }) => {
      const rotatedX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const rotatedY = dx * Math.sin(rad) + dy * Math.cos(rad);
      return { x: panel.x + rotatedX, y: panel.y + rotatedY, name };
    });

    return corners.find((corner) =>
      Math.abs(pos.x - corner.x) < margin && Math.abs(pos.y - corner.y) < margin
    )?.name;
  };

  // ✅ AI 추론 캡처 및 전송 - 로딩 기능 수정
  const handleAIInference = async () => {
    setIsLoading(true); // 🔄 로딩 시작

    const mapElement = document.querySelector(".simulation-canvas");
    if (!mapElement) {
      alert("지도를 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      width: mapElement.offsetWidth,
      height: mapElement.offsetHeight,
    });

    const fullWidth = canvas.width;
    const fullHeight = canvas.height;
    const cropX = fullWidth * 0.2;
    const cropWidth = fullWidth * 0.6;
    const cropHeight = fullHeight;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const ctx = croppedCanvas.getContext("2d");
    ctx.drawImage(canvas, cropX, 0, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

    croppedCanvas.toBlob(async (blob) => {
      if (!blob) {
        setIsLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("image", blob, "cropped_map.png");

      try {
        const response = await fetch("http://localhost:8080/api/predict", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        setAiDetections(result.detections);

        const map = window.naverMap;
        if (map) {
          setTimeout(() => {
            map.setOptions({ draggable: false, scrollWheel: false });
          }, 100);
        }

        // ✅ AI 배치 모드 ON
        setAiPlacementMode(true);

        const center = window.naverMap.getCenter();
        const lat = center.lat();
        const lng = center.lng();
        console.log("현재 지도 중심 위도/경도:", lat, lng);

      } catch (error) {
        console.error("AI 요청 실패:", error);
      } finally {
        setIsLoading(false); // 🔄 로딩 종료
      }
    }, "image/png");
  };



  return (
    <div className="simulation-container">
      {isLoading && <LoadingAnimation />}
      <div className="simulation-body">
        <div className="simulation-map-area fullscreen-map">
          <div className="simulation-map-wrapper">
            <div
              className="simulation-canvas"
              id="simulation-canvas"
              ref={canvasRef}
              onClick={handleMapClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}

              style={{ position: "relative" }}
            >
              {useVMap ? (
                <VMap centerLat={centerLat} centerLon={centerLon} />
              ) : (
                <NaverMap
                  centerLat={centerLat}
                  centerLon={centerLon}
                  setCenterLat={setCenterLat}
                  setCenterLon={setCenterLon}
                  showSolarOverlay={showSolarOverlay}
                />
              )}

              {/* 중앙 영역 시각화 */}
              <div
                id="capture-area-box"
                style={{
                  position: "absolute",
                  top: 0,
                  left: "20%",
                  width: "60%",
                  height: "100%",
                  border: "2px dashed red",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  pointerEvents: "none",
                  zIndex: 998,
                }}
              ></div>

              {/* AI 마스크 결과 */}
              <svg
                id="ai-mask-svg"
                width="100%"
                height="100%"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                  zIndex: 999,
                }}
              >
                {aiDetections.map((det, idx) => {
                  const offsetX = window.innerWidth * 0.2;
                  return (
                    <g key={idx}>
                      <rect
                        x={det.box[0] + offsetX}
                        y={det.box[1]}
                        width={det.box[2] - det.box[0]}
                        height={det.box[3] - det.box[1]}
                        stroke="red"
                        strokeWidth="2"
                        fill="none"
                      />
                      {det.mask && det.mask.length > 2 && (
                        <polygon
                          points={det.mask
                            .map(([y, x]) => `${x + offsetX},${y}`)
                            .join(" ")}
                          fill="rgba(198, 245, 180, 0.03)"
                          stroke="rgba(100,200,100,0.4)"
                          strokeWidth="1"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* 🟡 배치된 패널 이미지 */}
              {placedPanels.map((panel, idx) => {
                const corner = isNearCorner(mousePosition, panel);
                const cursor = corner ? "nwse-resize" : "move";
                return (
                  <img
                    key={idx}
                    src={panel.src}
                    alt={`panel-${idx}`}
                    style={{
                      position: "absolute",
                      top: panel.y,
                      left: panel.x,
                      width: panel.width,
                      height: panel.height,
                      transform: `translate(-50%, -50%) rotate(${panel.rotation}deg)`,
                      cursor: 'move',
                      zIndex: 1000,
                    }}
                    onMouseMove={(e) => {
                      const rect = canvasRef.current.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const corner = isNearCorner({ x, y }, panel);

                      if (corner === "top-left" || corner === "bottom-right") {
                        e.currentTarget.style.cursor = "nwse-resize"; // ↘↖ 방향
                      } else if (corner === "top-right" || corner === "bottom-left") {
                        e.currentTarget.style.cursor = "nesw-resize"; // ↗↙ 방향
                      } else {
                        e.currentTarget.style.cursor = "move"; // 기본 move
                      }
                    }}
                    onContextMenu={(e) => handleRightClick(e, idx)}
                  />
                );
              })}
            </div>
            {/* ✅ 마우스를 따라다니는 설치 패널 이미지 */}
            {placingPanel && (
              <img
                src={placingPanel}
                alt="placing"
                style={{
                  position: "fixed",
                  top: mousePosition.y,
                  left: mousePosition.x,
                  // width: "80px",
                  width: placingSize.width,
                  height: placingSize.height,
                  transform: `translate(-50%, -50%) rotate(${placingRotation}deg)`,
                  pointerEvents: "none",
                  zIndex: 2000,
                }}
              />
            )}



            {/* 패널 팝업 */}
            {showPanel && (
              <div className="popup-panel">
                <div className="popup-panel-content">
                  <div className="close-btn-layout">
                    <h2>패널 설정</h2>
                  </div>
                  {/* <h2>설치 패널 상세</h2> */}
                  <div className="panel-content-row">
                    <div className="panel-upper-grid">
                      {/* 패널 이미지 */}
                      <div className="panel-image-box clickable">
                        <img
                          src={solarpanel2}
                          alt="패널"
                          className="panel-image"
                          onClick={() => {
                            if (!aiPlacementMode) return;
                            setPlacingPanel(solarpanel2);
                            setPlacingSize({
                              width: cmToPx(198),
                              height: cmToPx(99),
                            });
                          }}
                        />
                      </div>

                      {/* 설치 개수 */}
                      <div className="info-card">
                        <img src={solar1} alt="설치 개수" className="info-icon" />
                        <div>
                          <div className="info-label">설치 패널 수</div>
                          <div className="info-value">{placedPanels.length} 개</div>
                        </div>
                      </div>

                      {/* 설치 면적 */}
                      <div className="info-card">
                        <img src={area1} alt="설치 면적" className="info-icon" />
                        <div>
                          <div className="info-label">설치 면적</div>
                          <div className="info-value">{totalArea.toFixed(2)} ㎡</div>
                        </div>
                      </div>

                      {/* 실제 설치 가능 수 */}
                      <div className="info-card tooltip-container">
                        <img src={solar2} alt="설치 가능 수" className="info-icon" />
                        <div>
                          <div className="info-label">
                            실제 설치 가능 수 <span className="tooltip">❓<span className="tooltiptext">AI 분석 면적 기준으로<br />최대 설치 가능한 패널 수입니다.</span></span>
                          </div>
                          <div className="info-value">{Math.floor(totalArea / 2)} 개</div>
                        </div>
                      </div>
                    </div>

                    {/* 에너지 생산량 시각화 */}
                    <h4 className="chart-section-title">시간대별 발전량</h4>
                    <Bar
                      height={120}
                      data={{
                        labels: hourlyLabels,
                        datasets: [{
                          label: '시간별 발전량',
                          data: hourlyData,
                          backgroundColor: '#4CAF50'
                        }]
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />

                    <h4 className="chart-section-title">연간 발전량</h4>
                    <Bar
                      height={100}
                      data={{
                        labels: ['봄', '여름', '가을', '겨울'],
                        datasets: [{
                          label: '계절별 발전량 (kWh)',
                          data: Object.values(seasonalData),
                          backgroundColor: '#4CAF50',
                          borderRadius: 8,
                        }],
                      }}
                      options={{
                        responsive: true,
                        plugins: { legend: { display: false } },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (val) => `${val} kWh`,
                            },
                          },
                        },
                      }}
                    />

                    <div className="simulation-donut-chart">
                      <Doughnut
                        data={{
                          labels: ['설치된 면적', '남은 면적'],
                          datasets: [{
                            data: [installRatio, 100 - installRatio],
                            backgroundColor: [
                              installRatio < 30 ? '#FF7043'
                                : installRatio < 70 ? '#FFD54F'
                                  : '#66BB6A',
                              '#E0E0E0'
                            ],
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false, // ✅ 반드시 false
                          cutout: '70%',
                          plugins: {
                            legend: { display: false },
                            centerText: {
                              value: installRatio
                            }
                          }
                        }}
                        plugins={[centerTextPlugin]}
                      />
                    </div>



                  </div>
                </div>

                <div className="complete-button-wrapper">
                  <button
                    className="ai-input-button"
                    onClick={handleAIInference}
                  >
                    패널 배치 시작
                  </button>
                  <button
                    className="clear-ai-button"
                    onClick={() => {
                      setAiDetections([]);

                      setPlacedPanels([]); // 👉 설치 패널 초기화
                      setAiPlacementMode(false);
                      // 🔵 파란 Polygon 전부 제거
                      polygonRefs.current.forEach((p) => p.setMap(null));
                      polygonRefs.current = []; // 배열 비우기
                      const map = window.naverMap;
                      if (map) {
                        map.setOptions({
                          draggable: true,
                          scrollWheel: true,
                        });
                      }
                    }}
                  >
                    패널 배치 취소
                  </button>
                  <button
                    className="complete-button"
                    onClick={handleCaptureAndNavigate}
                  >
                    패널 배치 완료
                  </button>
                </div>
              </div>
            )}

            <div className="panel-button-topright">
              <button
                className={`panel-mode-button ${!showSolarOverlay && !useVMap ? 'active' : ''}`}
                onClick={() => {
                  setUseVMap(false);
                  setShowSolarOverlay(false);
                }}
              >
                <img src={home_btn} alt="기본 지도" />
              </button>
              <button
                className={`panel-mode-button ${showSolarOverlay ? 'active' : ''}`}
                onClick={() => {
                  setUseVMap(false);
                  setShowSolarOverlay(true);
                }}
              >
                <img src={sunlight_btn} alt="일조량 모드" />
              </button>
              <button
                className={`panel-mode-button ${useVMap ? 'active' : ''}`}
                onClick={() => {
                  setUseVMap(true);
                  setShowSolarOverlay(false);
                }}
              >
                <img src={shadow_btn} alt="그림자 모드" />
              </button>
              <button
                className="open-panel-button"
                onClick={() => setShowPanel(prev => !prev)}
              >
                <img
                  src={isMobile ? simulation_btn_mobile : simulation_button}
                  alt="패널 보기 버튼"
                />
              </button>
            </div>


            {/* 
            <div className="panel-button-topright">
              <button
                className="open-panel-button"
                onClick={() => setShowPanel(prev => !prev)}
              >
                <img
                  src={isMobile ? simulation_btn_mobile : simulation_button}
                  alt="패널 보기 버튼"
                />
              </button>
            </div>

 
            <div className="switch-btn">
              <button
                className="switch-button"
                onClick={() => setUseVMap((prev) => !prev)}
              >
                <img src={shadow_btn} alt="맵 전환 버튼" />
              </button>
            </div>


            <div className="sunlight-filter-button">
              <button
                className="filter-button"
                onClick={() => setShowSolarOverlay((prev) => !prev)}
              >
                <img src={sunlight_btn} alt="일조량 버튼" />
              </button>
            </div> */}

            {/* 🔳 AI 자동배치 모드일 때만 비활성화 레이어 추가 */}
            {aiPlacementMode && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "10%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    zIndex: 2000,
                    pointerEvents: "auto",
                    cursor: "not-allowed",
                  }}
                  onClick={(e) => e.stopPropagation()}
                ></div>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "10%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    zIndex: 2000,
                    pointerEvents: "auto",
                    cursor: "not-allowed",
                  }}
                  onClick={(e) => e.stopPropagation()}
                ></div>
              </>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default SimulationPage;
