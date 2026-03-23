import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MainShell } from "@/components/main-shell";
import { SiteHeader } from "@/components/site-header";
import { isStaffAccess } from "@/lib/staff-access";
import { getSessionUser } from "@/lib/user-session";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luna — events",
  description: "Create events and register in a few steps",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [staff, sessionUser] = await Promise.all([
    isStaffAccess(),
    getSessionUser(),
  ]);

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="font-sans flex min-h-dvh flex-col">
        <SiteHeader
          showAdminLink={staff}
          sessionUser={
            sessionUser
              ? { name: sessionUser.name, email: sessionUser.email }
              : null
          }
        />
        <MainShell>{children}</MainShell>
      </body>
    </html>
  );
}
