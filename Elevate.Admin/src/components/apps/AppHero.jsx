import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import AppArt from './AppArt.jsx'
import { getAppMeta } from '../../constants/appMeta.js'

/**
 * 공개 사이트 블로그 머리글과 같은 히어로 밴드 (브레드크럼 · eyebrow · 제목 · 요약 · 메타 · 버튼).
 * 오른쪽에는 앱 색으로 빛나는 유리 타일을 둔다.
 *
 * @param {Object} props
 * @param {string} props.app 색과 아이콘을 고르는 앱 키 ('all' 포함)
 * @param {Array<{label: string, to?: string}>} [props.crumbs]
 * @param {React.ReactNode} [props.eyebrow]
 * @param {string} [props.eyebrowIcon]
 * @param {React.ReactNode} props.title
 * @param {string|string[]} [props.abstract] 문자열 배열이면 항목마다 한 줄
 * @param {React.ReactNode[]} [props.meta] 세로 구분선으로 나뉘는 메타 정보
 * @param {React.ReactNode} [props.actions]
 * @param {boolean} [props.compact] 편집 화면용 작은 머리글
 * @param {boolean} [props.wide] 편집 화면처럼 넓은 컨테이너에 맞춘다
 */
export default function AppHero({
  app,
  crumbs = [],
  eyebrow,
  eyebrowIcon,
  title,
  abstract,
  meta = [],
  actions,
  compact = false,
  wide = false,
}) {
  const appMeta = getAppMeta(app)
  const metaItems = meta.filter(Boolean)

  return (
    <section className={`ea-hero${compact ? ' ea-hero--compact' : ''}`} aria-labelledby="ea-hero-title">
      <AppArt key={appMeta.key} className="ea-hero__art" paint={appMeta.paint} glyph={appMeta.glyph} />
      <div className={`ea-container${wide ? ' ea-container--wide' : ''} ea-hero__inner`}>
        <div className="ea-hero__text">
          {crumbs.length > 0 && (
            <nav className="ea-crumbs" aria-label="현재 위치">
              {crumbs.map((crumb, index) => (
                <Fragment key={`${crumb.label}-${index}`}>
                  {index > 0 && <span className="ea-crumbs__sep" aria-hidden="true">/</span>}
                  {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
                </Fragment>
              ))}
            </nav>
          )}
          {eyebrow && (
            <p className="ea-hero__eyebrow">
              {eyebrowIcon && <img src={eyebrowIcon} alt="" width="22" height="22" />}
              {eyebrow}
            </p>
          )}
          <h1 id="ea-hero-title" className="ea-hero__title">{title}</h1>
          {abstract && (
            <p className="ea-hero__abstract">
              {Array.isArray(abstract)
                ? abstract.map((line, index) => (
                  <Fragment key={index}>
                    {index > 0 && <br />}
                    {line}
                  </Fragment>
                ))
                : abstract}
            </p>
          )}
          {metaItems.length > 0 && (
            <div className="ea-hero__meta">
              {metaItems.map((item, index) => <span key={index}>{item}</span>)}
            </div>
          )}
          {actions && <div className="ea-hero__actions">{actions}</div>}
        </div>
      </div>
    </section>
  )
}
