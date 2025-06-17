"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

interface Message {
  id: string;
  content: string;
  sender: { id: string; name: string; role: string };
  receiver: { id: string; name: string; role: string };
  createdAt: string;
}

export default function AllChatsPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    fetch("/api/messages")
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      });
  }, [session]);

  // بناء قائمة المحادثات: كل محادثة مع مستخدم آخر (حسب sender/receiver)
  const chatsMap = new Map<string, { user: { id: string; name: string; role: string }, lastMsg: Message }>();
  messages.forEach((msg) => {
    if (!session?.user) return;
    const isSender = msg.sender.id === session.user.id;
    const other = isSender ? msg.receiver : msg.sender;
    // فقط أضف آخر رسالة
    if (!chatsMap.has(other.id) || new Date(msg.createdAt) > new Date(chatsMap.get(other.id)!.lastMsg.createdAt)) {
      chatsMap.set(other.id, { user: other, lastMsg: msg });
    }
  });
  const chats = Array.from(chatsMap.values()).sort((a, b) => new Date(b.lastMsg.createdAt).getTime() - new Date(a.lastMsg.createdAt).getTime());

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        جميع المحادثات
      </Typography>
      <Paper sx={{ minHeight: 400, maxHeight: 600, overflowY: "auto", p: 0 }}>
        {loading ? (
          <Typography sx={{ p: 2 }}>جاري التحميل...</Typography>
        ) : chats.length === 0 ? (
          <Typography sx={{ p: 2 }} color="text.secondary">لا توجد محادثات بعد.</Typography>
        ) : (
          <List>
            {chats.map(({ user, lastMsg }, idx) => (
              <React.Fragment key={user.id}>
                <ListItem component="div" onClick={() => router.push(`/dashboard/chats/${user.id}`)} alignItems="flex-start" sx={{ cursor: "pointer" }}>
                  <ListItemText
                    primary={user.name + (user.role === "ADMIN" ? " (شؤون الطلبة)" : "")}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {lastMsg.content.length > 40 ? lastMsg.content.slice(0, 40) + "..." : lastMsg.content}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {new Date(lastMsg.createdAt).toLocaleString("ar-EG")}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {idx < chats.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
} 