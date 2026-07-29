import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { verifyPayload } from "@/lib/qr";

export async function POST(req: NextRequest) {
  const { payload } = await req.json();
  const code = payload ? verifyPayload(payload) : null;

  if (!code) {
    return NextResponse.json({ valid: false, reason: "QR invalide ou falsifié" }, { status: 400 });
  }

  const db = readDB();
  const invitation = db.find((i) => i.code === code);

  if (!invitation) {
    return NextResponse.json({ valid: false, reason: "Introuvable" }, { status: 404 });
  }
  if (invitation.used) {
    return NextResponse.json({ valid: false, reason: "Déjà scanné", invitation }, { status: 409 });
  }

  invitation.used = true;
  invitation.usedAt = new Date().toISOString();
  writeDB(db);

  return NextResponse.json({ valid: true, invitation });
}
