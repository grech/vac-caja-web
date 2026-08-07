export type ProgramType = "points" | "stamps";

export type CajaScanReward = {
  id: string;
  name: string;
  description: string | null;
  pointsRequired: number | null;
  stampsRequired: number | null;
};

export type CajaScanResult = {
  accountId: string;
  programType: ProgramType;
  pointsBalance: number;
  stampsBalance: number;
  stampsPerVisit: number | null;
  customer: { displayName: string };
  availableRewards: CajaScanReward[];
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function nullableNumber(value: unknown): number | null {
  return value === null || value === undefined ? null : asNumber(value);
}

function unwrapPayload(value: unknown): UnknownRecord | null {
  const root = asRecord(value);
  return asRecord(root?.data) ?? root;
}

export function mapScanResult(value: unknown): CajaScanResult | null {
  const payload = unwrapPayload(value);
  const account = asRecord(payload?.account) ?? asRecord(payload?.loyalty_account) ?? payload;
  const program = asRecord(payload?.program)
    ?? asRecord(payload?.loyalty_program)
    ?? asRecord(account?.program)
    ?? asRecord(account?.loyalty_program)
    ?? payload;
  const customer = asRecord(payload?.customer)
    ?? asRecord(payload?.profile)
    ?? asRecord(account?.customer)
    ?? asRecord(account?.profile);
  const accountId = asString(account?.id ?? payload?.account_id ?? payload?.accountId);
  const programType = asString(program?.type ?? payload?.program_type ?? payload?.programType);

  if (!accountId || (programType !== "points" && programType !== "stamps")) {
    return null;
  }

  const rawRewards = Array.isArray(payload?.available_rewards)
    ? payload.available_rewards
    : Array.isArray(payload?.availableRewards)
      ? payload.availableRewards
      : [];

  const availableRewards = rawRewards.flatMap((value) => {
    const reward = asRecord(value);
    const id = asString(reward?.id);
    const name = asString(reward?.name);

    return id && name
      ? [{
          id,
          name,
          description: asString(reward?.description),
          pointsRequired: nullableNumber(reward?.points_required ?? reward?.pointsRequired),
          stampsRequired: nullableNumber(reward?.stamps_required ?? reward?.stampsRequired),
        }]
      : [];
  });

  return {
    accountId,
    programType,
    pointsBalance: asNumber(account?.points_balance ?? payload?.points_balance ?? payload?.pointsBalance) ?? 0,
    stampsBalance: asNumber(account?.stamps_balance ?? payload?.stamps_balance ?? payload?.stampsBalance) ?? 0,
    stampsPerVisit: nullableNumber(
      program?.stamps_per_visit ?? payload?.stamps_per_visit ?? payload?.stampsPerVisit,
    ),
    customer: {
      displayName: asString(
        customer?.full_name
          ?? customer?.display_name
          ?? customer?.displayName
          ?? payload?.customer_name,
      ) ?? "Cliente",
    },
    availableRewards,
  };
}
