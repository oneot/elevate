/**
 * @file Home.jsx
 * @description Microsoft Elevate 홈페이지 컴포넌트.
 *
 * MapSection → 기능 카드 그리드 → 업데이트/행사 카드 → CopilotStudioSection →
 * MEESection → GlobalTrainingPartner 순으로 섹션을 구성한다.
 * URL hash(`#section-id`)로 진입하면 해당 섹션으로 자동 스크롤한다.
 */
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE, SITE_NAME, canonicalUrl } from '../constants/seo';

// Icons
import copilotIcon from '../assets/NewMicrosoft365Icons/copilot-logo-500.png';
import m365Icon from '../assets/NewMicrosoft365Icons/m365-copilot-logo-500.png';
import copilotStudioIcon from '../assets/NewMicrosoft365Icons/copilotstudio.png';
import teamsIcon from '../assets/NewMicrosoft365Icons/Teams_512.png';
import minecraftIcon from '../assets/NewMicrosoft365Icons/minecraft.png';
import excelIcon from '../assets/NewMicrosoft365Icons/Excel_512.png';
import onenoteIcon from '../assets/NewMicrosoft365Icons/OneNote_512.png';

// Components
import Navigation from '../components/layout/Navigation';
import MapSection from '../components/home/MapSection';
import CopilotStudioSection from '../components/home/CopilotStudioSection';
import Footer from '../components/layout/Footer';
import FeatureCard from '../components/home/FeatureCard';
import MEESection from '../components/home/MEESection';
import GlobalTrainingPartner from '../components/home/GlobalTrainingPartner';

import ChatWidget from '../components/common/ChatWidget';

// Hooks
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useMobileRevealAnimation } from '../hooks/useMobileRevealAnimation';
import { useHeroAnimation } from '../hooks/useHeroAnimation';

