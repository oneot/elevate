/**
 * @file DocsVideo.jsx
 * @description 활동 사례(영상) 화면 구성 요소.
 *
 * - VideoTheater: 선택한 영상을 크게 보여 주는 플레이어. 포스터의 유리 재생 버튼을 누르면 YouTube로 재생한다.
 * - VideoGrid: 블로그 게시글 카드와 같은 모양의 영상 카드 그리드.
 * 카드·이전/다음 버튼은 블로그 목록(DocsList)과 같은 스타일 클래스를 쓴다.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronLeft, ChevronRight, Play } from 'lucide-react';

function youtubeThumbnail(videoId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * 큰 포스터는 고화질(maxresdefault)을 먼저 쓴다. 고화질이 없는 영상은 YouTube가 120px 회색 이미지나
 * 404를 돌려주므로 그때는 hqdefault로 바꾼다. 영상이 바뀌면 부모가 key로 상태를 초기화한다.
 */
function PosterImage({ videoId }) {
  const [quality, setQuality] = useState('maxresdefault');
  return (
    <img
      src={youtubeThumbnail(videoId, quality)}
      alt=""
      decoding="async"
      fetchPriority="high"
      onLoad={(event) => {
        if (quality === 'maxresdefault' && event.currentTarget.naturalWidth <= 120) setQuality('hqdefault');
      }}
      onError={() => {
        if (quality !== 'hqdefault') setQuality('hqdefault');
      }}
    />
  );
}

/**
 * @param {Object} props
 * @param {{ videoId: string, title: string, description?: string, category?: string, year?: string|number, channel?: string }|null} props.item
 * @param {boolean} props.playing
 * @param {() => void} props.onPlay
 * @param {number} props.position - 1부터 시작하는 현재 순서
 * @param {number} props.total
 * @param {() => void} props.onPrev
 * @param {() => void} props.onNext
 * @param {React.ComponentType} [props.Icon] - 카테고리 아이콘
 */
export function VideoTheater({ item, playing, onPlay, position, total, onPrev, onNext, Icon }) {
  if (!item) return null;
  const details = [item.category, item.year, item.channel].filter(Boolean);

  return (
    <section id="edoc-theater" className="edoc-container edoc-container--wide edoc-theater" aria-labelledby="edoc-theater-title">
      <div className="edoc-player">
        {playing ? (
          <iframe
            key={item.videoId}
            src={`https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button type="button" className="edoc-player__poster" onClick={onPlay} aria-label={`${item.title} 재생`}>
            <PosterImage key={item.videoId} videoId={item.videoId} />
            <span className="edoc-play" aria-hidden="true">
              <Play size={28} fill="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
            </span>
          </button>
        )}
      </div>

      <div className="edoc-theater__info">
        <div className="edoc-theater__text">
          {details.length > 0 && (
            <p className="edoc-theater__eyebrow">
              {Icon && <Icon size={15} strokeWidth={1.9} aria-hidden="true" />}
              {details.join(' · ')}
            </p>
          )}
          <h2 id="edoc-theater-title" className="edoc-theater__title">
            {item.title}
          </h2>
          {item.description && <p className="edoc-theater__desc">{item.description}</p>}
          <p className="edoc-theater__links">
            <a
              className="edoc-textlink"
              href={`https://www.youtube.com/watch?v=${item.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube에서 보기
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </p>
        </div>

        {total > 1 && (
          <nav className="edoc-theater__nav" aria-label="영상 이동">
            <button type="button" className="edoc-pager__step" onClick={onPrev}>
              <ChevronLeft size={16} aria-hidden="true" />
              이전
            </button>
            <span className="edoc-theater__count" aria-live="polite">
              {position} / {total}
            </span>
            <button type="button" className="edoc-pager__step" onClick={onNext}>
              다음
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}

function VideoCard({ item, href, active, playing, onSelect, Icon, priority }) {
  const details = [item.year, item.channel].filter(Boolean).join(' · ');

  return (
    <article className="edoc-card edoc-vcard" data-active={active ? 'true' : undefined}>
      <Link
        to={href}
        className="edoc-card__link"
        aria-current={active ? 'true' : undefined}
        onClick={() => onSelect(item)}
      >
        <div className="edoc-card__media">
          <img
            src={youtubeThumbnail(item.videoId)}
            alt=""
            width="480"
            height="360"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
          <span className="edoc-vcard__play" aria-hidden="true">
            <Play size={13} fill="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
          </span>
          {active && <span className="edoc-vcard__now">{playing ? '재생 중' : '선택됨'}</span>}
        </div>
        <div className="edoc-card__body">
          {item.category && (
            <p className="edoc-card__eyebrow">
              {Icon && <Icon size={14} strokeWidth={1.9} aria-hidden="true" />}
              {item.category}
            </p>
          )}
          <h3 className="edoc-card__title">{item.title}</h3>
          {item.description && <p className="edoc-card__excerpt">{item.description}</p>}
          {details && <p className="edoc-card__meta">{details}</p>}
        </div>
      </Link>
    </article>
  );
}

/**
 * @param {Object} props
 * @param {Array} props.items
 * @param {string} [props.activeId] - 선택한 영상의 videoId
 * @param {string|null} [props.playingId] - 재생 중인 영상의 videoId
 * @param {(item: Object) => string} props.hrefFor - 카드 링크 (선택한 영상을 URL에 담는다)
 * @param {(item: Object) => void} props.onSelect
 * @param {(category: string) => React.ComponentType} [props.iconFor]
 */
export function VideoGrid({ items, activeId, playingId, hrefFor, onSelect, iconFor }) {
  return (
    <div className="edoc-grid">
      {items.map((item, index) => (
        <VideoCard
          key={item.videoId}
          item={item}
          href={hrefFor(item)}
          active={item.videoId === activeId}
          playing={item.videoId === playingId}
          onSelect={onSelect}
          Icon={iconFor ? iconFor(item.category) : undefined}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
