import assert from "node:assert/strict";
import test from "node:test";
// @ts-expect-error Node's built-in TypeScript runner requires the source extension.
import { MAX_IMAGE_BYTES, isImageDataUrl, parseImageDataUrl } from "./upload-validation.ts";

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16, 0x4a, 0x46, 0x49, 0x46]);
const dataUrl = (mime: string, buf: Buffer) => `data:${mime};base64,${buf.toString("base64")}`;

test("recognises base64 image data URLs only", () => {
  assert.equal(isImageDataUrl(dataUrl("image/jpeg", JPEG)), true);
  assert.equal(isImageDataUrl("  DATA:image/png;base64,AAAA"), true);
  assert.equal(isImageDataUrl("https://example.com/a.jpg"), false);
  assert.equal(isImageDataUrl("data:text/html;base64,PGgxPg=="), false);
  assert.equal(isImageDataUrl("data:image/svg+xml,<svg/>"), false);
  assert.equal(isImageDataUrl(undefined), false);
});

test("decodes a real image and takes the type from the bytes", () => {
  const jpeg = parseImageDataUrl(dataUrl("image/jpeg", JPEG));
  assert.ok(jpeg);
  assert.equal(jpeg.type.mime, "image/jpeg");
  assert.equal(jpeg.type.ext, "jpg");
  assert.deepEqual(jpeg.buffer, JPEG);

  // Declared MIME is ignored: PNG bytes labelled as JPEG are stored as PNG
  const png = parseImageDataUrl(dataUrl("image/jpeg", PNG));
  assert.equal(png?.type.mime, "image/png");

  // Line breaks inside the base64 payload are tolerated
  const wrapped = `data:image/png;base64,${PNG.toString("base64").replace(/(.{8})/g, "$1\n")}`;
  assert.equal(parseImageDataUrl(wrapped)?.type.ext, "png");
});

test("rejects non-images, broken base64 and oversized payloads", () => {
  assert.equal(parseImageDataUrl(dataUrl("image/png", Buffer.from("%PDF-1.7 not an image"))), null);
  assert.equal(parseImageDataUrl("data:image/png;base64,***"), null);
  assert.equal(parseImageDataUrl("data:image/png;base64,"), null);
  const huge = Buffer.concat([JPEG, Buffer.alloc(MAX_IMAGE_BYTES)]);
  assert.equal(parseImageDataUrl(dataUrl("image/jpeg", huge)), null);
});
