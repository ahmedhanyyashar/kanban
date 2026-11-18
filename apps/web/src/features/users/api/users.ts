import { api, unwrap } from "@/lib/api-client";

export const searchUsers = (q: string) =>
  unwrap(api.GET("/users/search", { params: { query: { q } } })).then(
    (data) => data.users,
  );
