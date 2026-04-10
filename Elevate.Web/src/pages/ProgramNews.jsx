import React from 'react';
import Logo from '../components/Logo';

export default function ProgramNews() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <header className="flex flex-col gap-5 px-4 sm:px-6 lg:px-12 pt-10 pb-8">
        <div className="flex items-center gap-4">
          <Logo isBlog={true} />
          <p className="text-slate-400">|</p>
          <h1 className="text-2xl sm:text-3xl font-bold">행사 소식</h1>
        </div>
      </header>
      <main className="flex flex-col items-center justify-center py-16">
        <div className="clean-card rounded-2xl bg-white/90 shadow-lg p-8 sm:p-12 text-center max-w-xl">
          <p className="text-lg text-slate-700 mb-2">4월 둘째주부터</p>
          <p className="text-lg text-slate-700 font-semibold">Microsoft Elevate 행사소식이 찾아올 예정입니다.💡</p>
        </div>
      </main>
    </div>
  );
}
