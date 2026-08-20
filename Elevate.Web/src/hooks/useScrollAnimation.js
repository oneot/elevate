/**
 * @file useScrollAnimation.js
 * @description 스크롤 시 `.fade-in-section` 요소가 뷰포트에 10% 이상 들어오면
 * `is-visible` 클래스를 추가하는 IntersectionObserver 기반 훅.
 *
 * 한 번 진입하면 클래스를 유지한다(제거하지 않음).
 */
import { useEffect } from 'react';

/**
 * 스크롤 시 요소가 뷰포트에 들어올 때 fade-in 애니메이션을 적용하는 훅
 * .fade-in-section 클래스를 가진 요소들을 관찰하고 .is-visible 클래스를 추가
 */
export const useScrollAnimation = () => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const sections = document.querySelectorAll('.fade-in-section');
        sections.forEach((section) => observer.observe(section));

        return () => sections.forEach((section) => observer.unobserve(section));
    }, []);
};
