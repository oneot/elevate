/**
 * @file Navigation.jsx
 * @description 홈 페이지 최상단에 고정되는 내비게이션 바 (현재 Home.jsx에서만 사용).
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
 *
 * - item.href 가 있으면 항상 <a> 태그를 사용한다.
 *   item.external 은 새 탭(_blank) 여부만 결정하며, href 존재 여부와는 무관하다.
 * - item.to 만 있으면 React Router <Link> 를 사용한다.
 * - ARIA menu 패턴(role="menu/menuitem")은 화살표 키 내비게이션 등을 완전 구현해야 하므로
 *   미구현 상태에서는 role 속성을 부여하지 않고 기본 링크/리스트 시맨틱을 사용한다.
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
            {/* "new" 배지 — 최근 추가된 항목에 표시 */}
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

    // href 가 있으면 항상 <a> 사용 — external 은 새 탭 여부만 결정
    if (item.href) {
        return (
            <a
                href={item.href}
                target={item.external ? '_blank' : '_self'}
                rel={item.external ? 'noopener noreferrer' : undefined}
                onClick={onClick}
                className={baseClass}
            >
                {content}
            </a>
        );
    }
    // to 가 있으면 React Router Link 사용
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
const NavigationContent = () => {
    // 현재 열린 데스크톱 드롭다운 메뉴의 label (null이면 모두 닫힘)
    const [openMenu, setOpenMenu] = useState(null);
    // 모바일 오버레이 열림 여부
    const [mobileOpen, setMobileOpen] = useState(false);
    // 모바일 아코디언에서 현재 펼쳐진 메뉴의 label
    const [expandedMobile, setExpandedMobile] = useState(null);

    /**
     * 드롭다운 닫힘 지연 타이머 ref.
     * 마우스가 버튼과 드롭다운 사이의 작은 gap을 통과할 때 즉시 닫히지 않도록
     * 150ms 딜레이를 줌. 그 안에 마우스가 다시 진입하면 타이머를 취소.
     */
    const closeTimerRef = useRef(null);
    /** 모바일 오버레이 DOM ref — 포커스 트랩에 사용 */
    const overlayRef = useRef(null);
    /** 모바일 오버레이 닫기 버튼 ref — 오버레이 열릴 때 최초 포커스 대상 */
    const closeBtnRef = useRef(null);

    /** 드롭다운 열기 — 진입 시 대기 중인 닫힘 타이머 취소 */
    const handleMenuEnter = (label) => {
        if (closeTimerRef.current) {
            clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
        }
        setOpenMenu(label);
    };

    /** 드롭다운 닫기 — 기존 타이머 clear 후 150ms 딜레이로 재설정 */
    const handleMenuLeave = () => {
        // 누적 타이머 방지: 이전 타이머를 반드시 취소 후 재설정
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        closeTimerRef.current = setTimeout(() => {
            closeTimerRef.current = null;
            setOpenMenu(null);
        }, 150);
    };

    // unmount 시 남은 타이머 cleanup (unmount 후 setState 방지)
    useEffect(() => {
        return () => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        };
    }, []);

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
    // 원래 overflow 값을 ref에 저장해두고 닫을 때 정확히 복원한다.
    const prevOverflowRef = useRef('');
    useEffect(() => {
        if (mobileOpen) {
            prevOverflowRef.current = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = prevOverflowRef.current;
        }
        return () => {
            document.body.style.overflow = prevOverflowRef.current;
        };
    }, [mobileOpen]);

    // 모바일 오버레이가 열릴 때 닫기 버튼으로 포커스 이동
    useEffect(() => {
        if (mobileOpen && closeBtnRef.current) {
            closeBtnRef.current.focus();
        }
    }, [mobileOpen]);

    /**
     * 모바일 오버레이 내 Tab 포커스 트랩.
     * 오버레이 밖으로 포커스가 빠지지 않도록 첫/마지막 포커스 가능 요소에서 순환한다.
     */
    const handleOverlayKeyDown = (e) => {
        if (e.key !== 'Tab') return;
        const focusable = overlayRef.current?.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    };

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
                                {/* 최상위 메뉴 버튼 — hover(마우스) + onClick(키보드/터치) 모두 지원 */}
                                <button
                                    type="button"
                                    aria-expanded={openMenu === menu.label}
                                    aria-haspopup="true"
                                    onClick={() => setOpenMenu((prev) => prev === menu.label ? null : menu.label)}
                                    className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    {menu.label}
                                    <ChevronIcon open={openMenu === menu.label} />
                                </button>

                                {/* 드롭다운 패널 */}
                                {openMenu === menu.label && (
                                    <ul
                                        className="absolute top-full left-0 mt-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[200px] z-50"
                                    >
                                        {menu.items.map((item) => (
                                            <li key={item.label}>
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
                            type="button"
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
            {/* role="dialog" + aria-modal: 키보드/스크린리더가 오버레이를 모달 대화상자로 인식하도록 함 */}
            {mobileOpen && (
                <div
                    ref={overlayRef}
                    role="dialog"
                    aria-modal="true"
                    aria-label="내비게이션 메뉴"
                    onKeyDown={handleOverlayKeyDown}
                    className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden overflow-y-auto"
                >
                    {/* 오버레이 헤더 */}
                    <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 shrink-0">
                        <Logo />
                        <button
                            ref={closeBtnRef}
                            type="button"
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
                                    type="button"
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

const Navigation = () => {
    const location = useLocation();
    return <NavigationContent key={location.pathname} />;
};

export default Navigation;
