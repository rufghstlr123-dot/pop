import { Item, RentalLog } from "@/types/inventory";
import { supabase, isSupabaseConfigured } from "./supabase";
import { INITIAL_ITEMS, INITIAL_LOGS } from "./seed-data";

const LOCAL_STORAGE_ITEMS_KEY = "the_hyundai_rental_items";
const LOCAL_STORAGE_LOGS_KEY = "the_hyundai_rental_logs";
const BROADCAST_CHANNEL_NAME = "hyundai_inventory_sync";

// 브라우저 탭 간 실시간 통신을 위한 BroadcastChannel (Supabase 없을 때도 실시간 동기화)
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (e) {
    console.warn("BroadcastChannel not supported", e);
  }
}

// 로컬 스토리지 헬퍼
function getLocalItems(): Item[] {
  if (typeof window === "undefined") return INITIAL_ITEMS;
  const raw = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(INITIAL_ITEMS));
    return INITIAL_ITEMS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_ITEMS;
  }
}

function saveLocalItems(items: Item[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
  broadcastChannel?.postMessage({ type: "ITEMS_UPDATED" });
}

function getLocalLogs(): RentalLog[] {
  if (typeof window === "undefined") return INITIAL_LOGS;
  const raw = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(INITIAL_LOGS));
    return INITIAL_LOGS;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_LOGS;
  }
}

function saveLocalLogs(logs: RentalLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(logs));
  broadcastChannel?.postMessage({ type: "LOGS_UPDATED" });
}

export const InventoryService = {
  isCloudSync(): boolean {
    return isSupabaseConfigured;
  },

  async getItems(): Promise<Item[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching items from Supabase:", error);
        return getLocalItems();
      }
      return data as Item[];
    }
    return getLocalItems();
  },

  async getLogs(): Promise<RentalLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("rental_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching logs from Supabase:", error);
        return getLocalLogs();
      }
      return data as RentalLog[];
    }
    return getLocalLogs();
  },

  async borrowItem(
    itemId: string,
    borrowerName: string,
    borrowerContact?: string,
    expectedReturnDate?: string,
    note?: string
  ): Promise<boolean> {
    const loanedAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // 1. Update item status
      const { error: itemError } = await supabase
        .from("items")
        .update({
          status: "LOANED",
          borrower_name: borrowerName,
          borrower_contact: borrowerContact || null,
          loaned_at: loanedAt,
          expected_return_date: expectedReturnDate || null,
        })
        .eq("id", itemId);

      if (itemError) {
        console.error("Supabase borrow error:", itemError);
        return false;
      }

      // 2. Fetch item name for log
      const { data: itemData } = await supabase
        .from("items")
        .select("name")
        .eq("id", itemId)
        .single();

      // 3. Insert log
      await supabase.from("rental_logs").insert({
        item_id: itemId,
        item_name: itemData?.name || "알 수 없는 물품",
        action: "BORROW",
        user_name: borrowerName,
        note: note || borrowerContact || null,
        timestamp: loanedAt,
      });

      return true;
    }

    // LocalStorage fallback
    const items = getLocalItems();
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return false;

    targetItem.status = "LOANED";
    targetItem.borrower_name = borrowerName;
    targetItem.borrower_contact = borrowerContact || null;
    targetItem.loaned_at = loanedAt;
    targetItem.expected_return_date = expectedReturnDate || null;
    saveLocalItems(items);

    const logs = getLocalLogs();
    logs.unshift({
      id: "log-" + Date.now(),
      item_id: itemId,
      item_name: targetItem.name,
      action: "BORROW",
      user_name: borrowerName,
      note: note || borrowerContact || null,
      timestamp: loanedAt,
    });
    saveLocalLogs(logs);

    return true;
  },

  async returnItem(itemId: string, note?: string): Promise<boolean> {
    const timestamp = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      // 1. Get current item details
      const { data: currentItem, error: getErr } = await supabase
        .from("items")
        .select("name, borrower_name")
        .eq("id", itemId)
        .single();

      if (getErr || !currentItem) {
        console.error("Error finding item for return:", getErr);
        return false;
      }

      // 2. Update status to AVAILABLE
      const { error: itemError } = await supabase
        .from("items")
        .update({
          status: "AVAILABLE",
          borrower_name: null,
          borrower_contact: null,
          loaned_at: null,
          expected_return_date: null,
        })
        .eq("id", itemId);

      if (itemError) {
        console.error("Supabase return error:", itemError);
        return false;
      }

      // 3. Log return
      await supabase.from("rental_logs").insert({
        item_id: itemId,
        item_name: currentItem.name,
        action: "RETURN",
        user_name: currentItem.borrower_name || "미확인",
        note: note || "정상 반납 완료",
        timestamp: timestamp,
      });

      return true;
    }

    // Local fallback
    const items = getLocalItems();
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem) return false;

    const previousBorrower = targetItem.borrower_name || "담당자";
    targetItem.status = "AVAILABLE";
    targetItem.borrower_name = null;
    targetItem.borrower_contact = null;
    targetItem.loaned_at = null;
    targetItem.expected_return_date = null;
    saveLocalItems(items);

    const logs = getLocalLogs();
    logs.unshift({
      id: "log-" + Date.now(),
      item_id: itemId,
      item_name: targetItem.name,
      action: "RETURN",
      user_name: previousBorrower,
      note: note || "정상 반납 완료",
      timestamp: timestamp,
    });
    saveLocalLogs(logs);

    return true;
  },

  async addItem(newItem: Omit<Item, "id" | "status" | "borrower_name" | "borrower_contact" | "loaned_at" | "expected_return_date" | "created_at">): Promise<Item | null> {
    const created_at = new Date().toISOString();
    const id = "hyd-" + Date.now().toString(36);

    const fullItem: Item = {
      ...newItem,
      id,
      status: "AVAILABLE",
      borrower_name: null,
      borrower_contact: null,
      loaned_at: null,
      expected_return_date: null,
      created_at,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("items").insert(fullItem).select().single();
      if (error) {
        console.error("Error creating item in Supabase:", error);
        return null;
      }
      return data as Item;
    }

    const items = getLocalItems();
    items.unshift(fullItem);
    saveLocalItems(items);
    return fullItem;
  },

  async deleteItem(itemId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("items").delete().eq("id", itemId);
      return !error;
    }

    const items = getLocalItems();
    const filtered = items.filter((i) => i.id !== itemId);
    saveLocalItems(filtered);
    return true;
  },

  // 실시간 변경 구독 (Supabase Realtime 또는 Local BroadcastChannel)
  subscribe(onUpdate: () => void): () => void {
    if (isSupabaseConfigured && supabase) {
      const channel = supabase
        .channel("hyundai_inventory_realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "items" },
          () => {
            onUpdate();
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "rental_logs" },
          () => {
            onUpdate();
          }
        )
        .subscribe();

      return () => {
        supabase?.removeChannel(channel);
      };
    }

    // Supabase 없을 시 로컬 브라우저 다중 탭 실시간 동기화
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === "ITEMS_UPDATED" || event.data?.type === "LOGS_UPDATED") {
        onUpdate();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOCAL_STORAGE_ITEMS_KEY || event.key === LOCAL_STORAGE_LOGS_KEY) {
        onUpdate();
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener("message", handleBroadcast);
    }
    window.addEventListener("storage", handleStorage);

    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener("message", handleBroadcast);
      }
      window.removeEventListener("storage", handleStorage);
    };
  },
};
