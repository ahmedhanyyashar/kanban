import { useEffect } from "react";

/** Names the page in the browser tab, the history and the window list; a single-page app keeps one title unless told. */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Flowboard`;
  }, [title]);
}
