"use client";

import { useEffect, useState, useCallback } from "react";

type Invitation = {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type ActionState = Record<string, "approving" | "rejecting" | undefined>;

export default function AdminPendingList() {
  const [invitations, setInvitations] = useState<Invitation[] | null>(null);
  const [error, setError] = useState("");
  const [actionState, setActionState] = useState<ActionState>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/invitations?status=pending", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInvitations(data);
    } catch {
      setError("Impossible de charger les demandes.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch initial des demandes en attente au montage
    load();
  }, [load]);

  async function handleAction(id: string, action: "approve" | "reject") {
    setActionState((s) => ({ ...s, [id]: action === "approve" ? "approving" : "rejecting" }));
    setError("");

    try {
      const res = await fetch(`/api/invitations/${id}/${action}`, { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Une erreur est survenue.");
        setActionState((s) => ({ ...s, [id]: undefined }));
        return;
      }

      // Retire la demande de la liste une fois traitée.
      setInvitations((prev) => (prev ? prev.filter((inv) => inv.id !== id) : prev));
    } catch {
      setError("Erreur réseau. Réessaie.");
      setActionState((s) => ({ ...s, [id]: undefined }));
    }
  }

  if (invitations === null && !error) {
    return <p className="text-[14px] text-[var(--muted)]">Chargement…</p>;
  }

  if (error && invitations === null) {
    return <p className="text-[14px] text-[#e08a8a]">{error}</p>;
  }

  if (invitations && invitations.length === 0) {
    return (
      <p className="text-[14px] text-[var(--muted)]">
        Aucune demande en attente pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-[13px] text-[#e08a8a]">{error}</p>}

      {invitations?.map((inv) => {
        const pending = actionState[inv.id];
        return (
          <div
            key={inv.id}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <p className="font-display text-[22px] leading-tight text-[var(--ink)]">
                {inv.prenom} {inv.nom}
              </p>
              <p className="text-[13px] text-[var(--muted)] mt-1">{inv.email}</p>
              <p className="text-[13px] text-[var(--muted)]">{inv.telephone}</p>
              <p className="text-[11px] text-[var(--muted)] mt-2 uppercase tracking-wider">
                Reçue le {new Date(inv.createdAt).toLocaleString("fr-FR")}
              </p>
            </div>

            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => handleAction(inv.id, "reject")}
                disabled={!!pending}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold uppercase tracking-wide border border-[#e08a8a]/50 text-[#e08a8a] hover:bg-[#e08a8a]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending === "rejecting" ? "…" : "Refuser"}
              </button>
              <button
                onClick={() => handleAction(inv.id, "approve")}
                disabled={!!pending}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold uppercase tracking-wide bg-[var(--gold)] text-[#0b0b0b] hover:bg-[var(--gold-bright)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending === "approving" ? "…" : "Approuver"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
