/**
 * @file Home.jsx
 * @description Microsoft Elevate 홈페이지 컴포넌트.
 *
 * MapSection → 기능 카드 그리드 → 업데이트/행사 카드(현재 숨김) → CopilotStudioSection →
 * MEESection → GlobalTrainingPartner 순으로 섹션을 구성한다.
 * 흰 배경 위에 Elevathon 페이지와 같은 글씨체를 쓴다 (styles/home.css, `.ehome` 범위).
 * URL hash(`#section-id`)로 진입하면 해당 섹션으로 자동 스크롤한다.
 */
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, DEFAULT_TITLE, SITE_NAME, canonicalUrl } from '../constants/seo';
import { SHOW_NEWS_SECTIONS } from '../constants/features';
import '../styles/home.css';

// Icons
import copilotIcon from '../assets/NewMicrosoft365Icons/copilot-logo-500.png';
import copilotStudioIcon from '../assets/NewMicrosoft365Icons/copilotstudio.png';
import teamsIcon from '../assets/NewMicrosoft365Icons/Teams_512.png';
import minecraftIcon from '../assets/NewMicrosoft365Icons/minecraft.png';
import excelIcon from '../assets/NewMicrosoft365Icons/Excel_512.png';
import onenoteIcon from '../assets/NewMicrosoft365Icons/OneNote_512.png';
import formsIcon from '../assets/docs-icons/forms.svg';
import githubIcon from '../assets/docs-icons/github.svg';
import azureIcon from '../assets/docs-icons/azure.svg';

// Components
import Navigation from '../components/layout/Navigation';
import MapSection from '../components/home/MapSection';
import CopilotStudioSection from '../components/home/CopilotStudioSection';
import Footer from '../components/layout/Footer';
import FeatureCard from '../components/home/FeatureCard';
import MEESection from '../components/home/MEESection';
import GlobalTrainingPartner from '../components/home/GlobalTrainingPartner';

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
    // 기능 카드 데이터 — 1024px부터 3×3, 왼쪽 위부터 이 순서. 640px부터는 한 줄에 두 장(마지막 한 장은 가운데), 그보다 좁으면 한 장씩.
    // description: 두 줄 — 앱이 하는 일 한 문장 + 권하는 한 문장. 각 줄은 가장 좁은 카드(약 227px)에서도 한 줄에 들어가게,
    //   글자가 가장 넓게 그려지는 Windows 맑은 고딕 15px 기준 220px 이하로 둔다.
    // iconSize: 그림마다 둘레 여백이 달라서, 보이는 아이콘 크기가 서로 비슷해지도록 맞춘 값.
    const features = [
        {
            title: 'Copilot',
            description: ['AI가 수업과 업무를 돕습니다.', '가르치는 시간을 되찾으세요.'],
            icon: copilotIcon,
            iconType: 'image',
            iconSize: 'w-11 h-11',
            to: '/copilot',
            colorScheme: 'blue',
            ariaLabel: 'Copilot 페이지로 이동'
        },
        {
            title: 'Microsoft Teams',
            description: ['수업과 소통이 한곳에 모입니다.', '온라인 교실을 열어 보세요.'],
            icon: teamsIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/teams',
            colorScheme: 'indigo',
            ariaLabel: 'Microsoft Teams 페이지로 이동'
        },
        {
            title: 'OneNote',
            description: ['수업 기록을 한 권에 담습니다.', '흩어진 노트와 과제를 모으세요.'],
            icon: onenoteIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/onenote',
            colorScheme: 'violet',
            ariaLabel: 'OneNote 페이지로 이동'
        },
        {
            title: 'Excel',
            description: ['수업 데이터를 표로 정리합니다.', '성적과 출석을 한눈에 보세요.'],
            icon: excelIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/excel',
            colorScheme: 'emerald',
            ariaLabel: 'Excel 페이지로 이동'
        },
        {
            title: 'Forms',
            description: ['설문과 퀴즈를 쉽게 만듭니다.', '응답 결과를 바로 확인해 보세요.'],
            icon: formsIcon,
            iconType: 'image',
            iconSize: 'w-11 h-11',
            to: '/forms',
            colorScheme: 'teal',
            ariaLabel: 'Forms 페이지로 이동'
        },
        {
            title: 'Minecraft EDU',
            description: ['블록으로 코딩과 AI를 익힙니다.', '놀며 배우는 수업을 시작하세요.'],
            icon: minecraftIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/minecraft',
            colorScheme: 'green',
            ariaLabel: 'Minecraft EDU 페이지로 이동'
        },
        {
            title: 'Copilot Studio',
            description: ['나만의 AI 에이전트를 만듭니다.', '코딩 없이 대화로 시작해 보세요.'],
            icon: copilotStudioIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/copilot-studio',
            colorScheme: 'violet',
            ariaLabel: 'Copilot Studio 페이지로 이동'
        },
        {
            title: 'GitHub',
            description: ['코드를 저장하고 공유합니다.', '전 세계 개발자와 협업해 보세요.'],
            icon: githubIcon,
            iconType: 'image',
            iconSize: 'w-8 h-8',
            to: '/github',
            colorScheme: 'slate',
            ariaLabel: 'GitHub 페이지로 이동'
        },
        {
            title: 'Azure',
            description: ['Microsoft의 클라우드입니다.', '앱과 AI를 손쉽게 운영해 보세요.'],
            icon: azureIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/azure',
            colorScheme: 'sky',
            ariaLabel: 'Azure 페이지로 이동'
        }
    ];
    // 두 장씩 놓이는 폭에서 카드 수가 홀수면 마지막 한 장을 가운데에 둔다 (4열 중 2~3열).
    const featureSpan = (index) => (
        features.length % 2 === 1 && index === features.length - 1
            ? 'col-span-1 sm:col-span-2 sm:col-start-2 lg:col-span-1 lg:col-start-auto'
            : 'col-span-1 sm:col-span-2 lg:col-span-1'
    );

    return (
        <div className="ehome relative min-h-screen selection:bg-ms-blue/20 selection:text-ms-blue">
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

            <Navigation />

            <MapSection />

            {/* Microsoft 365 Section */}
            <section id="m365-section" className="py-16 md:py-20 px-4 sm:px-6 max-w-7xl mx-auto">
                <div className="ehome-head mb-10 md:mb-14 fade-in-section">
                    <p className="ehome-kicker">Explore Microsoft AI</p>
                    <h2 className="ehome-h2">
                        교실 속 작은 변화를 돕는<br />
                        실용적인 AI 도구들을 만나보세요.
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-3 gap-6 md:gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={feature.to}
                            {...feature}
                            wrapperClassName={featureSpan(index)}
                        />
                    ))}
                </div>
            </section>

            {/* Microsoft365 Update & Program News Section
                — 요즘 업데이트하지 않아 숨김. features.js의 SHOW_NEWS_SECTIONS를 true로 바꾸면 다시 보인다. */}
            {SHOW_NEWS_SECTIONS && (
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
            )}

            <section id="agenthon">
            <CopilotStudioSection />
            </section>

            <section id="mee">
                <MEESection />
            </section>
            
            <GlobalTrainingPartner />

            <Footer />
        </div>
    );
};

export default Home;
