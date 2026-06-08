import React, { useEffect, useLayoutEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import ShowcaseLayout from "../components/layout/ShowcaseLayout";
import ActivityShowcaseCarousel from "../components/common/ActivityShowcaseCarousel";
import fallbackActivityVideos from "../data/activityVideos.json";
import { listActivityVideos } from "../api/activityVideos";
import { DEFAULT_OG_IMAGE, SITE_NAME, canonicalUrl } from "../constants/seo";

const PAGE_TITLE = "활동사례 알아보기 | Microsoft Elevate";
const PAGE_DESCRIPTION = "Microsoft Elevate for Educators 커뮤니티의 교육 혁신 활동 사례와 인사이트를 영상으로 확인하세요.";

export default function ActivityShowcasePage() {
  const [items, setItems] = useState(fallbackActivityVideos);

  useEffect(() => {
    const controller = new AbortController();
    listActivityVideos({ signal: controller.signal })
      .then((data) => {
        const apiItems = Array.isArray(data?.items) ? data.items : [];
        if (apiItems.length > 0) setItems(apiItems);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setItems(fallbackActivityVideos);
        }
      });

    return () => controller.abort();
  }, []);

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
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={canonicalUrl("/activity")} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl("/activity")} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      <ShowcaseLayout
        crumbs={[
          { label: "Microsoft Elevate", to: "/" },
          { type: "sep" },
          { label: "활동사례 알아보기", to: "/activity" },
        ]}
        title="활동사례 알아보기"
        subtitle="Microsoft Elevate for Educators (MEE) 커뮤니티에서 교육 혁신 인사이트를 나누며 함께 성장해 보세요."
      >
        <ActivityShowcaseCarousel items={items} />
      </ShowcaseLayout>
    </>
  );
}
