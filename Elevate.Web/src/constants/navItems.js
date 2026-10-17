/**
 * @file navItems.js
 * @description 홈 네비게이션 바 메뉴 구조 상수.
 *
 * NAV_ITEMS 배열은 최상위 메뉴(label)와 그 하위 항목(items[])으로 구성된다.
 * 최상위 메뉴에 to가 있으면 메뉴 이름 자체도 그 경로로 이동하는 링크가 된다.
 * 최상위 메뉴에 hidden이 true면 헤더(데스크톱·모바일)에 표시하지 않는다 (데이터는 그대로 둔다).
 * 각 하위 항목은 다음 필드를 가진다:
 *   - label: 표시 텍스트
 *   - to: React Router 내부 경로 (내부 링크일 때)
 *   - href: 절대 외부 URL (외부 링크일 때)
 *   - external: true이면 새 탭(_blank)으로 열기
 */

import { SHOW_NEWS_SECTIONS } from './features';

export const NAV_ITEMS = [
    {
        label: '시작하기',
        items: [
            {
                // 사이트 내부 경로 — 같은 탭에서 열리고, 로컬·운영 어디서든 같은 게시글로 이동
                label: '계정 만들기',
                to: '/m365/signup',
            },
        ],
    },
    {
        label: '블로그',
        to: '/all',
        items: [
            { label: 'M365', to: '/m365' },
            { label: 'Copilot', to: '/copilot' },
            { label: 'Copilot Studio', to: '/copilot-studio' },
            { label: 'Teams', to: '/teams' },
            { label: 'OneNote', to: '/onenote' },
            { label: 'Forms', to: '/forms' },
            { label: 'OneDrive', to: '/onedrive' },
            { label: 'PowerPoint', to: '/powerpoint' },
            { label: 'Excel', to: '/excel' },
            { label: 'Word', to: '/word' },
            { label: 'Minecraft Education', to: '/minecraft' },
            { label: 'GitHub', to: '/github' },
            { label: 'Azure', to: '/azure' },
        ],
    },
    {
        // 요즘 업데이트하지 않아 숨김 — features.js의 SHOW_NEWS_SECTIONS로 다시 켤 수 있다.
        label: '소식',
        hidden: !SHOW_NEWS_SECTIONS,
        items: [
            { label: 'AI & M365 최신 정보', to: '/update' },
            { label: '행사 및 프로그램 소식', to: '/program-news' },
        ],
    },
    {
        label: '참여하기',
        items: [
            { label: 'MEE 커뮤니티 가입하기', to: '/mee/pre-mee' },
            { label: '활동 사례 알아보기', to: '/activity' },
            {
                label: '에이전톤 문의하기',
                href: 'https://forms.office.com/r/YvQz3WbhZt',
                external: true,
            },
            { label: '에이전톤 우수사례', to: '/agenthon' },
        ],
    },
    {
        label: '파트너 / 지원',
        items: [
            {
                label: '파트너 신청하기',
                href: 'https://partner.microsoft.com/ko-kr/explore/education/gtp',
                external: true,
            },
            {
                label: '파트너 찾아보기',
                href: 'https://learn.microsoft.com/en-us/training/educator-center/programs/global-training-partner/find-global-training-partner#korea',
                external: true,
            },
        ],
    },
];
