import React, { useEffect, useRef, useState } from "react";
import "../common/css/VMap.css";
import play_btn from "../../assets/SimulationPage/play_btn.png";
import stop_btn from "../../assets/SimulationPage/stop_btn.png";

const VMap = ({ centerLat, centerLon }) => {
  const iframeRef = useRef(null);

  const [selTime, setSelTime] = useState(12);
  const [sunrise, setSunrise] = useState("N/A");
  const [sunset, setSunset] = useState("N/A");
  const [totalSunlight, setTotalSunlight] = useState("N/A");
  const [continuousSunlight, setContinuousSunlight] = useState("N/A");
  const [analysisInterval, setAnalysisInterval] = useState("15");

  const query = new URLSearchParams({
    lat: centerLat,
    lon: centerLon,
  }).toString();

  const handleTimeChange = (e) => {
    setSelTime(e.target.value);
  };

  const handleIntervalChange = (e) => {
    setAnalysisInterval(e.target.value);
  };

  const handleSunlightAnalysis = () => {
    iframeRef.current?.contentWindow.postMessage(
      {
        type: "SUNLIGHT_ANALYSIS",
        interval: analysisInterval,
      },
      "*"
    );
  };

  const handleResetAnalysis = () => {
    setSunrise("N/A");
    setSunset("N/A");
    setTotalSunlight("N/A");
    setContinuousSunlight("N/A");

    iframeRef.current?.contentWindow.postMessage(
      { type: "SUNLIGHT_RESET" },
      "*"
    );
  };

  useEffect(() => {
    if (iframeRef.current && centerLat && centerLon) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "MOVE_CAMERA",
          lat: parseFloat(centerLat),
          lon: parseFloat(centerLon),
        },
        "*"
      );
    }
  }, [centerLat, centerLon]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { type, result } = event.data;
      if (type === "SUNLIGHT_RESULT" && result) {
        setSunrise(result.sunrise);
        setSunset(result.sunset);
        setTotalSunlight(result.total);
        setContinuousSunlight(result.continuous);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <>
      {/* 3D 지도 랜더링 */}
      <iframe
        ref={iframeRef}
        src={`/vmap.html?${query}`}
        style={{ width: "100%", height: "100%", border: "none" }}
        title="3D MAP"
      />

      {/* 그림자 분석 패널 */}
      <div className="shadow-popup">
        <div className="popup-header">그림자 분석</div>
        <div className="sunshine_days">
          <div className="analysis_date">분석 기준 일자</div>
          <div className="sunshine_hours">
            <div className="sunrise_date">일출시간 : {sunrise}</div>
            <div className="sunset_time">일몰시간 : {sunset}</div>
          </div>
          <div className="sunlight">
            <div className="total_sunlight">
              총 일조시간간 : {totalSunlight}
            </div>
            <div className="continuous_sunlight">
              연속 일조시간(최대) : {continuousSunlight}
            </div>
          </div>
        </div>
        <div className="popup-content">
          <div className="analysis_time">
            <label htmlFor="interval">분석시간간격</label>
            <select
              id="anlysTimeInterval"
              value={analysisInterval}
              onChange={handleIntervalChange}
            >
              <option value="5">5분</option>
              <option value="10">10분</option>
              <option value="15">15분</option>
            </select>
          </div>

          <div className="time-slider-label">
            <label htmlFor="time-slider">시간별 그림자</label>
          </div>

          <div className="time-header">
            <span className="time-display">
              {String(selTime).padStart(2, "0")}:00
            </span>
            <div className="Time_zone_playback">
              <button className="time_play">
                <img src={play_btn} alt="재생버튼" />
              </button>
              <button className="stop_time">
                <img src={stop_btn} alt="일시 정지 버튼" />
              </button>
            </div>
          </div>

          <div className="time-slider-container">
            <div className="time-slider">
              <input
                type="range"
                id="time-slider"
                min="0"
                max="23"
                step="1"
                value={selTime}
                onChange={handleTimeChange}
              />
            </div>
          </div>

          <div className="popup-buttons">
            <button
              className="select-button loc-ana-button"
              onClick={handleSunlightAnalysis}
            >
              일조시간 분석
            </button>
            <button className="reset-button" onClick={handleResetAnalysis}>
              초기화
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VMap;
