import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { CartProvider } from "@/context/CartContext";
import { ConfigProvider } from "@/context/ConfigContext";
import { supabase } from "@/lib/supabase";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data } = await supabase.from('site_settings').select('key, value');
    const settings = data?.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {}) || {};

    return {
      title: settings.meta_title || "PYPER PARAGUAY - Librería y Tecnología Educativa",
      description: settings.meta_description || "Especialistas en soluciones educativas, útiles escolares y tecnología de vanguardia en Paraguay.",
      icons: {
        icon: settings.favicon_url || "/favicon.ico",
      }
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "PYPER PARAGUAY - Librería y Tecnología Educativa",
      description: "Especialistas en soluciones educativas, útiles escolares y tecnología de vanguardia en Paraguay.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body>
        <ConfigProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <FloatingWhatsApp />
            <AnalyticsTracker />
          </CartProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
