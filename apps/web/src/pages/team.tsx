import { Users } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@repo/ui/blocks/empty-state";
import { PageHeader } from "@repo/ui/blocks/page-header";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Skeleton } from "@repo/ui/components/skeleton";

import { MemberCard } from "@/features/workspace/components/member-card";
import { useWorkspace } from "@/features/workspace/hooks/use-workspace";
import { findPeople } from "@/features/workspace/lib/team";
import { usePageTitle } from "@/hooks/use-page-title";
import { authClient } from "@/lib/auth-client";

export function TeamPage() {
  usePageTitle("Team");
  const { data: session } = authClient.useSession();
  const { members, isPending } = useWorkspace();
  const [query, setQuery] = useState("");
  const people = findPeople(members, query);
  const owners = members.filter((member) => member.role === "owner").length;

  return (
    <div className="-m-4 flex flex-1 flex-col">
      <PageHeader title="Team" description="People across your boards" />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground tabular-nums">
            {members.length} {members.length === 1 ? "person" : "people"}
            {owners > 0 && `, ${owners} ${owners === 1 ? "owner" : "owners"}`}
          </p>
          <div className="ml-auto">
            <Label htmlFor="people-search" className="sr-only">
              Search people
            </Label>
            <Input
              id="people-search"
              type="search"
              placeholder="Search people"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-56"
            />
          </div>
        </div>

        {isPending ? (
          <div
            role="status"
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <span className="sr-only">Loading people</span>
            {Array.from({ length: 8 }, (_, index) => (
              <Skeleton key={index} className="h-44" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No teammates yet"
            description="Invite people to a board and they’ll appear here."
          />
        ) : people.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No one matches “{query.trim()}”.
          </p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {people.map((member) => (
              <li key={member.id}>
                <MemberCard
                  member={member}
                  isYou={member.id === session?.user.id}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
