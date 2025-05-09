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
  const cardContainerRef = useRef(null);
  const cardTitleRef = useRef(null);
  const [videoKey, setVideoKey] = useState(0);
  const isHoveringRef = useRef(false);

  const handleMouseEnter = async (e) => {
    isHoveringRef.current = true;
    const video = e.target;
    try {
      video.currentTime = 0;
      video.playbackRate = 1.5;
      await video.play(); // 🎯 play 중에 마우스 벗어날 수도 있음
    } catch (err) {
      // 💥 play 실패 시 무시
      console.warn('Video play() interrupted', err.message);
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    setTimeout(() => {
      if (!isHoveringRef.current) {
        setVideoKey(prev => prev + 1); // 마우스가 떠나있을 때만 교체
      }
    }, 100); // 살짝 지연시켜 play 중인 경우 완전히 끝내도록 유도
  };

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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      },
      { threshold: 0.2 }
    );

    if (cardTitleRef.current) {
      observer.observe(cardTitleRef.current);
    }

    if (cardContainerRef.current) {
      observer.observe(cardContainerRef.current);
    }

    return () => {
      if (cardTitleRef.current) observer.unobserve(cardTitleRef.current);
      if (cardContainerRef.current) observer.unobserve(cardContainerRef.current);
    };
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll('.card');

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach((card, index) => {
      card.style.transitionDelay = `${index * 0.3}s`; // 순차 등장
      observer.observe(card);
    });

    return () => {
      cards.forEach(card => observer.unobserve(card));
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
          <h1
            className="card-title-overlay"
            ref={cardTitleRef}
          >
            기능소개
          </h1>
        </div>

        <div className="card-container" ref={cardContainerRef}>
          <div className="card" onClick={() => setShowIntro(true)}>
            <video
              key={videoKey} // key 바뀌면 컴포넌트 새로 생성됨
              src={require('../assets/HomePage/info_video_1.mp4')}
              poster={require('../assets/HomePage/solar-pannel-1.jpg')}
              className="card-video"
              muted
              preload="metadata"
              loop
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            <div className="card-overlay">
              <p className="card-title">소개</p>
              <p className="card-sub">Introduction</p>
              {/* ✅ CTA 버튼 */}
              <button className="card-cta-btn">소개 보기 →</button>
            </div>
          </div>

          <div className="card" onClick={() => navigate('/info')}>
            <video
              key={videoKey} // key 바뀌면 컴포넌트 새로 생성됨
              src={require('../assets/HomePage/chart_video_1.mp4')}
              poster={require('../assets/HomePage/solar-pannel-2.jpg')}
              className="card-video"
              muted
              preload="metadata"
              loop
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />


            <div className="card-overlay">
              <p className="card-title">대시보드</p>
              <p className="card-sub">dashboard</p>

            </div>
          </div>

          <div className="card" onClick={() => navigate('/simulation')}>
            <video
              key={videoKey} // key 바뀌면 컴포넌트 새로 생성됨
              src={require('../assets/HomePage/simul_video_1.mp4')}
              poster={require('../assets/HomePage/solar-pannel-3.jpg')}
              className="card-video"
              muted
              preload="metadata"
              loop
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />

            {/* ✅ 발전량 툴팁 추가 */}
            <div className="card-tooltip">
              예상 발전량: 4.2 kWh/day
            </div>

            <div className="card-overlay">
              <p className="card-title">시뮬레이션</p>
              <p className="card-sub">Simulation</p>
              <button className="card-cta-btn" onClick={() => navigate('/simulation')}>
                시뮬레이션 체험 →
              </button>
            </div>
          </div>
        </div>
        <div className="button-group">
          <button className="custom-btn" onClick={() => navigate('/info')}>
            대시보드 페이지로 이동 →
          </button>
          <button className="custom-btn" onClick={() => navigate('/simulation')}>
            시뮬레이션 체험하기 →
          </button>
        </div>
      </div>

      {showIntro && (
        <IntroPopup onClose={() => setShowIntro(false)}>
          {/* ✅ 여기 추가 */}
          <video
            src={require('../assets/HomePage/chart_video_1.mp4')}
            autoPlay
            muted
            loop
            style={{ width: '100%', borderRadius: '12px' }}
          />
        </IntroPopup>
      )}
    </div>
  );
};

export default HomePage;
