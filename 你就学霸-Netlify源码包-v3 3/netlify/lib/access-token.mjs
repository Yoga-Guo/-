function signingSecret() {
  return process.env.ACCESS_SECRET || process.env.INVITE_CODE || "local-xueba-secret";
}

async function importKey(usage) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(signingSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage]
  );
}

export async function signAccessToken({ browserId, codeHash }) {
  const payloadObject = { browserId, codeHash, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  const payload = Buffer.from(JSON.stringify(payloadObject)).toString("base64url");
  const signature = await crypto.subtle.sign("HMAC", await importKey("sign"), new TextEncoder().encode(payload));
  return `${payload}.${Buffer.from(signature).toString("base64url")}`;
}

export async function readAccessClaims(token, browserId) {
  if (!token || !browserId) return null;
  const [payload, suppliedSignature] = token.split(".");
  if (!payload || !suppliedSignature) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (claims.exp < Date.now() || claims.browserId !== browserId) return null;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await importKey("verify"),
      Buffer.from(suppliedSignature, "base64url"),
      new TextEncoder().encode(payload)
    );
    return valid ? claims : null;
  } catch {
    return null;
  }
}

export async function verifyAccessToken(token, browserId) {
  return Boolean(await readAccessClaims(token, browserId));
}
