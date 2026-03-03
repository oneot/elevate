import { useEffect, useRef, useState } from 'react'

/**
 * IntersectionObserver 기반 스크롤 애니메이션 훅
 * 요소가 뷰포트에 들어오면 애니메이션 트리거
 */
export function useScrollAnimation(threshold = 0.1) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          // 한 번 보이면 더 이상 관찰하지 않음
          observer.unobserve(entry.target)
        }
      },
      { threshold }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold])

  return [ref, isVisible]
}
