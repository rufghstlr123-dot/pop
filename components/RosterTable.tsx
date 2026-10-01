"use client";
import React from "react";
import { Item } from "@/types/inventory";
import { User, MapPin, Calendar, Clock, RotateCcw, ArrowRight, Trash2, CheckCircle2 } from "lucide-react";

interface RosterTableProps {
  items: Item[];
  onBorrow: (item: Item) => void;
  onReturn: (item: Item) => void;
  onDelete: (id: string) => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
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

function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return "";
  try {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "(방금 전)";
    if (diffMins < 60) return `(${diffMins}분 전)`;
    if (diffHours < 24) return `(${diffHours}시간 전)`;
    return `(${diffDays}일 전)`;
  } catch {
    return "";
  }
}

export const RosterTable: React.FC<RosterTableProps> = ({
  items,
  onBorrow,
  onReturn,
  onDelete,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#666666]">
        <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-[#94a3b8]" />
        </div>
        <p className="font-bold text-sm text-[#333333]">해당 카테고리/검색어에 해당하는 물품이 없습니다.</p>
        <p className="text-xs text-[#94a3b8] mt-1">좌측 사이드바에서 새로운 물품을 바로 등록하실 수 있습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-[#f3f3f3] sticky top-0 z-20 border-b-2 border-[#bbbbbb]">
          <tr>
            <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] w-24">
              관리코드
            </th>
            <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] w-28">
              카테고리
            </th>
            <th className="py-2.5 px-4 font-bold text-[#333333] border-r border-[#d1d1d1] min-w-[220px]">
              물품명 & 비치 장소
            </th>
            <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] w-24 text-center">
              대여 상태
            </th>
            <th className="py-2.5 px-4 font-bold text-[#333333] border-r border-[#d1d1d1] min-w-[180px]">
              현재 대여자 / 연락처
            </th>
            <th className="py-2.5 px-3 font-bold text-[#333333] border-r border-[#d1d1d1] w-36">
              대여 일시 / 반납 예정
            </th>
            <th className="py-2.5 px-3 font-bold text-[#333333] w-28 text-center">
              관리 처리
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#d1d1d1]">
          {items.map((item) => {
            const isAvailable = item.status === "AVAILABLE";
            return (
              <tr
                key={item.id}
                className="hover:bg-[#f8fafc] transition-colors group"
              >
                {/* Code */}
                <td className="py-3 px-3 border-r border-[#d1d1d1] font-mono text-[11px] text-[#666666] whitespace-nowrap">
                  #{item.code}
                </td>

                {/* Category */}
                <td className="py-3 px-3 border-r border-[#d1d1d1] whitespace-nowrap">
                  <span className="px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569] font-medium text-[11px] border border-[#e2e8f0]">
                    {item.category}
                  </span>
                </td>

                {/* Item Name & Location */}
                <td className="py-3 px-4 border-r border-[#d1d1d1]">
                  <div className="font-bold text-sm text-[#1e293b] leading-tight group-hover:text-[#217346] transition-colors">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[#64748b] mt-1">
                    <MapPin className="w-3 h-3 text-[#217346] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>
                  {item.description && (
                    <div className="text-[11px] text-[#666666] mt-0.5 line-clamp-1 italic">
                      {item.description}
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-3 border-r border-[#d1d1d1] text-center whitespace-nowrap">
                  {isAvailable ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e6f2ec] text-[#217346] border border-[#bbf7d0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#217346]"></span>
                      대여 가능
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa]">
                      <Clock className="w-3 h-3 text-[#c2410c]" />
                      대여 중
                    </span>
                  )}
                </td>

                {/* Borrower Info */}
                <td className="py-3 px-4 border-r border-[#d1d1d1]">
                  {!isAvailable ? (
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#1e293b] flex items-center gap-1">
                        <User className="w-3 h-3 text-[#64748b]" />
                        {item.borrower_name}
                      </div>
                      {item.borrower_contact && (
                        <div className="text-[11px] text-[#64748b]">
                          {item.borrower_contact}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#94a3b8] text-[11px] italic">
                      - 즉시 수령 가능 -
                    </span>
                  )}
                </td>

                {/* Dates */}
                <td className="py-3 px-3 border-r border-[#d1d1d1] text-[11px] whitespace-nowrap">
                  {!isAvailable ? (
                    <div className="space-y-0.5">
                      <div className="text-[#333333] font-medium">
                        대여: {formatDate(item.loaned_at)}
                      </div>
                      <div className="text-[#64748b] text-[10px]">
                        {formatRelativeTime(item.loaned_at)}
                      </div>
                      {item.expected_return_date && (
                        <div className="text-[#c2410c] font-semibold pt-0.5">
                          반납: {formatDate(item.expected_return_date)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#94a3b8]">-</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1">
                    {isAvailable ? (
                      <button
                        onClick={() => onBorrow(item)}
                        className="px-3 py-1.5 rounded-md bg-[#217346] hover:bg-[#185a37] text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <span>대여</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onReturn(item)}
                        className="px-2.5 py-1.5 rounded-md bg-[#ffedd5] hover:bg-[#fed7aa] text-[#c2410c] border border-[#fdba74] text-xs font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>반납</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`'${item.name}' 물품을 삭제하시겠습니까?`)) {
                          onDelete(item.id);
                        }
                      }}
                      className="p-1 rounded text-[#cbd5e1] hover:text-[#ef4444] hover:bg-red-50 transition"
                      title="물품 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
