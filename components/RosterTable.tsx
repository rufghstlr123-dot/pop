"use client";
import React from "react";
import { Item } from "@/types/inventory";
import { User, MapPin, RotateCcw, CheckCircle2 } from "lucide-react";

interface RosterTableProps {
  items: Item[];
  onReturn: (item: Item) => void;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-";
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
}

export const RosterTable: React.FC<RosterTableProps> = ({
  items,
  onReturn,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-[#666666]">
        <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-3">
          <CheckCircle2 className="w-6 h-6 text-[#94a3b8]" />
        </div>
        <p className="font-bold text-sm text-[#333333]">해당 카테고리에 등록된 물품이 없습니다.</p>
        <p className="text-xs text-[#94a3b8] mt-1">좌측 사이드바에서 새 장소를 입력하여 간편하게 등록해보세요.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
      <table className="w-full text-left border-collapse text-xs">
        <thead className="bg-[#f3f3f3] sticky top-0 z-20 border-b-2 border-[#bbbbbb]">
          <tr>
            <th className="py-2.5 px-3.5 font-bold text-[#333333] border-r border-[#d1d1d1] w-28 text-center">
              카테고리
            </th>
            <th className="py-2.5 px-4 font-bold text-[#333333] border-r border-[#d1d1d1] min-w-[200px]">
              설치 장소
            </th>
            <th className="py-2.5 px-4 font-bold text-[#333333] border-r border-[#d1d1d1] min-w-[150px]">
              대여자
            </th>
            <th className="py-2.5 px-3.5 font-bold text-[#333333] border-r border-[#d1d1d1] min-w-[170px]">
              대여 일시 / 반납 예정
            </th>
            <th className="py-2.5 px-4 font-bold text-[#333333] border-r border-[#d1d1d1] min-w-[180px]">
              비고
            </th>
            <th className="py-2.5 px-3 font-bold text-[#333333] w-24 text-center">
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
                {/* Category Badge */}
                <td className="py-3 px-3.5 border-r border-[#d1d1d1] text-center whitespace-nowrap">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-bold border ${
                      item.category === "A2 POP"
                        ? "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]"
                        : item.category === "A3 POP"
                        ? "bg-[#fef3c7] text-[#b45309] border-[#fde68a]"
                        : "bg-[#f3e8ff] text-[#7e22ce] border-[#e9d5ff]"
                    }`}
                  >
                    {item.category}
                  </span>
                </td>

                {/* 설치 장소 */}
                <td className="py-3 px-4 border-r border-[#d1d1d1]">
                  <div className="font-bold text-sm text-[#1e293b] leading-tight flex items-center gap-1.5 group-hover:text-[#217346] transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-[#217346] shrink-0" />
                    <span>{item.location}</span>
                  </div>
                </td>

                {/* 대여자 */}
                <td className="py-3 px-4 border-r border-[#d1d1d1]">
                  {item.borrower_name ? (
                    <div className="font-bold text-sm text-[#1e293b] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#64748b]" />
                      <span>{item.borrower_name}</span>
                    </div>
                  ) : (
                    <span className="text-[#94a3b8] text-[11px] italic">
                      -
                    </span>
                  )}
                </td>

                {/* 대여 일시 & 반납 예정 (YYYY-MM-DD) */}
                <td className="py-3 px-3.5 border-r border-[#d1d1d1] text-[11px] whitespace-nowrap">
                  {item.loaned_at || item.expected_return_date ? (
                    <div className="space-y-0.5 font-mono">
                      {item.loaned_at && (
                        <div className="text-[#333333]">
                          대여: {formatDate(item.loaned_at)}
                        </div>
                      )}
                      {item.expected_return_date && (
                        <div className="text-[#c2410c] font-semibold">
                          예정: {formatDate(item.expected_return_date)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#94a3b8]">-</span>
                  )}
                </td>

                {/* 비고 */}
                <td className="py-3 px-4 border-r border-[#d1d1d1] text-[11px] text-[#475569]">
                  {item.description ? (
                    <span>{item.description}</span>
                  ) : (
                    <span className="text-[#cbd5e1]">-</span>
                  )}
                </td>

                {/* 관리 처리: 반납 버튼 또는 반납 완료 표시 (휴지통 삭제) */}
                <td className="py-3 px-3 text-center whitespace-nowrap">
                  {!isAvailable ? (
                    <button
                      onClick={() => onReturn(item)}
                      className="px-2.5 py-1.5 rounded-md bg-[#ffedd5] hover:bg-[#fed7aa] text-[#c2410c] border border-[#fdba74] text-xs font-bold transition inline-flex items-center gap-1 shadow-xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>반납</span>
                    </button>
                  ) : (
                    <span className="inline-block px-2.5 py-1 rounded text-[11px] font-bold bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
                      반납 완료
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
