/**
 * @file Navigation.jsx
 * @description 모든 페이지 최상단에 고정되는 내비게이션 바.
 *
 * 5개 드롭다운 메뉴와 우측 문의하기 CTA 버튼으로 구성된다.
 * - 데스크톱: 마우스 오버 시 드롭다운, 마우스 이탈 시 자동 닫힘
 * - 모바일: 햄버거 버튼 → 풀화면 오버레이 패널 + 아코디언
 * - Escape 키, 라우트 이동 시 드롭다운/오버레이 자동 닫힘
 */
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import { NAV_ITEMS } from '../../constants/navItems';

/**
 * 내부/외부 링크를 통합 렌더링하는 보조 컴포넌트.
 * item.external이 true이면 <a target="_blank">, 아니면 <Link to={...}>.
 *
 * @param {Object} props
 * @param {{ label: string, to?: string, href?: string, external?: boolean, isNew?: boolean }} props.item
 * @param {Function} [props.onClick] - 링크 클릭 시 실행할 콜백 (드롭다운/오버레이 닫기용)
 * @param {string} [props.className] - 추가 CSS 클래스
 */
const NavLink = ({ item, onClick, className = '' }) => {
    const baseClass =
        'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-700 ' +
        'hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors w-full text-left ' +
        className;

    const content = (
        <>
            {item.label}
            {/* "new" 배지 — Copilot Studio처럼 최근 추가된 항목에 표시 */}
            {item.isNew && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-violet-100 text-violet-700 rounded-md leading-none">
                    NEW
                </span>
            )}
            {/* 외부 링크 아이콘 */}
            {item.external && (
                <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            )}
        </>
    );

    if (item.external) {
        return (
            <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={baseClass}>
                {content}
            </a>
        );
    }
    return (
        <Link to={item.to} onClick={onClick} className={baseClass}>
            {content}
        </Link>
    );
};

/**
 * 드롭다운 방향 화살표 아이콘.
 * @param {{ open: boolean }} props
 */
