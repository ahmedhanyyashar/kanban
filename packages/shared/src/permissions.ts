import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

export const ac = createAccessControl(defaultStatements);

/** Every role a person can hold; only the unrestricted ones may manage accounts. */
export const roles = {
  member: ac.newRole({}),
};

export const ROLE_NAMES = ["member"] as const;
export type RoleName = (typeof ROLE_NAMES)[number];

/** The role a new account starts with. */
export const DEFAULT_ROLE: RoleName = "member";

/** The roles that may manage accounts. */
export const ADMIN_ROLES: readonly RoleName[] = [];
