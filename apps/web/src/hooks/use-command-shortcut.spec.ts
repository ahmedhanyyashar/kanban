import { fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCommandShortcut } from "./use-command-shortcut";

describe("useCommandShortcut", () => {
  it("fires on Ctrl+K and Cmd+K only, and stops after unmounting", () => {
    const onTrigger = vi.fn();
    const { unmount } = renderHook(() => useCommandShortcut(onTrigger));

    fireEvent.keyDown(document, { key: "k" });
    fireEvent.keyDown(document, { key: "j", ctrlKey: true });
    expect(onTrigger).not.toHaveBeenCalled();

    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    fireEvent.keyDown(document, { key: "K", metaKey: true });
    expect(onTrigger).toHaveBeenCalledTimes(2);

    unmount();
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(onTrigger).toHaveBeenCalledTimes(2);
  });
});
