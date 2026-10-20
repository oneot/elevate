/**
 * @file ActivityShowcasePage.jsx
 * @description 활동 사례 영상 페이지 (블로그와 같은 Apple Developer Documentation 스타일).
 *
 * - 왼쪽 내비게이터: 카테고리 → 영상 트리 (모바일에서는 드로어)
 * - 히어로 아래 플레이어: 선택한 영상을 크게 보여 주고, 카드나 목록에서 고르면 바로 재생한다
 * - 영상 카드 그리드: 카테고리 칩과 상단 검색으로 거른다
 * URL 쿼리: ?v=<YouTube 영상 ID>(선택한 영상), ?category=, ?q=, ?preview=local(내장 목록만 사용)
 */
import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, CirclePlay, GraduationCap, LayoutGrid, Mic, Workflow } from 'lucide-react';
import DocsShell from '../components/elevate-docs/DocsShell';
import DocsHero from '../components/elevate-docs/DocsHero';
import DocsNavigator, { NavHeader } from '../components/elevate-docs/DocsNavigator';
import { DocsEmpty, DocsLoadError } from '../components/elevate-docs/DocsList';
import { VideoGrid, VideoTheater } from '../components/elevate-docs/DocsVideo';
import { getDocsMeta, getTintStyle } from '../components/elevate-docs/docsMeta';
import fallbackActivityVideos from '../data/activityVideos.json';
import { listActivityVideos } from '../api/activityVideos';
import { useApiResource } from '../hooks/useApiResource';
import { DEFAULT_OG_IMAGE, SITE_NAME, canonicalUrl } from '../constants/seo';

const PAGE_TITLE = '활동사례 알아보기 | Microsoft Elevate';
const PAGE_DESCRIPTION = 'Microsoft Elevate for Educators 커뮤니티의 교육 혁신 활동 사례와 인사이트를 영상으로 확인하세요.';
const FEATURED_VIDEO_ID = 'QU0o1hRJP68';

const CATEGORY_ICONS = {
  행사: CalendarDays,
  수업사례: GraduationCap,
  인터뷰: Mic,
  업무자동화: Workflow,
};

function categoryIcon(category) {
  return CATEGORY_ICONS[category] || CirclePlay;
}

function matchesQuery(item, q) {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [item.title, item.description, item.channel, item.category].some((value) =>
    String(value || '').toLowerCase().includes(needle)
  );
}

