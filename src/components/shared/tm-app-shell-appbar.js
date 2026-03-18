export const TmAppShellAppBar = {
    render({ proDays, cash }) {
        return `
            <header id="tmvu-appbar">
                <div class="tmvu-appbar-left">
                    <button class="tmvu-toggle" type="button" aria-label="Toggle navigation">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    <div class="tmvu-metric">
                        <span class="tmvu-metric-label">Pro</span>
                        <strong class="tmvu-metric-value">${proDays || '0'}d</strong>
                    </div>
                </div>
                <div class="tmvu-appbar-right">
                    <div class="tmvu-metric">
                        <span class="tmvu-metric-label">Cash</span>
                        <strong class="tmvu-metric-value">$${cash}</strong>
                    </div>
                </div>
            </header>
        `;
    },
};
