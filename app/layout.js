import "./global.css"
import Head from 'next/head';

export const metadata = {
  title: 'Structly',
  description: 'Programming data structure explorer',
  viewport: {
    themeColor: '#7c3aed', 
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
