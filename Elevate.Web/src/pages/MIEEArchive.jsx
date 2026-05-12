import React from 'react';
import { Link } from 'react-router-dom';
import StaticDocPage from '../components/layout/StaticDocPage';

const MIEEArchive = () => (
  <StaticDocPage
    category="mee"
    slug="miee-archive"
    postTitle="MEE 지원 아카이브(~2025-2026)"
    crumbs={[
      { label: 'Microsoft Elevate', to: '/' },
      { type: 'sep' },
      { label: '커뮤니티 가입하기', to: '/mee/pre' },
      { type: 'sep' },
      { label: 'MEE 아카이브' },
    ]}
    footer={
      <div className="flex items-center justify-start">
        <Link
          to="/mee/pre"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-[20px] transition hover:bg-white/[0.10]"
        >
          <span className="text-slate-500">←</span>
          커뮤니티 가입하기로 돌아가기
        </Link>
      </div>
    }
  />
);

export default MIEEArchive;