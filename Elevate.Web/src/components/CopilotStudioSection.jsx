import copilotStudioIcon from '../assets/NewMicrosoft365Icons/copilotstudio.png';

const CopilotStudioSection = () => {
    return (
        <section id="studio-section" className="py-20 px-6 max-w-7xl mx-auto">
            <div className="bg-white/40 backdrop-blur-2xl rounded-[40px] p-10 lg:p-16 relative overflow-hidden text-center lg:text-left border border-white/60 border-b-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.9)] fade-in-section">
                
                {/* Background decoration (기존 동일) */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-purple-100 via-pink-50 to-transparent rounded-full translate-x-1/4 -translate-y-1/4 z-0"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-2/3">
                        <span className="inline-block py-1 px-3 rounded-md bg-purple-100 text-purple-600 font-bold text-xs uppercase mb-4 tracking-wider">AI Skilling</span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
                            대한민국 AI Skilling,<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-purple-900">Copilot Agent</span>로 <br className="md:hidden" />
                            시작합니다!
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
                        
                        {/* Liquid glass buttons */}
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <a
                                href="https://forms.office.com/r/YvQz3WbhZt"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group overflow-hidden inline-flex items-center justify-center 
                                         px-8 py-3.5 rounded-full font-bold text-purple-900
                                         bg-purple-400/50 backdrop-blur-2xl 
                                         border border-white/60 border-b-white/20
                                         shadow-[0_8px_24px_rgba(147,51,234,0.25),inset_0_1px_2px_rgba(255,255,255,0.8)]
                                         transition-all duration-300 ease-out
                                         hover:bg-purple-400/40 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(147,51,234,0.35),inset_0_1px_2px_rgba(255,255,255,0.9)]
                                         active:scale-95"
                            >
                                <span className="relative z-10 drop-shadow-sm">에이전톤 문의하기</span>
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out rounded-full" />
                            </a>

                            <a
                                href="https://github.com/oneot/copilotagenthon/blob/main/01_CopilotAgenthon_%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group overflow-hidden inline-flex items-center justify-center 
                                         px-8 py-3.5 rounded-full font-bold text-purple-800
                                         bg-purple-200/70 backdrop-blur-2xl 
                                         border border-purple-200/60 border-b-purple-100/20
                                         shadow-[0_8px_24px_rgba(168,85,247,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)]
                                         transition-all duration-300 ease-out
                                         hover:bg-purple-200/50 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(168,85,247,0.25),inset_0_1px_2px_rgba(255,255,255,1)]
                                         active:scale-95"
                            >
                                <span className="relative z-10 drop-shadow-sm">에이전톤 우수사례</span>
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out rounded-full" />
                            </a>
                        </div>
                    </div>

                    <div className="lg:w-1/3 flex justify-center">
                        <div className="relative w-[250px] h-[250px]
                                        bg-gradient-to-br from-purple-200 to-indigo-300 
                                        rounded-[3rem] shadow-2xl shadow-purple-200 
                                        flex items-center justify-center 
                                        transition-all duration-500 
                                        cursor-pointer group">
                            
                            <div className="absolute inset-0 bg-white/30 rounded-[3rem] blur-xl"></div>
                            
                            <img src={copilotStudioIcon}
                                 alt="CopilotStudio Logo"
                                 className="w-[250px] h-[250px] object-contain
                                            filter drop-shadow-lg
                                            transition-transform duration-500
                                            group-hover:scale-110" />
                            
                            {/* Floating Badge */}
                            <div className="absolute -bottom-6 -right-6 lg:-right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-700"></span>
                                </span>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-700 tracking-wider leading-none mb-1">Agentic AI</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CopilotStudioSection;