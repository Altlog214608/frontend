// vmap.js
window.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const lat = parseFloat(params.get("lat")) || 37.5665;
    const lon = parseFloat(params.get("lon")) || 126.978;
  
    const mapOptions = {
      mapId: "vmap-container",
      mapMode: "ws3d-map",
      basemapType: vw.ol3.BasemapType.GRAPHIC,
      initPosition: new vw.CameraPosition(
        new vw.CoordZ(lon, lat, 400),
        new vw.Direction(0, -45, 0)
      ),
      logo: false,
      navigation: false,
    };
  
    try {
      const vmap = new vw.Map();
      vmap.setOption(mapOptions);
      vmap.start();
      console.log("🌍 VWORLD 3D 지도 초기화 완료");
  
      const waitForVW = setInterval(() => {
        if (typeof vw !== "undefined" && typeof vw.Map !== "undefined") {
          clearInterval(waitForVW);
  
          console.log("✅ VWORLD 준비됨. 분석 API 로딩 시작");
          const script = document.createElement("script");
          script.src =
            "https://map.vworld.kr/js/dtkmap/tool3d/libapis/sunlightrights/sunlightrights_analysis_api.js";
          script.onload = () => {
            console.log("✅ sunlightrights_analysis_api.js 로드 완료");
          };
          document.head.appendChild(script);
        }
      }, 100);
    } catch (e) {
      console.error("❌ VMap 초기화 실패:", e);
    }
  });
  
  window.addEventListener("message", function (event) {
    const { type, lat, lon, interval } = event.data;
  
    if (type === "MOVE_CAMERA") {
      moveTo(lon, lat, 400);
    }
  
    if (type === "SUNLIGHT_ANALYSIS") {
      startSunlightAnalysis(interval);
    }
  
    if (type === "SUNLIGHT_RESET") {
      resetSunlightResult();
    }
  });
  
  function moveTo(x, y, z) {
    const movePos = new vw.CoordZ(x, y, z);
    const mPosi = new vw.CameraPosition(movePos, new vw.Direction(0, -60, 0));
    vw.Camera.move(mPosi);
  }
  
  function startSunlightAnalysis(interval = "15") {
    if (typeof sunlightrightsAnalysis === "undefined") {
      console.error("❌ 분석 API가 아직 준비되지 않았습니다.");
      alert("일조 분석 기능이 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
  
    console.log("🟡 일조 분석 시작 요청 수신");
    sunlightrightsAnalysis.spotmarkerSunny =
      "https://map.vworld.kr/js/dtkmap/tool3d/libapis/sunlightrights/sunny.png";
  
    console.log("🟡 drawPointOnMap 실행 시작");
    sunlightrightsAnalysis.drawPointOnMap(function () {
      console.log("🟢 지점 선택 완료 - drawPointOnMap 콜백 진입");
      console.log(`🕑 분석 간격: ${interval}분`);
  
      console.log("🟡 runSunlightlights 실행");
      try {
        sunlightrightsAnalysis.runSunlightlights(interval, function (ResultInfo) {
          console.log("✅ runSunlightlights 콜백 도착");
  
          if (!ResultInfo || ResultInfo.length < 4) {
            console.error("❌ 분석 결과 부족 또는 실패", ResultInfo);
            return;
          }
  
          const [r0, r1, r2, r3] = ResultInfo;
  
          window.parent.postMessage(
            {
              type: "SUNLIGHT_RESULT",
              result: {
                sunrise: r0.sunrise_Time,
                sunset: r1.sunset_Time,
                total: r2.total_sunlight_Time,
                continuous: r3.continuous_sunlight_Time,
              },
            },
            "*"
          );
  
          console.log("📤 분석 결과 React로 전송 완료");
        });
      } catch (e) {
        console.error("❌ 분석 중 예외 발생", e);
      }
    });
  }

function resetSunlightResult() {
try {
    if (
    typeof sunlightrightsAnalysis !== "undefined" &&
    typeof sunlightrightsAnalysis.removeAncientLightObject === "function"
    ) {
    sunlightrightsAnalysis.removeAncientLightObject();
    console.log("✅ removeAncientLightObject() 호출됨 - 분석 시각화 초기화 완료");
    } else {
    console.warn("⚠️ removeAncientLightObject 함수가 정의되어 있지 않음");
    }
} catch (e) {
    console.error("❌ 분석 결과 초기화 중 오류 발생:", e);
}
}