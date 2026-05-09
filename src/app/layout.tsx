import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SVG Graphic Editor',
  description: 'A web-based SVG graphic editor',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
