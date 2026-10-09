-- 006: room for encrypted contact-form messages.
-- name/email/message are now stored AES-256-GCM encrypted ("enc:v1:…"), which is longer than the
-- original text. Widening the columns to text keeps existing rows untouched; input lengths are
-- still limited by the API (name 100, email 254, message 5000 characters).
alter table public.contact_messages
  alter column name type text,
  alter column email type text,
  alter column message type text;
