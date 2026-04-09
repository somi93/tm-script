const STYLE_ID = 'tmu-stars-style';

const STAR_CSS = `
.tmu-stars{line-height:1}
.tmu-star-full{color:var(--tmu-warning)}
.tmu-star-half{background:linear-gradient(90deg,var(--tmu-warning) 50%,var(--tmu-border-embedded) 50%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.tmu-star-empty{color:var(--tmu-warning)}
.tmu-star-green{color:var(--tmu-success)}
.tmu-star-green-half{background:linear-gradient(90deg,var(--tmu-success) 50%,var(--tmu-border-embedded) 50%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.tmu-star-green-empty{color:var(--tmu-success)}
.tmu-star-split{background:linear-gradient(90deg,var(--tmu-warning) 50%,var(--tmu-success) 50%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
`;

function injectStyles(target = document.head) {
    if (!target) return;
    if (target === document.head) {
        if (document.getElementById(STYLE_ID)) return;
    } else if (target.querySelector && target.querySelector(`#${STYLE_ID}`)) {
        return;
    }
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = STAR_CSS;
    target.appendChild(style);
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const toNumber = (value) => {
    const numeric = parseFloat(value);
    return Number.isFinite(numeric) ? numeric : NaN;
};

function wrapStars(html, cls = '') {
    return `<span class="tmu-stars${cls ? ` ${cls}` : ''}">${html}</span>`;
}

function recommendation(value, cls = '') {
    injectStyles();
    const score = clamp(toNumber(value), 0, 5);
    if (!Number.isFinite(score)) return '';
    const fullStars = Math.floor(score);
    const hasHalfStar = score - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let html = '';
    for (let index = 0; index < fullStars; index += 1) html += '<span class="tmu-star-full">★</span>';
    if (hasHalfStar) html += '<span class="tmu-star-half">★</span>';
    for (let index = 0; index < emptyStars; index += 1) html += '<span class="tmu-star-empty">☆</span>';
    return wrapStars(html, cls);
}

function green(value, cls = '') {
    injectStyles();
    const score = clamp(toNumber(value), 0, 5);
    if (!Number.isFinite(score)) return '';
    const fullStars = Math.floor(score);
    const hasHalfStar = score - fullStars >= 0.25;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    let html = '';
    for (let index = 0; index < fullStars; index += 1) html += '<span class="tmu-star-green">★</span>';
    if (hasHalfStar) html += '<span class="tmu-star-green-half">★</span>';
    for (let index = 0; index < emptyStars; index += 1) html += '<span class="tmu-star-green-empty">☆</span>';
    return wrapStars(html, cls);
}

function combined(current, potential, cls = '') {
    injectStyles();
    const currentValue = clamp(toNumber(current), 0, 5);
    let potentialValue = clamp(toNumber(potential), 0, 5);
    if (!Number.isFinite(currentValue)) return '';
    if (!Number.isFinite(potentialValue) || potentialValue < currentValue) potentialValue = currentValue;
    let html = '';
    for (let index = 1; index <= 5; index += 1) {
        if (index <= currentValue) html += '<span class="tmu-star-full">★</span>';
        else if (index - 0.5 <= currentValue && currentValue < index) html += potentialValue >= index ? '<span class="tmu-star-split">★</span>' : '<span class="tmu-star-half">★</span>';
        else if (index <= potentialValue) html += '<span class="tmu-star-green">★</span>';
        else if (index - 0.5 <= potentialValue && potentialValue < index) html += '<span class="tmu-star-green-half">★</span>';
        else html += '<span class="tmu-star-green-empty">☆</span>';
    }
    return wrapStars(html, cls);
}

injectStyles();

export const TmStars = { injectStyles, recommendation, green, combined };