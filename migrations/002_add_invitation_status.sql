-- Ajoute le workflow de validation des invitations : une demande est créée
-- en statut "pending", un admin la valide ou la refuse depuis /admin.
-- Le QR code n'est généré et envoyé qu'après validation.

ALTER TABLE invitations
  ADD COLUMN status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' AFTER code,
  ADD COLUMN approved_at DATETIME NULL AFTER used_at,
  ADD COLUMN rejected_at DATETIME NULL AFTER approved_at;

-- Les invitations déjà existantes (créées avant ce workflow) sont considérées
-- comme déjà validées pour ne pas casser les pass déjà envoyés.
UPDATE invitations SET status = 'approved', approved_at = created_at WHERE status = 'pending';

CREATE INDEX idx_invitations_status ON invitations (status);
