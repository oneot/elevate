import React from 'react';
import { Link } from 'react-router-dom';
import StaticDocPage from '../components/layout/StaticDocPage';

const MEEPre = () => (
  <StaticDocPage
    category="mee"
    slug="pre-mee"
    postTitle="Pre-MEE E(Explorer) 지원 매뉴얼"
    crumbs={[
      { label: 'Microsoft Elevate', to: '/' },
      { type: 'sep' },
      { label: '커뮤니티 가입하기' },
    ]}
    footer={
      <div className="flex items-center justify-end">
        <Link
          to="/#mee"
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-[20px] transition hover:bg-white/[0.10]"
        >
          <span className="text-slate-500">←</span>
          Microsoft Elevate
        </Link>
      </div>
    }
  />
);

export default MEEPre;