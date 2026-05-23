import React, { useLayoutEffect } from "react";
import ShowcaseLayout from "../components/layout/ShowcaseLayout";
import ActivityShowcaseCarousel from "../components/common/ActivityShowcaseCarousel";
import activityVideos from "../data/activityVideos.json";

export default function ActivityShowcasePage() {
  useLayoutEffect(() => {
    const style = document.createElement("style");
    style.textContent =
      "html, body { scrollbar-width: none; -ms-overflow-style: none; }" +
      " html::-webkit-scrollbar, body::-webkit-scrollbar { width: 0; height: 0; }";
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);
  return (
    <ShowcaseLayout
      crumbs={[
        { label: "Microsoft Elevate", to: "/" },
        { type: "sep" },
        { label: "활동사례 알아보기", to: "/activity" },
      ]}
      title="활동사례 알아보기"
      subtitle="Microsoft Elevate for Educators (MEE) 커뮤니티에서 교육 혁신 인사이트를 나누며 함께 성장해 보세요."
    >
      <ActivityShowcaseCarousel items={activityVideos} />
    </ShowcaseLayout>
  );
}