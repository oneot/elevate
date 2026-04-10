import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Icons
import copilotIcon from '../assets/NewMicrosoft365Icons/copilot-logo-500.png';
import m365Icon from '../assets/NewMicrosoft365Icons/m365-copilot-logo-500.png';
import teamsIcon from '../assets/NewMicrosoft365Icons/Teams_512.png';
import minecraftIcon from '../assets/NewMicrosoft365Icons/minecraft.png';
import excelIcon from '../assets/NewMicrosoft365Icons/Excel_512.png';
import onenoteIcon from '../assets/NewMicrosoft365Icons/OneNote_512.png';

// Components
import Navigation from '../components/Navigation';
import MapSection from '../components/MapSection';
import CopilotStudioSection from '../components/CopilotStudioSection';
import Footer from '../components/Footer';
import ChatWidget from '../components/ChatWidget';
import FeatureCard from '../components/FeatureCard';
import MEESection from '../components/MEESection';
import GlobalTrainingPartner from '../components/GlobalTrainingPartner';

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
    const features = [
        {
            title: 'M365',
            description: '교실 운영을 통합하고 학습 활동을 지속적으로 이어가는 방법을 소개합니다.',
            icon: m365Icon,
            iconType: 'image',
            to: '/m365',
            colorScheme: 'orange',
            ariaLabel: 'M365 개요 페이지로 이동'
        },
        {
            title: 'Copilot',
            description: '선생님의 업무 시간은 줄이고, 학생들의 창의력은 확장합니다.',
            icon: copilotIcon,
            iconType: 'image',
            to: '/copilot',
            colorScheme: 'blue',
            ariaLabel: 'Copilot 페이지로 이동'
        },
        {
            title: 'Microsoft Teams',
            description: '수업에 필요한 모든 소통이 한 공간에서 연결됩니다.<br/>Microsoft Teams와 함께하는 수업을 시작하세요.',
            icon: teamsIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/teams',
            colorScheme: 'indigo',
            ariaLabel: 'Microsoft Teams 페이지로 이동'
        },
        {
            title: 'Minecraft EDU',
            description: '학생들은 탐험하고, 설계하고, 실험하며<br/>AI를 활용해 문제를 해결하는 법을 배웁니다.',
            icon: minecraftIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/minecraft',
            colorScheme: 'green',
            ariaLabel: 'Minecraft EDU 페이지로 이동'
        },
        {
            title: 'Excel',
            description: '교실과 실무에서 유용한 Excel 팁과 템플릿을 공유합니다.',
            icon: excelIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/excel',
            colorScheme: 'emerald',
            ariaLabel: 'Excel 페이지로 이동'
        },
        {
            title: 'OneNote',
            description: '교수·학습 기록과 협업을 돕는 OneNote 활용 사례입니다.',
            icon: onenoteIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/onenote',
            colorScheme: 'violet',
            ariaLabel: 'OneNote 페이지로 이동'
        }
    ];

    return (
        <div className="relative min-h-screen font-sans selection:bg-ms-blue/20 selection:text-ms-blue">
            <Helmet>
                <title>Microsoft Elevate | AI for ALL</title>
                <meta name="description" content="교육 현장을 위한 Microsoft AI 솔루션. M365와 Copilot으로 시작하는 모두를 위한 AI 교육 환경." />
                <meta property="og:title" content="Microsoft Elevate | AI for ALL" />
                <meta property="og:description" content="교육 현장을 위한 Microsoft AI 솔루션. M365와 Copilot으로 시작하는 모두를 위한 AI 교육 환경." />
                <meta property="og:image" content="https://raw.githubusercontent.com/oneot/elevate/main/Elevate.Web/public/elevate-og.png" />
                <meta property="og:type" content="website" />
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-auto sm:auto-rows-[240px]">
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={index}
                            {...feature}
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
                            <h3 className="text-xl font-bold text-orange-600 group-hover:text-orange-700 transition-colors">업데이트 소식</h3>
                        </div>
                        <p className="text-slate-700/80 font-medium mb-4 text-[15px]">Microsoft 제품 업데이트 소식을 매주 수요일에 이곳에서 받아보세요.</p>
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
                            <h3 className="text-xl font-bold text-sky-600 group-hover:text-sky-700 transition-colors">행사 소식</h3>
                        </div>
                        <p className="text-slate-700/80 font-medium mb-4 text-[15px]">Microsoft Elevate와 함께하는 행사 소식을 알아보세요.</p>
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