'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function InscriptionPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!acceptedTerms) {
      toast.error("Vous devez accepter les CGU et la politique de confidentialité.");
      return;
    }
    setLoading(true);
    try {
      await register(email, password, acceptedTerms);
      router.push('/');
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : 'Une erreur est survenue.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-semibold">Créer un compte</h1>
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?{' '}
            <Link href="/auth/connexion" className="underline hover:no-underline">
              Se connecter
            </Link>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 caractères.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="accepted-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="accepted-terms" className="text-sm font-normal leading-snug text-muted-foreground">
                J&apos;accepte les{' '}
                <Link href="/cgu" className="underline hover:no-underline" target="_blank">
                  conditions d&apos;utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/confidentialite" className="underline hover:no-underline" target="_blank">
                  politique de confidentialité
                </Link>
                .
              </Label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Création…' : 'Créer mon compte'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
