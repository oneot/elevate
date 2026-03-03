import Logo from './Logo';

const Navigation = () => {
    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-white/85 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-3">
                <Logo />

                <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
                    <a href="#map-section" className="hover:text-ms-blue transition-colors">시작하기</a>
                    <a href="#m365-section" className="hover:text-ms-blue transition-colors">블로그</a>
                    <a href="#studio-section" className="hover:text-ms-blue transition-colors">새로운 소식</a>
                </div>

                <a
                    href="https://forms.office.com/r/YvQz3WbhZt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative group overflow-hidden inline-flex items-center px-4 py-2 md:px-5 md:py-2.5 rounded-full min-h-10
                            text-slate-800 text-sm font-semibold whitespace-nowrap
                            bg-white/40 backdrop-blur-xl 
                            border border-white/60 border-b-white/20
                            shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)]
                            transition-all duration-300 ease-out
                            hover:bg-white/60 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,1)]
                            active:scale-95"
                >
                    <span className="relative z-10 drop-shadow-sm">문의하기</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out rounded-full" />
                </a>
            </div>
        </nav>
    );
};

export default Navigation;
