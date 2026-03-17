function slugify(source) {
  return String(source || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toSlugBase(title, fallback = 'post') {
  const candidate = slugify(title);
  return candidate || fallback;
}

module.exports = {
  slugify,
  toSlugBase
};