const ChevronIcon = ({ open }) => (
    <svg
        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

/**
 * 상단 고정 내비게이션 바 컴포넌트.
 *
 * @returns {JSX.Element}
 */
const Navigation = () => {
    // 현재 열린 데스크톱 드롭다운 메뉴의 label (null이면 모두 닫힘)
    const [openMenu, setOpenMenu] = useState(null);
    // 모바일 오버레이 열림 여부
    const [mobileOpen, setMobileOpen] = useState(false);
    // 모바일 아코디언에서 현재 펼쳐진 메뉴의 label
    const [expandedMobile, setExpandedMobile] = useState(null);

    const location = useLocation();

    /**
     * 드롭다운 닫힘 지연 타이머 ref.
     * 마우스가 버튼과 드롭다운 사이의 작은 gap을 통과할 때 즉시 닫히지 않도록
     * 150ms 딜레이를 줌. 그 안에 마우스가 다시 진입하면 타이머를 취소.
     */
    const closeTimerRef = useRef(null);

    /** 드롭다운 열기 — 진입 시 대기 중인 닫힘 타이머 취소 */
    const handleMenuEnter = (label) => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        setOpenMenu(label);
    };

    /** 드롭다운 닫기 — 150ms 후 실행 */
    const handleMenuLeave = () => {
        closeTimerRef.current = setTimeout(() => setOpenMenu(null), 150);
    };

    // 라우트 이동 시 모든 드롭다운/오버레이 닫기
    useEffect(() => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        setOpenMenu(null);
        setMobileOpen(false);
        setExpandedMobile(null);
    }, [location.pathname]);

    // Escape 키로 드롭다운/오버레이 닫기
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                setOpenMenu(null);
                setMobileOpen(false);
                setExpandedMobile(null);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 모바일 오버레이 열릴 때 body 스크롤 잠금
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    /** 모바일 아코디언 토글 */
    const toggleMobileMenu = (label) => {
        setExpandedMobile((prev) => (prev === label ? null : label));
    };

    /** 문의하기 CTA 공통 스타일 */
    const ctaClass =
        'relative group overflow-hidden inline-flex items-center px-4 py-2 md:px-5 md:py-2.5 rounded-full min-h-10 ' +
        'text-slate-800 text-sm font-semibold whitespace-nowrap ' +
        'bg-white/40 backdrop-blur-xl ' +
        'border border-white/60 border-b-white/20 ' +
        'shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9)] ' +
        'transition-all duration-300 ease-out ' +
        'hover:bg-white/60 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.25),inset_0_1px_2px_rgba(255,255,255,1)] ' +
        'active:scale-95';

    return (
        <>
            <nav className="fixed w-full z-50 top-0 left-0 bg-white/85 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between gap-3">
                    <Logo />

                    {/* ── 데스크톱 메뉴 목록 (md 이상) ── */}
                    <ul className="hidden md:flex items-center gap-1 text-sm">
                        {NAV_ITEMS.map((menu) => (
                            <li
                                key={menu.label}
                                className="relative"
                                // handleMenuEnter: 진입 시 닫힘 타이머 취소 후 즉시 열기
                                // handleMenuLeave: 이탈 시 150ms 후 닫기 (갭 통과 시 유지)
                                onMouseEnter={() => handleMenuEnter(menu.label)}
                                onMouseLeave={handleMenuLeave}
                            >
                                {/* 최상위 메뉴 버튼 */}
                                <button
                                    aria-expanded={openMenu === menu.label}
                                    aria-haspopup="true"
                                    className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    {menu.label}
                                    <ChevronIcon open={openMenu === menu.label} />
                                </button>

                                {/* 드롭다운 패널 */}
                                {openMenu === menu.label && (
                                    <ul
                                        role="menu"
                                        className="absolute top-full left-0 mt-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[200px] z-50"
                                    >
                                        {menu.items.map((item) => (
                                            <li key={item.label} role="menuitem">
                                                <NavLink
                                                    item={item}
                                                    onClick={() => setOpenMenu(null)}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* ── 우측: 문의하기 CTA + 모바일 햄버거 ── */}
                    <div className="flex items-center gap-3">
                        {/* 문의하기 CTA (기존 스타일 유지) */}
                        <a
                            href="https://forms.office.com/r/YvQz3WbhZt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={ctaClass}
                        >
                            <span className="relative z-10 drop-shadow-sm">문의하기</span>
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent group-hover:translate-x-full transition-transform duration-[1.2s] ease-in-out rounded-full" />
                        </a>

                        {/* 햄버거 버튼 (모바일 전용) */}
                        <button
                            aria-label="메뉴 열기"
                            onClick={() => setMobileOpen(true)}
                            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── 모바일 풀화면 오버레이 패널 ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden overflow-y-auto"
                    // 오버레이 배경 클릭 시 닫기는 의도하지 않음 — 콘텐츠가 꽉 차 있으므로 닫기 버튼으로만 닫음
                >
                    {/* 오버레이 헤더 */}
                    <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 shrink-0">
                        <Logo />
                        <button
                            aria-label="메뉴 닫기"
                            onClick={() => setMobileOpen(false)}
                            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* 아코디언 메뉴 목록 */}
                    <ul className="flex-1 px-4 py-4 space-y-1">
                        {NAV_ITEMS.map((menu) => (
                            <li key={menu.label}>
                                {/* 최상위 메뉴 토글 버튼 */}
                                <button
                                    aria-expanded={expandedMobile === menu.label}
                                    onClick={() => toggleMobileMenu(menu.label)}
                                    className="w-full flex items-center justify-between px-4 py-3.5 text-base font-semibold text-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
                                >
                                    {menu.label}
                                    <ChevronIcon open={expandedMobile === menu.label} />
                                </button>

                                {/* 하위 항목 (아코디언 펼침) */}
                                {expandedMobile === menu.label && (
                                    <ul className="pl-4 mt-1 mb-2 space-y-0.5">
                                        {menu.items.map((item) => (
                                            <li key={item.label}>
                                                <NavLink
                                                    item={item}
                                                    onClick={() => setMobileOpen(false)}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>

                    {/* 하단 문의하기 CTA */}
                    <div className="px-6 py-6 border-t border-slate-100 shrink-0">
                        <a
                            href="https://forms.office.com/r/YvQz3WbhZt"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center px-6 py-3.5 rounded-full font-semibold text-slate-800 bg-white/60 backdrop-blur-xl border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)] transition-all duration-300 hover:bg-white/80 active:scale-95"
                            onClick={() => setMobileOpen(false)}
                        >
                            문의하기
                        </a>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navigation;
