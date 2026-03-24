import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MainShell } from "@/components/main-shell";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
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
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="font-sans flex min-h-dvh flex-col">
        <ThemeProvider>
          <SiteHeader
            showAdminLink={staff}
            sessionUser={
              sessionUser
                ? {
                    name: sessionUser.name,
                    email: sessionUser.email,
                    username: sessionUser.username,
                    avatarUrl: sessionUser.avatarUrl,
                  }
                : null
            }
          />
          <MainShell>{children}</MainShell>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
