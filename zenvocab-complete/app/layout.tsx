import type { Metadata } from 'next'
import './globals.css'
import { PWAInstaller } from '@/components/pwa-installer'

export const metadata: Metadata = {
  title: 'ZenVocab - 极简单词流',
  description: '基于 AI 的极简单词学习工具',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ZenVocab',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans antialiased">
        <PWAInstaller />
        {children}
      </body>
    </html>
  )
}
