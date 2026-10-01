"use client";
import React, { useState } from "react";
import {
  X,
  Radio,
  Github,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Database,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface SyncGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCloud: boolean;
}

export const SyncGuideModal: React.FC<SyncGuideModalProps> = ({
  isOpen,
  onClose,
  isCloud,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleEnv = `NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const copyEnv = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F5] border border-stone-200 rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-hyundai-primary text-white p-6 relative shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-serif tracking-widest text-[#E5DEC9]">
              Deployment & Realtime Guide
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold mt-2 flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            실시간 연동 & 깃허브 / 버셀 배포 가이드
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            서로 다른 접속자가 동시에 동일한 화면을 실시간으로 공유하는 완벽한 아키텍처
          </p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-hyundai-dark">
          {/* Current Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isCloud
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : "bg-amber-50 border-amber-200 text-amber-950"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                isCloud ? "bg-emerald-500 animate-ping" : "bg-amber-500"
              }`}
            />
            <div>
              <h4 className="font-bold text-sm">
                현재 연동 상태: {isCloud ? "Supabase 클라우드 실시간 동기화 모드" : "듀얼 로컬 실시간 동기화 모드"}
              </h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isCloud
                  ? "Supabase Realtime이 활성화되어 있어 전 세계 어느 접속자든 0.1초 만에 동일한 화면을 공유합니다."
                  : "현재 로컬 모드에서는 동일 컴퓨터에서 '브라우저 창 2개(또는 시크릿 모드 창)'를 나란히 띄우면 새로고침 없이 즉시 실시간 동기화가 작동합니다."}
              </p>
            </div>
          </div>

          {/* 3 Step Deployment Flow */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-hyundai-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-hyundai-gold" />
              서로 다른 접속자 간 완전 실시간 연동 (3분 완성)
            </h3>

            {/* Step 1 */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-hyundai-primary text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-sm">Supabase 무료 데이터베이스 생성</span>
              </div>
              <p className="text-xs text-stone-600 pl-8 leading-relaxed">
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-semibold underline inline-flex items-center gap-1"
                >
                  Supabase.com <ExternalLink className="w-3 h-3" />
                </a>
                에서 무료 프로젝트를 1개 생성합니다. (Postgres DB + 웹소켓 실시간 기능 무료 제공)
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-hyundai-primary text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <span className="font-bold text-sm">SQL 에디터에서 테이블 1회 실행</span>
              </div>
              <p className="text-xs text-stone-600 pl-8 leading-relaxed">
                프로젝트 루트에 포함된 <code className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-800 font-mono">supabase_schema.sql</code> 파일의 내용을 복사하여 Supabase의 <strong>SQL Editor</strong>에 붙여넣고 <strong>[Run]</strong> 버튼을 누르면 실시간 테이블과 샘플 데이터가 자동 생성됩니다.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-hyundai-primary text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <span className="font-bold text-sm">GitHub Push 후 Vercel 연동</span>
              </div>
              <p className="text-xs text-stone-600 pl-8 leading-relaxed">
                GitHub 저장소에 소스코드를 푸시하고, Vercel에서 저장소를 Import합니다.
                Vercel의 <strong>Environment Variables</strong>에 아래 2가지 키를 등록하면 즉시 모든 접속자가 실시간으로 동기화됩니다.
              </p>

              <div className="pl-8 pt-2">
                <div className="bg-stone-900 text-stone-200 rounded-xl p-3 font-mono text-xs relative">
                  <pre className="overflow-x-auto">{sampleEnv}</pre>
                  <button
                    onClick={copyEnv}
                    className="absolute right-2 top-2 p-1.5 bg-stone-800 hover:bg-stone-700 rounded-lg text-stone-300 transition flex items-center gap-1 text-[11px]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        복사
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dual Engine Info */}
          <div className="p-4 bg-stone-100 rounded-2xl text-xs text-stone-600 space-y-1.5">
            <h5 className="font-bold text-hyundai-dark flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              듀얼 실시간 엔진 (Smart Fallback) 탑재
            </h5>
            <p className="leading-relaxed">
              본 시스템은 Supabase API 키가 없는 상태에서도 최신 브라우저의 <strong>BroadcastChannel API</strong>와 <strong>Storage Event</strong>를 감지하여,同一 디바이스 내 여러 창에서 실시간으로 대여/반납 상호작용을 바로 시연할 수 있도록 구현되어 있습니다.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-hyundai-primary text-white text-xs font-semibold hover:bg-hyundai-accent transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
