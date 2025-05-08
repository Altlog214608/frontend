import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/common/css/HomePage_CSS.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import IntroPopup from './IntroPopup.jsx';


const HomePage = () => {
  const navigate = useNavigate();
  const sectionRefs = useRef([]); // 각 섹션의 참조를 저장할 ref
  const [showIntro, setShowIntro] = useState(false);

  const settings = {
    dots: true,           // 하단 점 네비게이션 표시
    infinite: true,       // 무한 루프
    speed: 800,           // 전환 속도
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,       // ✅ 자동 슬라이드
    autoplaySpeed: 3000,  // ✅ 3초마다 전환
    arrows: true          // ✅ 양 옆 화살표 보이기
  };

  useEffect(() => {
    // IntersectionObserver를 사용하여 섹션이 화면에 들어오면 'visible' 클래스 추가
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');  // 섹션이 뷰포트에 들어오면 'visible' 클래스 추가
          } else {
            entry.target.classList.remove('visible');  // 섹션이 뷰포트를 벗어나면 'visible' 클래스 제거
          }
        });
      },
      { threshold: 0.1 } // 10% 이상 보일 때 'visible' 클래스를 추가
    );

    // 각 섹션을 관찰
    sectionRefs.current.forEach(section => {
      if (section) observer.observe(section);
    });

    // 컴포넌트 언마운트 시 IntersectionObserver를 정리
    return () => {
      sectionRefs.current.forEach(section => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="Home-container">
      <div className="slider-container">
        <div className="slider-overlay-text">ECOSOLAR
          <p>계룡건설 GreenTech sw 개발자 과정</p>
        </div>
        <Slider {...settings}>
          <div className="slide"><img src={require('../assets/HomePage/renewable_energy.png')} alt="slide1" /></div>
          <div className="slide"><img src={require('../assets/HomePage/solar_power_background.png')} alt="slide2" /></div>
          <div className="slide slide-blur"><img src={require('../assets/HomePage/back-slider-1.jpg')} alt="slide3" /></div>
          <div className="slide slide-blur"><img src={require('../assets/HomePage/back-slider-2.jpg')} alt="slide4" /></div>
          <div className="slide slide-blur"><img src={require('../assets/HomePage/back-slider-3.jpg')} alt="slide5" /></div>
        </Slider>
      </div>

      <div className='card-background'>
        <div className="card-title-overlay-wrapper">
          <h1 className="card-title-overlay">기능소개</h1>
        </div>
        <div className="card-container">
          <div className="card" onClick={() => setShowIntro(true)}>
            <img src={require('../assets/HomePage/solar-pannel-1.jpg')} alt="Intro" />
            <div className="card-overlay">
              <p className="card-title">소개</p>
              <p className="card-sub">Introduction</p>
            </div>
          </div>

          <div className="card" onClick={() => navigate('/info')}>
            <img src={require('../assets/HomePage/solar-pannel-2.jpg')} alt="info" />
            <div className="card-overlay">
              <p className="card-title">info</p>
              <p className="card-sub">info</p>
            </div>
          </div>

          <div className="card" onClick={() => navigate('/simulation')}>
            <img src={require('../assets/HomePage/solar-pannel-3.jpg')} alt="Simulation" />
            <div className="card-overlay">
              <p className="card-title">시뮬레이션</p>
              <p className="card-sub">Simulation</p>
            </div>
          </div>
        </div>
      </div>

      {showIntro && <IntroPopup onClose={() => setShowIntro(false)} />}
    </div>
  );
};

export default HomePage;
