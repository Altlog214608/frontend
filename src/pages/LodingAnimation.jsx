import React from "react";
import Lottie from "lottie-react";
import sunMoonLoader from "../assets/SimulationPage/sun-anime.json";

const LoadingAnimation = () => {
  return (
    <div style={{ 
      position: "fixed", 
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(255, 255, 255, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999
    }}>
      <Lottie 
        animationData={sunMoonLoader} 
        style={{ width: 200, height: 200 }} 
        loop 
      />
    </div>
  );
};

export default LoadingAnimation;
