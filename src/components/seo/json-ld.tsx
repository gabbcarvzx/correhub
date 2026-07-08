import type { Organization, WebApplication } from "schema-dts";

const organizationSchema: Organization = {
  "@type": "Organization",
  name: "CorreHub",
  url: "https://correhub.app",
  logo: "https://correhub.app/icons/icon-192x192.png",
  description: "Plataforma que conecta corredores, grupos de corrida, eventos e parceiros locais.",
  areaServed: "BR",
};

const webAppSchema: WebApplication = {
  "@type": "WebApplication",
  name: "CorreHub",
  url: "https://correhub.app",
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify([organizationSchema, webAppSchema]),
      }}
    />
  );
}
