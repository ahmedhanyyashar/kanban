import { LogOut } from "lucide-react";

import { PageHeader } from "@repo/ui/blocks/page-header";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

import { UserAvatar } from "@/features/users/components/user-avatar";
import { usePageTitle } from "@/hooks/use-page-title";
import { useSignOut } from "@/hooks/use-sign-out";
import { authClient } from "@/lib/auth-client";

export function SettingsPage() {
  usePageTitle("Settings");
  const { data: session } = authClient.useSession();
  const signOut = useSignOut();
  const user = session?.user;

  return (
    <div className="-m-4 flex flex-1 flex-col">
      <PageHeader title="Settings" description="Profile and account" />
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 p-6">
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Profile</h2>
            </CardTitle>
            <CardDescription>
              How you appear across your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {user && (
              <>
                <UserAvatar name={user.name} src={user.image} size="lg" />
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold tracking-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Account</h2>
            </CardTitle>
            <CardDescription>Manage your session.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
