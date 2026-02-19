import Logo from './Logo';

const Navigation = () => {
    return (
        <nav className="fixed w-full z-50 top-0 left-0 bg-white/85 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-3">
                <Logo />

                <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-500">
                    <a href="#map-section" className="hover:text-ms-blue transition-colors">Account</a>
                    <a href="#m365-section" className="hover:text-ms-blue transition-colors">Product</a>
                    <a href="#studio-section" className="hover:text-ms-blue transition-colors">AI Skilling</a>
                </div>

                <a
                    href="https://forms.office.com/r/YvQz3WbhZt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 md:px-5 md:py-2.5 rounded-full min-h-10
                               bg-slate-900 text-white text-sm font-semibold whitespace-nowrap
                               hover:bg-slate-700 transition-all shadow-lg shadow-slate-900/20"
                >
                    Contact Us
                </a>
            </div>
        </nav>
    );
};

export default Navigation;
