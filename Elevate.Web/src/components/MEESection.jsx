import React from 'react';
import meeImage from '../assets/mee-image.png'; 

const MEESection = () => {
    return (
        <section id="mee-section" className="py-20 px-6 max-w-7xl mx-auto">
            <div className="bg-white/40 backdrop-blur-2xl rounded-[40px] p-10 lg:p-16 relative overflow-hidden text-center lg:text-left border border-white/60 border-b-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9)] fade-in-section">
                
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-100 via-sky-50 to-transparent rounded-full translate-x-1/4 -translate-y-1/4 z-0"></div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                    
                    {/* Mobile: Image at bottom */}
                    <div className="order-last lg:order-none lg:w-4/12 flex justify-center lg:justify-start mt-10 lg:mt-0">
                        <div className="relative w-full max-w-[300px]
                                        rounded-[2.5rem] shadow-2xl shadow-blue-200/60 
                                        transition-all duration-500 
                                        group">
                            
                            <img src={meeImage}
                                 alt="Microsoft Elevate Educator"
                                 className="w-full h-auto object-cover rounded-[2.5rem] border-4 border-white
                                            transition-transform duration-500 group-hover:scale-[1.02]" />
                            
                            <div className="absolute -bottom-6 -right-6 lg:-right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-700"></span>
                                </span>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-700 tracking-wider leading-none mb-1">Network</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-8/12 relative z-10">
                        <span className="inline-block py-1 px-3 rounded-md bg-blue-50 text-blue-800 font-bold text-xs uppercase mb-4 tracking-wider border border-blue-100">
                            Community
                        </span>
                        
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
                            마이크로소프트 <br className="md:hidden" />교육 전문가 커뮤니티<br />
                            {/* Gradient text */}
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-900">
                                Microsoft Elevate <br className="md:hidden" />for Educators
                            </span>
                        </h2>

                        <p className="text-slate-600 text-base mb-10 leading-relaxed font-medium">
                            최신 Microsoft AI를 교실에 가장 먼저 적용할 수 있는 기회,
                            <span className="text-blue-800 font-bold"> 마이크로소프트 교육 전문가 그룹</span>에 합류하세요.
                            <br className="hidden md:block" /> <span className="text-blue-800 font-bold"> Microsoft Elevate for Educators (MEE)</span> 커뮤니티에서 교육 혁신 인사이트를 나누며 함께 성장해 보세요.
                        </p>
                        
                        {/* Liquid glass buttons */}
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            
                            <a
                                href="https://www.youtube.com/watch?v=SfK1hajr5qY&list=PLGh_JNxzXsX-eviPh2Y30PsLbIiEbP8Ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group overflow-hidden inline-flex items-center justify-center 
                                         px-8 py-3.5 rounded-full font-bold text-blue-900
                                         bg-blue-400/40 backdrop-blur-2xl 
                                         border border-white/60 border-b-white/20
                                         shadow-[0_8px_24px_rgba(37,99,235,0.25),inset_0_1px_2px_rgba(255,255,255,0.8)]
                                         transition-all duration-300 ease-out
                                         hover:bg-blue-400/40 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(37,99,235,0.35),inset_0_1px_2px_rgba(255,255,255,0.9)]
                                         active:scale-95"
                            >
                                <span className="relative z-10 drop-shadow-sm">활동 사례 알아보기</span>
                                {/* Shine effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out rounded-full" />
                            </a>

                            <a
                                href="https://elevateforeducators.microsoft.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group overflow-hidden inline-flex items-center justify-center 
                                         px-8 py-3.5 rounded-full font-bold text-sky-900
                                         bg-sky-200/60 backdrop-blur-2xl 
                                         border border-sky-200/60 border-b-sky-100/20
                                         shadow-[0_8px_24px_rgba(14,165,233,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)]
                                         transition-all duration-300 ease-out
                                         hover:bg-sky-200/50 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(14,165,233,0.25),inset_0_1px_2px_rgba(255,255,255,1)]
                                         active:scale-95"
                            >
                                <span className="relative z-10 drop-shadow-sm">커뮤니티 가입하기</span>
                                {/* Shine effect */}
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out rounded-full" />
                            </a>
                        </div>
                    </div>
                    
                </div>
            </div>
        </section>
    );
};

export default MEESection;