const Home = () => {
    const location = useLocation();

    // 애니메이션 훅 적용
    useScrollAnimation();
    useMobileRevealAnimation();
    useHeroAnimation();

    // /# 로 들어오면 해당 섹션으로 스크롤
    useEffect(() => {
        if (location.hash) {
            requestAnimationFrame(() => {
                const id = location.hash.replace('#', '');
                const el = document.getElementById(id);
                if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        }
    }, [location.hash]);
    // 기능 카드 데이터
    // mdColSpan: md(768px+) 6열 그리드에서의 col-span 클래스 — 2-3-2 레이아웃
    //   행1 (M365·Copilot)                       → col-span-3 (2카드)
    //   행2 (CopilotStudio·Teams·MinecraftEDU)   → col-span-2 (3카드)
    //   행3 (Excel·OneNote)                      → col-span-3 (2카드)
    const features = [
        {
            title: 'M365',
            description: '수업 준비, 협업, 평가까지 교실에 필요한 모든 도구를 한 곳에 모았습니다.<br/>Microsoft 365 하나로 끊김 없는 수업을 시작하세요.',
            icon: m365Icon,
            iconType: 'image',
            to: '/m365',
            colorScheme: 'orange',
            ariaLabel: 'M365 개요 페이지로 이동',
            mdColSpan: 'col-span-1 sm:col-span-1 md:col-span-3'
        },
        {
            title: 'Copilot',
            description: 'AI가 수업 자료 제작과 행정 업무를 돕고, 학생들의 아이디어를 함께 확장합니다.<br/>Microsoft Copilot과 함께 가르치는 시간을 되찾으세요.',
            icon: copilotIcon,
            iconType: 'image',
            to: '/copilot',
            colorScheme: 'blue',
            ariaLabel: 'Copilot 페이지로 이동',
            mdColSpan: 'col-span-1 sm:col-span-1 md:col-span-3'
        },
        {
            title: 'Copilot Studio',
            description: '학생들이 자신만의 AI 에이전트를 만들고 문제 해결에 활용할 수 있습니다.<br/>Microsoft Copilot Studio로 학생의 아이디어가 현실이 되는 미래형 수업을 시작하세요.',
            icon: copilotStudioIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/copilot-studio',
            colorScheme: 'violet',
            ariaLabel: 'Copilot Studio 페이지로 이동',
            mdColSpan: 'col-span-1 sm:col-span-1 md:col-span-2'
        },
        {
            title: 'Microsoft Teams',
            description: '수업에 필요한 모든 소통이 한 공간에서 연결됩니다.<br/>Microsoft Teams와 함께하는 수업을 시작하세요.',
            icon: teamsIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/teams',
            colorScheme: 'indigo',
            ariaLabel: 'Microsoft Teams 페이지로 이동',
            mdColSpan: 'col-span-1 sm:col-span-1 md:col-span-2'
        },
        {
            title: 'Minecraft EDU',
            description: '블록으로 만든 가상 세계에서 학생들이 코딩과 AI를 직접 다루며 문제 해결력을 키웁니다.<br/>Minecraft Education과 함께 놀이로 배우는 수업을 시작하세요.',
            icon: minecraftIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/minecraft',
            colorScheme: 'green',
            ariaLabel: 'Minecraft EDU 페이지로 이동',
            mdColSpan: 'col-span-1 sm:col-span-1 md:col-span-2'
        },
        {
            title: 'Excel',
            description: '성적, 출석, 설문 결과까지 수업에서 다루는 모든 데이터를 표로 정리하고 분석합니다.<br/>Microsoft Excel로 수업 데이터를 한눈에 살펴보세요.',
            icon: excelIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/excel',
            colorScheme: 'emerald',
            ariaLabel: 'Excel 페이지로 이동',
            mdColSpan: 'col-span-1 sm:col-span-1 md:col-span-3'
        },
        {
            title: 'OneNote',
            description: '수업 노트, 학생 과제, 공동 작업을 한 권의 디지털 노트북에 담습니다.<br/>Microsoft OneNote와 함께 흩어진 수업 기록을 한 권에 모아보세요.',
            icon: onenoteIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/onenote',
            colorScheme: 'violet',
            ariaLabel: 'OneNote 페이지로 이동',
            mdColSpan: 'col-span-1 sm:col-span-1 md:col-span-3'
        }
    ];

    return (
        <div className="relative min-h-screen font-sans selection:bg-ms-blue/20 selection:text-ms-blue">
            <Helmet>
                <title>{DEFAULT_TITLE}</title>
                <meta name="description" content={DEFAULT_DESCRIPTION} />
                <link rel="canonical" href={canonicalUrl('/')} />
                <meta property="og:site_name" content={SITE_NAME} />
                <meta property="og:title" content={DEFAULT_TITLE} />
                <meta property="og:description" content={DEFAULT_DESCRIPTION} />
                <meta property="og:url" content={canonicalUrl('/')} />
                <meta property="og:image" content={DEFAULT_OG_IMAGE} />
                <meta property="og:type" content="website" />
                <meta property="og:locale" content="ko_KR" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={DEFAULT_TITLE} />
                <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
                <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
            </Helmet>

            {/* Background Blobs */}
            <div className="pastel-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <Navigation />

            <MapSection />

            {/* Microsoft 365 Section */}
            <section id="m365-section" className="py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="mb-10 md:mb-12 text-center fade-in-section">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 md:mb-6 tracking-tight text-slate-900">Explore Microsoft AI</h2>
                    <p className="text-slate-500 text-base sm:text-lg">교실 속 작은 변화를 돕는 실용적인 AI 도구들을 만나보세요.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-6 md:gap-8 auto-rows-auto sm:auto-rows-[240px]">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            {...feature}
                            wrapperClassName={feature.mdColSpan}
                        />
                    ))}
                </div>
            </section>

            {/* Microsoft365 Update & Program News Section */}
            <section id="microsoft365-update" className="py-12 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Microsoft365 Update Card */}
                    <a href="/update"
                        className="group block rounded-[2rem] bg-white border border-white/30 p-6 min-h-[120px] flex flex-col items-start justify-center text-left shadow-[0_6px_28px_0_rgba(0,0,0,0.10),0_1.5px_6px_0_rgba(0,0,0,0.06)] hover:shadow-[0_6px_28px_0_rgba(0,0,0,0.20),0_1.5px_6px_0_rgba(0,0,0,0.12)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 relative overflow-hidden"
                    >
                        <div className="flex items-center mb-3">
                            <span className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mr-3 shadow-lg shadow-orange-100 border border-white text-3xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-slate-50 group-hover:shadow-orange-200/80">
                                📰
                            </span>
                            <h3 className="text-xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">AI & M365 최신 정보</h3>
                        </div>
                        <p className="text-slate-700/80 font-medium mb-4 text-[15px]">Microsoft 제품 업데이트 소식을 확인해보세요.</p>
                        <span className="text-orange-600 font-bold text-xs opacity-100 translate-x-0 sm:opacity-0 sm:translate-x-[-10px] sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">더 알아보기 <span aria-hidden>→</span></span>
                    </a>

                    {/* Program News Card */}
                    <a href="/program-news"
                        className="group block rounded-[2rem] bg-white border border-white/30 p-6 min-h-[120px] flex flex-col items-start justify-center text-left shadow-[0_6px_28px_0_rgba(0,0,0,0.10),0_1.5px_6px_0_rgba(0,0,0,0.06)] hover:shadow-[0_6px_28px_0_rgba(0,0,0,0.20),0_1.5px_6px_0_rgba(0,0,0,0.12)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-200 relative overflow-hidden"
                    >
                        <div className="flex items-center mb-3">
                            <span className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mr-3 shadow-lg shadow-blue-100 border border-white text-3xl transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-slate-50 group-hover:shadow-blue-200/80">
                                📢
                            </span>
                            <h3 className="text-xl font-bold text-sky-600 group-hover:text-sky-700 transition-colors">행사 및 프로그램 소식</h3>
                        </div>
                        <p className="text-slate-700/80 font-medium mb-4 text-[15px]">Microsoft Elevate와 함께하는 프로그램 & 행사 소식을 알아보세요.</p>
                        <span className="text-sky-600 font-bold text-xs opacity-100 translate-x-0 sm:opacity-0 sm:translate-x-[-10px] sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300 flex items-center gap-1">더 알아보기 <span aria-hidden>→</span></span>
                    </a>
                </div>
            </section>

            <section id="agenthon">
            <CopilotStudioSection />
            </section>

            <section id="mee">
                <MEESection />
            </section>
            
            <GlobalTrainingPartner />

            <Footer />
            <ChatWidget />
        </div>
    );
};

export default Home;
