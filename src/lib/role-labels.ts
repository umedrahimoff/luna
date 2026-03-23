import { UserRole } from "@prisma/client";

export function userRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return "Administrator";
    case UserRole.MODERATOR:
      return "Moderator";
    case UserRole.USER:
    default:
      return "User";
  }
}
