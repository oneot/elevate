import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

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

// Hooks
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useMobileRevealAnimation } from '../hooks/useMobileRevealAnimation';
import { useHeroAnimation } from '../hooks/useHeroAnimation';

const Home = () => {
    // 애니메이션 훅 적용
    useScrollAnimation();
    useMobileRevealAnimation();
    useHeroAnimation();

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
                    {/* Microsoft 365 */}
                    <Link to="/blog/m365" className="block h-full col-span-1 row-span-1">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-orange-50 shadow-soft hover:shadow-hover transition-all duration-300">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg shadow-orange-100 border border-white">
                                    <img src={m365Icon} alt="Microsoft 365" className="w-10 h-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800">M365 개요</h3>
                                <p className="text-sm text-slate-500">교실 운영을 통합하고 학습 활동을 지속적으로 이어가는 방법을 소개합니다.</p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 text-orange-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">더 알아보기 →</div>
                        </div>
                    </Link>

                    {/* Copilot */}
                    <Link to="/blog/copilot" className="block h-full col-span-1 row-span-1">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-blue-50 shadow-soft hover:shadow-hover transition-all duration-300">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg shadow-blue-100 border border-white">
                                    <img src={copilotIcon} alt="Microsoft Copilot" className="w-10 h-10 group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900">Copilot</h3>
                                <p className="text-sm text-slate-500">선생님의 업무 시간은 줄이고, 학생들의 창의력은 확장합니다.</p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 text-ms-blue text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">더 알아보기 →</div>
                        </div>
                    </Link>

                    

                    {/* Microsoft Teams */}
                    <Link to="/blog/teams" className="block h-full col-span-1 row-span-1">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-indigo-50 shadow-soft hover:shadow-hover transition-all duration-300">
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
                    </Link>

                    {/* Minecraft EDU */}
                    <Link to="/blog/minecraft" className="block h-full col-span-1 row-span-1">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-green-50 shadow-soft hover:shadow-hover transition-all duration-300">
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
                    </Link>

                    {/* Excel */}
                    <Link to="/blog/excel" className="block h-full col-span-1 row-span-1">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50 shadow-soft hover:shadow-hover transition-all duration-300">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-100 border border-white">
                                    <img src={excelIcon} alt="Excel" className="w-9 h-9 group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-xl font-bold text-emerald-700">Excel</h3>
                                <p className="text-sm text-slate-500">
                                    교실과 실무에서 유용한 Excel 팁과 템플릿을 공유합니다.
                                </p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 text-emerald-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                더 알아보기 →
                            </div>
                        </div>
                    </Link>

                    {/* OneNote */}
                    <Link to="/blog/onenote" className="block h-full col-span-1 row-span-1">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 group cursor-pointer fade-in-section h-full flex flex-col justify-between bg-gradient-to-br from-white to-violet-50 shadow-soft hover:shadow-hover transition-all duration-300">
                            <div>
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg shadow-violet-100 border border-white">
                                    <img src={onenoteIcon} alt="OneNote" className="w-9 h-9 group-hover:scale-110 transition-transform" />
                                </div>
                                <h3 className="text-xl font-bold text-violet-700">OneNote</h3>
                                <p className="text-sm text-slate-500">
                                    교수·학습 기록과 협업을 돕는 OneNote 활용 사례입니다.
                                </p>
                            </div>
                            <div className="card-cta mt-4 sm:mt-0 text-violet-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                더 알아보기 →
                            </div>
                        </div>
                    </Link>

                    {/* Elevate Blog */}
                    <Link to="/blog" className="block h-full col-span-1 row-span-1">
                        <div className="reveal-card clean-card rounded-[2rem] p-6 h-full flex flex-col justify-between group cursor-pointer fade-in-section bg-gradient-to-br from-white to-slate-100 shadow-soft hover:shadow-hover transition-all duration-300">
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
                    </Link>
                </div>
            </section>

            <CopilotStudioSection />

            <Footer />
            <ChatWidget />
        </div>
    );
};

export default Home;