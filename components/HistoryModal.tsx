"use client";
import React from "react";
import { X, History, ArrowRight, RotateCcw, User, Calendar, Clock } from "lucide-react";
import { RentalLog } from "@/types/inventory";

interface HistoryModalProps {
  logs: RentalLog[];
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return `${month}월 ${date}일 ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  logs,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F5] border border-stone-200 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-hyundai-primary text-white p-6 relative shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-serif tracking-widest text-[#E5DEC9]">
              The Hyundai Timeline
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold mt-2 flex items-center gap-2">
            <History className="w-5 h-5" />
            실시간 대여 & 반납 기록
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            모든 대여 및 반납 이력이 시간순으로 실시간 기록됩니다.
          </p>
        </div>

        {/* Logs List */}
        <div className="p-6 overflow-y-auto flex-1 divide-y divide-stone-200/70">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-stone-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">아직 대여/반납 이력이 없습니다.</p>
              <p className="text-xs mt-1">물품을 대여하거나 반납하면 이곳에 실시간으로 표시됩니다.</p>
            </div>
          ) : (
            logs.map((log) => {
              const isBorrow = log.action === "BORROW";
              return (
                <div key={log.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  {/* Status Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isBorrow
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {isBorrow ? (
                      <ArrowRight className="w-4 h-4" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isBorrow
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {isBorrow ? "대여 시작" : "반납 완료"}
                      </span>
                      <span className="text-xs text-stone-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatDate(log.timestamp)}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-hyundai-dark mt-1.5">
                      {log.item_name}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-stone-600 mt-1">
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        {log.user_name}
                      </span>
                      {log.note && (
                        <span className="text-stone-500 truncate max-w-xs bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                          {log.note}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
