import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createInvitation, findInvitationByEmail, getAllInvitations } from "@/lib/db";
import { signCode } from "@/lib/qr";
import { sendInvitationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, telephone, email } = await req.json();

    if (!nom || !prenom || !telephone || !email) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const existing = await findInvitationByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Cet email a déjà un pass. Vérifie ta boîte mail." },
        { status: 409 }
      );
    }

    const code = nanoid(10);
    const sig = signCode(code);
    const qrPayload = `${code}.${sig}`;

    const invitation = await createInvitation({
      id: nanoid(),
      nom,
      prenom,
      telephone,
      email,
      code,
    });

    await sendInvitationEmail({ to: email, prenom, qrPayload });

    return NextResponse.json({ success: true, id: invitation.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const invitations = await getAllInvitations();
  return NextResponse.json(invitations);
}
