import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";
import { CODE_HASHES } from "../lib/redeem-codes.mjs";
import { signAccessToken } from "../lib/access-token.mjs";

const localRedemptions = globalThis.__xuebaLocalRedemptions || new Map();
globalThis.__xuebaLocalRedemptions = localRedemptions;

function hashCode(code) {
  return createHash("sha256").update(code).digest("hex");
}

async function readRedemption(key) {
  if (process.env.LOCAL_REDEMPTION_STORE === "true") return localRedemptions.get(key) || null;
  const store = getStore({ name: "xueba-redemptions", consistency: "strong" });
  return store.get(key, { type: "json" });
}

async function writeRedemption(key, record) {
  if (process.env.LOCAL_REDEMPTION_STORE === "true") {
    localRedemptions.set(key, record);
    return;
  }
  const store = getStore({ name: "xueba-redemptions", consistency: "strong" });
  await store.setJSON(key, record);
}

export default async (request) => {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });

  try {
    const { code = "", browserId = "" } = await request.json();
    const normalizedCode = String(code).trim().toUpperCase();
    const normalizedBrowserId = String(browserId).trim();
    if (!/^[A-Za-z0-9_-]{16,100}$/.test(normalizedBrowserId)) {
      return Response.json({ valid: false, reason: "INVALID_BROWSER" }, { status: 400 });
    }

    const codeHash = hashCode(normalizedCode);
    const localDemoCode = process.env.LOCAL_REDEMPTION_STORE === "true" && normalizedCode === (process.env.INVITE_CODE || "XUEBA2026");
    if (!CODE_HASHES.has(codeHash) && !localDemoCode) return Response.json({ valid: false, reason: "INVALID_CODE" });

    const storageKey = `code-${codeHash}`;
    const existing = await readRedemption(storageKey);
    if (existing && existing.browserId !== normalizedBrowserId) {
      return Response.json({ valid: false, reason: "CODE_ALREADY_USED" }, { status: 409 });
    }

    if (!existing) {
      await writeRedemption(storageKey, { browserId: normalizedBrowserId, redeemedAt: new Date().toISOString() });
      const confirmed = await readRedemption(storageKey);
      if (!confirmed || confirmed.browserId !== normalizedBrowserId) {
        return Response.json({ valid: false, reason: "CODE_ALREADY_USED" }, { status: 409 });
      }
    }

    const token = await signAccessToken({ browserId: normalizedBrowserId, codeHash });
    return Response.json({ valid: true, token });
  } catch {
    return Response.json({ valid: false, reason: "SERVICE_UNAVAILABLE" }, { status: 503 });
  }
};
