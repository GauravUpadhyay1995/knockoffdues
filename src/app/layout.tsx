import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { LoadingProvider } from "@/context/LoadingContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import TopLoadingBar from "@/components/common/TopLoadingBar";
import { Suspense } from 'react';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import Drawer from '@/components/home/Drawer';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Knock Off Dues | Innovation & Development',
  description: 'Knock Off Dues',
  icons: {
    icon: "/favicon.ico",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <Suspense fallback={null}>
          <TopLoadingBar />
        
          {/* <button
       
                 className="fixed right-0 top-1/2 -translate-y-1/2 bg-orange-600 text-white px-3 py-2 rounded-l-lg shadow-md z-50 hover:bg-indigo-700 transition"
               >
                 ⚙️hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
               </button> */}
        </Suspense>
        <AuthProvider>
            <Drawer />
          <ThemeProvider>
            <SidebarProvider>
              <LoadingProvider>
                <LoadingScreen />
                {children}
              </LoadingProvider>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
        />
      </body>
    </html>
  );
}
