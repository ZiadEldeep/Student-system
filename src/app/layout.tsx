"use client";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { SessionProvider } from "next-auth/react";
import QueryProvider from "@/components/providers/IntlProvider";
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
      <head>
        <link rel="icon" href="/favicon.ico" />
        <title>نظام إدارة الكلية</title>
        <meta name="description" content="نظام إدارة كلية الحاسبات والمعلومات" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <QueryProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
