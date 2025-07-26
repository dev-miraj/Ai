import type React from "react"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
})

export const metadata: Metadata = {
  title: "CognitionX | Assignment 8",
  description: "AI Chat Assistant",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${outfit.variable} font-outfit`}>{children}</body>
    </html>
  )
}
