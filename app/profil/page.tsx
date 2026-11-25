'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Download, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/dictionaries';
import { usersMeApi } from '@/lib/api';
import { ApiError } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

const HALAL_LABELS: Record<number, string> = {
  1: 'Déclaratif',
  2: 'Validé mosquée',
  3: 'Certifié organisme',
  4: '100% Halal',
};

export default function ProfilPage() {
  const { user, accessToken, isLoading, logout, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/connexion');
  }, [isLoading, user, router]);

  if (isLoading || !user || !accessToken) {
    return <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">Chargement…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gérez votre compte, vos préférences et vos données.</p>
      </div>

      <PreferencesSection
        token={accessToken}
        language={user.language}
        halalStrictnessPreference={user.halalStrictnessPreference}
        notificationPreferences={user.notificationPreferences}
        onSaved={() => void refreshUser()}
      />

      <EmailSection token={accessToken} currentEmail={user.email} onSaved={() => void refreshUser()} />

      <PasswordSection token={accessToken} />

      <PhoneSection token={accessToken} currentPhone={user.phoneNumber} onSaved={() => void refreshUser()} />

      <RgpdSection token={accessToken} />

      <DangerSection token={accessToken} onDeleted={() => void logout()} />

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/confidentialite" className="underline hover:no-underline">
          Politique de confidentialité
        </Link>{' '}
        ·{' '}
        <Link href="/cgu" className="underline hover:no-underline">
          Conditions d&apos;utilisation
        </Link>
      </p>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

// ── Préférences ────────────────────────────────────────────────────────────

function PreferencesSection({
  token,
  language,
  halalStrictnessPreference,
  notificationPreferences,
  onSaved,
}: {
  token: string;
  language: string;
  halalStrictnessPreference: number | null;
  notificationPreferences: { promos: boolean; planning_reminders: boolean; prayer_times: boolean };
  onSaved: () => void;
}) {
  const { t, setLocale } = useI18n();
  const [lang, setLang] = useState(language);
  const [halal, setHalal] = useState<number | ''>(halalStrictnessPreference ?? '');
  const [notifs, setNotifs] = useState(notificationPreferences);
  const [saving, setSaving] = useState(false);

  async function save(partial: Partial<{ language: string; halalStrictnessPreference: number; notificationPreferences: Partial<typeof notifs> }>) {
    setSaving(true);
    try {
      await usersMeApi.updatePreferences(partial, token);
      onSaved();
      toast.success(t('common.save'));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SectionCard title={t('profile.preferences')}>
      <div className="space-y-1.5">
        <Label htmlFor="language">{t('profile.language')}</Label>
        <select
          id="language"
          value={lang}
          onChange={(e) => {
            const next = e.target.value;
            setLang(next);
            setLocale(next as Locale); // bascule immédiate de l'UI
            void save({ language: next });
          }}
          disabled={saving}
          className="h-8 w-full max-w-[200px] rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="halal-strictness">{t('profile.halal_default')}</Label>
        <select
          id="halal-strictness"
          value={halal}
          onChange={(e) => {
            const v = e.target.value === '' ? '' : Number(e.target.value);
            setHalal(v);
            if (v !== '') void save({ halalStrictnessPreference: v });
          }}
          disabled={saving}
          className="h-8 w-full max-w-[240px] rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="">{t('profile.not_set')}</option>
          {[1, 2, 3, 4].map((level) => (
            <option key={level} value={level}>
              {level} — {HALAL_LABELS[level]}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">{t('profile.halal_help')}</p>
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium">{t('profile.notifications')}</p>
        <NotifRow
          label={t('profile.notif_promos')}
          checked={notifs.promos}
          disabled={saving}
          onChange={(checked) => {
            const next = { ...notifs, promos: checked };
            setNotifs(next);
            void save({ notificationPreferences: { promos: checked } });
          }}
        />
        <NotifRow
          label={t('profile.notif_planning')}
          checked={notifs.planning_reminders}
          disabled={saving}
          onChange={(checked) => {
            const next = { ...notifs, planning_reminders: checked };
            setNotifs(next);
            void save({ notificationPreferences: { planning_reminders: checked } });
          }}
        />
        <NotifRow
          label={t('profile.notif_prayer')}
          checked={notifs.prayer_times}
          disabled={saving}
          onChange={(checked) => {
            const next = { ...notifs, prayer_times: checked };
            setNotifs(next);
            void save({ notificationPreferences: { prayer_times: checked } });
          }}
        />
      </div>
    </SectionCard>
  );
}

function NotifRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={`notif-${label}`} className="font-normal">
        {label}
      </Label>
      <Switch
        id={`notif-${label}`}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(c) => onChange(c === true)}
      />
    </div>
  );
}

// ── Email ─────────────────────────────────────────────────────────────────

function EmailSection({ token, currentEmail, onSaved }: { token: string; currentEmail: string; onSaved: () => void }) {
  const [newEmail, setNewEmail] = useState(currentEmail);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await usersMeApi.updateEmail(newEmail, password, token);
      setPassword('');
      onSaved();
      toast.success('Email mis à jour.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard title="Adresse email">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-email">Nouvel email</Label>
          <Input id="new-email" type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email-password">Mot de passe actuel</Label>
          <Input
            id="email-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Mise à jour…' : "Mettre à jour l'email"}
        </Button>
      </form>
    </SectionCard>
  );
}

// ── Mot de passe ──────────────────────────────────────────────────────────

function PasswordSection({ token }: { token: string }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    try {
      await usersMeApi.updatePassword(currentPassword, newPassword, token);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Mot de passe mis à jour.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard title="Mot de passe">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Mot de passe actuel</Label>
          <Input
            id="current-password"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">Nouveau mot de passe</Label>
          <Input
            id="new-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Mise à jour…' : 'Changer le mot de passe'}
        </Button>
      </form>
    </SectionCard>
  );
}

// ── Téléphone ─────────────────────────────────────────────────────────────

function PhoneSection({
  token,
  currentPhone,
  onSaved,
}: {
  token: string;
  currentPhone: string | null;
  onSaved: () => void;
}) {
  const [phone, setPhone] = useState(currentPhone ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await usersMeApi.updatePhone(phone.trim() === '' ? null : phone.trim(), token);
      onSaved();
      toast.success('Numéro de téléphone mis à jour.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard title="Numéro de téléphone">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone (optionnel)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+33612345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? 'Mise à jour…' : 'Enregistrer'}
        </Button>
      </form>
    </SectionCard>
  );
}

// ── RGPD : export des données ─────────────────────────────────────────────

function RgpdSection({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const data = await usersMeApi.exportData(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hal-holiday-mes-donnees.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard title="Mes données (RGPD)">
      <p className="text-sm text-muted-foreground">
        Téléchargez une copie de vos données personnelles au format JSON (droit à la
        portabilité, art. 20 du RGPD).
      </p>
      <Button variant="outline" size="sm" onClick={() => void handleExport()} disabled={loading}>
        <Download data-icon="inline-start" />
        {loading ? 'Génération…' : 'Télécharger mes données'}
      </Button>
    </SectionCard>
  );
}

// ── Suppression du compte ────────────────────────────────────────────────

function DangerSection({ token, onDeleted }: { token: string; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await usersMeApi.deleteAccount(password, token);
      toast.success('Compte supprimé.');
      onDeleted();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
      setLoading(false);
    }
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <h2 className="text-base font-semibold text-destructive">Supprimer mon compte</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Cette action est <span className="font-medium text-foreground">définitive</span> : votre
          compte, vos favoris et toutes vos données associées seront supprimés immédiatement et
          irrévocablement.
        </p>

        {!confirming ? (
          <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
            <Trash2 data-icon="inline-start" />
            Supprimer mon compte
          </Button>
        ) : (
          <form onSubmit={(e) => void handleDelete(e)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="delete-password">Confirmez avec votre mot de passe</Label>
              <Input
                id="delete-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" size="sm" disabled={loading}>
                {loading ? 'Suppression…' : 'Confirmer la suppression définitive'}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Annuler
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
