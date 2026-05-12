const Footer = () => {
    return (
        <footer className="bg-white border-t border-slate-100 mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h4 className="font-bold text-xl mb-1 text-slate-800">Microsoft Elevate</h4>
                        <p className="text-slate-500 text-sm">
                            Empowering every student and every educator on the planet to achieve more.
                        </p>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-slate-500">
                        <a
                            href="https://www.microsoft.com/ko-kr/privacy/privacystatement"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-ms-blue transition-colors"
                        >
                        개인정보처리방침
                        </a>

                        <a href="https://www.microsoft.com/ko-kr/servicesagreement"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-ms-blue transition-colors"
                        >
                        이용약관
                        </a>
                    </div>
                </div>
                <div className="text-center mt-12 text-xs text-slate-400">
                    &copy; 2026 Microsoft Elevate Korea. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
