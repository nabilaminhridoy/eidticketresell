import { redirect } from 'next/navigation';

export default function RootNotFound() {
  // Redirect root-level 404s to the language-aware 404 page
  redirect('/en/404');
}
