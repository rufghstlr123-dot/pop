"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Item, RentalLog, InventoryStats } from "@/types/inventory";
import { InventoryService } from "@/lib/inventory-service";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { RosterTable } from "@/components/RosterTable";
import { ReturnModal } from "@/components/ReturnModal";
import { EditModal } from "@/components/EditModal";
import { HistoryModal } from "@/components/HistoryModal";
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

  // Modals
  const [selectedReturnItem, setSelectedReturnItem] = useState<Item | null>(null);
  const [selectedEditItem, setSelectedEditItem] = useState<Item | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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

  // Filter items: Only currently loaned items appear in the main dashboard table!
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (item.status !== "LOANED") return false;
      if (selectedCategory === "전체") return true;
      return item.category === selectedCategory;
    });
  }, [items, selectedCategory]);

  // Past returned items for HistoryModal
  const returnedItems = useMemo(() => {
    return items.filter((item) => item.status === "AVAILABLE" && Boolean(item.returned_at || item.borrower_name));
  }, [items]);

  // Actions
  const handleReturnSubmit = async (itemId: string, note?: string) => {
    const success = await InventoryService.returnItem(itemId, note);
    if (success) {
      await loadData();
      const item = items.find((i) => i.id === itemId);
      addNotification("반납 완료", `'${item?.location || "물품"}'이(가) 정상 반납되었습니다. [과거 반납 기록]에서 확인 가능합니다.`, "RETURN");
    } else {
      alert("반납 처리에 실패했습니다.");
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
      {/* App Header (sp-blond style with live clock and history modal trigger) */}
      <Header
        onRefresh={() => loadData()}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
      />

      {/* Main Content Area (Sidebar + Spreadsheet) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          stats={categoryStats}
          onAddItem={handleAddItem}
          onResetData={handleResetData}
        />

        {/* Right Main Table Viewer (Only Currently LOANED items) */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
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
              onReturn={(i) => setSelectedReturnItem(i)}
              onEdit={(i) => setSelectedEditItem(i)}
            />
          )}

          {/* Bottom Bar */}
          <div className="px-4 py-1.5 bg-[#f3f3f3] border-t border-[#d1d1d1] flex items-center justify-end text-[0.8rem] text-[#94a3b8] shrink-0 font-mono min-h-[28px]">
          </div>
        </main>
      </div>

      {/* Modals */}
      <ReturnModal
        item={selectedReturnItem}
        isOpen={Boolean(selectedReturnItem)}
        onClose={() => setSelectedReturnItem(null)}
        onSubmit={handleReturnSubmit}
      />

      <EditModal
        item={selectedEditItem}
        isOpen={Boolean(selectedEditItem)}
        onClose={() => setSelectedEditItem(null)}
        onSubmit={handleEditSubmit}
      />

      <HistoryModal
        items={returnedItems}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onEdit={(item) => setSelectedEditItem(item)}
      />

      {/* Realtime Toast Notifications */}
      <RealtimeNotification
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
