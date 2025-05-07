import React, { useEffect } from 'react'; // useEffect 추가
import '../components/common/css/Info_CSS.css';
import IndustryUsageChart from '../components/charts/IndustryUsageChart';
import UsageCompareChart from '../components/charts/UsageCompareChart';
import EnergySourceChart from '../components/charts/EnergySourceChart';
import RenewableChart from '../components/charts/RenewableChart';
import mapImg from '../assets/InfoPage/2page_map.png'
import chart_label1 from '../assets/InfoPage/chart_label1.png'
import chart_label2 from '../assets/InfoPage/chart_label2.png'
import chart_label3 from '../assets/InfoPage/chart_label3.png'
import chart_label4 from '../assets/InfoPage/chart_label4.png'

import KoreaMap from '../components/location/KoreaMap1';

const InfoPage = () => {
  useEffect(() => {
    const updateOverflow = () => {
      const isMobile = window.innerWidth <= 420;
      document.body.style.overflow = isMobile ? 'auto' : 'hidden';
    };
  
    updateOverflow();
    window.addEventListener('resize', updateOverflow);
  
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('resize', updateOverflow);
    };
  }, []);
  return (
    <div className="info-container">
      <div className="info-top-section">
        <div className="left-map">
        <div className='map-wrappers'>
          <div className='map-label'>
            <img src={mapImg} alt='지역별 전력 사용량 지도' />
          </div>
        </div>
          <div className='map-chart'>
              <KoreaMap/>
          </div>
        </div>
        <div className="vertical-divider" />
        <div className="right-top">
          <div className="top-charts">
            <div className='chartA'>
              <div className='chart_label1'> <img src={chart_label1} alt='업종별 전력 사용량'/> </div>
              <div className="chart"><IndustryUsageChart /></div>
            </div>
            <div className='chartB'>
              <div className='chart_label2'> <img src={chart_label2} alt='전력 사용량 비교'/> </div>
              <div className="chart"><UsageCompareChart /></div>
            </div>
          </div>
          
          
          <div className="horizontal-divider" />


          <div className="bottom-charts">
            <div className='chartC'>
              <div className='chart_label3'> <img src={chart_label3} alt='국내 에너지원별 발전 비율'/> </div>
              <div className="chart"><EnergySourceChart /></div>
            </div>
            <div className='chartD'>
              <div className='chart_label4'> <img src={chart_label4} alt='신재생 에너지 사용 비율'/> </div>
              <div className="chart"><RenewableChart /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
