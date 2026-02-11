import { Helmet } from 'react-helmet-async';
import { Outlet } from 'react-router-dom';
import { BlogCard } from '../components/categories';
import copilotLogo from '../assets/NewMicrosoft365Icons/copilot-logo-500.png';
import m365CopilotLogo from '../assets/NewMicrosoft365Icons/m365-copilot-logo-500.png';
import teamsLogo from '../assets/NewMicrosoft365Icons/Teams_512.png';
import minecraftLogo from '../assets/NewMicrosoft365Icons/minecraft.png';
import excelLogo from '../assets/NewMicrosoft365Icons/Excel_512.png';
import onenoteLogo from '../assets/NewMicrosoft365Icons/OneNote_512.png';

const Blog = () => {
    const cards = [
        {
            title: 'M365 개요',
            excerpt: 'M365 도구로 교육을 혁신하는 실전 가이드와 사례.',
            icon: <img src={m365CopilotLogo} alt="Microsoft 365" className="h-10 w-10 object-contain rounded-md" />,
            to: '/blog/m365',
            ctaLabel: '자세히 보기'
        },
        {
            title: 'Copilot',
            excerpt: '교실과 업무에서 Copilot 활용 사례와 팁을 공유합니다.',
            icon: <img src={copilotLogo} alt="Copilot" className="h-10 w-10 object-contain rounded-md" />,
            to: '/blog/copilot',
            ctaLabel: '자세히 보기'
        },
        {
            title: 'Teams',
            excerpt: '협업과 원격수업을 위한 Teams 활용법과 모범 사례.',
            icon: <img src={teamsLogo} alt="Teams" className="h-10 w-10 object-contain rounded-md" />,
            to: '/blog/teams',
            ctaLabel: '자세히 보기'
        },
        {
            title: 'Minecraft',
            excerpt: '교육용 Minecraft 프로젝트와 수업 사례를 소개합니다.',
            icon: <img src={minecraftLogo} alt="Minecraft EDU" className="h-10 w-10 object-contain rounded-md" />,
            to: '/blog/minecraft',
            ctaLabel: '자세히 보기'
        },
        {
            title: 'Excel',
            excerpt: '교실과 실무에서 유용한 Excel 팁과 템플릿을 공유합니다.',
            icon: <img src={excelLogo} alt="Excel" className="h-10 w-10 object-contain rounded-md" />,
            to: '/blog/excel',
            ctaLabel: '자세히 보기'
        },
        {
            title: 'OneNote',
            excerpt: '교수·학습 기록과 협업을 돕는 OneNote 활용 사례.',
            icon: <img src={onenoteLogo} alt="OneNote" className="h-10 w-10 object-contain rounded-md" />,
            to: '/blog/onenote',
            ctaLabel: '자세히 보기'
        }
    ];

    return (
        <div className="relative min-h-screen font-sans selection:bg-ms-blue/20 selection:text-ms-blue">
            <Helmet>
                <title>Blog | Microsoft Elevate</title>
                <meta name="description" content="Microsoft Elevate 블로그. 교육 현장의 AI 활용 사례와 인사이트를 공유합니다." />
                <meta property="og:title" content="Blog | Microsoft Elevate" />
                <meta property="og:description" content="Microsoft Elevate 블로그. 교육 현장의 AI 활용 사례와 인사이트를 공유합니다." />
            </Helmet>

            {/* Background Blobs */}
            <div className="pastel-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* Blog Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
                <div className="text-center max-w-4xl">
                    <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                        Microsoft Elevate Blog
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        M365로 교육을 바꿔보세요.
                    </p>
                </div>

                {/* 검색창 (비활성) + 카드 그리드 + 오른쪽 캡션 */}
                <div className="max-w-6xl mx-auto mt-12 px-6 w-full">
                    {/* 검색창: 당장은 기능 없음 (readOnly) */}
                    <div className="flex justify-center w-full">
                        <div className="w-full max-w-3xl">
                            <input
                                type="text"
                                placeholder="Copilot으로 검색하기"
                                readOnly
                                aria-label="검색"
                                className="w-full bg-white/60 rounded-full py-3 px-6 border border-white/60 shadow-inner placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-ms-blue/30"
                            />
                        </div>
                    </div>

                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 왼쪽: 카드 그리드 (2/3) */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {cards.map((c) => (
                                    <BlogCard
                                        key={c.to}
                                        title={c.title}
                                        excerpt={c.excerpt}
                                        icon={c.icon}
                                        to={c.to}
                                        ctaLabel={c.ctaLabel}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* 오른쪽: 회색 문구 (데스크탑에만 표시) */}
                        <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                            <div className="text-right pr-8">
                                <p className="text-2xl lg:text-3xl text-slate-500 leading-relaxed">
                                    당신의 무한한 교육을
                                    <br />
                                    M365와 함께하세요
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Outlet for nested routes */}
            <Outlet />
        </div>
    );
};

export default Blog;
