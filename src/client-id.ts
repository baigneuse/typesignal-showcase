/**
 * Source excerpt from the shipped TypeSignal product (including its warning).
 * Generic local recovery helper; not an identity, session or security primitive.
 */
/** Local recovery IDs only. Never use this function for authentication or payments. */
export function createClientId(
  source:
    | Pick<Crypto, "randomUUID" | "getRandomValues">
    | undefined = globalThis.crypto,
): string {
  if (typeof source?.randomUUID === "function") return source.randomUUID();
  if (typeof source?.getRandomValues === "function") {
    const bytes = source.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Explicit non-security fallback for old / non-secure browser contexts.
  return `local-${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2)}`;
}
let sequence = 0;
