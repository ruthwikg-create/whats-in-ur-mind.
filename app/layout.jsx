import './globals.css';
export const metadata = { title: "What's in U'R mind — Think. Explore. Discover.", description: "An AI research companion for ideas, careers and life in Telugu, English, Hindi, Tenglish and Hinglish. Built by Ruthwik." };
export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#f6f9f4' };
export default function RootLayout({children}) { return <html lang="en"><body>{children}</body></html>; }