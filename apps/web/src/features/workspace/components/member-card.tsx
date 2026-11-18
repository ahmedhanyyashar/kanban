import { Crown } from "lucide-react";

import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";

import { UserAvatar } from "@/features/users/components/user-avatar";
import type { WorkspaceMember } from "@/features/workspace/lib/workspace";

type MemberCardProps = {
  member: WorkspaceMember;
  /** The signed-in person, marked "(You)". */
  isYou: boolean;
};

export function MemberCard({ member, isYou }: MemberCardProps) {
  const count = member.boards.length;
  return (
    <Card className="items-center text-center transition-shadow hover:shadow-soft">
      <CardContent className="flex w-full flex-col items-center gap-1">
        <UserAvatar name={member.name} src={member.image} size="lg" />
        <p className="mt-2 font-display text-base font-semibold tracking-tight">
          {member.name}
          {isYou && (
            <span className="ml-1.5 text-xs font-medium text-muted-foreground">
              (You)
            </span>
          )}
        </p>
        <p className="max-w-full truncate text-xs text-muted-foreground">
          {member.email}
        </p>
        <Badge variant="secondary" className="mt-2 capitalize">
          {member.role === "owner" && <Crown />}
          {member.role}
        </Badge>
        <p className="mt-3 w-full border-t pt-3 text-xs text-muted-foreground">
          On {count} {count === 1 ? "board" : "boards"}
        </p>
      </CardContent>
    </Card>
  );
}
