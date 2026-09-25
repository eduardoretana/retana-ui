import { Suspense } from "react";
import type { Metadata } from "next";

import { TeamDashboard } from "@/components/demo/team-dashboard";

export const metadata: Metadata = {
  title: "Team",
  description: "Layered panel demo: peek a team member, then expand the profile without leaving the table.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<ScreenFallback label="Loading team…" />}>
      <TeamDashboard />
    </Suspense>
  );
}

function ScreenFallback({ label }: { label: string }) {
  return (
    <div className="grid h-dvh place-items-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
