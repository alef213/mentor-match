import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Venture Cafe Phoenix Mentorship Network",
  description: "Find your mentor or mentee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-8">
        {children}
        <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur-sm py-2 text-center">
          <p className="text-xs text-white/20">
            Built by{" "}
            <a
              href="https://www.thinklaunchiq.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
            >
              ThinkLaunchIQ
            </a>
            {" · "}In partnership with{" "}
            <a
              href="https://resolutionresourcegroup.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50 transition-colors"
            >
              Resolution Resource Group
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
