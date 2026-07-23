import { redirect } from 'next/navigation';

export default function NotFound() {
  // Redirect to the proper 404 page route
  redirect('/en/404');
}
