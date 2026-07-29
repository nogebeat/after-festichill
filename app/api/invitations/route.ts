import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { readDB, writeDB } from "@/lib/db";
import { signCode } from "@/lib/qr";
import { sendInvitationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, telephone, email } = await req.json();

    if (!nom || !prenom || !telephone || !email) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const db = readDB();
    const existing = db.find((i) => i.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "Cet email a déjà un pass. Vérifie ta boîte mail." },
        { status: 409 }
      );
    }

    const code = nanoid(10);
    const sig = signCode(code);
    const qrPayload = `${code}.${sig}`;

    const invitation = {
      id: nanoid(),
      nom,
      prenom,
      telephone,
      email,
      code,
      used: false,
      createdAt: new Date().toISOString(),
    };
    db.push(invitation);
    writeDB(db);

    await sendInvitationEmail({ to: email, prenom, qrPayload });

    return NextResponse.json({ success: true, id: invitation.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(readDB());
}
