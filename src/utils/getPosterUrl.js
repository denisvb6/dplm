// Converts legacy image paths saved in MongoDB into stable public URLs.
// Vite serves files from public/ at the site root in both dev and production.
export function getPosterUrl(poster) {
    if (typeof poster !== 'string' || !poster.trim()) return '';

    const value = poster.trim();
    if (/^https?:\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {
        return value;
    }

    return value
        .replace(/^\/?src\/assets\//, '/images/')
        .replace(/^\/?public\//, '/');
}
