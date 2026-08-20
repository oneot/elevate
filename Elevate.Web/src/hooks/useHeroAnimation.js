/**
 * @file useHeroAnimation.js
 * @description 페이지 최초 로드 시 히어로 섹션 요소를 순차적으로 페이드인하는 애니메이션 훅.
 *
 * `.hero-text > *` 요소에 150ms 간격 delay를, `.map-container`에 300ms delay를 적용한다.
 * opacity와 transform은 CSS에서 초기값(`0`, `translateY(20px)`)으로 설정되어 있어야 한다.
 */
import { useEffect } from 'react';

export const useHeroAnimation = () => {
    useEffect(() => {
        const heroElements = document.querySelectorAll('.hero-text > *');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + index * 150);
        });

        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            setTimeout(() => {
                mapContainer.style.opacity = '1';
                mapContainer.style.transform = 'scale(1)';
            }, 300);
        }
    }, []);
};
