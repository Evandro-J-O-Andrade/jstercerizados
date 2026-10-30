-- P0-A.1 — Media Assets: adicionar coluna file_hash para verificação de integridade
-- Data: 2026-10-26
-- Escopo: Adiciona coluna opcional file_hash (SHA-256) à tabela media_assets
-- para permitir verificação de integridade de arquivos após upload.
-- Aditivo: não altera dados existentes, não quebra consultas atuais.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'media_assets'
      AND column_name = 'file_hash'
  ) THEN
    ALTER TABLE public.media_assets
      ADD COLUMN file_hash TEXT;
  END IF;
END $$;

COMMENT ON COLUMN public.media_assets.file_hash IS 'Hash SHA-256 do arquivo para verificação de integridade pós-upload';
