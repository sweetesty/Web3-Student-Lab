"use client";

import {
    groupNotifications,
    Notification,
    NotificationType,
    useNotifications,
} from "@/contexts/NotificationContext";
import { useMemo, useState } from "react";
import { VirtualizedList } from "./VirtualizedList";

const TYPE_OPTIONS: { value: "all" | NotificationType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "signature", label: "Signatures" },
  { value: "enrollment", label: "Enrollments" },
  { value: "certificate", label: "Certificates" },
  { value: "system", label: "System" },
  { value: "error", label: "Errors" },
];

const TYPE_COLORS: Record<NotificationType, string> = {
  signature: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  enrollment: "text-green-400 bg-green-400/10 border-green-400/20",
  certificate: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  system: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  error: "text-red-400 bg-red-400/10 border-red-400/20",
};

const ITEM_HEIGHT = 72;
const SIDEBAR_LIST_HEIGHT = 480;

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationSidebar({ open, onClose }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState<"all" | NotificationType>("all");
  const [grouped, setGrouped] = useState(true);

  const filtered = useMemo(
    () =>
      filter === "all" ? notifications : notifications.filter((n) => n.type === filter),
    [notifications, filter]
  );

  const groups = useMemo(() => groupNotifications(filtered), [filtered]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        role="dialog"
        aria-label="Notification Center"
        className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-zinc-950 border-l border-white/10 flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-white font-black tracking-widest uppercase text-sm">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-[10px] font-black tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              aria-label="Close notifications"
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-white/10 overflow-x-auto">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`shrink-0 px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase transition-colors ${
                filter === opt.value
                  ? "bg-red-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setGrouped((g) => !g)}
            className={`shrink-0 ml-auto px-3 py-1 rounded text-[10px] font-black tracking-widest uppercase transition-colors ${
              grouped ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {grouped ? "Grouped" : "Flat"}
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
              <span className="text-3xl">🔔</span>
              <span className="text-sm font-black tracking-widest uppercase">No notifications</span>
            </div>
          ) : grouped ? (
            <GroupedView groups={groups} onMarkRead={markRead} />
          ) : (
            <VirtualizedList
              items={filtered}
              itemHeight={ITEM_HEIGHT}
              containerHeight={SIDEBAR_LIST_HEIGHT}
              renderItem={(n) => (
                <NotificationRow key={n.id} notification={n} onMarkRead={markRead} />
              )}
            />
          )}
        </div>
      </aside>
    </>
  );
}

function GroupedView({
  groups,
  onMarkRead,
}: {
  groups: ReturnType<typeof groupNotifications>;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div className="overflow-y-auto h-full">
      {groups.map((g) => (
        <div
          key={g.type}
          className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          onClick={() => onMarkRead(g.latestId)}
        >
          <div
            className={`shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-black ${TYPE_COLORS[g.type]}`}
          >
            {g.count > 99 ? "99+" : g.count}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-black tracking-wide">{g.label}</span>
              {!g.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              )}
            </div>
            <p className="text-gray-500 text-[11px] truncate">
              {g.count === 1 ? "1 new event" : `${g.count} new events`}
            </p>
          </div>
          <span className="text-gray-600 text-[10px] shrink-0">
            {formatTime(g.latestTimestamp)}
          </span>
        </div>
      ))}
    </div>
  );
}

function NotificationRow({
  notification: n,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer h-[72px] ${
        n.read ? "opacity-50" : ""
      }`}
      onClick={() => !n.read && onMarkRead(n.id)}
    >
      <div
        className={`shrink-0 w-2 h-2 rounded-full mt-2 ${
          n.read ? "bg-transparent" : "bg-red-500"
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-black truncate">{n.title}</p>
        <p className="text-gray-500 text-[11px] truncate">{n.message}</p>
      </div>
      <span className="text-gray-600 text-[10px] shrink-0 mt-0.5">
        {formatTime(n.timestamp)}
      </span>
    </div>
  );
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}
