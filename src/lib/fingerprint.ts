/** Anonymous per-browser identity, used only for client-side de-dupe of votes. */
export function getFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  let fp = localStorage.getItem("dc:fp");
  if (!fp) {
    fp = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
    localStorage.setItem("dc:fp", fp);
  }
  return fp;
}

export function hasVoted(caseId: string): "a" | "b" | "both" | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(`dc:vote:${caseId}`);
  return v === "a" || v === "b" || v === "both" ? v : null;
}

export function markVoted(caseId: string, choice: "a" | "b" | "both") {
  if (typeof window === "undefined") return;
  localStorage.setItem(`dc:vote:${caseId}`, choice);
}