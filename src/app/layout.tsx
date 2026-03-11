import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import FloatingRecommendation from "@/components/FloatingRecommendation";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { CartProvider } from "@/context/CartContext";
import { ConfigProvider } from "@/context/ConfigContext";
import { supabase } from "@/lib/supabase";
import Script from "next/script";
import { Lexend } from "next/font/google";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side fetch to prevent hydration flicker (e.g. Logo swap)
  // This will fetch settings and navigation only once per request.
  const [
    { data: setRes },
    { data: navRes }
  ] = await Promise.all([
    supabase.from('site_settings').select('key, value'),
    supabase.from('navigation_items').select('*').eq('active', true).order('order', { ascending: true })
  ]);

  const initialSettings: any = {};
  if (setRes) setRes.forEach((s: any) => initialSettings[s.key] = s.value);
  const initialNavigation = navRes || [];

  return (
    <html lang="es" suppressHydrationWarning className={lexend.variable}>
      <head>
        {/* Preconnect to improve speed of external connections */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://jdzujwuhvovjwyjvxvvy.supabase.co" />
        <link rel="dns-prefetch" href="https://jdzujwuhvovjwyjvxvvy.supabase.co" />
        
        {/* Material Symbols loading */}
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
        />
        <noscript>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        </noscript>
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WCMLWQ98"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-WCMLWQ98');
            `,
          }}
        />

        <ConfigProvider initialSettings={initialSettings} initialNavigation={initialNavigation}>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <FloatingWhatsApp />
            <FloatingRecommendation />
            <AnalyticsTracker />
          </CartProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
