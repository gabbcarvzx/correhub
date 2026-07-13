import { MarketingHomePage } from "@/features/marketing/pages/marketing-home-page";
import { getRunnerOfTheWeek } from "@/features/runner-of-week/services/runner-of-week-service";
import { getCurrentTenant } from "@/lib/security/tenant";

export default async function Home() {
  let runnerOfWeek = null;
  try {
    const tenant = await getCurrentTenant();
    runnerOfWeek = await getRunnerOfTheWeek(tenant.id);
  } catch {
    // Se falhar (ex: sem tenant), apenas não mostra
  }

  return <MarketingHomePage runnerOfWeek={runnerOfWeek} />;
}
