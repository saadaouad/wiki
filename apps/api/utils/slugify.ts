const MAX_SLUG_LENGTH = 255;

export function slugify(text: string): string {
  let s = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (s.length > MAX_SLUG_LENGTH) {
    s = s.slice(0, MAX_SLUG_LENGTH).replace(/-+$/g, '');
  }
  return s;
}
