'use client';

import { useState, ReactNode } from 'react';
import '../src/global.css';

export default function RootLayout({ children }) {
  const [dark, setDark] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>MASH Store</title>
        <meta name="description" content="MASH Store - Premium Streetwear" />
      </head>
      <body className={dark ? 'dark' : ''}>
        {children}
      </body>
    </html>
  );
}
