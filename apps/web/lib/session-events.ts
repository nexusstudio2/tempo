"use client";

const tabId = typeof window === "undefined" ? "server" : crypto.randomUUID();

export function notifySessionChanged() {
  window.dispatchEvent(new Event("tempo:session-changed"));
  if (typeof BroadcastChannel === "undefined") return;

  const channel = new BroadcastChannel("tempo-session");
  channel.postMessage({ type: "changed", tabId });
  channel.close();
}

export function subscribeToOtherSessionChanges(onChange: () => void) {
  if (typeof BroadcastChannel === "undefined") return () => {};

  const channel = new BroadcastChannel("tempo-session");
  channel.onmessage = (event: MessageEvent<{ type?: string; tabId?: string }>) => {
    if (event.data?.type === "changed" && event.data.tabId !== tabId) onChange();
  };
  return () => channel.close();
}
