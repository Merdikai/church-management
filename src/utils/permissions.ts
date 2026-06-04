import type { RoleName } from '../types/Role';

export function isAdmin(role: RoleName): boolean {
  return role === 'admin';
}

export function isLeader(role: RoleName): boolean {
  return role === 'leader';
}

export function isMember(role: RoleName): boolean {
  return role === 'member';
}

export function canManageTeams(role: RoleName): boolean {
  return role === 'admin';
}

export function canPostAnnouncements(role: RoleName): boolean {
  return role === 'admin' || role === 'leader';
}

export function canApproveRequests(role: RoleName): boolean {
  return role === 'admin' || role === 'leader';
}