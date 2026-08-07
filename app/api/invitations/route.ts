import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import {
  createInvitation,
  findInvitationByEmail,
  getAllInvitations,
  getInvitationsByStatus,
  InvitationStatus,
} from "@/lib/db";
import { sendAdminNewRequestEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, telephone, email } = await req.json();

    if (!nom || !prenom || !telephone || !email) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const existing = await findInvitationByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "Cet email a déjà une demande en cours ou un pass. Vérifie ta boîte mail." },
        { status: 409 }
      );
    }

    // Le code QR est généré tout de suite (pour être stable) mais n'est
    // signé et envoyé qu'une fois la demande approuvée par l'admin.
    const code = nanoid(10);

    const invitation = await createInvitation({
      id: nanoid(),
      nom,
      prenom,
      telephone,
      email,
      code,
    });

    // Notifie l'admin qu'une demande attend une validation.
    await sendAdminNewRequestEmail({ nom, prenom, email, telephone });

    return NextResponse.json({ success: true, id: invitation.id, status: "pending" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") as InvitationStatus | null;

  const invitations =
    status && ["pending", "approved", "rejected"].includes(status)
      ? await getInvitationsByStatus(status)
      : await getAllInvitations();

  return NextResponse.json(invitations);
}
