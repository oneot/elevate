import { Helmet } from 'react-helmet-async';

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

// Hooks
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useMobileRevealAnimation } from '../hooks/useMobileRevealAnimation';
import { useHeroAnimation } from '../hooks/useHeroAnimation';

const Home = () => {
    // 애니메이션 훅 적용
    useScrollAnimation();
    useMobileRevealAnimation();
    useHeroAnimation();

    // 기능 카드 데이터
    const features = [
        {
            title: 'M365 개요',
            description: '교실 운영을 통합하고 학습 활동을 지속적으로 이어가는 방법을 소개합니다.',
            icon: m365Icon,
            iconType: 'image',
            to: '/blog/m365',
            colorScheme: 'orange',
            ariaLabel: 'M365 개요 페이지로 이동'
        },
        {
            title: 'Copilot',
            description: '선생님의 업무 시간은 줄이고, 학생들의 창의력은 확장합니다.',
            icon: copilotIcon,
            iconType: 'image',
            to: '/blog/copilot',
            colorScheme: 'blue',
            ariaLabel: 'Copilot 페이지로 이동'
        },
        {
            title: 'Microsoft Teams',
            description: '수업에 필요한 모든 소통이 한 공간에서 연결됩니다.<br/>Microsoft Teams와 함께하는 수업을 시작하세요.',
            icon: teamsIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/blog/teams',
            colorScheme: 'indigo',
            ariaLabel: 'Microsoft Teams 페이지로 이동'
        },
        {
            title: 'Minecraft EDU',
            description: '학생들은 탐험하고, 설계하고, 실험하며<br/>AI를 활용해 문제를 해결하는 법을 배웁니다.',
            icon: minecraftIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/blog/minecraft',
            colorScheme: 'green',
            ariaLabel: 'Minecraft EDU 페이지로 이동'
        },
        {
            title: 'Excel',
            description: '교실과 실무에서 유용한 Excel 팁과 템플릿을 공유합니다.',
            icon: excelIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/blog/excel',
            colorScheme: 'emerald',
            ariaLabel: 'Excel 페이지로 이동'
        },
        {
            title: 'OneNote',
            description: '교수·학습 기록과 협업을 돕는 OneNote 활용 사례입니다.',
            icon: onenoteIcon,
            iconType: 'image',
            iconSize: 'w-9 h-9',
            to: '/blog/onenote',
            colorScheme: 'violet',
            ariaLabel: 'OneNote 페이지로 이동'
        },
        {
            title: 'Elevate Blog',
            description: 'Microsoft AI의 모든 리소스를 한 곳에서 확인하세요.',
            icon: '📦',
            iconType: 'emoji',
            to: '/blog',
            colorScheme: 'slate',
            ctaLabel: '전체 보기 →',
            ariaLabel: 'Elevate Blog 전체 페이지로 이동'
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
            <section id="m365-section" className="py-20 px-6 max-w-7xl mx-auto">
                <div className="mb-12 text-center fade-in-section">
                    <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-900">Explore Microsoft AI</h2>
                    <p className="text-slate-500 text-lg">교육 현장을 변화시키는 강력한 도구들을 만나보세요.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-auto sm:auto-rows-[240px]">
                    {features.map((feature, index) => (
                        <FeatureCard 
                            key={index}
                            {...feature}
                        />
                    ))}
                </div>
            </section>

            <CopilotStudioSection />

            <Footer />
            <ChatWidget />
        </div>
    );
};

export default Home;
