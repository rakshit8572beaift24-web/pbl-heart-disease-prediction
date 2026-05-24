import React from 'react';
import { Plus, MessageSquare, Trash2, PanelLeftClose } from 'lucide-react';

const ChatSidebar = ({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onDelete,
  onClose,
  mobile = false,
}) => (
  <aside
    className={`flex flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 ${
      mobile ? 'h-full w-72' : 'w-64 shrink-0 hidden md:flex'
    }`}
  >
    <div className="p-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={onNew}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New chat
      </button>
      {mobile && onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="w-5 h-5" />
        </button>
      )}
    </div>

    <div className="flex-1 overflow-y-auto p-2 space-y-1">
      {sessions.length === 0 ? (
        <p className="px-3 py-4 text-xs text-slate-400 text-center">No conversations yet</p>
      ) : (
        sessions.map((s) => (
          <div
            key={s.id}
            className={`group flex items-center gap-1 rounded-lg ${
              activeSessionId === s.id
                ? 'bg-white dark:bg-slate-800 shadow-sm'
                : 'hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              className="flex-1 flex items-start gap-2 px-3 py-2.5 text-left min-w-0"
            >
              <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                  {s.title}
                </p>
                {s.preview && (
                  <p className="text-xs text-slate-400 truncate">{s.preview}</p>
                )}
              </div>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(s.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 mr-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              aria-label="Delete conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))
      )}
    </div>
  </aside>
);

export default ChatSidebar;
