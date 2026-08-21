import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adwait Tagalpallewar — Engineer",
  description: "Engineer crafting intelligent systems and experiments.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
