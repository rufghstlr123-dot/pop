"use client";
import React from "react";
import {
  MapPin,
  Tag,
  User,
  Phone,
  Calendar,
  Clock,
  ArrowRight,
  RotateCcw,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Item } from "@/types/inventory";

interface ItemCardProps {
  item: Item;
  onBorrow: (item: Item) => void;
  onReturn: (item: Item) => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "";
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return `${diffDays}일 전`;
  } catch {
    return "";
  }
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
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

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onBorrow,
  onReturn,
  onDelete,
}) => {
  const isAvailable = item.status === "AVAILABLE";

  return (
    <div
      className={`hyundai-card rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden bg-white shadow-sm hover:shadow-md ${
        isAvailable
          ? "border-stone-200/90 hover:border-emerald-600/40"
          : "border-amber-200/70 hover:border-amber-500/40 bg-gradient-to-b from-white to-[#FAF6F0]"
      }`}
    >
      {/* Top Header */}
      <div className="p-5 sm:p-6 pb-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Category & Code */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-[#F4F1EA] text-[#4A453C] border border-[#E8E2D5]">
              {item.category}
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              #{item.code}
            </span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            {isAvailable ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                대여 가능
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
                <Clock className="w-3 h-3 text-amber-600" />
                대여 중
              </span>
            )}

            {/* Quick Delete */}
            <button
              onClick={() => {
                if (confirm(`'${item.name}' 물품을 목록에서 삭제하시겠습니까?`)) {
                  onDelete(item.id);
                }
              }}
              className="p-1 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition"
              title="물품 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Item Title */}
        <h3 className="text-lg font-bold text-hyundai-dark leading-snug tracking-tight mb-2">
          {item.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-hyundai-primary shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed bg-[#FBFBFA] p-2.5 rounded-xl border border-stone-100">
            {item.description}
          </p>
        )}
      </div>

      {/* Loaned Info or Available State */}
      <div className="px-5 sm:px-6 py-3 border-t border-stone-100 bg-[#FAF9F6]/50">
        {!isAvailable ? (
          <div className="space-y-1.5 text-xs text-stone-700">
            <div className="flex items-center justify-between">
              <span className="text-stone-400 font-medium">대여자</span>
              <span className="font-semibold text-hyundai-dark flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" />
                {item.borrower_name}
              </span>
            </div>

            {item.borrower_contact && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400">연락처/부서</span>
                <span className="text-stone-600 truncate max-w-[160px]">
                  {item.borrower_contact}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-stone-400">대여 시각</span>
              <span className="text-amber-800 font-medium">
                {formatDate(item.loaned_at)} ({formatRelativeTime(item.loaned_at)})
              </span>
            </div>

            {item.expected_return_date && (
              <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-dashed border-stone-200">
                <span className="text-stone-400">반납 예정</span>
                <span className="text-stone-700 font-medium">
                  {formatDate(item.expected_return_date)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between py-1 text-xs text-emerald-800">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              즉시 현장 수령 가능
            </span>
            <span className="text-[11px] text-stone-400 font-mono">STANDBY</span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-3 bg-white border-t border-stone-100">
        {isAvailable ? (
          <button
            onClick={() => onBorrow(item)}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-white bg-hyundai-primary hover:bg-[#254633] active:bg-[#14261B] transition flex items-center justify-center gap-2 shadow-sm"
          >
            <span>물품 대여하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => onReturn(item)}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm text-amber-900 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border border-amber-300/80 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>반납 확인 처리</span>
          </button>
        )}
      </div>
    </div>
  );
};
