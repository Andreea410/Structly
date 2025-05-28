import "./global.css"

export const metadata = {
  title: 'Structly',
  description: 'Programming data structure explorer',
};

export const viewport = {
  themeColor: '#7c3aed',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
