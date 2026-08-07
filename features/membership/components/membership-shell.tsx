import { MembershipBoundary } from "./membership-boundary";
import { OperationalShell } from "./operational-shell";

export function MembershipShell() {
  return (
    <MembershipBoundary>
      <OperationalShell />
    </MembershipBoundary>
  );
}
