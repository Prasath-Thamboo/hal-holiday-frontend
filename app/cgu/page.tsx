import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Conditions d'utilisation — Hal Holiday",
  description: "Les conditions générales d'utilisation de Hal Holiday.",
};

export default function CguPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Conditions d&apos;utilisation</h1>
      <p className="mb-10 text-sm text-muted-foreground">Dernière mise à jour : 1er septembre 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-2 text-lg font-semibold">1. Objet</h2>
          <p>
            Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;accès
            et l&apos;usage de l&apos;application Hal Holiday, qui recense des lieux
            (restaurants, mosquées, activités) à Paris compatibles avec un mode de vie
            musulman.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">2. Création de compte</h2>
          <p>
            La création d&apos;un compte nécessite un email valide et un mot de passe.
            Vous êtes responsable de la confidentialité de vos identifiants et de toute
            activité effectuée depuis votre compte.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">3. Contenu et fiabilité des informations</h2>
          <p>
            Les niveaux de rigueur halal affichés (déclaratif, validé mosquée, certifié,
            100% halal) reflètent les informations disponibles au moment de la
            publication et n&apos;engagent pas la responsabilité de Hal Holiday quant à
            leur exactitude absolue. Il appartient à chaque utilisateur de vérifier
            auprès de l&apos;établissement les éléments qui lui importent.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">4. Usage autorisé</h2>
          <p>
            Vous vous engagez à utiliser l&apos;application dans le respect des lois en
            vigueur et à ne pas tenter d&apos;en perturber le fonctionnement (extraction
            massive de données, attaque, usurpation de compte, etc.).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">5. Suppression de compte</h2>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis l&apos;onglet Profil.
            Cette action est définitive et entraîne la suppression de l&apos;ensemble de
            vos données associées (favoris, séjours, préférences).
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">6. Données personnelles</h2>
          <p>
            Le traitement de vos données personnelles est détaillé dans notre{' '}
            <a href="/confidentialite" className="underline hover:no-underline">
              politique de confidentialité
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">7. Évolution des CGU</h2>
          <p>
            Ces CGU peuvent être amenées à évoluer. Toute modification substantielle vous
            sera notifiée avant sa prise d&apos;effet.
          </p>
        </section>
      </div>
    </div>
  );
}
