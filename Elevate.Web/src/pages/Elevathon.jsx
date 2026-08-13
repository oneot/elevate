import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE_NAME, canonicalUrl } from '../constants/seo';
import meeImage from '../assets/mee-image-720.jpg';
import gtpImage from '../assets/GTP2-720.jpg';
import './Elevathon.css';

const FORM_URL = 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=v4j5cvGGr0GRqy180BHbR8nX5ErKQsdOq2ua2V06Dq1UOVZBU1E3VFdGM0g5VzJXVVpZVE9WSFNBWS4u';
const PAGE_TITLE = 'Microsoft Elevathon | Ideas into impact';
const PAGE_DESCRIPTION = 'Microsoft AI로 업무와 교육 현장의 변화를 만드는 한 달간의 팀 경진대회, Microsoft Elevathon에 참여하세요.';

const products = [
  {
    name: 'M365 Copilot',
    image: '/images/elevathon/copilot.png',
    description: '업무 맥락을 이해하고 문서, 데이터, 커뮤니케이션을 하나의 흐름으로 연결합니다.',
    label: 'AI ASSISTANT',
    href: 'https://www.microsoft.com/ko-kr/microsoft-365-copilot',
  },
  {
    name: 'Copilot Cowork',
    image: '/images/elevathon/cowork.png',
    description: '여러 단계의 업무를 계획하고 실행해, 요청한 결과물을 실제 작업으로 완성합니다.',
    label: 'EXECUTION LAYER',
    href: 'https://www.microsoft.com/en-us/microsoft-365-copilot/cowork',
  },
  {
    name: 'Microsoft Scout',
    image: '/images/elevathon/scout.png',
    description: '업무 우선순위를 지속적으로 파악하고 필요한 다음 행동을 선제적으로 이어갑니다.',
    label: 'AUTOPILOT AGENT',
    href: 'https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/02/introducing-microsoft-scout-your-always-on-personal-agent/',
  },
  {
    name: 'Copilot Studio',
    image: '/images/elevathon/studio.png',
    description: '자연어와 생성형 AI로 조직과 교육 현장에 맞는 맞춤형 Agent를 설계합니다.',
    label: 'AGENT BUILDER',
    href: 'https://www.microsoft.com/ko-kr/microsoft-365-copilot/microsoft-copilot-studio',
  },
  {
    name: 'GitHub',
    image: '/images/elevathon/github.png',
    description: 'AI 기반 코드 제안과 개발 지원으로 교육 현장에 필요한 Agent와 솔루션 구현을 가속합니다.',
    label: 'DEVELOPER PLATFORM',
    href: 'https://github.com/',
  },
];

const phases = [
  ['9월 넷째 주', 'Kick-off Day', 'Microsoft Office · 팀별 계정 제공 · 트랙별 도구 교육'],
  ['10월 첫째 주', 'Define', '교실 현장의 문제, 기대 성과, Demo 기준 정의'],
  ['10월 둘째 주', 'Build & Improve', '업무 시나리오 또는 AI Agent 제작과 반복 개선'],
  ['10월 넷째 주', 'Final Competition', '광화문 Microsoft Office · 최종 발표 및 Live Demo'],
];

function ApplyButton({ children, className = '' }) {
  return (
    <a className={`elevathon-button elevathon-button-primary ${className}`} href={FORM_URL} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="elevathon-arrow" aria-hidden="true">→</span>
    </a>
  );
}

