/**
 * Redirection /maitre-ouvrage/dashboard/validation → dashboard section Performance > Validations
 * Le dashboard utilise une seule page avec query params (?main=performance&sub=validation&leaf=...).
 */

import { redirect } from 'next/navigation';

export default function DashboardValidationPage() {
  redirect('/maitre-ouvrage/dashboard?main=performance&sub=validation&leaf=en-attente');
}
