import { NextRequest, NextResponse } from "next/server";
import { approveInvitation, findInvitationById } from "@/lib/db";
import { signCode } from "@/lib/qr";
import { sendInvitationEmail } from "@/lib/mail";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const existing = await findInvitationById(id);
  if (!existing) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }
  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: "Cette demande a déjà été traitée", invitation: existing },
      { status: 409 }
    );
  }

  const invitation = await approveInvitation(id);
  if (!invitation) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  // Le QR n'est signé et envoyé qu'à ce moment-là.
  const sig = signCode(invitation.code);
  const qrPayload = `${invitation.code}.${sig}`;

  try {
    await sendInvitationEmail({
      to: invitation.email,
      prenom: invitation.prenom,
      qrPayload,
    });
  } catch (err) {
    console.error("Échec de l'envoi du pass après approbation:", err);
    return NextResponse.json(
      { error: "Demande approuvée mais l'envoi de l'email a échoué", invitation },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true, invitation });
}