export default function Elevathon() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const elements = document.querySelectorAll('.elevathon-page [data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="elevathon-page">
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={canonicalUrl('/elevathon')} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl('/elevathon')} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
      </Helmet>

      <main>
        <section className="elevathon-hero">
          <div className="elevathon-wrap">
            <p className="elevathon-eyebrow">FY27 START · GTP &amp; E4E</p>
            <h1><span>Microsoft Elevathon</span><span className="elevathon-soft">Ideas into impact.</span></h1>
            <p className="elevathon-hero-copy">Microsoft AI와 함께 업무를 더 스마트하게, 교육 현장을 더 혁신적으로.<br />한 달간 제작하고 시연하는 Microsoft Elevathon에 초대합니다.</p>
            <div className="elevathon-hero-actions"><ApplyButton>참가 신청하기</ApplyButton></div>

            <div className="elevathon-hero-visual" aria-label="해커톤 활용 Microsoft AI 제품">
              <div className="elevathon-center-glass"><strong>Build what changes work.<span>One month · Two tracks · Unlimited tokens</span></strong></div>
              {products.map((product, index) => (
                <div className={`elevathon-product-float elevathon-float-${index + 1}`} key={product.name}>
                  <img src={product.image} alt="" />
                  <span>{product.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="elevathon-stats-section" aria-label="행사 핵심 정보">
          <div className="elevathon-wrap">
            <div className="elevathon-stats" data-reveal>
              <div><b>2</b><span>개의 경진 트랙</span></div>
              <div><b>1000</b><span>만원 규모의 총상금</span></div>
              <div><b>한달</b><span>간의 경진대회</span></div>
              <div><b>무제한</b><span>토큰, 라이센스 지원</span></div>
            </div>
          </div>
        </section>

        <section id="tracks" className="elevathon-section">
          <div className="elevathon-wrap">
            <div data-reveal>
              <p className="elevathon-kicker">Choose your challenge</p>
              <h2>어떤 변화를 만들지<br />선택하세요.</h2>
              <p className="elevathon-lead">두 트랙 모두 실제 사용 장면에서 작동하는 결과물을 완성하고, 광화문 Microsoft Office의 최종 무대에서 직접 시연합니다.</p>
            </div>
            <div className="elevathon-tracks" data-reveal>
              <article><p className="elevathon-track-label">TRACK 1</p><strong>AI WORKTHON</strong><h3>일하는 방식을<br />다시 설계합니다.</h3><p>Microsoft AI를 활용해 반복 업무를 자동화하고, 더 빠르고 효율적인 업무 프로세스 데모 시나리오를 제작합니다.</p><div>M365 Copilot · Cowork · Scout</div></article>
              <article><p className="elevathon-track-label">TRACK 2</p><strong>AI AGENTHON</strong><h3>교육 현장을 바꾸는<br />AI Agent를 만듭니다.</h3><p>실제 교실의 문제를 정의하고, 교육 현장의 혁신을 가져올 AI Agent를 제작합니다.</p><div>M365 Copilot · Copilot Studio · GitHub</div></article>
            </div>
          </div>
        </section>

        <section id="tools" className="elevathon-section elevathon-tools-section">
          <div className="elevathon-wrap">
            <div data-reveal><p className="elevathon-kicker">Built with Microsoft AI</p><h2>프롬프트에서 끝나지 않고,<br />실제 프로젝트로.</h2><p className="elevathon-lead">Kick-off Day에서 트랙별 실습을 진행하고,<br /> 팀별 무제한 토큰 / 라이센스 탑재 계정을 제공해 바로 프로젝트를 시작합니다.</p></div>
            <div className="elevathon-tools" data-reveal>
              {products.map((product) => (
                <a href={product.href} target="_blank" rel="noopener noreferrer" key={product.name} aria-label={`${product.name} 공식 페이지 열기`}>
                  <div><img src={product.image} alt="" /><h3>{product.name}</h3><p>{product.description}</p></div>
                  <span>{product.label}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="schedule" className="elevathon-section">
          <div className="elevathon-wrap elevathon-schedule">
            <div data-reveal><p className="elevathon-kicker">One-month build</p><h2>만들고,<br />배포하고,<br />시연합니다.</h2><p className="elevathon-lead">Kick-off를 시작으로 9월 말 팀별 시연 발표로 이어지는 집중 빌드 여정입니다.</p></div>
            <div className="elevathon-timeline" data-reveal>
              {phases.map(([date, title, description]) => <div className="elevathon-phase" key={title}><time>{date}</time><div><h3>{title}</h3><p>{description}</p></div></div>)}
            </div>
          </div>
        </section>

        <section id="prize" className="elevathon-section">
          <div className="elevathon-wrap">
            <div data-reveal><p className="elevathon-kicker">Prize</p><h2>두 트랙에서 각각<br />Top 3를 시상합니다.</h2><p className="elevathon-lead">우수 사례로 선정 된 팀에게 소정의 상품권이 제공됩니다.</p></div>
            <div className="elevathon-prize-shell" data-reveal>
              {[['1st', '300만원', '각 트랙 1위'], ['2nd', '150만원', '각 트랙 2위'], ['3rd', '50만원', '각 트랙 3위']].map(([rank, amount, note]) => <div className="elevathon-prize" key={rank}><small>{rank}</small><b>{amount}</b><span>{note}</span></div>)}
            </div>
          </div>
        </section>

        <section id="teams" className="elevathon-section">
          <div className="elevathon-wrap">
            <div data-reveal><p className="elevathon-kicker">Who can join</p><h2>작은 팀으로<br />크게 도전하세요.</h2></div>
            <div className="elevathon-teams" data-reveal>
              <article><b>Partner · 파트너 대표팀</b><p>각 파트너사는 최대 4명의 파트너 대표 팀원을 구성해, 조직의 실무 과제를 해결할 AI 프로젝트를 완성합니다.</p><img className="elevathon-team-image" src={meeImage} alt="Microsoft Elevate for Educators Network" loading="lazy" decoding="async" /></article>
              <article><b>E4E · 교원 자유팀</b><p>교원 최대 4명이 자유롭게 한 팀을 꾸려, 교육 현장의 변화를 이끌 AI 아이디어에 도전합니다.</p><img className="elevathon-team-image" src={gtpImage} alt="Microsoft Global Training Partner" loading="lazy" decoding="async" /></article>
            </div>
          </div>
        </section>

        <section className="elevathon-cta-section">
          <div className="elevathon-wrap">
            <div className="elevathon-cta" data-reveal><div><p className="elevathon-eyebrow">Ready to build?</p><h2>아이디어를<br />우리가 사는 세상으로.</h2><p>팀과 문제를 정했다면 지금 바로 시작하세요.<br />Kick-off Day에 광화문에서 만나요!</p><ApplyButton>Microsoft Forms로 참가 신청</ApplyButton><small>신청 링크는 새 창에서 열립니다.</small></div></div>
          </div>
        </section>
      </main>

      <ApplyButton className="elevathon-mobile-apply">참가 신청하기</ApplyButton>
    </div>
  );
}