export default function ActivityShowcasePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const useLocalPreview = searchParams.get('preview') === 'local';
  const [playingId, setPlayingId] = useState(null);

  const loadVideos = useCallback(async (signal) => (await listActivityVideos({ signal })).items, []);
  const { data, loading, error, retry } = useApiResource(useLocalPreview ? null : loadVideos);
  const items = data || fallbackActivityVideos;

  const categories = useMemo(() => [...new Set(items.map((item) => item.category).filter(Boolean))], [items]);
  const categoryParam = searchParams.get('category') || '';
  const category = categories.includes(categoryParam) ? categoryParam : '';
  const qParam = (searchParams.get('q') || '').trim();
  const videoParam = searchParams.get('v') || '';

  const filtered = useMemo(
    () => items.filter((item) => (!category || item.category === category) && matchesQuery(item, qParam)),
    [items, category, qParam]
  );

  const selected =
    items.find((item) => item.videoId === videoParam) ||
    items.find((item) => item.videoId === FEATURED_VIDEO_ID) ||
    items[0] ||
    null;
  const playing = Boolean(selected) && playingId === selected.videoId;
  // 이전/다음은 지금 보이는 목록 안에서 움직이고, 선택한 영상이 목록 밖이면 전체 목록을 쓴다.
  const queue = selected && filtered.some((item) => item.videoId === selected.videoId) ? filtered : items;
  const position = selected ? queue.findIndex((item) => item.videoId === selected.videoId) : -1;

  const nextParams = useCallback(
    (changes) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(changes).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      return params;
    },
    [searchParams]
  );

  const hrefWith = useCallback(
    (changes) => {
      const search = nextParams(changes).toString();
      return `/activity${search ? `?${search}` : ''}`;
    },
    [nextParams]
  );

  const updateParams = useCallback((changes) => setSearchParams(nextParams(changes)), [nextParams, setSearchParams]);

  // Bring the player into view only when it isn't already fully visible below the doc bar.
  const revealTheater = useCallback(() => {
    const section = document.getElementById('edoc-theater');
    const player = section?.querySelector('.edoc-player');
    if (!section || !player) return;
    const bar = document.querySelector('.edoc-dbar');
    const top = bar ? bar.getBoundingClientRect().bottom : 0;
    const rect = player.getBoundingClientRect();
    if (rect.top < top || rect.bottom > window.innerHeight) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const revealList = useCallback(() => {
    document.getElementById('edoc-videos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const playVideo = useCallback(
    (videoId) => {
      setPlayingId(videoId);
      revealTheater();
    },
    [revealTheater]
  );

  const step = (delta) => {
    if (position < 0 || queue.length < 2) return;
    const next = queue[(position + delta + queue.length) % queue.length];
    updateParams({ v: next.videoId });
  };

  const navSections = useMemo(
    () => [
      {
        id: 'activity-categories',
        heading: '카테고리',
        nodes: [
          {
            id: 'cat:all',
            label: '전체 영상',
            icon: LayoutGrid,
            badge: items.length,
            to: hrefWith({ category: '', q: '' }),
            onSelect: revealList,
          },
          ...categories.map((name) => {
            const videos = items.filter((item) => item.category === name);
            return {
              id: `cat:${name}`,
              label: name,
              icon: categoryIcon(name),
              badge: videos.length,
              to: hrefWith({ category: name }),
              onSelect: revealList,
              defaultExpanded: name === category,
              children: videos.map((video) => ({
                id: `vid:${video.videoId}`,
                label: video.title,
                to: hrefWith({ v: video.videoId }),
                onSelect: () => playVideo(video.videoId),
              })),
            };
          }),
        ],
      },
    ],
    [items, categories, category, hrefWith, revealList, playVideo]
  );

  const meta = getDocsMeta('activity');

  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={canonicalUrl('/activity')} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl('/activity')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>
      <DocsShell
        section="activity"
        tintStyle={getTintStyle('activity')}
        search={{
          placeholder: '활동 사례 검색',
          value: qParam,
          onSubmit: (q) => {
            // 상단 검색은 모든 영상에서 찾는다 (카테고리 칩 선택은 풀어 준다).
            updateParams({ q, category: '' });
            if (q) revealList();
          },
        }}
        navigator={(
          <DocsNavigator
            header={<NavHeader backTo="/" backLabel="Elevate 홈" title="활동 사례" subtitle={`영상 ${items.length}개`} />}
            sections={navSections}
            activeId={selected ? `vid:${selected.videoId}` : ''}
          />
        )}
        fabLabel="영상 목록"
      >
        <DocsHero
          wide
          category="activity"
          eyebrow="MEE 커뮤니티"
          title="활동사례 알아보기"
          abstract={meta.description}
          meta={[`영상 ${items.length}개`, `카테고리 ${categories.length}개`]}
        />

        {loading && (
          <p className="edoc-container edoc-container--wide" role="status">최신 영상 목록을 불러오는 중...</p>
        )}
        {error && (
          <div className="edoc-container edoc-container--wide">
            <DocsLoadError
              title="최신 영상 목록을 불러오지 못했습니다."
              message={`기본 영상 목록을 표시합니다. ${error.message}`}
              onRetry={retry}
            />
          </div>
        )}

        <VideoTheater
          item={selected}
          playing={playing}
          onPlay={() => selected && setPlayingId(selected.videoId)}
          position={position + 1}
          total={queue.length}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          Icon={selected ? categoryIcon(selected.category) : undefined}
        />

        <section
          id="edoc-videos"
          className="edoc-container edoc-container--wide edoc-section edoc-vsection"
          aria-labelledby={qParam ? 'edoc-list-heading' : undefined}
          aria-label={qParam ? undefined : '영상 목록'}
        >
          {/* 목록 위 제목·개수는 두지 않고, 검색 중일 때만 결과 제목과 '검색 지우기'를 보여 준다. */}
          {qParam && (
            <div className="edoc-section__head">
              <h2 id="edoc-list-heading" className="edoc-h2">
                ‘{qParam}’ 검색 결과
              </h2>
              <div className="edoc-section__tools">
                <button type="button" className="edoc-textlink" onClick={() => updateParams({ category: '', q: '' })}>
                  검색 지우기
                </button>
              </div>
            </div>
          )}

          <div className="edoc-chips" role="group" aria-label="카테고리로 거르기">
            <button type="button" className="edoc-chip" aria-pressed={!category} onClick={() => updateParams({ category: '' })}>
              전체
            </button>
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                className="edoc-chip"
                aria-pressed={name === category}
                onClick={() => updateParams({ category: name })}
              >
                {name}
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <VideoGrid
              items={filtered}
              activeId={selected?.videoId}
              playingId={playing ? selected.videoId : null}
              hrefFor={(item) => hrefWith({ v: item.videoId })}
              onSelect={(item) => playVideo(item.videoId)}
              iconFor={categoryIcon}
            />
          ) : (
            <DocsEmpty title={qParam ? `‘${qParam}’에 대한 영상이 없습니다.` : '표시할 영상이 없습니다.'}>
              {qParam ? '다른 검색어를 입력하거나 카테고리를 바꿔 보세요.' : undefined}
            </DocsEmpty>
          )}
        </section>
      </DocsShell>
    </>
  );
}
