import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import microsoftLogo from '../assets/Microsoft.png';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen font-sans selection:bg-ms-blue/20 selection:text-ms-blue">
            <Helmet>
                <title>404 - Page Not Found | Microsoft Elevate</title>
                <meta name="description" content="페이지를 찾을 수 없습니다. Microsoft Elevate 홈으로 돌아가세요." />
                <meta property="og:title" content="404 - Page Not Found | Microsoft Elevate" />
                <meta property="og:description" content="페이지를 찾을 수 없습니다." />
            </Helmet>

            {/* Background Blobs */}
            <div className="pastel-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {/* 404 Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
                <div className="text-center max-w-2xl">
                    {/* Microsoft Logo */}
                    <div className="mb-8 flex justify-center">
                        <img 
                            src={microsoftLogo} 
                            alt="Microsoft Logo" 
                            className="h-12 object-contain opacity-90"
                        />
                    </div>

                    {/* Glass Card */}
                    <div className="clean-card rounded-[3rem] p-12 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50">
                        {/* 404 Number */}
                        <div className="text-9xl font-bold text-gradient mb-6 tracking-tight">
                            404
                        </div>

                        {/* Message */}
                        <h1 className="text-3xl font-bold text-slate-900 mb-4">
                            페이지를 찾을 수 없습니다
                        </h1>
                        <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.<br />
                            URL을 다시 확인하시거나 홈으로 돌아가주세요.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center gap-2
                                         bg-slate-900 text-white px-8 py-3.5 rounded-full
                                         font-bold text-base
                                         hover:bg-slate-800 transition-all
                                         shadow-lg hover:shadow-xl hover:-translate-y-1"
                            >
                                <svg 
                                    className="w-5 h-5" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                                    />
                                </svg>
                                홈으로 돌아가기
                            </button>

                            <button
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2
                                         bg-white border-2 border-slate-200 text-slate-700
                                         px-8 py-3.5 rounded-full font-bold text-base
                                         hover:bg-slate-50 hover:border-slate-300
                                         transition-all"
                            >
                                <svg 
                                    className="w-5 h-5" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                                    />
                                </svg>
                                이전 페이지로 돌아가기
                            </button>
                        </div>
                    </div>

                    {/* Help Text */}
                    <p className="mt-8 text-sm text-slate-400">
                        문제가 계속되면{' '}
                        <a 
                            href="https://forms.office.com/r/YvQz3WbhZt" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-ms-blue hover:underline font-semibold"
                        >
                            문의하기
                        </a>
                        를 통해 알려주세요.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
