'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  MapPin, 
  Clock, 
  Smartphone,
  Laptop,
  ExternalLink,
  ShieldCheck,
  Tag,
  Target
} from 'lucide-react';
import { formatPKR, formatRelativeTime } from '@/lib/utils';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useAuth } from '@/context/AuthContext';

const QUICK_PROMPTS = [
  'Is this available for physical inspection?',
  'Can you share benchmark/test video?',
  'Can we meet at Hafeez Centre / Saddar?',
  'What is your final price for cash on inspection?',
  'Does it include the original box and charger?',
];

function MessagesContent() {
  const searchParams = useSearchParams();
  const startWithListing = searchParams.get('startWithListing');
  const startWithRequest = searchParams.get('startWithRequest');

  const { user } = useAuth();
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [activeThread, setActiveThread] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // New message input
  const [inputText, setInputText] = useState('');
  const [senderRole, setSenderRole] = useState<'BUYER' | 'SELLER'>('BUYER');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch all threads on load
  const loadThreads = async () => {
    try {
      const res = await fetch('/api/messages');
      const data = await res.json();
      if (data.success && (data.sessions || data.threads)) {
        const list = data.sessions || data.threads;
        setThreads(list);
        if (!activeThreadId && list.length > 0) {
          setActiveThreadId(list[0].id);
        }
      }
    } catch (e) {
      console.error('Error fetching threads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startWithListing) {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: startWithListing,
          senderName: user?.name || 'You (Buyer)',
          text: 'Assalam-o-Alaikum! Is this item available for physical inspection?',
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && (data.sessionId || data.threadId)) {
            setActiveThreadId(data.sessionId || data.threadId);
            loadThreads();
          }
        });
    } else if (startWithRequest) {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: startWithRequest,
          senderName: user?.name || 'You (Seller)',
          text: 'Assalam-o-Alaikum! I have this part available at my shop.',
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success && (data.sessionId || data.threadId)) {
            setActiveThreadId(data.sessionId || data.threadId);
            loadThreads();
          }
        });
    } else {
      loadThreads();
    }
  }, [startWithListing, startWithRequest, user?.name]);

  // Load active thread messages & item context
  useEffect(() => {
    if (!activeThreadId) return;
    setMessagesLoading(true);

    fetch(`/api/messages?sessionId=${activeThreadId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && (data.session || data.thread)) {
          setActiveThread(data.session || data.thread);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      })
      .finally(() => setMessagesLoading(false));
  }, [activeThreadId]);

  const handleSendMessage = async (textToSend?: string, isPrompt = false) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeThreadId) return;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeThreadId,
          threadId: activeThreadId,
          senderRole,
          senderName: senderRole === 'BUYER' ? (user?.name || 'You (Buyer)') : activeThread?.sellerName || 'Seller',
          text,
          isPrompt,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setActiveThread((prev: any) => ({
          ...prev,
          messages: [...(prev?.messages || []), data.message],
        }));
        setInputText('');
        loadThreads();
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (e) {
      console.error('Error sending message:', e);
    }
  };

  // Extract linked item metadata for sticky header
  const linkedListing = activeThread?.listing;
  const linkedRequest = activeThread?.request;

  let itemThumbnail = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80';
  if (linkedListing?.images) {
    try {
      const arr = typeof linkedListing.images === 'string' ? JSON.parse(linkedListing.images) : linkedListing.images;
      if (arr && arr[0]) itemThumbnail = arr[0];
    } catch {}
  } else if (linkedRequest?.photoUrl) {
    itemThumbnail = linkedRequest.photoUrl;
  }

  const itemTitle = linkedListing?.title || linkedRequest?.title || activeThread?.title;
  const itemPrice = linkedListing?.price || linkedRequest?.maxBudgetPKR || activeThread?.itemPrice;
  const itemCity = linkedListing?.city || linkedRequest?.city || activeThread?.itemCity;
  const itemLink = linkedListing ? `/listings/${linkedListing.id}` : linkedRequest ? `/requests/${linkedRequest.id}` : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              CONTEXT-AWARE DIRECT MESSAGING
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Buyer & Seller Chat Center
          </h1>
          <p className="text-xs text-slate-500">
            Linked directly to the hardware ad or part sourcing request being negotiated
          </p>
        </div>

        {/* Sender Role Toggle for testing */}
        <div className="flex items-center gap-2 bg-gray-100/70 p-1 rounded-xl border border-gray-200 text-xs">
          <span className="text-slate-400 text-[11px] px-1 font-medium">Chatting as:</span>
          <button
            onClick={() => setSenderRole('BUYER')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              senderRole === 'BUYER' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Buyer
          </button>
          <button
            onClick={() => setSenderRole('SELLER')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              senderRole === 'SELLER' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Seller
          </button>
        </div>
      </div>

      {/* Chat Container */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[75vh] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        {/* Left: Threads List */}
        <div className="md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-gray-50/40">
          <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Conversations ({threads.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-400 animate-pulse">
                Loading conversations...
              </div>
            ) : threads.length > 0 ? (
              threads.map((thread) => {
                const isActive = thread.id === activeThreadId;
                return (
                  <button
                    key={thread.id}
                    onClick={() => setActiveThreadId(thread.id)}
                    className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                      isActive ? 'bg-white border-l-4 border-blue-600 shadow-2xs' : 'hover:bg-white/80'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs flex-shrink-0">
                      {thread.sellerName?.slice(0, 2).toUpperCase() || 'TR'}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {thread.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                          {formatRelativeTime(thread.lastMessageAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {thread.lastMessage || 'No messages yet'}
                      </p>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-blue-600 font-mono font-bold">
                          {thread.itemPrice ? formatPKR(thread.itemPrice) : ''}
                        </span>
                        {thread.unreadBuyer > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                            {thread.unreadBuyer}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No active chat conversations yet.
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Chat Conversation */}
        <div className="md:col-span-8 flex flex-col h-full bg-white">
          {activeThread ? (
            <>
              {/* STICKY CONTEXT HEADER: EXACT ITEM BEING DISCUSSED */}
              <div className="p-3 border-b border-gray-200 bg-slate-50/90 backdrop-blur-xs flex items-center justify-between gap-3 z-10 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail */}
                  <div className="w-11 h-11 rounded-xl bg-white border border-gray-200 overflow-hidden flex-shrink-0 shadow-2xs">
                    <img
                      src={itemThumbnail}
                      alt={itemTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Item Title, Price & Details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {linkedListing ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                          {linkedListing.category}
                        </span>
                      ) : linkedRequest ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          Part Request
                        </span>
                      ) : null}
                      <h3 className="text-xs font-extrabold text-slate-900 truncate">
                        {itemTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      {itemPrice && (
                        <span className="font-mono font-bold text-blue-600">
                          {formatPKR(itemPrice)}
                        </span>
                      )}
                      <span>&bull;</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5 text-slate-400" />
                        {itemCity}
                      </span>
                      <span>&bull;</span>
                      <span>Seller: <strong className="text-slate-800">{activeThread.sellerName}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right Header Actions: WhatsApp & View Ad Link */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {activeThread.sellerWhatsapp && (
                    <WhatsAppButton
                      phone={activeThread.sellerWhatsapp}
                      adTitle={itemTitle}
                      price={itemPrice}
                      variant="sm"
                    />
                  )}

                  {itemLink && (
                    <Link
                      href={itemLink}
                      target="_blank"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-slate-700 text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                      title="Open item in new tab"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span className="hidden sm:inline">View Item</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
                {activeThread.messages?.map((msg: any) => {
                  const isMe = msg.senderRole === senderRole;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold">{msg.senderName}</span>
                        <span>&bull;</span>
                        <span>{formatRelativeTime(msg.createdAt)}</span>
                      </div>

                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs leading-relaxed ${
                          isMe
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white border border-gray-200 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar */}
              <div className="p-2 border-t border-gray-100 bg-gray-50/60 overflow-x-auto flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1 flex-shrink-0 px-1 font-mono">
                  <Sparkles className="w-3 h-3 text-amber-800" /> Prompts:
                </span>
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt, true)}
                    className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-gray-100 text-slate-700 border border-gray-200 transition-colors flex-shrink-0 shadow-2xs"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Message Input Form */}
              <div className="p-3 border-t border-gray-100 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder={`Type message as ${senderRole === 'BUYER' ? 'Buyer' : 'Seller'}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors shadow-xs btn-tactile"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-xs">Select a conversation thread to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-slate-400">Loading Messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
