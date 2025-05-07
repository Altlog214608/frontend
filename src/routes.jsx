import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/layouts/Layout';

import HomePage from './pages/HomePage';
import SimulationPage from './pages/SimulationPage';
import InfoPage from './pages/InfoPage';
import ResultPage from './pages/ResultPage';
import TestPage from './pages/TestPage';

const AppRoutes = () =>{
    return (
        <Routes>
            <Route element={<Layout />}>s
                <Route path="/" element={<HomePage/>}></Route>
                <Route path="/info" element={<InfoPage/>}></Route>
                <Route path="/simulation" element={<SimulationPage/>}></Route>
                <Route path="/result" element={<ResultPage/>}></Route>
                <Route path="/test" element={<TestPage />}></Route>
                {/* 페이지 추가시 여기에 추가 */}
            </Route>
        </Routes>
    );
};

export default AppRoutes;
