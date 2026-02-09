import copilotStudioIcon from '../assets/NewMicrosoft365Icons/copilotstudio.png';

const CopilotStudioSection = () => {
    return (
        <section id="studio-section" className="py-20 px-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-[40px] p-10 lg:p-16 relative overflow-hidden text-center lg:text-left shadow-2xl border border-slate-100 fade-in-section">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-purple-100 via-pink-50 to-transparent rounded-full translate-x-1/4 -translate-y-1/4 z-0"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-2/3">
                        <span className="inline-block py-1 px-3 rounded-md bg-purple-100 text-purple-600 font-bold text-xs uppercase mb-4 tracking-wider">AI Skilling</span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
                            대한민국 AI Skilling,<br />
                            Copilot Agent로 <br className="md:hidden" />
                            시작합니다!!
                        </h2>
                        <p className="text-slate-600 text-base mb-10 leading-relaxed font-medium">
                            학생들과 교육자들이 직접 AI 에이전트를 만드는 해커톤{' '}
                            <span className="text-purple-600 font-bold">‘에이전톤’</span>에 도전하세요.
                            <br className="hidden md:block" />
                            Copilot → Studio → Foundry로 이어지는{' '}
                            <span className="text-purple-600 font-bold">AI 제작 3단계 여정</span>은 AI를 단순히 잘 사용하는
                            <br className="hidden md:block" />
                            User가 아닌 Creator, 즉 <span className="text-purple-600 font-bold">Agent Boss</span>로 성장할 수 있는 구조를 제공합니다.
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
    );
};

export default CopilotStudioSection;
