export const metadata = {
  title: 'BECOME',
  description: 'A premium workspace for creating and managing your Etsy shop.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
