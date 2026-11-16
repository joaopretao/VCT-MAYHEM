import { Lineup, Role } from '../types';

// Fixed visual order of the 5 lineup slots / journey nodes
export const ROLE_ORDER: Role[] = ['Duelist', 'Controller', 'Initiator', 'Sentinel', 'Flex'];

// The first role (in visual order) that is still empty
export function getNextOpenRole(lineup: Lineup): Role | null {
  return ROLE_ORDER.find(r => !lineup[r]) ?? null;
}
