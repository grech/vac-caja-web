import type { ProgramType } from "@/features/scanner/domain/scan-result";

export type CajaEarnResult = {
  programType: ProgramType;
  pointsBalance: number;
  stampsBalance: number;
  pointsDelta: number | null;
  stampsDelta: number | null;
};

export type CajaRedeemResult = {
  programType: ProgramType;
  pointsBalance: number;
  stampsBalance: number;
  pointsSpent: number;
  stampsSpent: number;
  rewardName: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function unwrap(value: unknown): UnknownRecord | null {
  const root = asRecord(value);
  return asRecord(root?.data) ?? root;
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function string(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function programType(value: unknown): ProgramType | null {
  const type = string(value);
  return type === "points" || type === "stamps" ? type : null;
}

function balances(payload: UnknownRecord, type: ProgramType) {
  const newBalance = number(payload.new_balance ?? payload.newBalance);
  const pointsBalance = number(
    payload.points_balance ?? payload.pointsBalance ?? payload.new_points_balance,
  ) ?? (type === "points" ? newBalance : null);
  const stampsBalance = number(
    payload.stamps_balance ?? payload.stampsBalance ?? payload.new_stamps_balance,
  ) ?? (type === "stamps" ? newBalance : null);

  return {
    pointsBalance: pointsBalance ?? 0,
    stampsBalance: stampsBalance ?? 0,
  };
}

export function mapEarnResult(value: unknown): CajaEarnResult | null {
  const payload = unwrap(value);
  const type = programType(payload?.program_type ?? payload?.programType ?? payload?.type);

  if (!payload || !type) {
    return null;
  }

  return {
    programType: type,
    ...balances(payload, type),
    pointsDelta: number(
      payload.points_delta ?? payload.pointsDelta ?? payload.points_added ?? payload.points_earned,
    ),
    stampsDelta: number(
      payload.stamps_delta ?? payload.stampsDelta ?? payload.stamps_added ?? payload.stamps_earned,
    ),
  };
}

export function mapRedeemResult(value: unknown): CajaRedeemResult | null {
  const payload = unwrap(value);
  const reward = asRecord(payload?.reward);
  const type = programType(payload?.program_type ?? payload?.programType ?? payload?.type);
  const rewardName = string(payload?.reward_name ?? payload?.rewardName ?? reward?.name);

  if (!payload || !type || !rewardName) {
    return null;
  }

  return {
    programType: type,
    ...balances(payload, type),
    pointsSpent: number(
      payload.points_spent ?? payload.pointsSpent ?? payload.points_cost,
    ) ?? 0,
    stampsSpent: number(
      payload.stamps_spent ?? payload.stampsSpent ?? payload.stamps_cost,
    ) ?? 0,
    rewardName,
  };
}
