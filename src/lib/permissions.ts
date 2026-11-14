export type UserRole = "ADMIN" | "SECRETARY" | "TEACHER" | "GUARDIAN";

export const PERMISSIONS = {
  ADMIN: ["all"],
  SECRETARY: [
    "academic:read",
    "academic:write",
    "financial:read",
    "financial:write",
    "enrollment:create",
    "attendance:read",
  ],
  TEACHER: [
    "academic:read",
    "attendance:read",
    "attendance:write",
    "lessons:write",
  ],
  GUARDIAN: [
    "guardian:read",
    "financial:student:read",
  ],
} as const;

export function hasPermission(
  role: UserRole,
  permission: string
): boolean {
  if (role === "ADMIN") return true;
  const userPerms = PERMISSIONS[role] as readonly string[];
  return userPerms?.includes(permission) || false;
}

export function canManageEnrollments(role: UserRole): boolean {
  return role === "ADMIN" || role === "SECRETARY";
}

export function canManagePayments(role: UserRole): boolean {
  return role === "ADMIN" || role === "SECRETARY";
}

export function canRecordAttendance(role: UserRole): boolean {
  return role === "ADMIN" || role === "SECRETARY" || role === "TEACHER";
}

