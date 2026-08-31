export type EarnPayloadInput = {
  businessId: string;
  accountId: string;
  operationId: string;
  purchaseAmount?: number;
};

export function buildEarnBackendPayload(input: EarnPayloadInput) {
  return {
    business_id: input.businessId,
    customer_loyalty_account_id: input.accountId,
    operationId: input.operationId,
    ...(input.purchaseAmount === undefined ? {} : { purchase_amount: input.purchaseAmount }),
  };
}

export function buildRedeemBackendPayload(input: {
  businessId: string;
  accountId: string;
  rewardId: string;
  operationId: string;
}) {
  return {
    business_id: input.businessId,
    account_id: input.accountId,
    reward_id: input.rewardId,
    branch_id: null,
    operationId: input.operationId,
  };
}
