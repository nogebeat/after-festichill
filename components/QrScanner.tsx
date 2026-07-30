"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Invitation = {
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

type ScanResult = {
  status: "valid" | "already-used" | "invalid" | "not-found";
  message: string;
  invitation?: Invitation;
};

type HistoryEntry = ScanResult & { at: number; rawCode: string };

const RESULT_STYLES: Record<
  ScanResult["status"],
  { border: string; bg: string; icon: string; label: string }
> = {
  valid: {
    border: "border-[var(--gold)]",
    bg: "bg-[rgba(201,169,97,0.14)]",
    icon: "✓",
    label: "Accès autorisé",
  },
  "already-used": {
    border: "border-[#e0b25a]",
    bg: "bg-[rgba(224,178,90,0.14)]",
    icon: "⟲",
    label: "Déjà scanné",
  },
  invalid: {
    border: "border-[#e08a8a]",
    bg: "bg-[rgba(224,138,138,0.14)]",
    icon: "✕",
    label: "QR invalide",
  },
  "not-found": {
    border: "border-[#e08a8a]",
    bg: "bg-[rgba(224,138,138,0.14)]",
    icon: "✕",
    label: "Introuvable",
  },
};

export default function QrScanner() {
  const readerRegionId = "qr-reader-region";
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const busyRef = useRef(false); // prevents double-fire while a scan is being processed
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const validateCode = useCallback(async (payload: string) => {
    setChecking(true);
    let res: ScanResult;
    try {
      const r = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload }),
      });
      const json = await r.json();

      if (r.ok && json.valid) {
        res = { status: "valid", message: "Entrée validée.", invitation: json.invitation };
      } else if (r.status === 409) {
        res = {
          status: "already-used",
          message: json.invitation?.usedAt
            ? `Déjà scanné le ${new Date(json.invitation.usedAt).toLocaleString("fr-FR")}`
            : "Ce pass a déjà été utilisé.",
          invitation: json.invitation,
        };
      } else if (r.status === 404) {
        res = { status: "not-found", message: "Aucune invitation ne correspond à ce code." };
      } else {
        res = { status: "invalid", message: json.reason || "QR invalide ou falsifié." };
      }
    } catch {
      res = { status: "invalid", message: "Erreur réseau. Réessaie." };
    }

    setResult(res);
    setHistory((h) => [{ ...res, at: Date.now(), rawCode: payload }, ...h].slice(0, 20));
    setChecking(false);
    return res;
  }, []);

  const onDecoded = useCallback(
    async (decodedText: string) => {
      if (busyRef.current) return;
      busyRef.current = true;

      // brief pause so we don't re-fire on the same frame
      try {
        await scannerRef.current?.pause(true);
      } catch {
        // ignore if already paused/stopped
      }

      await validateCode(decodedText);

      // auto-resume scanning after a short delay so the agent can read the result
      resumeTimeoutRef.current = setTimeout(() => {
        try {
          scannerRef.current?.resume();
        } catch {
          // ignore
        }
        busyRef.current = false;
      }, 1800);
    },
    [validateCode]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode(readerRegionId, { verbose: false });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => onDecoded(decodedText),
        () => {
          // decode errors fire continuously while no QR is in frame — ignore
        }
      );
      setCameraOn(true);
    } catch (err) {
      console.error(err);
      setCameraError(
        "Impossible d'accéder à la caméra. Vérifie les permissions ou utilise la saisie manuelle ci-dessous."
      );
      setCameraOn(false);
    }
  }, [onDecoded]);

  const stopCamera = useCallback(async () => {
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch {
      // ignore
    }
    scannerRef.current = null;
    busyRef.current = false;
    setCameraOn(false);
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = manualCode.trim();
    if (!code) return;
    await validateCode(code);
    setManualCode("");
  }

  const style = result ? RESULT_STYLES[result.status] : null;

  return (
    <div className="w-full max-w-[440px] mx-auto flex flex-col gap-4">
      {/* Camera panel */}
      <div className="ticket-card relative rounded-[20px] border border-[var(--border)] overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <p className="font-display text-[13px] tracking-[0.35em] text-[var(--gold)] mb-1">
            Contrôle d&apos;accès
          </p>
          <h2 className="font-display text-[28px] leading-[0.95] text-[var(--ink)]">
            Scanner un pass
          </h2>
        </div>

        <div className="px-6 pb-6">
          <div
            id={readerRegionId}
            className="w-full rounded-xl overflow-hidden bg-black/40 border border-[var(--border)]"
            style={{ minHeight: cameraOn ? undefined : 200 }}
          />

          {cameraError && (
            <p className="text-[13px] text-[#e08a8a] mt-3">{cameraError}</p>
          )}

          <div className="mt-4 flex gap-3">
            {!cameraOn ? (
              <button
                onClick={startCamera}
                className="flex-1 py-3 rounded-xl font-display text-[15px] tracking-[0.1em] uppercase bg-[var(--gold)] text-[#0b0b0b] hover:bg-[var(--gold-bright)] active:scale-[0.98] transition-all"
              >
                Activer la caméra
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="flex-1 py-3 rounded-xl font-display text-[15px] tracking-[0.1em] uppercase border border-[var(--border)] text-[var(--ink)] hover:border-[var(--gold)] active:scale-[0.98] transition-all"
              >
                Arrêter la caméra
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Result panel */}
      {result && style && (
        <div className={`rounded-[20px] border-2 ${style.border} ${style.bg} px-6 py-5 rise`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-display text-2xl">{style.icon}</span>
            <p className="font-display text-[20px] tracking-wide text-[var(--ink)]">
              {style.label}
            </p>
          </div>
          <p className="text-[13px] text-[var(--muted)] mb-2">{result.message}</p>
          {result.invitation && (
            <p className="text-[14px] text-[var(--ink)]">
              {result.invitation.prenom} {result.invitation.nom}
              <span className="text-[var(--muted)]"> · {result.invitation.telephone}</span>
            </p>
          )}
        </div>
      )}

      {/* Manual fallback */}
      <div className="ticket-card rounded-[20px] border border-[var(--border)] px-6 py-5">
        <p className="font-display text-[13px] tracking-[0.3em] text-[var(--gold)] mb-3">
          Saisie manuelle
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Code du pass (ex: abc123.def456)"
            className="flex-1 bg-black/30 border border-[var(--border)] rounded-lg px-4 py-2.5 text-[14px] text-[var(--ink)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--gold)]"
          />
          <button
            type="submit"
            disabled={checking || !manualCode.trim()}
            className="px-5 py-2.5 rounded-lg font-display text-[13px] tracking-[0.1em] uppercase bg-[var(--gold)] text-[#0b0b0b] hover:bg-[var(--gold-bright)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Vérifier
          </button>
        </form>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-[20px] border border-[var(--border)] px-6 py-5">
          <p className="font-display text-[13px] tracking-[0.3em] text-[var(--gold)] mb-3">
            Derniers scans
          </p>
          <ul className="flex flex-col gap-2 max-h-[240px] overflow-y-auto">
            {history.map((h, i) => {
              const s = RESULT_STYLES[h.status];
              return (
                <li
                  key={`${h.at}-${i}`}
                  className="flex items-center justify-between text-[13px] border-b border-[var(--border)] pb-2 last:border-0"
                >
                  <span className="text-[var(--ink)]">
                    {h.invitation
                      ? `${h.invitation.prenom} ${h.invitation.nom}`
                      : h.rawCode.slice(0, 18)}
                  </span>
                  <span className={s.border.replace("border-", "text-")}>{s.icon} {s.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
