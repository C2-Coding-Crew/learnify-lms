"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Send, Paperclip, Smile, Loader2, User as UserIcon, FileText, Image as ImageIcon, Download, X } from "lucide-react";

interface Message {
  id: number;
  message: string | null;
  fileUrl: string | null;
  fileType: string | null;
  createdDate: string;
  userId: string;
  user: {
    id: string;
    name: string;
    image: string | null;
    roleId: number;
  };
}

interface ChatRoomProps {
  courseId: number;
  courseTitle: string;
  currentUserId: string;
}

const COMMON_EMOJIS = ["😀", "😂", "🥰", "😍", "😎", "🤩", "🤔", "😮", "😴", "👍", "🔥", "🚀", "🎉", "💯", "👏", "🙌"];

export default function ChatRoom({ courseId, courseTitle, currentUserId }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/discussions`);
      const data = await res.json();
      if (!data.error) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchMessages();
    
    // SSE Real-time connection
    const eventSource = new EventSource(`/api/discussions/stream?courseId=${courseId}`);
    
    eventSource.onmessage = (event) => {
      try {
        const newMsg = JSON.parse(event.data);
        setMessages((prev) => {
          // Prevent duplicates if we already received it from our own POST or initial fetch
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } catch (err) {
        console.error("SSE parsing error", err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [fetchMessages, courseId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Click outside emoji picker to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || isSending || isUploading) return;

    let fileUrl = null;
    let fileType = null;

    setIsSending(true);

    try {
      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        if (!uploadRes.ok) throw new Error("File upload failed");
        const uploadData = await uploadRes.json();
        fileUrl = uploadData.url;
        fileType = selectedFile.type;
        setIsUploading(false);
      }

      const res = await fetch(`/api/courses/${courseId}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: newMessage.trim() || null,
          fileUrl,
          fileType
        })
      });
      
      const data = await res.json();
      if (!data.error) {
        setMessages([...messages, data]);
        setNewMessage("");
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Gagal mengirim pesan. Silakan coba lagi.");
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    // setShowEmojiPicker(false); // keep it open for multiple emojis
  };

  const renderFilePreview = (url: string, type: string | null) => {
    if (type?.startsWith("image/")) {
      return (
        <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img src={url} alt="Attached image" className="max-w-full max-h-[300px] object-contain" />
        </div>
      );
    }
    return (
      <div className="mt-2 p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-50 text-[#FF6B4A] rounded-lg flex items-center justify-center">
          <FileText size={20} />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold text-slate-700 truncate">Document Attached</p>
          <p className="text-[10px] text-slate-400">Click to download</p>
        </div>
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-8 h-8 bg-slate-50 text-slate-400 hover:text-[#FF6B4A] rounded-lg flex items-center justify-center transition-colors"
        >
          <Download size={16} />
        </a>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#FF6B4A]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative h-full">
      {/* Chat Header */}
      <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-100 text-[#FF6B4A] rounded-full flex items-center justify-center font-black">
            {courseTitle.charAt(0)}
          </div>
          <div>
            <h3 className="font-black text-slate-800">{courseTitle}</h3>
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              Group Discussion • {messages.length} Messages
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 bg-[#F8F9FB]"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
             <UserIcon size={48} className="mb-2 opacity-20" />
             <p className="text-sm font-bold">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.userId === currentUserId;
            return (
              <div key={msg.id} className={`flex gap-4 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black shrink-0 text-xs ${
                  isMe ? 'bg-slate-800 text-white' : 'bg-orange-100 text-[#FF6B4A]'
                }`}>
                  {msg.user.name.charAt(0)}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm border ${
                  isMe 
                    ? 'bg-[#FF6B4A] text-white border-transparent rounded-tr-sm' 
                    : 'bg-white text-slate-600 border-slate-100 rounded-tl-sm'
                }`}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[10px] font-black text-[#FF6B4A] uppercase tracking-wider">{msg.user.name}</p>
                      <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase">
                        {msg.user.roleId === 3 ? 'Student' : msg.user.roleId === 2 ? 'Instructor' : 'Admin'}
                      </span>
                    </div>
                  )}
                  {msg.message && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                  {msg.fileUrl && renderFilePreview(msg.fileUrl, msg.fileType)}
                  <span className={`text-[10px] font-bold mt-2 block ${isMe ? 'text-white/70 text-right' : 'text-slate-300'}`}>
                    {new Date(msg.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* File Preview before sending */}
      {selectedFile && (
        <div className="px-6 py-3 bg-white border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-orange-50 text-[#FF6B4A] rounded-lg flex items-center justify-center">
                {selectedFile.type.startsWith("image/") ? <ImageIcon size={16} /> : <FileText size={16} />}
             </div>
             <div>
               <p className="text-xs font-bold text-slate-700">{selectedFile.name}</p>
               <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
             </div>
          </div>
          <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-6 bg-white border-t border-slate-100 relative">
        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute bottom-full left-6 mb-2 p-3 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 grid grid-cols-8 gap-2 w-max"
          >
            {COMMON_EMOJIS.map(emoji => (
              <button 
                key={emoji} 
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-50 rounded-lg transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-[#F8F9FB] p-2 rounded-2xl border border-slate-100">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors hover:bg-white rounded-xl"
          >
            <Paperclip size={20} />
          </button>
          <textarea 
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message..." 
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium py-2 resize-none max-h-32"
          />
          <button 
            type="button" 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 transition-colors hover:bg-white rounded-xl ${showEmojiPicker ? 'text-[#FF6B4A]' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Smile size={20} />
          </button>
          <button 
            type="submit"
            disabled={isSending || isUploading || (!newMessage.trim() && !selectedFile)}
            className="w-10 h-10 bg-[#FF6B4A] hover:bg-[#fa5a36] text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-orange-100 ml-2 disabled:opacity-50"
          >
            {isSending || isUploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="-ml-0.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
