import { NextRequest, NextResponse } from "next/server";
import { findInvitationByCode, markInvitationUsed } from "@/lib/db";
import { verifyPayload } from "@/lib/qr";

export async function POST(req: NextRequest) {
  const { payload } = await req.json();
  const code = payload ? verifyPayload(payload) : null;

  if (!code) {
    return NextResponse.json({ valid: false, reason: "QR invalide ou falsifié" }, { status: 400 });
  }

  const invitation = await findInvitationByCode(code);

  if (!invitation) {
    return NextResponse.json({ valid: false, reason: "Introuvable" }, { status: 404 });
  }
  if (invitation.status === "pending") {
    return NextResponse.json(
      { valid: false, reason: "Demande en attente de validation", invitation },
      { status: 403 }
    );
  }
  if (invitation.status === "rejected") {
    return NextResponse.json(
      { valid: false, reason: "Demande refusée", invitation },
      { status: 403 }
    );
  }
  if (invitation.used) {
    return NextResponse.json({ valid: false, reason: "Déjà scanné", invitation }, { status: 409 });
  }

  const updated = await markInvitationUsed(code);

  return NextResponse.json({ valid: true, invitation: updated });
}
