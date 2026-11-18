import { useNavigate } from "react-router";

import { authClient } from "@/lib/auth-client";

/** Ends the session and goes to the sign-in page. */
export function useSignOut() {
  const navigate = useNavigate();
  return () => {
    void authClient.signOut().then(() => navigate("/sign-in"));
  };
}
