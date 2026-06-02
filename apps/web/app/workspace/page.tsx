'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChatService, ChatMessageRead, ChatRead } from '@/services/api';
import { useAuthStore } from '@/store/useAuthStore';

// ─── Types ────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────

function getSessionIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('log') || t.includes('debug') || t.includes('system')) return '🖥️';
  if (t.includes('csv') || t.includes('revenue') || t.includes('data')) return '📊';
  if (t.includes('road') || t.includes('plan') || t.includes('product')) return '📄';
  return '💬';
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── New Chat Modal ───────────────────────────────────────

interface NewChatModalProps {
  onConfirm: (title: string) => void;
  onCancel: () => void;
}

function NewChatModal({ onConfirm, onCancel }: NewChatModalProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onCancel();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-[#111827] border border-slate-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-blue-950/50 border border-blue-800/60 flex items-center justify-center text-blue-400">
            💬
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">New Session</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Give your session a descriptive title</p>
          </div>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Q4 Market Analysis, Debug Pipeline..."
          maxLength={80}
          className="w-full bg-[#1F2937]/60 border border-slate-700 focus:border-blue-500/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
        />
        <div className="flex justify-end mt-1 pr-1">
          <span className="text-[10px] text-slate-600 font-mono">{title.length}/80</span>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-3 mb-5">
          {['Market Analysis', 'Debug Session', 'Data Review', 'Planning'].map((s) => (
            <button
              key={s}
              onClick={() => setTitle(s)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#1F2937]/50 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
          >
            Create Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-9 h-9 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-center text-blue-400 flex-shrink-0">
        🤖
      </div>
      <div className="bg-[#1F2937]/30 border border-slate-800 px-4 py-3 rounded-2xl rounded-tl-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex gap-4 items-start justify-end">
        <div className="bg-[#1E293B]/80 border border-slate-700/60 p-4 rounded-2xl rounded-tr-none max-w-[80%]">
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0 text-sm">
          👤
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-start">
      <div className="w-9 h-9 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex-shrink-0">
        🤖
      </div>
      <div className="bg-[#1F2937]/30 border border-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

function WelcomeScreen({ onQuickAction }: { onQuickAction: (text: string) => void }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="w-9 h-9 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] flex-shrink-0">
        🤖
      </div>
      <div className="space-y-4 max-w-[85%]">
        <div>
          <h3 className="text-sm font-medium text-slate-200 tracking-wide">Welcome back, Commander.</h3>
          <p className="text-sm text-slate-400 leading-relaxed mt-2">
            I'm ready to assist. Start a new session or pick an existing one from the sidebar.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onQuickAction('Summarize the reports I uploaded and extract key insights.')}
            className="bg-[#1F2937]/30 border border-slate-800 p-4 rounded-xl hover:border-slate-700 cursor-pointer transition-colors group text-left"
          >
            <span className="text-cyan-400 text-sm">📄</span>
            <h5 className="text-xs font-semibold text-slate-200 mt-2 group-hover:text-white">Summarize Reports</h5>
            <p className="text-[11px] text-slate-500 mt-1">Extract key insights from PDF</p>
          </button>
          <button
            onClick={() => onQuickAction('Analyze my revenue CSV and show trends with forecasting.')}
            className="bg-[#1F2937]/30 border border-slate-800 p-4 rounded-xl hover:border-slate-700 cursor-pointer transition-colors group text-left"
          >
            <span className="text-purple-400 text-sm">📈</span>
            <h5 className="text-xs font-semibold text-slate-200 mt-2 group-hover:text-white">Analyze Revenue CSV</h5>
            <p className="text-[11px] text-slate-500 mt-1">Trend visualization & forecasting</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export default function ChatWorkspace() {
  const { token, hydrated, isAuthenticated } = useAuthStore();

  const [chats, setChats] = useState<ChatRead[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const didLoadRef = useRef(false);
  const activeChatIdRef = useRef<string | null>(null);

  // ── Scroll to bottom on new messages ──────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // ── Load chats once after hydration ───────────────────
  useEffect(() => {
    if (!hydrated) return;
    if (didLoadRef.current) return;
    if (!isAuthenticated || !token) {
      setIsLoadingChats(false);
      setError('Not authenticated. Please log in.');
      return;
    }
    didLoadRef.current = true;
    loadChats();
  }, [hydrated, isAuthenticated]);

  const loadChats = async () => {
    setIsLoadingChats(true);
    setError(null);
    try {
      const data = await ChatService.listChats(token!);
      const sorted = [...data].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setChats(sorted);
      if (sorted.length > 0) {
        await selectChat(sorted[0].id);
      }
    } catch (err: any) {
      setError(err.message ?? 'Failed to load chats');
    } finally {
      setIsLoadingChats(false);
    }
  };

  // ── Select a chat and load its messages ───────────────
  // NOTE: GET /chats/:id/messages must be defined in your backend.
  // Backend route needed: @router.get("/{chat_id}/messages", response_model=list[ChatMessageRead])
  const selectChat = useCallback(async (chatId: string) => {
    if (chatId === activeChatIdRef.current) return;
    activeChatIdRef.current = chatId;
    setActiveChatId(chatId);
    setIsLoadingMessages(true);
    setMessages([]);
    setError(null);
    try {
      const msgs = await ChatService.listMessages(chatId, token!);
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role as Message['role'],
          content: m.content,
          created_at: m.created_at,
        }))
      );
    } catch (err: any) {
      // If 405 Method Not Allowed: add GET /{chat_id}/messages route to your FastAPI router
      setError(
        err.message?.includes('405')
          ? 'Backend missing GET /chats/{id}/messages route — see comment in selectChat'
          : (err.message ?? 'Failed to load messages')
      );
    } finally {
      setIsLoadingMessages(false);
    }
  }, [token]);

  // ── Create a new chat with user-supplied title ─────────
  const handleCreateChat = async (title: string) => {
    setShowNewChatModal(false);
    setError(null);
    try {
      const newChat = await ChatService.createChat({ title }, token!);
      setChats((prev) => [newChat, ...prev]);
      activeChatIdRef.current = newChat.id;
      setActiveChatId(newChat.id);
      setMessages([]);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create chat');
    }
  };

  // ── Send a message ─────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const content = (text ?? inputMessage).trim();
    if (!content || isSending) return;

    setInputMessage('');
    setError(null);

    let chatId = activeChatIdRef.current;

    // If no active chat, open the modal to name it first
    if (!chatId) {
      // Auto-title from message content and create silently
      const autoTitle = content.slice(0, 60);
      try {
        const newChat = await ChatService.createChat({ title: autoTitle }, token!);
        setChats((prev) => [newChat, ...prev]);
        activeChatIdRef.current = newChat.id;
        setActiveChatId(newChat.id);
        chatId = newChat.id;
      } catch (err: any) {
        setError(err.message ?? 'Failed to create chat');
        return;
      }
    }

    const optimisticUser: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);
    setIsSending(true);

    try {
      const sent = await ChatService.sendMessage(chatId, { role: 'user', content }, token!);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimisticUser.id
            ? { id: sent.id, role: sent.role as Message['role'], content: sent.content, created_at: sent.created_at }
            : m
        )
      );
    } catch (err: any) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticUser.id));
      setError(err.message ?? 'Failed to send message');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const activeChat = chats.find((c) => c.id === activeChatId);

  // ── Render ─────────────────────────────────────────────
  return (
    <DashboardLayout>
      <PageHeader
        title="Workspace Interface Node"
        description="SynapseOS orchestration matrix — AI-powered chat workspace."
      />

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onConfirm={handleCreateChat}
          onCancel={() => setShowNewChatModal(false)}
        />
      )}

      <div className="min-h-screen bg-[#0B0F19] text-slate-200 p-6 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1400px] mx-auto h-[calc(100vh-4rem)]">

          {/* ── LEFT: Sessions Sidebar ─────────────────────── */}
          <div className="lg:col-span-4 bg-[#111827]/60 border border-slate-800/80 rounded-xl flex flex-col justify-between overflow-hidden">
            <div className="p-4 flex-1 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Recent Sessions
                </span>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  title="New chat"
                  className="text-slate-400 hover:text-white transition-colors text-lg p-1 hover:bg-slate-800/50 rounded"
                >
                  📝
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-400">
                  ⚠️ {error}
                </div>
              )}

              {/* Session list */}
              {isLoadingChats ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border border-transparent animate-pulse bg-[#1E293B]/30 h-16" />
                  ))}
                </div>
              ) : chats.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-xs text-slate-500">No sessions yet.</p>
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
                  >
                    Start your first chat →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => selectChat(chat.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        chat.id === activeChatId
                          ? 'bg-[#1E293B]/70 border-slate-700 shadow-md'
                          : 'bg-transparent border-transparent hover:bg-[#1E293B]/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-base mt-0.5 opacity-80">{getSessionIcon(chat.title)}</span>
                        <div className="min-w-0">
                          <h4 className={`text-sm font-medium truncate ${chat.id === activeChatId ? 'text-blue-400' : 'text-slate-300'}`}>
                            {chat.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{formatRelativeTime(chat.created_at)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer widget */}
            <div className="p-4 border-t border-slate-800/60 bg-[#111827]/40 flex-shrink-0">
              <div className="flex items-center gap-3 bg-[#1F2937]/40 border border-slate-800 p-3 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-800/60 flex items-center justify-center text-cyan-400 text-sm shadow-[0_0_10px_rgba(34,211,238,0.15)]">
                  ⚡
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">Pro Engine Active</h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">Unlimited 4.0 usage</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Chat Panel ──────────────────────────── */}
          <div className="lg:col-span-8 bg-[#111827]/60 border border-slate-800/80 rounded-xl flex flex-col overflow-hidden">

            {/* Chat header */}
            {activeChat && (
              <div className="px-6 py-3 border-b border-slate-800/60 flex items-center gap-3 flex-shrink-0">
                <span>{getSessionIcon(activeChat.title)}</span>
                <span className="text-sm font-medium text-slate-200 truncate">{activeChat.title}</span>
                <span className="ml-auto text-[10px] text-slate-500 font-mono">{formatRelativeTime(activeChat.created_at)}</span>
              </div>
            )}

            {/* Message history */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Loading messages…
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <WelcomeScreen onQuickAction={(text) => sendMessage(text)} />
              ) : (
                messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
              )}
              {isSending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-4 border-t border-slate-800/60 bg-[#111827]/80 space-y-3 flex-shrink-0">
              <div className="flex flex-wrap gap-2">
                <button className="bg-[#1F2937]/50 border border-slate-800 hover:bg-slate-800 text-[11px] font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                  📎 Attach CSV/PDF
                </button>
                <button
                  onClick={() => sendMessage('Search the web for the latest market trends.')}
                  className="bg-[#1F2937]/50 border border-slate-800 hover:bg-slate-800 text-[11px] font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  🌐 Web Search
                </button>
                <button
                  onClick={() => sendMessage('Enter math mode and help me solve equations.')}
                  className="bg-[#1F2937]/50 border border-slate-800 hover:bg-slate-800 text-[11px] font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  ∑ Math Mode
                </button>
              </div>

              <div className="relative bg-[#1F2937]/40 border border-slate-800/80 rounded-xl focus-within:border-slate-700 transition-colors flex items-center p-2 pr-3">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={activeChatId ? "Type a message or use '/' for commands…" : "Type to start a new session…"}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSending}
                  className="w-full bg-transparent border-none text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 py-2 px-2 disabled:opacity-50"
                />
                <div className="flex items-center gap-3 ml-2">
                  <button className="text-slate-500 hover:text-slate-300 transition-colors text-sm">🎤</button>
                  <button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isSending}
                    className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center hover:bg-blue-500 hover:text-slate-900 transition-all font-bold shadow-[0_0_10px_rgba(59,130,246,0.15)] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 pt-1 font-mono">
                <span className="flex items-center gap-1">🛡️ ENTERPRISE DATA PROTECTION ACTIVE</span>
                <span>Synapse Engine 4.2 Luminous</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}