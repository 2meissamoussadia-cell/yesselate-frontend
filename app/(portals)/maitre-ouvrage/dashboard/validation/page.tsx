/**
 * Redirection /maitre-ouvrage/dashboard/validation → module Validation BC (redistribution).
 */

import { redirect } from 'next/navigation';

export default function DashboardValidationPage() {
  redirect('/maitre-ouvrage/validation-bc');
}
