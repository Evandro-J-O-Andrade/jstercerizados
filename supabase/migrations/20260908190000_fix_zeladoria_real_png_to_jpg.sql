-- Correção: zeladoria-real.png deletado do working tree.
-- O JPG equivalente (zeladoria.jpg, 1408x768) já está no Git HEAD.
-- Atualiza o card_image_url do serviço para usar o JPG existente.

UPDATE public.services
SET card_image_url = '/images/servicos/zeladoria/zeladoria.jpg'
WHERE slug = 'limpeza-de-manutencao'
  AND coalesce(card_image_url, '') = '/images/servicos/zeladoria/zeladoria-real.png';