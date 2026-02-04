/**
 * Validation BC — Redirection vers la vue Outlook-like unifiée
 */

import { redirect } from 'next/navigation';

export default function ValidationBCPage() {
  redirect('/maitre-ouvrage/validation-bc/outlook');
}
