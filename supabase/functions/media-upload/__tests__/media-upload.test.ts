import { assertEquals, assertRejects } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

const MAGIC_BYTES = {
  'image/png': [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  'image/jpeg': [
    new Uint8Array([0xff, 0xd8, 0xff, 0xdb]),
    new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
    new Uint8Array([0xff, 0xd8, 0xff, 0xe1]),
  ],
  'image/webp': [new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50])],
};

function validateMagicBytes(header: Uint8Array, declaredMime: string): boolean {
  const expectedSignatures = MAGIC_BYTES[declaredMime];
  if (!expectedSignatures) return false;

  return expectedSignatures.some((sig) =>
    sig.every((byte, i) => header[i] === byte),
  );
}

Deno.test('validateMagicBytes - valid PNG', () => {
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assertEquals(validateMagicBytes(pngHeader, 'image/png'), true);
});

Deno.test('validateMagicBytes - valid JPEG (JFIF)', () => {
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  assertEquals(validateMagicBytes(jpegHeader, 'image/jpeg'), true);
});

Deno.test('validateMagicBytes - valid JPEG (Exif)', () => {
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x10, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00]);
  assertEquals(validateMagicBytes(jpegHeader, 'image/jpeg'), true);
});

Deno.test('validateMagicBytes - valid JPEG (DB)', () => {
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06]);
  assertEquals(validateMagicBytes(jpegHeader, 'image/jpeg'), true);
});

Deno.test('validateMagicBytes - valid WebP', () => {
  const webpHeader = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  assertEquals(validateMagicBytes(webpHeader, 'image/webp'), true);
});

Deno.test('validateMagicBytes - invalid PNG (wrong signature)', () => {
  const invalidHeader = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  assertEquals(validateMagicBytes(invalidHeader, 'image/png'), false);
});

Deno.test('validateMagicBytes - JPEG declared but PNG content', () => {
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  assertEquals(validateMagicBytes(pngHeader, 'image/jpeg'), false);
});

Deno.test('validateMagicBytes - SVG rejected (not in allowed)', () => {
  const svgHeader = new Uint8Array([0x3c, 0x3f, 0x78, 0x6d, 0x6c, 0x20, 0x76, 0x65, 0x72, 0x73, 0x69, 0x6f]);
  assertEquals(validateMagicBytes(svgHeader, 'image/svg+xml'), false);
});

Deno.test('validateMagicBytes - unknown MIME type', () => {
  const anyHeader = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
  assertEquals(validateMagicBytes(anyHeader, 'application/pdf'), false);
});

Deno.test('validateMagicBytes - truncated header', () => {
  const shortHeader = new Uint8Array([0x89, 0x50]);
  assertEquals(validateMagicBytes(shortHeader, 'image/png'), false);
});

const ENTITY_TO_RESOURCE = {
  company: 'companies.media',
  service: 'services.media',
  partner: 'partners.media',
  supplier: 'suppliers.media',
};

Deno.test('ENTITY_TO_RESOURCE mapping', () => {
  assertEquals(ENTITY_TO_RESOURCE.company, 'companies.media');
  assertEquals(ENTITY_TO_RESOURCE.service, 'services.media');
  assertEquals(ENTITY_TO_RESOURCE.partner, 'partners.media');
  assertEquals(ENTITY_TO_RESOURCE.supplier, 'suppliers.media');
  assertEquals(ENTITY_TO_RESOURCE.invalid, undefined);
});

const PRIMARY_PURPOSES = ['logo', 'hero', 'card'];

Deno.test('PRIMARY_PURPOSES', () => {
  assertEquals(PRIMARY_PURPOSES.includes('logo'), true);
  assertEquals(PRIMARY_PURPOSES.includes('hero'), true);
  assertEquals(PRIMARY_PURPOSES.includes('card'), true);
  assertEquals(PRIMARY_PURPOSES.includes('gallery'), false);
  assertEquals(PRIMARY_PURPOSES.includes('avatar'), false);
});

const VALID_PURPOSES = ['logo', 'hero', 'card', 'gallery', 'avatar', 'cover'];

Deno.test('VALID_PURPOSES', () => {
  VALID_PURPOSES.forEach((p) => assertEquals(VALID_PURPOSES.includes(p), true));
  assertEquals(VALID_PURPOSES.includes('invalid'), false);
});

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

Deno.test('ALLOWED_MIME_TYPES', () => {
  ALLOWED_MIME_TYPES.forEach((m) => assertEquals(ALLOWED_MIME_TYPES.includes(m), true));
  assertEquals(ALLOWED_MIME_TYPES.includes('image/svg+xml'), false);
  assertEquals(ALLOWED_MIME_TYPES.includes('image/gif'), false);
  assertEquals(ALLOWED_MIME_TYPES.includes('application/pdf'), false);
});

const MAX_FILE_SIZE = 10 * 1024 * 1024;

Deno.test('MAX_FILE_SIZE is 10MB', () => {
  assertEquals(MAX_FILE_SIZE, 10485760);
});

const MAX_GALLERY_ITEMS = 10;

Deno.test('MAX_GALLERY_ITEMS is 10', () => {
  assertEquals(MAX_GALLERY_ITEMS, 10);
});

Deno.test('Storage path format', () => {
  const entityType = 'company';
  const entityId = '123e4567-e89b-12d3-a456-426614174000';
  const purpose = 'logo';
  const uuid = 'abcdef12-3456-7890-abcd-ef1234567890';
  const fileExt = 'webp';

  const storagePath = `${entityType}/${entityId}/${purpose}/${uuid}.${fileExt}`;
  assertEquals(storagePath, 'company/123e4567-e89b-12d3-a456-426614174000/logo/abcdef12-3456-7890-abcd-ef1234567890.webp');
});

Deno.test('Storage path format for gallery', () => {
  const entityType = 'service';
  const entityId = '123e4567-e89b-12d3-a456-426614174000';
  const purpose = 'gallery';
  const uuid = 'abcdef12-3456-7890-abcd-ef1234567890';
  const fileExt = 'png';

  const storagePath = `${entityType}/${entityId}/${purpose}/${uuid}.${fileExt}`;
  assertEquals(storagePath, 'service/123e4567-e89b-12d3-a456-426614174000/gallery/abcdef12-3456-7890-abcd-ef1234567890.png');
});

Deno.test('Storage path format for partner', () => {
  const entityType = 'partner';
  const entityId = '123e4567-e89b-12d3-a456-426614174000';
  const purpose = 'logo';
  const uuid = 'abcdef12-3456-7890-abcd-ef1234567890';
  const fileExt = 'jpeg';

  const storagePath = `${entityType}/${entityId}/${purpose}/${uuid}.${fileExt}`;
  assertEquals(storagePath, 'partner/123e4567-e89b-12d3-a456-426614174000/logo/abcdef12-3456-7890-abcd-ef1234567890.jpeg');
});