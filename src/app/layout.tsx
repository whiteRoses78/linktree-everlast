import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono, PT_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Footer } from "@/components/footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "linktree-app",
    template: "%s · linktree-app",
  },
  description: "Linktree-Style Profilseiten mit kuratierten Links.",
  // Demo-Projekt: bewusst nicht in Google indexieren, um die TMG/DSGVO-
  // Grauzone für private Lernprojekte zu wahren. Vor produktivem Betrieb
  // diese Zeile entfernen.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${ptSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Footer />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
