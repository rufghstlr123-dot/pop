"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  PackageCheck,
  PlusCircle,
  HelpCircle,
  Laptop,
} from "lucide-react";
import { Item, RentalLog, InventoryStats } from "@/types/inventory";
import { InventoryService } from "@/lib/inventory-service";
import { Header } from "@/components/Header";
import { StatsBanner } from "@/components/StatsBanner";
import { ItemCard } from "@/components/ItemCard";
import { BorrowModal } from "@/components/BorrowModal";
import { ReturnModal } from "@/components/ReturnModal";
import { AddItemModal } from "@/components/AddItemModal";
import { HistoryModal } from "@/components/HistoryModal";
import { SyncGuideModal } from "@/components/SyncGuideModal";
import {
  RealtimeNotification,
  NotificationMessage,
} from "@/components/RealtimeNotification";

const CATEGORIES = [
  "전체",
  "음향/오디오",
  "카메라/영상",
  "IT/업무장비",
  "뷰티/스타일링",
  "행사/의전",
  "기타 편의용품",
];

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [logs, setLogs] = useState<RentalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCloud, setIsCloud] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "AVAILABLE" | "LOANED">("ALL");

  // Modals
  const [selectedBorrowItem, setSelectedBorrowItem] = useState<Item | null>(null);
  const [selectedReturnItem, setSelectedReturnItem] = useState<Item | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Realtime Notifications
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  const addNotification = useCallback(
    (title: string, description: string, type: "BORROW" | "RETURN" | "ADD" | "INFO" = "INFO") => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      const newNotification: NotificationMessage = { id, title, description, type };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]);

      // Auto dismiss after 4.5s
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4500);
    },
    []
  );

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Load items & logs
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
          "실시간 데이터 동기화 완료",
          "다른 사용자 또는 다른 창의 변경사항이 실시간으로 적용되었습니다.",
          "INFO"
        );
      }
    } catch (err) {
      console.error("Failed to load inventory data:", err);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  // Initial load & Realtime subscription
  useEffect(() => {
    setIsCloud(InventoryService.isCloudSync());
    loadData();

    // Subscribe to real-time events (Supabase WebSocket or BroadcastChannel)
    const unsubscribe = InventoryService.subscribe(() => {
      loadData(true);
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  // Stats
  const stats: InventoryStats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.status === "AVAILABLE").length;
    const loaned = items.filter((i) => i.status === "LOANED").length;
    return { total, available, loaned };
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Status Filter
      if (statusFilter === "AVAILABLE" && item.status !== "AVAILABLE") return false;
      if (statusFilter === "LOANED" && item.status !== "LOANED") return false;

      // 2. Category Filter
      if (selectedCategory !== "전체" && item.category !== selectedCategory) return false;

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.code.toLowerCase().includes(query);
        const matchLocation = item.location.toLowerCase().includes(query);
        const matchBorrower = item.borrower_name?.toLowerCase().includes(query) ?? false;
        const matchCategory = item.category.toLowerCase().includes(query);
        return matchName || matchCode || matchLocation || matchBorrower || matchCategory;
      }

      return true;
    });
  }, [items, statusFilter, selectedCategory, searchQuery]);

  // Handlers
  const handleBorrowSubmit = async (
    itemId: string,
    borrowerName: string,
    borrowerContact?: string,
    expectedReturnDate?: string,
    note?: string
  ) => {
    const success = await InventoryService.borrowItem(
      itemId,
      borrowerName,
      borrowerContact,
      expectedReturnDate,
      note
    );
    if (success) {
      await loadData();
      const item = items.find((i) => i.id === itemId);
      addNotification(
        "물품 대여 완료",
        `'${item?.name || "물품"}'의 대여가 등록되었습니다.`,
        "BORROW"
      );
    } else {
      alert("대여 처리에 실패했습니다.");
    }
  };

  const handleReturnSubmit = async (itemId: string, note?: string) => {
    const success = await InventoryService.returnItem(itemId, note);
    if (success) {
      await loadData();
      const item = items.find((i) => i.id === itemId);
      addNotification(
        "물품 반납 완료",
        `'${item?.name || "물품"}'이(가) 정상 반납되어 대여 가능 상태로 전환되었습니다.`,
        "RETURN"
      );
    } else {
      alert("반납 처리에 실패했습니다.");
    }
  };

  const handleAddItemSubmit = async (newItem: Omit<Item, "id" | "status" | "borrower_name" | "borrower_contact" | "loaned_at" | "expected_return_date" | "created_at">) => {
    const created = await InventoryService.addItem(newItem);
    if (created) {
      await loadData();
      addNotification(
        "신규 물품 등록",
        `'${created.name}'이(가) 대여 목록에 등록되었습니다.`,
        "ADD"
      );
    } else {
      alert("물품 등록에 실패했습니다.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    const success = await InventoryService.deleteItem(itemId);
    if (success) {
      await loadData();
      addNotification("물품 삭제", "해당 물품이 목록에서 제거되었습니다.", "INFO");
    }
  };

  // Reset to initial seed demo data
  const handleResetData = async () => {
    if (
      confirm(
        "샘플 초기 데이터로 복구하시겠습니까? (로컬 테스트 시 대여 현황이 초기화됩니다)"
      )
    ) {
      await InventoryService.resetData();
      await loadData();
      addNotification("데이터 초기화", "샘플 물품 목록으로 초기화되었습니다.", "INFO");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5]">
      {/* Header */}
      <Header
        isCloud={isCloud}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats & Title Banner */}
        <StatsBanner
          stats={stats}
          isCloud={isCloud}
          onFilterChange={(st) => setStatusFilter(st)}
          currentFilter={statusFilter}
        />

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-sm mb-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="물품명, 관리코드(#HYD), 비치 장소, 대여자 이름 검색..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hyundai-primary/30 focus:border-hyundai-primary transition placeholder:text-stone-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 px-1 py-0.5"
                >
                  지우기
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                onClick={() => loadData()}
                className="p-2.5 rounded-xl border border-stone-200 bg-[#FAF9F6] text-stone-600 hover:bg-stone-100 transition"
                title="데이터 새로고침"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleResetData}
                className="text-xs px-3 py-2.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition"
                title="샘플 데이터 복구"
              >
                초기화
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-hyundai-primary text-white shadow-sm font-semibold"
                      : "bg-[#F5F2EB] text-[#555047] hover:bg-stone-200/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filter Indicator if applied */}
        {statusFilter !== "ALL" && (
          <div className="mb-4 flex items-center justify-between bg-white px-4 py-2 rounded-xl border border-stone-200 text-xs">
            <span className="text-stone-600">
              현재 필터:{" "}
              <strong className="text-hyundai-primary">
                {statusFilter === "AVAILABLE" ? "대여 가능한 물품만" : "대여 중인 물품만"}
              </strong>
            </span>
            <button
              onClick={() => setStatusFilter("ALL")}
              className="text-hyundai-primary hover:underline font-medium"
            >
              전체 보기
            </button>
          </div>
        )}

        {/* Item Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-white border border-stone-200 animate-pulse p-6"
              >
                <div className="h-4 w-20 bg-stone-200 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-stone-200 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-stone-200 rounded mb-6"></div>
                <div className="h-16 bg-stone-100 rounded-xl mb-4"></div>
                <div className="h-10 bg-stone-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-12 text-center my-8">
            <PackageCheck className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-hyundai-dark">
              검색 조건에 맞는 물품이 없습니다
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              검색어를 변경하시거나, 새로운 장비를 등록하여 관리를 시작해보세요.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("전체");
                  setStatusFilter("ALL");
                }}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                검색 필터 해제
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-hyundai-primary text-white hover:bg-hyundai-accent"
              >
                신규 물품 등록
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onBorrow={(i) => setSelectedBorrowItem(i)}
                onReturn={(i) => setSelectedReturnItem(i)}
                onDelete={(id) => handleDeleteItem(id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Information Footer */}
      <footer className="border-t border-stone-200 bg-[#F4F1EA]/70 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-hyundai-primary flex items-center justify-center text-white">
              <span className="font-serif text-sm font-bold text-[#E5DEC9]">H</span>
            </div>
            <div>
              <p className="text-xs font-serif font-bold text-hyundai-dark tracking-wide">
                THE HYUNDAI SEOUL · SOUNDS FOREST
              </p>
              <p className="text-[11px] text-stone-500">
                실시간 다중 접속 물품 대여 & 반납 관제 시스템
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-500">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="hover:text-hyundai-primary underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              깃허브 & 버셀 실시간 연동 방법
            </button>
            <span>·</span>
            <span>Next.js 14 & Supabase Realtime</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BorrowModal
        item={selectedBorrowItem}
        isOpen={Boolean(selectedBorrowItem)}
        onClose={() => setSelectedBorrowItem(null)}
        onSubmit={handleBorrowSubmit}
      />

      <ReturnModal
        item={selectedReturnItem}
        isOpen={Boolean(selectedReturnItem)}
        onClose={() => setSelectedReturnItem(null)}
        onSubmit={handleReturnSubmit}
      />

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddItemSubmit}
      />

      <HistoryModal
        logs={logs}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <SyncGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        isCloud={isCloud}
      />

      {/* Realtime Toast Notifications */}
      <RealtimeNotification
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  );
}
