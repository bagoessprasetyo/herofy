import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AuthHandler } from '@/components/AuthHandler';
import { Navigation } from '@/components/Navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Herofy - Turn Your Life Into an Epic RPG Adventure',
  description: 'Transform boring daily tasks into exciting RPG quests that motivate you to become the hero of your own life. Gain XP, level up, and build your character through real-world achievements.',
  keywords: 'productivity, RPG, gamification, tasks, motivation, level up, quests, habit tracker',
  authors: [{ name: 'Herofy Team' }],
  creator: 'Herofy',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://herofy.com',
    siteName: 'Herofy',
    title: 'Herofy - Turn Your Life Into an Epic RPG Adventure',
    description: 'Transform boring daily tasks into exciting RPG quests. Gain XP, level up, and become the hero of your own life!',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Herofy - RPG Life Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Herofy - Turn Your Life Into an Epic RPG Adventure',
    description: 'Transform boring daily tasks into exciting RPG quests. Gain XP, level up, and become the hero of your own life!',
    images: ['/og-image.png'],
    creator: '@herofy_app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Herofy" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
      </head>
      <body className={`${inter.className} antialiased min-h-screen bg-gray-50`}>
        <AuthProvider>
          <AuthHandler />
          <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            <Navigation />
            
            {/* Main Content */}
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-8 px-4">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {/* Brand */}
                  <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">H</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">Herofy</span>
                    </div>
                    <p className="text-gray-600 mb-4 max-w-md">
                      Transform your daily tasks into epic RPG quests. Level up your life, one quest at a time.
                    </p>
                    <div className="flex space-x-4">
                      <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="sr-only">Twitter</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-600 transition-colors">
                        <span className="sr-only">GitHub</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                  
                  {/* Product */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      Product
                    </h3>
                    <ul className="space-y-3">
                      <li><a href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
                      <li><a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
                      <li><a href="/changelog" className="text-gray-600 hover:text-gray-900 transition-colors">Changelog</a></li>
                      <li><a href="/roadmap" className="text-gray-600 hover:text-gray-900 transition-colors">Roadmap</a></li>
                    </ul>
                  </div>
                  
                  {/* Support */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      Support
                    </h3>
                    <ul className="space-y-3">
                      <li><a href="/help" className="text-gray-600 hover:text-gray-900 transition-colors">Help Center</a></li>
                      <li><a href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
                      <li><a href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy</a></li>
                      <li><a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</a></li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-gray-400 text-sm text-center">
                    © 2025 Herofy. All rights reserved. Made with ❤️ for heroes everywhere.
                  </p>
                </div>
              </div>
            </footer>
          </div>

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Define default options
              className: '',
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                maxWidth: '500px',
              },
              // Default options for specific types
              success: {
                duration: 3000,
                style: {
                  background: '#10b981',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#10b981',
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#ef4444',
                },
              },
              loading: {
                style: {
                  background: '#3b82f6',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}