import type { components } from "@repo/api-client";

/** What the summary route answers for a board: the generated type, not a copy of it. */
export type BoardSummary =
  components["schemas"]["SummaryResponseDto"]["data"]["summary"];
