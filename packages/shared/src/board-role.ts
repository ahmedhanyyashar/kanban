import { z } from "zod";

/** What a person can be on a board; the owner is the one who created it. */
export const BOARD_ROLES = ["owner", "admin", "member"] as const;
export const boardRoleSchema = z.enum(BOARD_ROLES);
export type BoardRole = z.infer<typeof boardRoleSchema>;

/** Who may invite and remove people. Defined once, so the API enforces it and the UI hides what it would refuse. */
export function canManageMembers(role: BoardRole): boolean {
  return role === "owner" || role === "admin";
}
