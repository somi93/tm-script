const valueStyleAttr = (color) => (color ? ` style="color:${color}"` : '');

export const TmMatchAnalysisProfile = {
    card({ icon, label, homeValue, awayValue, homeColor = '', awayColor = '' }) {
        return `<div class="rnd-an-profile-card"><span class="rnd-an-profile-icon">${icon}</span><div class="rnd-an-profile-info"><div class="rnd-an-profile-label">${label}</div><div class="rnd-an-profile-vals"><span class="rnd-an-profile-val home"${valueStyleAttr(homeColor)}>${homeValue}</span><span class="rnd-an-profile-vs">vs</span><span class="rnd-an-profile-val away"${valueStyleAttr(awayColor)}>${awayValue}</span></div></div></div>`;
    },
};