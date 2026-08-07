import { redirect } from "next/navigation";
import { ActivityScreen } from "@/features/activity/components/activity-screen";
import { getAuthenticatedUserId } from "@/features/auth/services/server-auth";
import { MembershipBoundary } from "@/features/membership/components/membership-boundary";

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/login");
  }

  return (
    <MembershipBoundary>
      <ActivityScreen />
    </MembershipBoundary>
  );
}
