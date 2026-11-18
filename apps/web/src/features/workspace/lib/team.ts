import type { WorkspaceMember } from "./workspace";

/** The people matching the text in their name or email, ordered by name. */
export function findPeople(
  members: WorkspaceMember[],
  query: string,
): WorkspaceMember[] {
  const needle = query.trim().toLowerCase();
  return members
    .filter(
      (member) =>
        !needle ||
        member.name.toLowerCase().includes(needle) ||
        member.email.toLowerCase().includes(needle),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}
