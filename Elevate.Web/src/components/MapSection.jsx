import { useState, useRef } from 'react';
import KoreaMap from './KoreaMap';
import MapTooltip from './MapTooltip';
import { offices, officeNames } from '../constants/offices';
import { normalizeUrl } from '../utils/url';
import feelingsMonster from '../assets/FeelingsMonster.png';

const MapSection = () => {
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const mapContainerRef = useRef(null);

    const handleMapPointEnter = (e, key) => {
        const name = officeNames[key] || key || "지역";
        const mapRect = mapContainerRef.current.getBoundingClientRect();
        
        const circleRect = e.target.getBoundingClientRect();
        const circleCenterX = circleRect.left + circleRect.width / 2;
        const circleCenterY = circleRect.top + circleRect.height / 2;
        
        const pinRadius = parseFloat(e.target.getAttribute('r')) || 8;
        const tooltipOffset = pinRadius + 35;
        
        setTooltip({
            visible: true,
            x: circleCenterX - mapRect.left,
            y: circleCenterY - mapRect.top - tooltipOffset,
            text: name
        });
        setHoveredRegion(key);
    };

    const handleMapPointMove = (e) => {
        if (!tooltip.visible) return;
        const mapRect = mapContainerRef.current.getBoundingClientRect();
        
        const circleRect = e.target.getBoundingClientRect();
        const circleCenterX = circleRect.left + circleRect.width / 2;
        const circleCenterY = circleRect.top + circleRect.height / 2;
        
        const pinRadius = parseFloat(e.target.getAttribute('r')) || 8;
        const tooltipOffset = pinRadius + 10;
        
        setTooltip(prev => ({
            ...prev,
            x: circleCenterX - mapRect.left,
            y: circleCenterY - mapRect.top - tooltipOffset,
        }));
    };

    const handleMapPointLeave = () => {
        setTooltip(prev => ({ ...prev, visible: false }));
        setHoveredRegion(null);
    };

    const handleMapPointClick = (key) => {
        const name = officeNames[key] || key;
        const url = normalizeUrl(offices[key]);
        if (!url) return;

        const isMobile = window.matchMedia("(pointer: coarse)").matches;
        if (isMobile) {
            if (window.confirm(`${name} 페이지로 이동하시겠습니까?`)) {
                window.open(url, "_blank", "noopener,noreferrer");
            }
        } else {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <section id="map-section" className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-6 pt-24 pb-12 gap-12">
            
            <div className="lg:w-1/2 z-10 hero-text">
                <div style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 1s ease-out' }} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-ms-blue text-xs font-bold mb-6 tracking-wide uppercase shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    AI for ALL
                </div>

                <h1 style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 1s ease-out 0.15s' }} className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-6 text-slate-900 tracking-tight">
                    교실의 미래,<br/>
                    <span className="text-gradient">Microsoft AI</span>가<br/>
                    함께합니다.
                </h1>

                <p style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 1s ease-out 0.3s' }} className="text-lg text-slate-500 mb-8 max-w-lg leading-relaxed font-medium">
                    모두를 위한 AI 교육 환경,<br/>M365와 Copilot으로 바로 시작해 보세요!<br/>
                    <span className="text-slate-900 font-bold underline decoration-ms-blue/30 decoration-4 underline-offset-4">
                        교육용 계정 생성을 위해 지도에서 교육청을 선택해주세요.
                    </span>
                </p>

                <div style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 1s ease-out 0.45s' }} className="w-full max-w-[420px]">
    <a 
        href="https://microsoft-elevate.com/m365/signup"
        target="_blank"
        rel="noopener noreferrer"
        className="py-4 group relative overflow-hidden bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 border-b-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center gap-5 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,1)] cursor-pointer card-link outline-none"
    >
        <div className="w-16 h-16 bg-white/60 rounded-2xl p-2 shadow-sm border border-white/80 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 shrink-0">
            <img src={feelingsMonster} alt="Student icon" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col items-start text-left w-full">
            <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                교육용 계정 관련 도움이 필요하신가요?
            </h3>
            <div className="w-full mt-2 overflow-hidden">
                <div className="text-sm font-bold 
                    flex justify-start
                    transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)]
                    text-blue-600
                    group-hover:translate-x-[calc(97%-85px)]
                    group-hover:text-blue-900"
                >
                    더 알아보기 →
                </div>
            </div>
        </div>
    </a>
</div>
            </div>

            {/* 오른쪽 지도 영역 */}
            <div 
                ref={mapContainerRef}
                className="lg:w-1/2 relative flex justify-center items-center h-[500px] lg:h-[750px] w-full map-container"
                style={{ opacity: 0, transform: 'scale(0.95)', transition: 'all 1.2s ease-out 0.3s' }}
            >
                <KoreaMap 
                    hoveredRegion={hoveredRegion}
                    onPointEnter={handleMapPointEnter}
                    onPointMove={handleMapPointMove}
                    onPointLeave={handleMapPointLeave}
                    onPointClick={handleMapPointClick}
                />
                <MapTooltip tooltip={tooltip} />
            </div>
        </section>
    );
};

export default MapSection;