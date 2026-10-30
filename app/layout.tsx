import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Retana UI",
    template: "%s · Retana UI",
  },
  description:
    "Catalog of shared shadcn components, blocks, hooks, and libraries. Each piece inherits the host project's theme, including dark mode.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var q=new URLSearchParams(location.search);var theme=q.get('theme');if(theme==='dark'||theme==='light'){document.documentElement.classList.toggle('dark',theme==='dark');localStorage.setItem('theme',theme)}else if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}var locale=q.get('locale');if(locale==='es-MX'||locale==='es')document.documentElement.lang='es-MX';if(locale==='en'||(locale&&locale.slice(0,3)==='en-'))document.documentElement.lang='en';if(q.get('motion')==='reduce'||q.get('motion')==='reduced'){var native=window.matchMedia.bind(window);window.matchMedia=function(query){if(String(query).indexOf('prefers-reduced-motion')!==-1){return{matches:true,media:String(query),onchange:null,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false}}}return native(query)}}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
