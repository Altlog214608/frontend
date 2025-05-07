import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import "../components/common/css/Simulation_CSS.css";
import solarpanel1 from "../assets/SimulationPage/solarpanel1.png";
import solarpanel2 from "../assets/SimulationPage/solarpanel2.png";
import simulation_button from "../assets/SimulationPage/simulation_button.png";
import sunlight_btn from "../assets/SimulationPage/sunlight_btn.png";
import mapswitch from "/Users/user/netCarbonProject_java/frontend/src/assets/SimulationPage/KakaoTalk_20250422_143601452.png";

import { useNavigate } from "react-router-dom";
import NaverMap from "../components/map/NaverMap";

const SimulationPage = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [aiDetections, setAiDetections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
    window.onMapChanged = () => {
      setAiDetections([]);
    };
  }, []);

  const handleOpenPanel = () => setShowPanel(true);
  const handleClosePanel = () => setShowPanel(false);

  const handleAIInference = async () => {
    const mapElement = document.querySelector(".simulation-canvas");
    if (!mapElement) return alert("지도를 찾을 수 없습니다.");

    const canvas = await html2canvas(mapElement, {
      useCORS: true,
      width: mapElement.offsetWidth,
      height: mapElement.offsetHeight,
    });

    const fullWidth = canvas.width;
    const fullHeight = canvas.height;
    const cropX = fullWidth * 0.1;
    const cropWidth = fullWidth * 0.8;
    const cropHeight = fullHeight;

    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;

    const ctx = croppedCanvas.getContext("2d");
    ctx.drawImage(
      canvas,
      cropX,
      0,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    croppedCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append("image", blob, "cropped_map.png");

      try {
        const response = await fetch("http://localhost:8080/api/predict", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        setAiDetections(result.detections);
      } catch (error) {
        console.error("AI 요청 실패:", error);
      }
    }, "image/png");
  };

  return (
    <div className="simulation-container">
      <div className="simulation-body">
        <div className="simulation-map-area fullscreen-map">
          <div className="simulation-map-wrapper">
            <div
              className="simulation-canvas"
              id="simulation-canvas"
              style={{ position: "relative" }}
            >
              <NaverMap />

              {/* 중앙 영역 시각화 */}
              <div
                id="capture-area-box"
                style={{
                  position: "absolute",
                  top: 0,
                  left: "10%",
                  width: "80%",
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
                  const offsetX = window.innerWidth * 0.1;
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
            </div>

            {/* 패널 보기 버튼 */}
            <div className="panel-button-topright">
              <button className="open-panel-button" onClick={handleOpenPanel}>
                <img src={simulation_button} alt="패널 보기 버튼" />
              </button>
            </div>

            {/* 패널 팝업 */}
            {showPanel && (
              <div className="popup-panel">
                <div className="popup-panel-content">
                  <div className="close-button-area" onClick={handleClosePanel}>
                    <img src={simulation_button} alt="설치 패널 닫기기" />
                  </div>
                  <h2>설치 패널 상세</h2>
                  <div className="panel-content-row">
                    <div className="panel-image-selection">
                      <div className="panel-image-box">
                        <img
                          src={solarpanel1}
                          alt="패널1"
                          className="panel-image panel-small"
                        />
                        <div className="panel-size">165cm x 99cm</div>
                      </div>
                      <div className="panel-image-box">
                        <img
                          src={solarpanel2}
                          alt="패널2"
                          className="panel-image panel-large"
                        />
                        <div className="panel-size">198cm x 99cm</div>
                      </div>
                    </div>
                    <div className="panel-form-section">
                      <div className="panel-info">
                        <label className="panel-label">설치 개수</label>
                        <input
                          type="number"
                          placeholder="설치 개수"
                          className="panel-input"
                        />
                      </div>
                      <div className="panel-info">
                        <label className="panel-label">설치 면적</label>
                        <input
                          type="text"
                          placeholder="자동 계산"
                          className="panel-result-input"
                          readOnly
                        />
                      </div>
                      <div className="panel-info">
                        <label className="panel-label">
                          예상 에너지 생산량
                        </label>
                        <input
                          type="text"
                          placeholder="자동 계산"
                          className="panel-result-input"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="panel-divider" />

                  <div className="chart-wrapper">
                    <div className="chart-box">
                      <span className="chart-placeholder-text">
                        AI 추천 vs 사용자 발전량 차트 공간
                      </span>
                    </div>
                    <div className="chart-box">
                      <span className="chart-placeholder-text">
                        설치 일치율 차트 공간
                      </span>
                    </div>
                  </div>

                  <div className="complete-button-wrapper">
                    <button
                      className="ai-input-button"
                      onClick={handleAIInference}
                    >
                      AI 자동 배치
                    </button>
                    <button
                      className="clear-ai-button"
                      onClick={() => setAiDetections([])}
                    >
                      AI 배치 취소
                    </button>
                    <button
                      className="complete-button"
                      onClick={() => navigate("/result")}
                    >
                      배치 완료
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 일조량 버튼 */}
            <div className="sunlight-filter-button">
              <button className="filter-button">
                <img src={sunlight_btn} alt="일조량 버튼" />
              </button>
            </div>
            <div className="switch-btn">
              <button className="switch-button">
                <img src={mapswitch} alt="맵 전환 버튼" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// export default SimulationPage;
