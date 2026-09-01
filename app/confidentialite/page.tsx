import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Hal Holiday',
  description: 'Comment Hal Holiday collecte, utilise et protège vos données personnelles.',
};

export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Politique de confidentialité</h1>
      <p className="mb-10 text-sm text-muted-foreground">Dernière mise à jour : 1er septembre 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Qui sommes-nous</h2>
          <p>
            Hal Holiday est une application qui aide ses utilisateurs à préparer un séjour
            à Paris en recensant des lieux compatibles avec un mode de vie musulman
            (restaurants, mosquées, activités). Ce document décrit les données que nous
            collectons et l&apos;usage que nous en faisons, conformément au Règlement
            Général sur la Protection des Données (RGPD).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Données collectées</h2>
          <ul className="ml-5 list-disc space-y-1">
            <li>Email et mot de passe (haché, jamais stocké en clair) lors de la création d&apos;un compte.</li>
            <li>Numéro de téléphone, si vous choisissez de le renseigner.</li>
            <li>Préférences : langue, niveau de rigueur halal souhaité, préférences de notification.</li>
            <li>Lieux favoris et, à terme, les séjours/plannings que vous créez dans l&apos;application.</li>
            <li>Position géographique, uniquement si vous l&apos;autorisez, pour la recherche de lieux à proximité — jamais stockée côté serveur.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Finalité et base légale</h2>
          <p>
            Ces données sont utilisées pour faire fonctionner votre compte, personnaliser
            votre expérience (filtre de rigueur halal, langue) et vous montrer des
            recommandations pertinentes. Le traitement repose sur l&apos;exécution du
            contrat qui nous lie (fourniture du service) et, pour les notifications
            optionnelles, sur votre consentement.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Conservation</h2>
          <p>
            Vos données sont conservées tant que votre compte est actif. En cas de
            suppression de compte, vos données personnelles et les données associées
            (favoris, séjours) sont supprimées immédiatement et définitivement.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Vos droits</h2>
          <p>
            Conformément aux articles 15 à 22 du RGPD, vous disposez d&apos;un droit
            d&apos;accès, de rectification, d&apos;effacement, de limitation et de
            portabilité de vos données. Depuis l&apos;onglet{' '}
            <span className="font-medium">Profil</span>, vous pouvez à tout moment :
          </p>
          <ul className="ml-5 mt-2 list-disc space-y-1">
            <li>Télécharger une copie de vos données personnelles (droit à la portabilité).</li>
            <li>Modifier votre email, mot de passe ou numéro de téléphone.</li>
            <li>Supprimer définitivement votre compte et toutes les données associées.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Partage des données</h2>
          <p>
            Nous ne vendons ni ne partageons vos données personnelles avec des tiers à
            des fins commerciales. Elles peuvent être traitées par nos sous-traitants
            techniques (hébergement) dans le seul cadre du fonctionnement du service.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Contact</h2>
          <p>
            Pour toute question relative à vos données, ou pour exercer un droit non
            couvert par les fonctionnalités du compte, contactez-nous à{' '}
            <a href="mailto:contact@halholiday.fr" className="underline hover:no-underline">
              contact@halholiday.fr
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
