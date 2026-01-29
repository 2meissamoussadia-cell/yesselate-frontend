'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST /api/auth/login
    console.log({ email, password });
  };

  return (
    <div className="w-full max-w-sm rounded-lg border bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-center mb-6">
        NICE RÉNOVATION — Connexion
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="dg@nice.sn"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-primary text-primary-foreground py-2 px-4 font-medium hover:opacity-90 transition-opacity"
        >
          Se connecter
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/" className="underline hover:text-foreground">
          Retour à l&apos;accueil
        </Link>
      </p>
    </div>
  );
}
