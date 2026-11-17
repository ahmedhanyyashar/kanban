export { cn } from "cn";

/** "3 hours ago", "in 2 days": the distance from now, in the largest whole unit up to days. */
export function formatRelativeTime(date: string | Date): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffInSeconds = (new Date(date).getTime() - Date.now()) / 1000;

  if (Math.abs(diffInSeconds) < 60)
    return rtf.format(Math.round(diffInSeconds), "second");
  if (Math.abs(diffInSeconds) < 3600)
    return rtf.format(Math.round(diffInSeconds / 60), "minute");
  if (Math.abs(diffInSeconds) < 86400)
    return rtf.format(Math.round(diffInSeconds / 3600), "hour");
  return rtf.format(Math.round(diffInSeconds / 86400), "day");
}
