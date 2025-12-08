import { StatCards } from "@/components/dashboard/stat-cards";
import { RequestChart } from "@/components/dashboard/request-chart";
import { PlanDistributionChart } from "@/components/dashboard/plan-distribution-chart";
import { RecentActivityTable } from "@/components/dashboard/recent-activity-table";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Rate Limiter Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live snapshot of API usage, limits, and plan distribution.
          </p>
        </div>
      </header>

      <StatCards />

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RequestChart />
        </div>
        <div>
          <PlanDistributionChart />
        </div>
      </section>

      <section>
        <RecentActivityTable />
      </section>
    </div>
  );
}
