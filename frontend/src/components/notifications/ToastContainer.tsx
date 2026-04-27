"use client";

import { NotificationType, useNotifications } from "@/contexts/NotificationContext";
import { useEffect } from "react";

const TYPE_COLORS: Record<NotificationType, string> = {
  signature: "border-blue-500/40 bg-blue-500/10",
  enrollment: "border-green-500/40 bg-green-500/10",
  certificate: "border-yellow-500/40 bg-yellow-500/10",
  system: "border-gray-500/40 bg-gray-500/10",
  error: "border-red-500/40 bg-red-500/10",
};

const AUTO_DISMISS_MS = 4000;

export function ToastContainer() {
  const { toasts, dismissToast } = useNotifications();

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} title={t.title} message={t.message} type={t.type} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

function Toast({
  id,
  title,
  message,
  type,
  onDismiss,
}: {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(id), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  return (
    <div
      role="alert"
      className={`pointer-events-auto w-72 rounded-lg border px-4 py-3 shadow-xl backdrop-blur-md flex items-start gap-3 animate-in slide-in-from-right-4 ${TYPE_COLORS[type]}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-black truncate">{title}</p>
        <p className="text-gray-400 text-[11px] truncate">{message}</p>
      </div>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-gray-500 hover:text-white transition-colors text-xs mt-0.5"
      >
        ✕
      </button>
    </div>
  );
}
