import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/features/auth/services/server-auth";
import { MembershipBoundary } from "@/features/membership/components/membership-boundary";
import { ScannerScreen } from "@/features/scanner/components/scanner-screen";

export const dynamic = "force-dynamic";

export default async function ScanPage() {
  const userId = await getAuthenticatedUserId();

  if (!userId) {
    redirect("/login");
  }

  return (
    <MembershipBoundary>
      <ScannerScreen />
    </MembershipBoundary>
  );
}
