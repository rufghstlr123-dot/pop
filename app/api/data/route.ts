import { NextResponse } from "next/server";
import { Item, RentalLog } from "@/types/inventory";
import { INITIAL_ITEMS, INITIAL_LOGS } from "@/lib/seed-data";

// Next.js 개발 서버 및 인스턴스 전역 저장소 (모든 다른 브라우저, 다른 탭, 시크릿 창, 다른 기기 간 완전 공유)
interface ServerStore {
  items: Item[];
  logs: RentalLog[];
  version: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __inventoryStore: ServerStore | undefined;
}

if (!globalThis.__inventoryStore) {
  globalThis.__inventoryStore = {
    items: JSON.parse(JSON.stringify(INITIAL_ITEMS)),
    logs: JSON.parse(JSON.stringify(INITIAL_LOGS)),
    version: Date.now(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientVersion = searchParams.get("version");

  const store = globalThis.__inventoryStore!;

  // 버전만 체크하려는 경우 빠른 응답
  if (clientVersion && Number(clientVersion) === store.version) {
    return NextResponse.json({ changed: false, version: store.version });
  }

  return NextResponse.json({
    changed: true,
    items: store.items,
    logs: store.logs,
    version: store.version,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;
    const store = globalThis.__inventoryStore!;

    if (action === "BORROW") {
      const { itemId, borrowerName, borrowerContact, expectedReturnDate, note } = payload;
      const target = store.items.find((i) => i.id === itemId);
      if (!target) {
        return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
      }

      const loanedAt = new Date().toISOString();
      target.status = "LOANED";
      target.borrower_name = borrowerName;
      target.borrower_contact = borrowerContact || null;
      target.loaned_at = loanedAt;
      target.expected_return_date = expectedReturnDate || null;

      store.logs.unshift({
        id: "log-" + Date.now(),
        item_id: itemId,
        item_name: target.name,
        action: "BORROW",
        user_name: borrowerName,
        note: note || borrowerContact || null,
        timestamp: loanedAt,
      });

      store.version = Date.now();
      return NextResponse.json({ success: true, version: store.version });
    }

    if (action === "RETURN") {
      const { itemId, note } = payload;
      const target = store.items.find((i) => i.id === itemId);
      if (!target) {
        return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
      }

      const previousBorrower = target.borrower_name || "담당자";
      const timestamp = new Date().toISOString();
      target.status = "AVAILABLE";
      target.borrower_name = null;
      target.borrower_contact = null;
      target.loaned_at = null;
      target.expected_return_date = null;

      store.logs.unshift({
        id: "log-" + Date.now(),
        item_id: itemId,
        item_name: target.name,
        action: "RETURN",
        user_name: previousBorrower,
        note: note || "정상 반납 완료",
        timestamp,
      });

      store.version = Date.now();
      return NextResponse.json({ success: true, version: store.version });
    }

    if (action === "ADD") {
      const newItem: Item = {
        ...payload,
        id: "hyd-" + Date.now().toString(36),
        status: "AVAILABLE",
        borrower_name: null,
        borrower_contact: null,
        loaned_at: null,
        expected_return_date: null,
        created_at: new Date().toISOString(),
      };

      store.items.unshift(newItem);
      store.version = Date.now();
      return NextResponse.json({ success: true, item: newItem, version: store.version });
    }

    if (action === "DELETE") {
      const { itemId } = payload;
      store.items = store.items.filter((i) => i.id !== itemId);
      store.version = Date.now();
      return NextResponse.json({ success: true, version: store.version });
    }

    if (action === "RESET") {
      store.items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
      store.logs = JSON.parse(JSON.stringify(INITIAL_LOGS));
      store.version = Date.now();
      return NextResponse.json({ success: true, version: store.version });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
