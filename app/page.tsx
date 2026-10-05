"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Item, RentalLog, InventoryStats } from "@/types/inventory";
import { InventoryService } from "@/lib/inventory-service";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RosterTable } from "@/components/RosterTable";
import { EditModal } from "@/components/EditModal";
import { ReBorrowModal } from "@/components/ReBorrowModal";
import {
  RealtimeNotification,
  NotificationMessage,
} from "@/components/RealtimeNotification";

const CATEGORIES = ["전체", "A2 POP", "A3 POP", "철제배너"];

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<RentalLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [viewMode, setViewMode] = useState<"CURRENT" | "RETURNED">("CURRENT");

  // Modals
  const [selectedEditItem, setSelectedEditItem] = useState<Item | null>(null);
  const [selectedReBorrowItem, setSelectedReBorrowItem] = useState<Item | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const addNotification = useCallback(
    (title: string, description: string, type: "BORROW" | "RETURN" | "ADD" | "INFO" = "INFO") => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      const newNotification: NotificationMessage = { id, title, description, type };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    },
    []
  );

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const loadData = useCallback(async (showNotificationOnChange = false) => {
    try {
      const [fetchedItems, fetchedLogs] = await Promise.all([
        InventoryService.getItems(),
        InventoryService.getLogs(),
      ]);

      setItems(fetchedItems);
      setLogs(fetchedLogs);

      if (showNotificationOnChange) {
        addNotification(
          "실시간 동기화 완료",
          "다른 사용자의 변경사항이 실시간으로 반영되었습니다.",
          "INFO"
        );
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadData();

    const unsubscribe = InventoryService.subscribe(() => {
      loadData(true);
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Statistics for current selected category
  const categoryStats: InventoryStats = useMemo(() => {
    const targetItems = selectedCategory === "전체" ? items : items.filter((i) => i.category === selectedCategory);
    const total = targetItems.length;
    const available = targetItems.filter((i) => i.status === "AVAILABLE").length;
    const loaned = targetItems.filter((i) => i.status === "LOANED").length;
    return { total, available, loaned };
  }, [items, selectedCategory]);

  // Filter items based on selected category & viewMode toggle
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "전체" && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedCategory === "전체") {
        return item.status === "LOANED";
      } else {
        if (viewMode === "RETURNED") {
          return item.status === "AVAILABLE" && Boolean(item.returned_at || item.borrower_name);
        } else {
          return item.status === "LOANED";
        }
      }
    });
  }, [items, selectedCategory, viewMode]);

  // Actions: Direct return without popup
  const handleDirectReturn = async (item: Item) => {
    if (!confirm(`'${item.location} (${item.category})' 물품을 즉시 반납 처리하시겠습니까?`)) {
      return;
    }
    const success = await InventoryService.returnItem(item.id);
    if (success) {
      await loadData();
      addNotification("반납 완료", `'${item.location}' 물품이 정상 반납되었습니다.`, "RETURN");
    } else {
      alert("반납 처리에 실패했습니다.");
    }
  };

  // Re-borrow: Start new rental from returned record
  const handleReBorrowSubmit = async (
    itemId: string,
    data: {
      borrower_name: string;
      loaned_at: string;
      expected_return_date?: string;
      description?: string;
    }
  ) => {
    const success = await InventoryService.editItem(itemId, {
      status: "LOANED",
      borrower_name: data.borrower_name,
      loaned_at: data.loaned_at,
      expected_return_date: data.expected_return_date || null,
      returned_at: null,
      description: data.description || null,
    });
    if (success) {
      await loadData();
      // Switch view back to CURRENT loans so user immediately sees newly activated loan
      setViewMode("CURRENT");
      addNotification(
        "대여 시작",
        `'${data.borrower_name}'님에게 대여가 다시 시작되었습니다.`,
        "BORROW"
      );
    } else {
      alert("대여 처리에 실패했습니다.");
    }
  };

  const handleEditSubmit = async (itemId: string, updatedData: Partial<Item>) => {
    const success = await InventoryService.editItem(itemId, updatedData);
    if (success) {
      await loadData();
      addNotification("수정 완료", "물품 정보가 수정되었습니다.", "INFO");
    } else {
      alert("수정에 실패했습니다.");
    }
  };

  const handleAddItem = async (itemData: {
    category: string;
    location: string;
    borrower_name?: string;
    loaned_at?: string;
    expected_return_date?: string;
    description?: string;
  }) => {
    const created = await InventoryService.addItem({
      name: `${itemData.category} (${itemData.location})`,
      category: itemData.category,
      code: itemData.category.slice(0, 2) + "-" + Math.floor(10 + Math.random() * 90),
      location: itemData.location,
      description: itemData.description || null,
      borrower_name: itemData.borrower_name || null,
      loaned_at: itemData.loaned_at || null,
      expected_return_date: itemData.expected_return_date || null,
      returned_at: null,
    } as any);

    if (created) {
      await loadData();
      addNotification("신규 등록", `'${itemData.location}'에 ${itemData.category} 대여가 등록되었습니다.`, "ADD");
    } else {
      alert("등록에 실패했습니다.");
    }
  };

  const handleResetData = async () => {
    if (confirm("모든 데이터를 기본 샘플 데이터로 복구하시겠습니까?")) {
      await InventoryService.resetData();
      await loadData();
      addNotification("초기화 완료", "기본 데이터로 복구되었습니다.", "INFO");
    }
  };

  return (
    <div className="app-container">
      {/* App Header (sp-blond style with live clock) */}
      <Header onRefresh={() => loadData()} />

      {/* Main Content Area (Sidebar + Spreadsheet) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            // Default to CURRENT loans when switching category
            setViewMode("CURRENT");
          }}
          stats={categoryStats}
          onAddItem={handleAddItem}
          onResetData={handleResetData}
        />

        {/* Right Main Table Viewer */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Sub Header Toggle: Appears only for specific categories, NOT for "전체" */}
          {selectedCategory !== "전체" && (
            <div className="px-5 py-2.5 bg-[#f8fafc] border-b border-[#d1d1d1] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[0.85rem] font-bold text-[#1e293b]">{selectedCategory}</span>
                <span className="text-[0.75rem] text-[#64748b]">
                  ({viewMode === "CURRENT" ? "현재 대여 중" : "과거 반납 기록"} {filteredItems.length}건)
                </span>
              </div>

              {/* Toggle Segment */}
              <div className="flex items-center bg-[#e2e8f0] p-0.5 rounded-lg text-[0.8rem] font-bold">
                <button
                  onClick={() => setViewMode("CURRENT")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    viewMode === "CURRENT"
                      ? "bg-white text-[#217346] shadow-xs"
                      : "text-[#64748b] hover:text-[#1e293b]"
                  }`}
                >
                  현재 대여 중
                </button>
                <button
                  onClick={() => setViewMode("RETURNED")}
                  className={`px-3 py-1 rounded-md transition-all ${
                    viewMode === "RETURNED"
                      ? "bg-[#217346] text-white shadow-xs"
                      : "text-[#64748b] hover:text-[#1e293b]"
                  }`}
                >
                  과거 반납 기록
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 border-2 border-[#217346] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-[0.85rem] text-[#666666]">데이터를 불러오는 중입니다...</p>
              </div>
            </div>
          ) : (
            <RosterTable
              items={filteredItems}
              viewMode={viewMode}
              onReturn={handleDirectReturn}
              onEdit={(i) => setSelectedEditItem(i)}
              onReBorrow={(i) => setSelectedReBorrowItem(i)}
            />
          )}

          {/* Bottom Bar */}
          <div className="px-4 py-1.5 bg-[#f3f3f3] border-t border-[#d1d1d1] flex items-center justify-end text-[0.8rem] text-[#94a3b8] shrink-0 font-mono min-h-[28px]">
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      <EditModal
        item={selectedEditItem}
        isOpen={Boolean(selectedEditItem)}
        onClose={() => setSelectedEditItem(null)}
        onSubmit={handleEditSubmit}
      />

      {/* Re-Borrow Modal */}
      <ReBorrowModal
        item={selectedReBorrowItem}
        isOpen={Boolean(selectedReBorrowItem)}
        onClose={() => setSelectedReBorrowItem(null)}
        onSubmit={handleReBorrowSubmit}
      />

      {/* Realtime Toast Notifications */}
      <RealtimeNotification
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
