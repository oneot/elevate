/**
 * @file navItems.js
 * @description 홈 네비게이션 바 메뉴 구조 상수.
 *
 * NAV_ITEMS 배열은 최상위 메뉴(label)와 그 하위 항목(items[])으로 구성된다.
 * 각 하위 항목은 다음 필드를 가진다:
 *   - label: 표시 텍스트
 *   - to: React Router 내부 경로 (내부 링크일 때)
 *   - href: 절대 외부 URL (외부 링크일 때)
 *   - external: true이면 새 탭(_blank)으로 열기
 */

export const NAV_ITEMS = [
    {
        label: '시작하기',
        items: [
            {
                // 같은 탭에서 열림 — external 미지정
                label: '계정 만들기',
                href: 'https://microsoft-elevate.com/m365/signup',
            },
        ],
    },
    {
        label: '블로그',
        items: [
            { label: 'M365', to: '/m365' },
            { label: 'Copilot', to: '/copilot' },
            { label: 'Teams', to: '/teams' },
            { label: 'Minecraft Education', to: '/minecraft' },
            { label: 'Excel', to: '/excel' },
            { label: 'OneNote', to: '/onenote' },
            { label: 'Copilot Studio', to: '/copilot-studio' },
        ],
    },
    {
        label: '소식',
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
