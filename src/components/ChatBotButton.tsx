import React, { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import ChatIcon from "@mui/icons-material/Chat";
import ChatBotDrawer from "./ChatBotDrawer";

export default function ChatBotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="التحدث مع شؤون الطلبة" placement="left">
        <Fab
          color="primary"
          aria-label="chat"
          onClick={() => setOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 2000,
          }}
        >
          <ChatIcon />
        </Fab>
      </Tooltip>
      <ChatBotDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
