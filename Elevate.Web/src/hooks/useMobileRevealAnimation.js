/**
 * @file useMobileRevealAnimation.js
 * @description 터치 디바이스에서 `.reveal-card` 요소가 뷰포트 중앙 영역에 진입할 때
 * `in-view` 클래스를 토글하는 IntersectionObserver 기반 훅.
 *
 * `hover: none` 미디어 쿼리로 터치 디바이스만 대상으로 하며,
 * 마우스 지원 디바이스에서는 early return하여 옵저버를 생성하지 않는다.
 */
import { useEffect } from 'react';

/**
 * 모바일 터치 디바이스에서 카드가 화면 중앙 영역에 들어올 때 애니메이션을 적용하는 훅
 * .reveal-card 클래스를 가진 요소들을 관찰하고 .in-view 클래스를 토글
 */
export const useMobileRevealAnimation = () => {
    useEffect(() => {
        const isTouch = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (!isTouch) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) entry.target.classList.add("in-view");
                    else entry.target.classList.remove("in-view");
                });
            },
            { rootMargin: "-35% 0px -35% 0px", threshold: 0.01 }
        );

        const cards = document.querySelectorAll(".reveal-card");
        cards.forEach((c) => observer.observe(c));

        return () => cards.forEach((c) => observer.unobserve(c));
    }, []);
};
