import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/common/css/HomePage_CSS.css';

// 이미지 임포트
import green_intro from '../assets/HomePage/intro_green.png';
import carbon_intro from '../assets/HomePage/carbon_intro.png';
import new_energy from '../assets/HomePage/new_energy.png';
import solar_power from '../assets/HomePage/solar_power.png';

const HomePage = () => {
  const navigate = useNavigate();
  const sectionRefs = useRef([]); // 각 섹션의 참조를 저장할 ref

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
      {/* Section 1: 탄소 중립 섹션 */}
      <section className="section section1 section-white" ref={el => (sectionRefs.current[0] = el)}>
        <div className='top-overlay'>
        {/* <img src={green_intro} alt="배경 상단 이미지" className="top-overlay" /> */}
        </div>
        <div className='bottom-overlay'>
          <div>
          {/* <img src={carbon_intro} alt="탄소중립 소개" className="intro-image clickable" /> */}
          <div className='intro'>
            <div className='text_title3'>
              <h2>탄소중립이란?</h2>
            </div>
            <div className='underline3'></div>
            <div className='text_4'>
              <p>*탄소중립은 대기 중 온실가스 농도가 인간 활동에 의해 더 증가되지 않도록 순배출량이 0이 되도록 하는 것으로 ‘넷제로(Net-Zero)’라고도 부른다. </p>
              <p>특정 기간에 인간 활동에 의한 온실가스 배출량이 전 지구적 흡수량과 균형을 이룰 때 탄소중립이 달성된다.</p>
            </div>
          </div>
          <div className='graph'></div>
          </div>

        </div>
      </section>

      {/* Section 2: 신재생 에너지 소개 섹션 */}
      <section className="section section2" ref={el => (sectionRefs.current[1] = el)}>
        {/* <img src={new_energy} alt="신재생 에너지" className="fullscreenA-img clickable" /> */}
        <div className="text-overlay">
          <div className='text_title1'>
            <h2>탄소중립과 신재생에너지</h2>
          </div>
          <div className='underline' ></div>
          <div className='text_1'>
            <br></br>
          <p>우리나라는 전력 생산 과정에서 많은 온실가스를 배출하고 있습니다. </p>
            <p>특히 화석연료를 이용한 발전 방식은 온실가스 배출량의 큰 비중(약 36%)을 차지합니다.</p>
            <br></br>
          <p>탄소중립을 위해서는 배출되는 온실가스의 양을 줄여야합니다. 이를 위해서는 에너지 생산
            방식의 전환이 필수적입니다.</p>
            <br></br>
          <p>신재생에너지는 발전과정에서 이산화탄소를 거의 배출하지 않기 때문에, 탄소중립 목표를
            달성하기 위한 핵심수단으로 꼽힙니다.</p>
            <br></br>
          <p>정부도 2050년 탄소중립을 목표로 삼고 있으며, 화석연료 발전을 단계적으로 감축하고,
            신재생에너지 비중을 대폭 확대하려는 계획을 수립하고 있습니다.
          </p>
          <br></br>
          <p>우리 프로젝트는 신재생에너지 발전 방법 중 태양광 발전에 초점을 두었습니다.</p>
          </div>
        </div>
      
      </section>

      {/* Section 3: 태양광 에너지 섹션 */}
      <section className="section section3" ref={el => (sectionRefs.current[2] = el)}>
        {/* <img src={solar_power} alt="태양광 관련" className="fullscreenA-img solar-img" /> */}

        {/* 텍스트 설명 영역 */}
        <div className="text-overlay solar-text">
          <div className='text_title2'>
            <h2>태양광 에너지</h2>
          </div>
          <div className="underline2" />
          <div className='text_2'>
            <p>태양광 발전 시스템을 이용하여 빛 에너지를 모아 전기로 바꾸는 것입니다.</p>
            <p>따라서, 일사량/일조량이 많으면 더 많은 전력을 생산할 수 있습니다.</p>
            <br />
            <p>우리 프로그램은 AI가 일조량, 기후 등을 학습하여 효율 좋은 배치를 추천합니다.</p>
          </div>
          <br /><br />
          <div className='text_title3'>
            <h4>* 국내 태양광 발전소 현황</h4>
          </div>
          <div className='text_3'>  
            <p>태양광 발전소 개소: 약 17만 개소</p>
            <p>태양광 발전소 용량: 약 27,000 MW</p>
            <p>연간 태양광 발전량: 약 2,800만 MWh</p>
          </div>

        </div>

        {/* 버튼 그룹: '더 알아보기' 및 '시뮬레이션 체험하기' 버튼 */}
        <div className="button-group">
          <button className="custom-btn" onClick={() => navigate('/info')}>
            더 알아보기 →
          </button>
          <button className="custom-btn" onClick={() => navigate('/simulation')}>
            시뮬레이션 체험하기 →
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
