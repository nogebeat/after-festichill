import mysql from "mysql2/promise";

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

type InvitationRow = mysql.RowDataPacket & {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  code: string;
  used: number;
  created_at: Date;
  used_at: Date | null;
};

let pool: mysql.Pool | null = null;

/**
 * Lazily creates a single shared connection pool.
 * Reads connection info from env vars — either DATABASE_URL, or the
 * individual DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME vars.
 */
function getPool(): mysql.Pool {
  if (pool) return pool;

  const {
    DATABASE_URL,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env;

  if (DATABASE_URL) {
    pool = mysql.createPool(DATABASE_URL);
  } else {
    if (!DB_HOST || !DB_USER || !DB_NAME) {
      throw new Error(
        "Missing MySQL env vars. Set DATABASE_URL or DB_HOST/DB_USER/DB_PASSWORD/DB_NAME."
      );
    }
    pool = mysql.createPool({
      host: DB_HOST,
      port: DB_PORT ? Number(DB_PORT) : 3306,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      dateStrings: false,
    });
  }

  return pool;
}

function mapRow(row: InvitationRow): Invitation {
  return {
    id: row.id,
    nom: row.nom,
    prenom: row.prenom,
    telephone: row.telephone,
    email: row.email,
    code: row.code,
    used: !!row.used,
    createdAt: new Date(row.created_at).toISOString(),
    usedAt: row.used_at ? new Date(row.used_at).toISOString() : undefined,
  };
}

export async function getAllInvitations(): Promise<Invitation[]> {
  const [rows] = await getPool().query<InvitationRow[]>(
    "SELECT * FROM invitations ORDER BY created_at DESC"
  );
  return rows.map(mapRow);
}

export async function findInvitationByEmail(
  email: string
): Promise<Invitation | null> {
  const [rows] = await getPool().query<InvitationRow[]>(
    "SELECT * FROM invitations WHERE LOWER(email) = LOWER(?) LIMIT 1",
    [email]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function findInvitationByCode(
  code: string
): Promise<Invitation | null> {
  const [rows] = await getPool().query<InvitationRow[]>(
    "SELECT * FROM invitations WHERE code = ? LIMIT 1",
    [code]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function createInvitation(input: {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  code: string;
}): Promise<Invitation> {
  const now = new Date();
  await getPool().query(
    `INSERT INTO invitations (id, nom, prenom, telephone, email, code, used, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      input.id,
      input.nom,
      input.prenom,
      input.telephone,
      input.email,
      input.code,
      now,
    ]
  );

  return {
    ...input,
    used: false,
    createdAt: now.toISOString(),
  };
}

export async function markInvitationUsed(
  code: string
): Promise<Invitation | null> {
  const invitation = await findInvitationByCode(code);
  if (!invitation) return null;
  if (invitation.used) return invitation;

  const usedAt = new Date();
  await getPool().query(
    "UPDATE invitations SET used = 1, used_at = ? WHERE code = ?",
    [usedAt, code]
  );

  return { ...invitation, used: true, usedAt: usedAt.toISOString() };
}
