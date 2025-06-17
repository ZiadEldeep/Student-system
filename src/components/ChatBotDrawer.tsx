import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import faq from "@/app/data/faq.json";

export default function ChatBotDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [customMsg, setCustomMsg] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    // هنا تقدر تستخدم API الرسائل لإرسال الرسالة الحقيقية
    await fetch("/api/messages", {
      method: "POST",
      body: JSON.stringify({
        content: customMsg,
        receiverId: "ADMIN_ID" // هتعدلها لاحقاً حسب ID الأدمن
      }),
      headers: { "Content-Type": "application/json" }
    });
    setSent(true);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2, display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
          شؤون الطلبة
        </Typography>
        {!sent ? (
          <>
            {selected === null ? (
              <>
                <Typography sx={{ mb: 1 }}>اختر سؤالاً:</Typography>
                {faq.map((item, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 1, justifyContent: "flex-start" }}
                    onClick={() => setSelected(idx)}
                  >
                    {item.question}
                  </Button>
                ))}
              </>
            ) : faq[selected].answer ? (
              <>
                <Typography sx={{ mb: 2, color: "primary.main" }}>
                  {faq[selected].answer}
                </Typography>
                <Button variant="text" onClick={() => setSelected(null)}>
                  سؤال آخر
                </Button>
              </>
            ) : (
              <>
                <Typography sx={{ mb: 1 }}>اكتب استفسارك:</Typography>
                <TextField
                  multiline
                  minRows={3}
                  fullWidth
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!customMsg}
                  onClick={handleSend}
                >
                  إرسال إلى شؤون الطلبة
                </Button>
              </>
            )}
          </>
        ) : (
          <Typography sx={{ color: "success.main", textAlign: "center" }}>
            تم إرسال استفسارك بنجاح! سيتم الرد عليك قريباً.
          </Typography>
        )}
      </Box>
    </Drawer>
  );
}
