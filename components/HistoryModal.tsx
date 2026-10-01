"use client";
import React from "react";
import { X, History, ArrowRight, RotateCcw, User, Clock } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
      <div className="bg-white border border-[#d1d1d1] rounded-xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-[#217346] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4" />
              대여 & 반납 실시간 기록
            </h2>
            <p className="text-[11px] text-[#e6f2ec] mt-0.5">
              실시간으로 처리된 모든 물품 대여 및 반납 히스토리입니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-[#e2e8f0] text-xs">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-[#94a3b8]">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="font-bold">기록된 대여/반납 이력이 없습니다.</p>
            </div>
          ) : (
            logs.map((log) => {
              const isBorrow = log.action === "BORROW";
              return (
                <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                      isBorrow
                        ? "bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa]"
                        : "bg-[#e6f2ec] text-[#217346] border border-[#bbf7d0]"
                    }`}
                  >
                    {isBorrow ? (
                      <ArrowRight className="w-3.5 h-3.5" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isBorrow
                            ? "bg-[#ffedd5] text-[#c2410c]"
                            : "bg-[#e6f2ec] text-[#217346]"
                        }`}
                      >
                        {isBorrow ? "대여" : "반납 완료"}
                      </span>
                      <span className="text-[11px] text-[#94a3b8] flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {formatDate(log.timestamp)}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-[#1e293b] mt-1">
                      {log.item_name}
                    </h4>

                    <div className="flex items-center gap-2 text-[11px] text-[#64748b] mt-0.5">
                      <span className="flex items-center gap-1 font-medium text-[#333333]">
                        <User className="w-3 h-3 text-[#94a3b8]" />
                        {log.user_name}
                      </span>
                      {log.note && (
                        <span className="text-[#64748b] bg-[#f1f5f9] px-1.5 py-0.5 rounded truncate max-w-sm">
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
        <div className="p-3 bg-[#f8fafc] border-t border-[#d1d1d1] text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-[#d1d1d1] bg-white text-[#333333] text-xs font-semibold hover:bg-slate-100 transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
