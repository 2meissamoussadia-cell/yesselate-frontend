/**
 * Programmation — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function ProgrammationPage() {
  redirect('/maitre-ouvrage/programmation/outlook');
}
