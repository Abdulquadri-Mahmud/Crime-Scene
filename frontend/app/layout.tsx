import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Community Crime Registry",
  description:
    "File, track, and manage community crime reports — a faster, more reliable alternative to in-person and phone reporting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper font-body text-ink antialiased">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-line bg-ink py-8 text-paper/70">
          <div className="mx-auto max-w-5xl px-6 text-sm">
            <p>
              Community Crime Registry — a project of the Department of Computer Science,
              Gateway (ICT) Polytechnic Saapade.
            </p>
            <p className="mt-1 text-paper/40">
              In a life-threatening emergency, contact your local police station or emergency
              services directly. This system is for non-emergency incident reporting and tracking.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
