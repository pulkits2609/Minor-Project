import type { MineOpsRoleKey } from '@/constants/mineops';

const APP_ROLES: MineOpsRoleKey[] = ['worker', 'supervisor', 'safety', 'admin', 'authority'];

export const normalizeRoleForApp = (role: string | null | undefined): MineOpsRoleKey | null => {
  if (!role) return null;
  const normalized = role === 'safety_officer' ? 'safety' : role;
  return APP_ROLES.includes(normalized as MineOpsRoleKey) ? (normalized as MineOpsRoleKey) : null;
};

export const toApiRole = (role: string | null | undefined): string | null => {
  if (!role) return null;
  return role === 'safety' ? 'safety_officer' : role;
};
