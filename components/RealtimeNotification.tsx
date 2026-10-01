"use client";
import React, { useEffect } from "react";
import { Bell, X, CheckCircle2, RotateCcw } from "lucide-react";

export interface NotificationMessage {
  id: string;
  title: string;
  description: string;
  type?: "BORROW" | "RETURN" | "ADD" | "INFO";
}

interface RealtimeNotificationProps {
  notifications: NotificationMessage[];
  onDismiss: (id: string) => void;
}

export const RealtimeNotification: React.FC<RealtimeNotificationProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl p-4 shadow-xl shadow-stone-900/10 flex items-start gap-3 transform transition-all duration-300 animate-slide-up"
        >
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              n.type === "BORROW"
                ? "bg-amber-100 text-amber-700"
                : n.type === "RETURN"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-hyundai-sageLight text-hyundai-primary"
            }`}
          >
            {n.type === "BORROW" ? (
              <Bell className="w-4 h-4" />
            ) : n.type === "RETURN" ? (
              <RotateCcw className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h5 className="text-xs font-bold text-hyundai-dark leading-tight">
                {n.title}
              </h5>
              <button
                onClick={() => onDismiss(n.id)}
                className="text-stone-400 hover:text-stone-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-stone-600 mt-1 leading-snug">
              {n.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
