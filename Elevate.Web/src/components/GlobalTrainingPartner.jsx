import React from 'react';
import gtpImage from '../assets/GTP2.png'; 

const GlobalTrainingPartner = () => {
    return (
        <section id="gtp-section" className="py-20 px-6 max-w-7xl mx-auto">
            <div className="bg-white/40 backdrop-blur-2xl rounded-[40px] p-10 lg:p-16 relative overflow-hidden text-center lg:text-left border border-white/60 border-b-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.9)] fade-in-section">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100 via-violet-50 to-transparent rounded-full translate-x-1/4 -translate-y-1/4 z-0"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                    <div className="lg:w-8/12 relative z-10">
                        <span className="inline-block py-1 px-3 rounded-md bg-indigo-50 text-indigo-800 font-bold text-xs uppercase mb-4 tracking-wider border border-indigo-100">
                            Partner Program
                        </span>
                        <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
                            마이크로소프트 <br className="md:hidden" />공인 교육 파트너<br/>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-violet-900">
                                Global Training Partner
                            </span>
                        </h2>
                        <p className="text-slate-600 text-base mb-10 leading-relaxed font-medium">
                            Global Training Partner는 <span className="text-violet-800 font-bold">Microsoft 교육 프로그램을 공식적으로 운영</span>할 수 있는 파트너 제도입니다.
                            <br className="hidden md:block" />
                            Microsoft AI Skilling 기반 연수 프로그램을 운영하며 함께 성장할 EduTech 기업을 기다립니다.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <a
                                href="https://partner.microsoft.com/ko-kr/explore/education/gtp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group overflow-hidden inline-flex items-center justify-center 
                                         w-[180px] px-8 py-3.5 rounded-full font-bold text-indigo-900
                                         bg-indigo-400/40 backdrop-blur-2xl 
                                         border border-white/60 border-b-white/20
                                         shadow-[0_8px_24px_rgba(79,70,229,0.25),inset_0_1px_2px_rgba(255,255,255,0.8)]
                                         transition-all duration-300 ease-out
                                         hover:bg-indigo-400/40 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(79,70,229,0.35),inset_0_1px_2px_rgba(255,255,255,0.9)]
                                         active:scale-95"
                            >
                                <span className="relative z-10 drop-shadow-sm">파트너 신청하기</span>
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out rounded-full" />
                            </a>
                            <a
                                href="https://learn.microsoft.com/en-us/training/educator-center/programs/global-training-partner/find-global-training-partner#korea"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative group overflow-hidden inline-flex items-center justify-center 
                                         w-[180px] px-8 py-3.5 rounded-full font-bold text-violet-900
                                         bg-violet-200/60 backdrop-blur-2xl 
                                         border border-violet-200/60 border-b-violet-100/20
                                         shadow-[0_8px_24px_rgba(139,92,246,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)]
                                         transition-all duration-300 ease-out
                                         hover:bg-violet-200/50 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(139,92,246,0.25),inset_0_1px_2px_rgba(255,255,255,1)]
                                         active:scale-95"
                            >
                                <span className="relative z-10 drop-shadow-sm">파트너 찾아보기</span>
                                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out rounded-full" />
                            </a>
                        </div>
                    </div>
                    <div className="lg:w-4/12 flex justify-center lg:justify-end mt-10 lg:mt-0">
                        <div className="relative w-full max-w-[300px]
                                        rounded-[2.5rem] shadow-2xl shadow-indigo-200/60 
                                        transition-all duration-500 
                                        group">
                            <img src={gtpImage}
                                 alt="Global Training Partner"
                                 className="w-full h-auto object-cover rounded-[2.5rem] border-4 border-white
                                            transition-transform duration-500 group-hover:scale-[1.02]" />
                            <div className="absolute -bottom-6 -right-6 lg:-right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3 transform group-hover:-translate-y-2 transition-transform duration-500">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-700"></span>
                                </span>
                                <div className="text-left">
                                    <p className="text-xs font-bold text-slate-700 tracking-wider leading-none mb-1">Partner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </section>
    );
};

export default GlobalTrainingPartner;
