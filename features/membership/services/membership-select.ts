export const ACTIVE_MEMBERSHIP_SELECT = `
  id,
  business_id,
  profile_id,
  role,
  status,
  login_username,
  profile:profiles!business_members_profile_id_fkey(full_name),
  business:businesses(name, cashier_login_code)
`;
