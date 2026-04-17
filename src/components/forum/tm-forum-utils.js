export const esc = (v) => String(v || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
