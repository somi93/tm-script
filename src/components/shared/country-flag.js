const normalizeCountry = (country) => String(country || '').trim().toLowerCase();

export const CountryFlag = {
    render(country, cls = '') {
        const code = normalizeCountry(country);
        return code ? `<ib alt="flag of ${code}" class="flag-img-${code}${cls ? ' ' + cls : ''}"></ib>` : '';
    },
};