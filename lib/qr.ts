import crypto from "crypto";

export function signCode(code: string) {
  return crypto
    .createHmac("sha256", process.env.QR_SECRET || "dev-secret")
    .update(code)
    .digest("hex")
    .slice(0, 16);
}

export function verifyPayload(payload: string) {
  const [code, sig] = payload.split(".");
  if (!code || !sig) return null;
  if (signCode(code) !== sig) return null;
  return code;
}
