import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/analytics');
  
  // This won't be rendered, but including as a fallback
  return <div>Redirecting to Analytics...</div>;
}

