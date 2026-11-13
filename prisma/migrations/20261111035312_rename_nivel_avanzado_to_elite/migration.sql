-- Renames the enum VALUE in place (PostgreSQL 10+) so existing `UsuarioDeporte.nivel` rows
-- currently set to AVANZADO automatically read as ELITE afterwards — no data migration needed.
ALTER TYPE "Nivel" RENAME VALUE 'AVANZADO' TO 'ELITE';
