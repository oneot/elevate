/**
 * @file MapSection.jsx
 * @description 홈페이지 히어로 섹션 — 한국 지도 인터랙션과 교육청 링크를 포함한다.
 *
 * 768px 이상에서는 왼쪽 문구·오른쪽 지도로 나란히 놓고 화면 폭에 맞춰 함께 줄어들며,
 * 그보다 좁은 화면(모바일)에서는 문구 아래에 지도를 세로로 쌓는다.
 * 문구는 항상 왼쪽 정렬이며, 중간 화면(768~1359px)에서는 문구와 지도를 한 묶음으로 화면 가운데에 둔다.
 * 사용자가 지도의 교육청 핀 위에 마우스를 올리면 툴팁이 표시되고,
 * 클릭 시 해당 교육청의 Microsoft 365 포털로 이동한다.
 * 모바일(coarse pointer)에서는 confirm 다이얼로그로 이동 의사를 확인한다.
 */
import { useState, useRef } from 'react';
import KoreaMap from './KoreaMap';
import MapTooltip from './MapTooltip';
import { offices, officeNames } from '../../constants/offices';
import { normalizeUrl } from '../../utils/url';
import feelingsMonster from '../../assets/FeelingsMonster.png';

// useHeroAnimation이 `.hero-text > *`의 opacity/transform을 순서대로 풀어 준다.
const heroReveal = (delay) => ({
    opacity: 0,
    transform: 'translateY(30px)',
    transition: `opacity 1s ease-out ${delay}s, transform 1s ease-out ${delay}s`,
});

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
        
        // 핀 반지름만큼 위로 오프셋하여 툴팁이 핀 위에 떠 보이게 한다.
        const pinRadius = parseFloat(e.target.getAttribute('r')) || 8;
        const tooltipOffset = pinRadius + 35;
        
        // 좌표는 mapContainer 기준 상대 위치로 변환한다.
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

        // 모바일(coarse pointer): 새 탭 이동 전 confirm으로 사용자 의사를 확인한다.
        // 데스크톱: hover로 이미 인지한 상태이므로 즉시 새 탭으로 이동한다.
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
        <section id="map-section" className="ehome-hero">
            <div className="ehome-wrap ehome-hero__inner">
                <div className="ehome-hero__text hero-text">
                    <h1 className="ehome-hero__title" style={heroReveal(0.1)}>
                        <span>교실의 미래,</span>
                        <span><span className="ehome-hero__gradient">Microsoft AI</span>가</span>
                        <span>함께합니다.</span>
                    </h1>

                    <p className="ehome-hero__lead" style={heroReveal(0.25)}>
                        모두를 위한 AI 교육 환경,<br />M365와 Copilot으로 바로 시작해 보세요!<br />
                        <strong>교육용 계정 생성을 위해 지도에서 교육청을 선택해주세요.</strong>
                    </p>

                    {/* 계정 도움말 카드 — 기존 유리 카드 디자인 그대로 */}
                    <div className="ehome-hero__help w-full max-w-[420px]" style={heroReveal(0.4)}>
                        <a
                            href="/m365/signup"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ehome-help-card py-4 group relative overflow-hidden bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/60 border-b-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.9)] flex items-center gap-5 w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-white/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,1)] cursor-pointer card-link outline-none"
                        >
                            <div className="ehome-help-card__icon w-16 h-16 bg-white/60 rounded-2xl p-2 shadow-sm border border-white/80 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 shrink-0">
                                <img src={feelingsMonster} alt="Student icon" decoding="async" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex flex-col items-start text-left w-full">
                                <h3 className="ehome-card-title ehome-card-title--sm break-keep">
                                    교육용 계정 관련 도움이 필요하신가요?
                                </h3>
                                <div className="ehome-help-card__more w-full mt-2 overflow-hidden">
                                    <div className="text-sm font-bold flex justify-start transition-all duration-800 ease-[cubic-bezier(0.16,1,0.3,1)] text-blue-600 group-hover:translate-x-[calc(97%-85px)] group-hover:text-blue-900">
                                        더 알아보기 →
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>

                {/* 오른쪽(모바일은 아래) 지도 영역 */}
                <div
                    ref={mapContainerRef}
                    className="ehome-map map-container"
                    style={{ opacity: 0, transform: 'scale(0.95)', transition: 'opacity 1.2s ease-out 0.3s, transform 1.2s ease-out 0.3s' }}
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
            </div>
        </section>
    );
};

export default MapSection;
