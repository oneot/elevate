import React from "react";
import ShowcaseLayout from "../components/ShowcaseLayout";
import ActivityShowcaseCarousel from "../components/ActivityShowcaseCarousel";
import { activityVideos } from "../data/activityVideos";

export default function ActivityShowcasePage() {
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