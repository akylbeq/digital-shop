export function resolvePublicAssetUrl(
  base: string,
  path: string | null | undefined,
): string | null {
  if (!path?.trim()) return null;
  const p = path.trim();
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  if (!base) return null;
  const b = base.replace(/\/$/, '');
  return `${b}${p.startsWith('/') ? p : `/${p}`}`;
}

export function primaryProductImage(product: {
  image: string | null;
  imagesAlbum?: string[] | null;
}): string | null {
  if (product.image) return product.image;
  const album = product.imagesAlbum;
  if (Array.isArray(album) && album.length > 0) return album[0] ?? null;
  return null;
}
