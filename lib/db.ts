import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "data", "invitations.json");

export type Invitation = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  code: string;
  used: boolean;
  createdAt: string;
  usedAt?: string;
};

export function readDB(): Invitation[] {
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "[]");
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

export function writeDB(data: Invitation[]) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
