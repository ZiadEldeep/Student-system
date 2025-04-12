"use client";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SessionProvider } from "next-auth/react";
const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "نظام إدارة الكلية",
//   description: "نظام إدارة كلية الحاسبات والمعلومات",
// };

const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: {
      main: "#184271",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <SessionProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
