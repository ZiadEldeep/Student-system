"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

interface Message {
  id: string;
  content: string;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
  createdAt: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // جلب الرسائل
  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        // عرض فقط الرسائل بين المستخدم الحالي وadmin
        const filtered = data.filter((msg: Message) =>
          (msg.sender.id === session.user.id && msg.receiver.role === "ADMIN") ||
          (msg.receiver.id === session.user.id && msg.sender.role === "ADMIN")
        );
        setMessages(filtered.reverse());
        setLoading(false);
      });
  }, [session]);

  // Scroll to bottom
  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // إرسال رسالة جديدة
  const handleSend = async () => {
    if (!newMsg.trim() || !session?.user) return;
    setSending(true);
    // ابحث عن ID الأدمن
    const admin = messages.find((msg) => msg.sender.role === "ADMIN" || msg.receiver.role === "ADMIN");
    const adminId = admin?.sender.role === "ADMIN" ? admin.sender.id : admin?.receiver.id;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newMsg, receiverId: adminId }),
    });
    setNewMsg("");
    setSending(false);
    // إعادة تحميل الرسائل
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        if (!session?.user) return;
        const filtered = data.filter((msg: Message) =>
          (msg.sender.id === session.user.id && msg.receiver.role === "ADMIN") ||
          (msg.receiver.id === session.user.id && msg.sender.role === "ADMIN")
        );
        setMessages(filtered.reverse());
      });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        محادثة مع شؤون الطلبة
      </Typography>
      <Paper sx={{ minHeight: 400, maxHeight: 500, overflowY: "auto", p: 2, mb: 2, display: "flex", flexDirection: "column-reverse" }}>
        <div ref={chatRef} />
        {loading ? (
          <Typography>جاري التحميل...</Typography>
        ) : messages.length === 0 ? (
          <Typography color="text.secondary">لا توجد رسائل بعد.</Typography>
        ) : (
          messages.map((msg) => (
            <Box key={msg.id} sx={{ mb: 2, display: "flex", flexDirection: msg.sender.id === session?.user?.id ? "row-reverse" : "row" }}>
              <Box sx={{ bgcolor: msg.sender.id === session?.user?.id ? "primary.main" : "grey.200", color: msg.sender.id === session?.user?.id ? "#fff" : "#222", px: 2, py: 1, borderRadius: 2, maxWidth: "70%" }}>
                <Typography variant="body2">{msg.content}</Typography>
                <Typography variant="caption" sx={{ display: "block", textAlign: "left", opacity: 0.7 }}>
                  {new Date(msg.createdAt).toLocaleString("ar-EG")}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Paper>
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          placeholder="اكتب رسالتك..."
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          disabled={sending}
        />
        <Button variant="contained" onClick={handleSend} disabled={sending || !newMsg.trim()}>
          إرسال
        </Button>
      </Box>
    </Box>
  );
} 