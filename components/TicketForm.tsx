"use client";

import { useState, FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function TicketForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(json.error || "Une erreur est survenue.");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMsg("Erreur réseau. Réessaie.");
    }
  }

  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* Ticket card */}
      <div className="relative bg-[var(--card)] rounded-[20px] border border-[#2a2620] shadow-[0_0_60px_-15px_rgba(201,169,97,0.25)] overflow-hidden">
        {/* Stub header */}
        <div className="px-8 pt-8 pb-6 relative">
          <p className="font-display text-[13px] tracking-[0.35em] text-[var(--gold)] uppercase mb-1">
            Pass nominatif
          </p>
          <h2 className="font-display text-[38px] leading-[0.9] text-[var(--ink)]">
            Réserve ta place
          </h2>
          <p className="text-[13px] text-[var(--muted)] mt-2">
            Un pass QR unique t&apos;attend dans ta boîte mail.
          </p>
        </div>

        {/* Perforated divider */}
        <div className="relative h-0 border-t-2 border-dashed border-[#2f2b24] mx-0">
          <span className="ticket-notch -left-[14px] top-1/2 -translate-y-1/2" style={{ left: "-14px" }} />
          <span className="ticket-notch" style={{ right: "-14px", left: "auto", top: "-14px", transform: "translateY(-50%)" }} />
        </div>

        {/* Form / success state */}
        <div className="px-8 py-7">
          {status === "success" ? (
            <div className="rise text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[var(--gold)] mb-4 rotate-[-6deg]">
                <span className="font-display text-2xl text-[var(--gold)]">✓</span>
              </div>
              <p className="font-display text-2xl tracking-wide text-[var(--gold-bright)] mb-1">
                Pass confirmé
              </p>
              <p className="text-[13px] text-[var(--muted)]">
                Check ta boîte mail (et les spams) pour ton QR code.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field name="prenom" placeholder="Prénom" />
                <Field name="nom" placeholder="Nom" />
              </div>
              <Field name="telephone" placeholder="Téléphone" type="tel" />
              <Field name="email" placeholder="Email" type="email" />

              {status === "error" && (
                <p className="text-[13px] text-[#e08a8a] -mt-1">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 w-full py-3.5 rounded-xl font-display text-[18px] tracking-[0.1em] uppercase bg-[var(--gold)] text-[#0b0b0b] transition-all hover:bg-[var(--gold-bright)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "loading" ? "Envoi…" : "Obtenir mon pass"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  name,
  placeholder,
  type = "text",
}: {
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <input
      required
      name={name}
      type={type}
      placeholder={placeholder}
      className="w-full bg-[#0f0d0b] border border-[#2a2620] rounded-lg px-4 py-3 text-[14px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--gold)] transition-colors"
    />
  );
}
