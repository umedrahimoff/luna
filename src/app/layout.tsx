import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MainShell } from "@/components/main-shell";
import { I18nProvider } from "@/components/i18n-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSiteUrl } from "@/lib/seo";
import { isStaffRole } from "@/lib/staff-access";
import { getSessionUser } from "@/lib/user-session";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Luna — events",
    template: "%s — Luna",
  },
  description: "Discover events and host your own in minutes.",
  openGraph: {
    type: "website",
    siteName: "Luna",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
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
  const sessionUser = await getSessionUser();
  const staff = sessionUser != null && isStaffRole(sessionUser.role);
  const dictionary = getDictionary(sessionUser?.preferredLanguage ?? "EN");
  const englishDictionary = getDictionary("EN");

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="font-sans flex min-h-dvh flex-col">
        <ThemeProvider>
          <I18nProvider dictionary={dictionary} englishDictionary={englishDictionary}>
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
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
