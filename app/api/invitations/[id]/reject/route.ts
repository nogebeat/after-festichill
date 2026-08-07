import { NextRequest, NextResponse } from "next/server";
import { findInvitationById, rejectInvitation } from "@/lib/db";
import { sendRejectionEmail } from "@/lib/mail";

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

  const invitation = await rejectInvitation(id);
  if (!invitation) {
    return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
  }

  try {
    await sendRejectionEmail({ to: invitation.email, prenom: invitation.prenom });
  } catch (err) {
    console.error("Échec de l'envoi de l'email de refus:", err);
    // On ne bloque pas le refus côté admin même si l'email échoue.
  }

  return NextResponse.json({ success: true, invitation });
}
