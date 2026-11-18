/** How long the text the API accepts may be; the API validates with these and the forms use the same. */
export const LIMITS = {
  boardTitle: 120,
  boardDescription: 1000,
  columnTitle: 100,
  taskTitle: 255,
  taskDescription: 5000,
} as const;
