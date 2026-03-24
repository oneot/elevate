import React, { useEffect, useMemo, useRef, useState } from "react";

function getYouTubeThumbnail(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

function getWrappedIndex(index, length) {
  return (index + length) % length;
}

export default function ActivityShowcaseCarousel({ items = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [isAnimating, setIsAnimating] = useState(false);

  const listRefs = useRef([]);
  const listScrollContainerRef = useRef(null);

  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category).filter(Boolean));
    return ["전체", ...set];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "전체") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const safeActiveIndex =
    filteredItems.length === 0 ? 0 : Math.min(activeIndex, filteredItems.length - 1);

  const activeItem = filteredItems[safeActiveIndex] ?? null;

  const moveToIndex = (index) => {
    if (filteredItems.length === 0 || isAnimating) return;
    setIsAnimating(true);
    setPlayingId(null);
    setActiveIndex(getWrappedIndex(index, filteredItems.length));

    window.setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  const goPrev = () => {
    if (filteredItems.length === 0) return;
    moveToIndex(safeActiveIndex - 1);
  };

  const goNext = () => {
    if (filteredItems.length === 0) return;
    moveToIndex(safeActiveIndex + 1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setActiveIndex(0);
    setPlayingId(null);
  };

  useEffect(() => {
    const activeButton = listRefs.current[safeActiveIndex];
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [safeActiveIndex, selectedCategory]);

  const visibleCards = useMemo(() => {
    if (filteredItems.length === 0) return [];

    const positions = [-2, -1, 0, 1, 2];

    return positions.map((offset) => {
      const index = getWrappedIndex(safeActiveIndex + offset, filteredItems.length);
      return {
        item: filteredItems[index],
        offset,
        index,
      };
    });
  }, [filteredItems, safeActiveIndex]);

  const orderedCards = useMemo(() => {
    return [...visibleCards].sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));
  }, [visibleCards]);

  const orbitMotionMap = {
    [-2]: {
      transform:
        "translate(-50%, -50%) rotateY(58deg) translateX(-340px) translateY(22px) scale(0.72)",
      zIndex: 4,
      opacity: 0.14,
      filter: "blur(1.4px)",
      pointerEvents: "none",
    },
    [-1]: {
      transform:
        "translate(-50%, -50%) rotateY(34deg) translateX(-230px) translateY(10px) scale(0.86)",
      zIndex: 10,
      opacity: 0.42,
      filter: "blur(0.7px)",
      pointerEvents: "auto",
    },
    [0]: {
      transform:
        "translate(-50%, -50%) rotateY(0deg) translateX(0px) translateY(0px) scale(1)",
      zIndex: 20,
      opacity: 1,
      filter: "none",
      pointerEvents: "auto",
    },
    [1]: {
      transform:
        "translate(-50%, -50%) rotateY(-34deg) translateX(230px) translateY(10px) scale(0.86)",
      zIndex: 10,
      opacity: 0.42,
      filter: "blur(0.7px)",
      pointerEvents: "auto",
    },
    [2]: {
      transform:
        "translate(-50%, -50%) rotateY(-58deg) translateX(340px) translateY(22px) scale(0.72)",
      zIndex: 4,
      opacity: 0.14,
      filter: "blur(1.4px)",
      pointerEvents: "none",
    },
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const active = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryChange(category)}
                className={[
                  "rounded-full px-4 py-2 text-sm transition-all duration-300",
                  active
                    ? "border border-white/40 bg-white/30 text-slate-900 shadow-sm backdrop-blur-xl"
                    : "border border-white/20 bg-white/10 text-slate-700 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/18 hover:text-slate-900 hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]",
                ].join(" ")}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="rounded-full border border-white/20 bg-white/12 px-4 py-2 text-sm text-slate-700 backdrop-blur-xl">
          총 {filteredItems.length}개의 활동사례
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="relative min-w-0 px-2 py-4 sm:px-4">
          <div className="relative">
            <div className="mx-auto mb-10 flex min-h-[470px] items-center justify-center sm:min-h-[560px]">
              <div
                className="relative h-[360px] w-full max-w-[980px] overflow-visible sm:h-[460px]"
                style={{
                  perspective: "2200px",
                  transformStyle: "preserve-3d",
                }}
              >
                {orderedCards.map(({ item, offset, index }) => {
                  const isCenter = offset === 0;
                  const isPlaying = playingId === item.id && isCenter;
                  const motion = orbitMotionMap[offset];

                  return (
                    <article
                      key={`${item.id}-${offset}-${safeActiveIndex}`}
                      className="absolute left-1/2 top-1/2 w-[88%] max-w-[760px]"
                      style={{
                        zIndex: motion.zIndex,
                        pointerEvents: motion.pointerEvents,
                      }}
                      onClick={() => {
                        if (offset === -1) goPrev();
                        if (offset === 1) goNext();
                      }}
                    >
                      <div
                        className="transform-gpu transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] will-change-transform"
                        style={{
                          transform: motion.transform,
                          opacity: motion.opacity,
                          filter: motion.filter,
                          transformStyle: "preserve-3d",
                        }}
                      >
                        <div
                          className={[
                            "overflow-hidden rounded-[28px] border border-white/25 backdrop-blur-2xl transition-all duration-500",
                            isCenter
                              ? "bg-white/[0.92] ring-1 ring-white/60 shadow-[0_24px_72px_rgba(15,23,42,0.18)]"
                              : "bg-white/[0.22] shadow-[0_12px_36px_rgba(15,23,42,0.10)] hover:bg-white/[0.26]",
                          ].join(" ")}
                        >
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                            {isPlaying ? (
                              <iframe
                                className="h-full w-full"
                                src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0`}
                                title={item.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              />
                            ) : (
                              <>
                                <img
                                  src={getYouTubeThumbnail(item.videoId)}
                                  alt={item.title}
                                  className={[
                                    "h-full w-full object-cover transition-transform duration-700",
                                    isCenter ? "scale-[1.02]" : "scale-100",
                                  ].join(" ")}
                                />

                                {isCenter ? (
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/28 via-slate-900/6 to-transparent" />
                                ) : (
                                  <div className="absolute inset-0 bg-white/18" />
                                )}

                                {isCenter ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPlayingId(item.id);
                                    }}
                                    className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/25 text-white backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-white/32 hover:shadow-[0_10px_26px_rgba(255,255,255,0.18)]"
                                    aria-label={`${item.title} 재생`}
                                  >
                                    <span className="ml-0.5 text-xl">▶</span>
                                  </button>
                                ) : (
                                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <div className="rounded-full border border-white/20 bg-white/12 px-4 py-1 text-xs text-white/90 backdrop-blur-md">
                                      {offset < 0 ? "이전 카드" : "다음 카드"}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>

                          {isCenter ? (
                            <div className="space-y-3 px-5 py-5 sm:px-6">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 sm:text-sm">
                                <span className="rounded-full bg-white/35 px-3 py-1 backdrop-blur-md">
                                  {item.category}
                                </span>
                                <span className="rounded-full bg-white/25 px-3 py-1 backdrop-blur-md">
                                  {item.year}
                                </span>
                                <span>{item.channel}</span>
                              </div>

                              <h2 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                {item.title}
                              </h2>

                              <p className="line-clamp-2 text-sm leading-6 text-slate-700 sm:text-base">
                                {item.description}
                              </p>
                            </div>
                          ) : (
                            <div className="px-4 py-3">
                              <p className="line-clamp-1 text-sm font-medium text-slate-800">
                                {item.title}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="group rounded-full border border-white/25 bg-white/15 px-5 py-3 text-sm text-slate-800 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/45 hover:bg-white/28 hover:text-slate-950 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)] active:translate-y-0 active:scale-[0.98]"
              >
                <span className="inline-flex items-center gap-2 font-medium">
                  <span className="transition-transform duration-300 group-hover:-translate-x-1">
                    ←
                  </span>
                  이전
                </span>
              </button>

              <div className="rounded-full border border-white/20 bg-white/12 px-5 py-3 text-sm text-slate-700 backdrop-blur-xl">
                {filteredItems.length > 0 ? `${safeActiveIndex + 1} / ${filteredItems.length}` : "0 / 0"}
              </div>

              <button
                type="button"
                onClick={goNext}
                className="group rounded-full border border-white/25 bg-white/15 px-5 py-3 text-sm text-slate-800 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-white/45 hover:bg-white/28 hover:text-slate-950 hover:shadow-[0_12px_28px_rgba(15,23,42,0.14)] active:translate-y-0 active:scale-[0.98]"
              >
                <span className="inline-flex items-center gap-2 font-medium">
                  다음
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border border-white/20 bg-white/[0.10] p-4 shadow-[0_18px_60px_rgba(15,23,42,0.10)] backdrop-blur-2xl lg:sticky lg:top-6">
          <p className="mb-3 px-2 text-sm font-medium text-slate-700">
            활동 목록
          </p>

          {activeItem ? (
            <div className="mb-4 rounded-2xl border border-white/20 bg-white/18 px-3 py-3 text-sm text-slate-800 transition-all duration-300">
              <span className="mr-2 text-slate-500">현재 선택:</span>
              <span className="font-semibold text-slate-950">
                {activeItem.title}
              </span>
            </div>
          ) : null}

          <div
            ref={listScrollContainerRef}
            className="max-h-[min(62vh,560px)] space-y-3 overflow-y-auto pr-1"
          >
            {filteredItems.map((item, index) => {
              const active = index === safeActiveIndex;

              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    listRefs.current[index] = el;
                  }}
                  type="button"
                  onClick={() => {
                    moveToIndex(index);
                  }}
                  className={[
                    "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-2 pl-3 text-left transition-all duration-300",
                    active
                      ? "scale-[1.02] border border-white/35 bg-white/40 ring-1 ring-white/45 shadow-[0_12px_30px_rgba(15,23,42,0.12)]"
                      : "border border-transparent bg-transparent hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/18 hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]",
                  ].join(" ")}
                >
                  {active ? (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent" />
                  ) : (
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-white/10 via-transparent to-transparent" />
                  )}

                  <div
                    className={[
                      "absolute bottom-2 left-0 top-2 rounded-full transition-all duration-300",
                      active
                        ? "w-[4px] bg-blue-200"
                        : "w-[2px] bg-transparent group-hover:w-[3px] group-hover:bg-blue-400/50",
                    ].join(" ")}
                  />

                  <div className="relative shrink-0">
                    <img
                      src={getYouTubeThumbnail(item.videoId)}
                      alt={item.title}
                      className={[
                        "h-16 w-24 rounded-xl object-cover transition-all duration-300",
                        active
                          ? "scale-[1.03] ring-2 ring-white/50 shadow-[0_8px_20px_rgba(15,23,42,0.12)]"
                          : "group-hover:scale-[1.02] group-hover:ring-2 group-hover:ring-white/30 group-hover:shadow-[0_8px_18px_rgba(15,23,42,0.08)]",
                      ].join(" ")}
                    />
                    {active ? (
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/35" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={[
                        "line-clamp-2 text-sm transition-all duration-300",
                        active
                          ? "font-semibold text-slate-950"
                          : "font-medium text-slate-900 group-hover:text-slate-950",
                      ].join(" ")}
                    >
                      {item.title}
                    </div>

                    <div
                      className={[
                        "mt-1 text-xs transition-colors duration-300",
                        active
                          ? "text-slate-700"
                          : "text-slate-600 group-hover:text-slate-700",
                      ].join(" ")}
                    >
                      {item.category} · {item.year}
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-8 text-center text-sm text-slate-600">
                표시할 활동이 없습니다.
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}