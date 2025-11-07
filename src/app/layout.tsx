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
import { AuthProvider, SettingsProvider } from '@/context/AuthContext';
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
        
         
        </Suspense>
        <AuthProvider>
           <SettingsProvider>
            <Drawer />
          <ThemeProvider>
            <SidebarProvider>
              <LoadingProvider>
                <LoadingScreen />
                {children}
              </LoadingProvider>
            </SidebarProvider>
          </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          reverseOrder={false}
        />
      </body>
    </html>
  );
}
