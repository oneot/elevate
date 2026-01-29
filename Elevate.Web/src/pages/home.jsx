import { useEffect, useState, useRef } from 'react';

// Assets
import microsoftLogo from '../assets/Microsoft.png';
import feelingsMonster from '../assets/FeelingsMonster.png';

// Icons
import copilotIcon from '../assets/NewMicrosoft365Icons/copilot-logo-500.png';
import m365Icon from '../assets/NewMicrosoft365Icons/m365-copilot-logo-500.png';
import teamsIcon from '../assets/NewMicrosoft365Icons/Teams_512.png';
import minecraftIcon from '../assets/NewMicrosoft365Icons/minecraft.png';
import copilotStudioIcon from '../assets/NewMicrosoft365Icons/copilotstudio.png';

// Components
import KoreaMap from '../components/KoreaMap';

const Home = () => {
    // State for map tooltip
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const mapContainerRef = useRef(null);

    // Office URLs
    const offices = {
        Seoul: "https://o365.sen.go.kr",
        Incheon: "https://o365.ice.go.kr",
        Gyeonggi: "https://goedu.kr",
        Gangwon: "https://office365.gwe.go.kr",
        Sejong: "https://o365.sje.go.kr",
        Chungbuk: "https://cloud.cbe.go.kr",
        Chungnam: "https://o365.cne.go.kr",
        Daejeon: "https://www.dje365.kr",
        Gyeongbuk: "https://365.gyo6.net",
        Daegu: "https://o365.dge.go.kr",
        Ulsan: "https://o365.use.go.kr",
        Busan: "https://o365.pen.go.kr",
        Gyeongnam: "https://sw-ms.gne.go.kr",
        Jeonbuk: "https://getsw.jbe.go.kr",
        Jeonnam: "https://o365.jne.go.kr/",
        Gwangju: "https://o365.gen.go.kr",
        JeJu: "https://o365.jje.go.kr/",
    };

    const officeNames = {
        Gyeongnam: "경남교육청",
        Daegu: "대구교육청",
        Seoul: "서울교육청",
        Busan: "부산교육청",
        Incheon: "인천교육청",
        Gyeonggi: "경기교육청",
        Sejong: "세종교육청",
        Chungbuk: "충북교육청",
        Ulsan: "울산교육청",
        Chungnam: "충남교육청",
        Gyeongbuk: "경북교육청",
        JeJu: "제주교육청",
        Daejeon: "대전교육청",
        Jeonnam: "전남교육청",
        Jeonbuk: "전북교육청",
        Gwangju: "광주교육청",
        Gangwon: "강원교육청",
    };

    const normalizeUrl = (u) => {
        if (!u) return "";
        if (u.startsWith("http://") || u.startsWith("https://")) return u;
        return "https://" + u.replace(/^\/+/, "");
    };

    // Scroll Animation Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const sections = document.querySelectorAll('.fade-in-section');
        sections.forEach((section) => observer.observe(section));

        return () => sections.forEach((section) => observer.unobserve(section));
    }, []);

    // Mobile Reveal Card Observer
    useEffect(() => {
        const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (!isTouch) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add("in-view");
                    else entry.target.classList.remove("in-view");
                });
            },
            { rootMargin: "-35% 0px -35% 0px", threshold: 0.01 }
        );

        const cards = document.querySelectorAll(".reveal-card");
        cards.forEach((c) => observer.observe(c));

        return () => cards.forEach((c) => observer.unobserve(c));
    }, []);

    // Initial Animation
    useEffect(() => {
        const heroElements = document.querySelectorAll('.hero-text > *');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + index * 150);
        });

        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            setTimeout(() => {
                mapContainer.style.opacity = '1';
                mapContainer.style.transform = 'scale(1)';
            }, 300);
        }
    }, []);


    const handleMapPointEnter = (e, key) => {
        const name = officeNames[key] || key || "지역";
        const rect = mapContainerRef.current.getBoundingClientRect();
        
        setTooltip({
            visible: true,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 40,
            text: name
        });
        setHoveredRegion(key);
    };

    const handleMapPointMove = (e) => {
        if (!tooltip.visible) return;
        const rect = mapContainerRef.current.getBoundingClientRect();
        setTooltip(prev => ({
            ...prev,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top - 40,
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
        if (window.confirm(`${name} M365 지원 페이지로 이동하여\n계정 문제를 해결하시겠습니까?`)) {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <div className="relative min-h-screen font-sans selection:bg-ms-blue/20 selection:text-ms-blue">
            {/* Background Blobs */}
            <div className="pastel-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* Navigation */}
            <nav className="fixed w-full z-50 top-0 left-0 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg width="24" height="24" viewBox="0 0 23 23" fill="none">
                            <path d="M0 0H10.5V10.5H0V0Z" fill="#F25022"/>
                            <path d="M12.5 0H23V10.5H12.5V0Z" fill="#7FBA00"/>
                            <path d="M0 12.5H10.5V23H0V12.5Z" fill="#00A4EF"/>
                            <path d="M12.5 12.5H23V23H12.5V12.5Z" fill="#FFB900"/>
                        </svg>
                        <span className="text-xl font-bold tracking-tight text-slate-800">Microsoft <span className="font-normal text-slate-500">Elevate</span></span>
                    </div>

                    <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
                        <a href="#map-section" className="hover:text-ms-blue transition-colors">Account</a>
                        <a href="#m365-section" className="hover:text-ms-blue transition-colors">Product</a>
                        <a href="#studio-section" className="hover:text-ms-blue transition-colors">AI Skilling</a>
                    </div>

                    <a
                        href="https://forms.office.com/r/YvQz3WbhZt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-5 py-2.5 rounded-full
                                   bg-slate-900 text-white text-sm font-semibold
                                   hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/20"
                    >
                        Contact Us
                    </a>
                </div>
            </nav>

            {/* Hero Section (Map) */}
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
                            먼저, 지도에서 교육청을 선택해주세요.
                        </span>
                    </p>

                    <div style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 1s ease-out 0.45s' }} className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 flex items-start gap-4 w-full max-w-lg transform transition-transform hover:scale-105">
                        <img src={feelingsMonster} alt="Student icon" className="w-16 h-16 object-contain shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">학생 혹은 교원이신가요?</h3>
                            <p className="text-sm text-slate-500">
                                각 교육청 Microsoft 포털에서,
                                <br className="block sm:hidden" />
                                Microsoft AI를 바로 시작해보세요!
                            </p>
                        </div>
                    </div>
                </div>

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

                    <div 
                        id="tooltip" 
                        className="absolute bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl transition-opacity pointer-events-none z-20"
                        style={{
                            opacity: tooltip.visible ? 1 : 0,
                            left: `${tooltip.x}px`,
                            top: `${tooltip.y}px`,
                            transform: 'translateY(-10px)'
                        }}
                    >
                        <span>{tooltip.text}</span>
                        <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
                    </div>
                </div>
            </section>

            {/* Microsoft 365 Section */}
            <section id="m365-section" className="py-20 px-6 max-w-7xl mx-auto">
                <div className="mb-12 text-center fade-in-section">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">Explore Microsoft AI</h2>
                    <p className="text-slate-500 text-lg">교육 현장을 변화시키는 강력한 도구들을 만나보세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-auto sm:auto-rows-[240px]">
                    {/* Copilot */}
                    <div className="reveal-card clean-card rounded-[2.5rem] p-8 col-span-1 lg:col-span-1 row-span-1 lg:row-span-2 relative overflow-hidden group cursor-pointer fade-in-section bg-gradient-to-br from-white via-white to-blue-50 shadow-soft hover:shadow-hover transition-all duration-300">
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center mb-8 shadow-xl shadow-blue-200/50 border border-white overflow-hidden">
                                    <img src={copilotIcon}
                                         alt="Microsoft Copilot"
                                         className="w-14 h-14 object-contain group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900 tracking-tight">Microsoft Copilot</h3>
                                <p className="text-slate-500 text-lg leading-relaxed font-medium">
                                    선생님의 업무 시간은 줄이고,<br/>
                                    학생들의 창의력은 무한히 확장합니다.<br/>
                                    AI 비서와 함께하는 교실을 경험하세요.
                                </p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 flex items-center gap-2 text-ms-blue font-bold opacity-0 group-hover:opacity-100 group-hover:gap-4 transition-all duration-300 text-lg translate-x-[-10px] group-hover:translate-x-0">
                                더 알아보기 <span>→</span>
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl"></div>
                    </div>

                    {/* Microsoft 365 */}
                    <a href="https://github.com/oneot/elevate/blob/main/blog/01_CopilotStudioHandsOn.md" target="_blank" rel="noopener noreferrer" className="block h-full">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 col-span-1 row-span-1 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-orange-50 shadow-soft hover:shadow-hover transition-all duration-300">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg shadow-orange-100 border border-white">
                                    <img src={m365Icon} alt="M365" className="w-10 h-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Microsoft 365</h3>
                                <p className="text-sm text-slate-500">
                                    선생님의 교실 운영을 하나의 환경으로 통합하고,<br/>
                                    학생들의 학습 활동을 지속적으로 이어갑니다.
                                </p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 text-orange-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                더 알아보기 →
                            </div>
                        </div>
                    </a>

                    {/* Microsoft Teams */}
                    <a href="https://github.com/oneot/elevate/blob/main/blog/01_CopilotStudioHandsOn.md" target="_blank" rel="noopener noreferrer" className="block h-full">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 col-span-1 row-span-1 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-indigo-50 shadow-soft hover:shadow-hover transition-all duration-300">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-100 border border-white">
                                    <img src={teamsIcon} alt="Teams" className="w-9 h-9 group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-xl font-bold text-indigo-700">Microsoft Teams</h3>
                                <p className="text-sm text-slate-500">
                                    수업에 필요한 모든 소통이 한 공간에서 연결됩니다.<br/>
                                    Microsoft Teams와 함께하는 수업을 시작하세요.
                                </p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 text-indigo-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                더 알아보기 →
                            </div>
                        </div>
                    </a>

                    {/* Minecraft EDU */}
                    <a href="https://github.com/oneot/elevate/blob/main/blog/01_CopilotStudioHandsOn.md" target="_blank" rel="noopener noreferrer" className="block h-full">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 col-span-1 row-span-1 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-green-50 shadow-soft hover:shadow-hover transition-all duration-300">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg shadow-green-100 border border-white">
                                    <img src={minecraftIcon} alt="Minecraft" className="w-9 h-9 group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-xl font-bold text-green-700">Minecraft EDU</h3>
                                <p className="text-sm text-slate-500">
                                    학생들은 탐험하고, 설계하고, 실험하며<br/>
                                    AI를 활용해 문제를 해결하는 법을 배웁니다.
                                </p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 text-green-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                더 알아보기 →
                            </div>
                        </div>
                    </a>

                    {/* Elevate Blog */}
                    <a href="https://github.com/oneot/elevate/blob/main/blog/01_CopilotStudioHandsOn.md" target="_blank" rel="noopener noreferrer" className="block h-full">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 col-span-1 row-span-1 h-full flex flex-col justify-between group cursor-pointer fade-in-section bg-gradient-to-br from-white to-slate-100 shadow-soft hover:shadow-hover transition-all duration-300">
                            <div>
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 text-3xl shadow-md border border-white transition-all duration-300 ease-out group-hover:scale-110 group-hover:-translate-y-0.5 group-hover:bg-slate-50">
                                    📦
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">Elevate Blog</h3>
                                <p className="text-sm text-slate-500">
                                    Microsoft AI의 모든 리소스를 한 곳에서 확인하세요.
                                </p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 text-slate-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                전체 보기 →
                            </div>
                        </div>
                    </a>
                </div>
            </section>

            {/* Studio Section */}
            <section id="studio-section" className="py-20 px-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-[40px] p-10 lg:p-16 relative overflow-hidden text-center lg:text-left shadow-2xl border border-slate-100 fade-in-section">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-purple-100 via-pink-50 to-transparent rounded-full translate-x-1/4 -translate-y-1/4 z-0"></div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-2/3">
                            <span className="inline-block py-1 px-3 rounded-md bg-purple-100 text-purple-600 font-bold text-xs uppercase mb-4 tracking-wider">AI Skilling</span>
                            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">대한민국 AI Skilling,<br/>Copilot Agent로 시작합니다!</h2>
                            <p className="text-slate-600 text-base mb-10 leading-relaxed font-medium">
                                학생들과 교육자들이 직접 AI 에이전트를 만드는 해커톤
                                <span className="text-purple-600 font-bold">‘에이전톤’</span>에 도전하세요.<br/>
                                Copilot → Studio → Foundry로 이어지는 
                                <span className="text-purple-600 font-bold"> AI 제작 3단계 여정</span>은
                                AI를 User가 아닌,<br/>
                                <span className="text-purple-600 font-bold">Creator</span>로 성장할 수 있는 구조를 제공합니다.
                            </p>
                            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                                <a
                                    href="https://forms.office.com/r/YvQz3WbhZt"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center
                                             bg-slate-900 text-white px-8 py-3.5 rounded-full
                                             font-bold
                                             hover:bg-slate-800 transition-all
                                             shadow-lg hover:shadow-xl hover:-translate-y-1"
                                >
                                    에이전톤 문의하기
                                </a>
                                <a
                                    href="https://github.com/oneot/elevate/blob/main/blog/01_CopilotStudioHandsOn.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center
                                             bg-white border-2 border-slate-200 text-slate-700
                                             px-8 py-3.5 rounded-full font-bold
                                             hover:bg-slate-50 hover:border-slate-300
                                             transition-all"
                                >
                                    Copilot Studio
                                </a>
                            </div>
                        </div>

                        <div className="lg:w-1/3 flex justify-center">
                            <div className="relative w-56 h-56 
                                            bg-gradient-to-br from-purple-200 to-indigo-300 
                                            rounded-[3rem] shadow-2xl shadow-purple-200 
                                            flex items-center justify-center 
                                            transform rotate-6 hover:rotate-0 transition-all duration-500 
                                            cursor-pointer group">
                                
                                <div className="absolute inset-0 bg-white/30 rounded-[3rem] blur-xl"></div>
                                
                                <img src={copilotStudioIcon}
                                     alt="CopilotStudio Logo"
                                     className="w-50 h-50 object-contain
                                                filter drop-shadow-lg
                                                transition-transform duration-500
                                                group-hover:scale-110" />
                                
                                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs font-bold text-slate-700">Agentic AI</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 mt-20">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h4 className="font-bold text-xl mb-1 text-slate-800">Microsoft Elevate</h4>
                            <p className="text-slate-500 text-sm">Empowering every student and every educator on the planet to achieve more.</p>
                        </div>
                        <div className="flex gap-8 text-sm font-medium text-slate-500">
                            <a href="#" className="hover:text-ms-blue transition-colors">개인정보처리방침</a>
                            <a href="#" className="hover:text-ms-blue transition-colors">이용약관</a>
                            <a href="#" className="hover:text-ms-blue transition-colors">문의하기</a>
                        </div>
                    </div>
                    <div className="text-center mt-12 text-xs text-slate-400">
                        &copy; 2026 Microsoft Elevate Korea. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
