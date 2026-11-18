/** Where each kind of server data lives in the query cache. */
export const boardKeys = {
  all: ["boards"] as const,
  list: () => [...boardKeys.all, "list"] as const,
  detail: (boardId: string) => [...boardKeys.all, "detail", boardId] as const,
  activities: (boardId: string) =>
    [...boardKeys.all, "activities", boardId] as const,
};

export const userKeys = {
  search: (query: string) => ["users", "search", query] as const,
};
