// IntroPopup.jsx
import React from 'react';
import '../components/common/css/IntroPopup.css';

const IntroPopup = ({ onClose }) => {
  return (
    <div className="intro-modal-overlay">
      <div className="intro-modal">
        <button className="intro-modal-close" onClick={onClose}>✕</button>
        <div className="intro-modal-content">
          <div className="intro-modal-left">
            <h2>탄소중립과 신재생에너지</h2>
            <div className="underline" />
            <p>우리나라는 전력 생산 과정에서 많은 온실가스를 배출하고 있습니다.</p>
            <p>특히 화석연료를 이용한 발전 방식은 온실가스 배출량의 큰 비중(약 36%)을 차지합니다.</p>
            <p>탄소중립을 위해서는 배출되는 온실가스의 양을 줄여야합니다. 이를 위해서는 에너지 생산 방식의 전환이 필수적입니다.</p>
            <p>신재생에너지는 발전과정에서 이산화탄소를 거의 배출하지 않기 때문에, 탄소중립 목표를 달성하기 위한 핵심수단으로 꼽힙니다.</p>
            <p>우리 프로젝트는 신재생에너지 발전 방법 중 태양광 발전에 초점을 두었습니다.</p>
          </div>
          <div className="intro-modal-right">
            <h2>탄소중립이란?</h2>
            <div className="underline" />
            <p>*탄소중립은 대기 중 온실가스 농도가 인간 활동에 의해 더 증가되지 않도록 순배출량이 0이 되도록 하는 것입니다.</p>
            <p>‘넷제로(Net-Zero)’라고도 하며, 배출량과 흡수량의 균형을 맞춰야 달성됩니다.</p>
            <div className="graph-img" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroPopup;