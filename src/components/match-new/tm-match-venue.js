/**
 * tm-match-venue.js — Venue tab for new match player.
 * Uses normalized match data (match.venue, match.attendance, match.competition).
 */

const VENUE_STYLE_ID = 'mp-venue-style';
const ensureVenueStyles = () => {
    if (document.getElementById(VENUE_STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = VENUE_STYLE_ID;
    s.textContent = `
        .rnd-venue-wrap { max-width: 900px; margin: 0 auto; padding: 8px 0 16px; }
        .rnd-venue-hero {
            position: relative; border-radius: 8px; overflow: hidden;
            background: linear-gradient(135deg, var(--tmu-surface-panel) 0%, var(--tmu-accent-fill) 40%, var(--tmu-success-fill) 100%);
            margin-bottom: 16px; padding: 24px;
            box-shadow: 0 6px 24px var(--tmu-surface-overlay);
        }
        .rnd-venue-hero::before {
            content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
            background: repeating-linear-gradient(90deg, transparent, transparent 48%, var(--tmu-border-contrast) 48%, var(--tmu-border-contrast) 52%);
            pointer-events: none;
        }
        .rnd-venue-stadium-svg { display: block; margin: 0 auto 16px; opacity: 0.55; }
        .rnd-venue-name {
            text-align: center; font-size: var(--tmu-font-xl); font-weight: 800; color: var(--tmu-text-strong);
            letter-spacing: 0.5px; margin-bottom: 4px; text-shadow: 0 2px 8px var(--tmu-surface-overlay);
        }
        .rnd-venue-city {
            text-align: center; font-size: var(--tmu-font-sm); color: var(--tmu-text-panel-label); margin-bottom: 12px;
            letter-spacing: 1px; text-transform: uppercase;
        }
        .rnd-venue-tournament { text-align: center; margin-bottom: 0; }
        .rnd-venue-tournament span {
            display: inline-block; background: var(--tmu-success-fill); padding: 3px 12px;
            border-radius: 99px; font-size: var(--tmu-font-xs); color: var(--tmu-text-main); letter-spacing: 0.5px;
        }
        .rnd-venue-cards {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;
        }
        .rnd-venue-card {
            background: linear-gradient(145deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
            border-radius: 8px; padding: 14px; text-align: center; position: relative; overflow: hidden;
        }
        .rnd-venue-card::after {
            content: ''; position: absolute; top: -20px; right: -20px;
            width: 60px; height: 60px; border-radius: 50%; background: var(--tmu-success-fill-faint);
        }
        .rnd-venue-card-icon { font-size: var(--tmu-font-2xl); margin-bottom: 6px; }
        .rnd-venue-card-value { font-size: var(--tmu-font-xl); font-weight: 800; color: var(--tmu-text-strong); margin-bottom: 0; }
        .rnd-venue-card-label { font-size: var(--tmu-font-xs); color: var(--tmu-text-panel-label); text-transform: uppercase; letter-spacing: 0.5px; }
        .rnd-venue-gauge-wrap {
            background: linear-gradient(145deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
            border-radius: 8px; padding: 16px; margin-bottom: 14px;
        }
        .rnd-venue-gauge-header {
            display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
        }
        .rnd-venue-gauge-title { font-size: var(--tmu-font-sm); color: var(--tmu-text-panel-label); text-transform: uppercase; letter-spacing: 0.5px; }
        .rnd-venue-gauge-value { font-size: var(--tmu-font-md); font-weight: 700; color: var(--tmu-text-strong); }
        .rnd-venue-gauge-bar {
            height: 10px; background: var(--tmu-surface-panel); border-radius: 4px; overflow: hidden;
        }
        .rnd-venue-gauge-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
        .rnd-venue-gauge-fill.attendance {
            background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end), var(--tmu-text-live));
        }
        .rnd-venue-weather {
            background: linear-gradient(145deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
            border-radius: 8px; padding: 16px; margin-bottom: 14px;
            display: flex; align-items: center; gap: 16px;
        }
        .rnd-venue-weather-icon { font-size: 48px; line-height: 1; }
        .rnd-venue-weather-info { flex: 1; }
        .rnd-venue-weather-text { font-size: var(--tmu-font-lg); font-weight: 700; color: var(--tmu-text-strong); margin-bottom: 0; }
        .rnd-venue-weather-sub { font-size: var(--tmu-font-sm); color: var(--tmu-text-panel-label); }
        .rnd-venue-facilities {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px;
        }
        .rnd-venue-facility {
            background: linear-gradient(145deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
            border-radius: 8px; padding: 10px 8px; text-align: center; transition: background 0.2s;
        }
        .rnd-venue-facility.active { background: linear-gradient(145deg, var(--tmu-accent-fill), var(--tmu-success-fill)); }
        .rnd-venue-facility-icon { font-size: var(--tmu-font-xl); margin-bottom: 4px; }
        .rnd-venue-facility-label { font-size: var(--tmu-font-xs); color: var(--tmu-text-panel-label); text-transform: uppercase; letter-spacing: 0.3px; }
        .rnd-venue-facility .rnd-venue-facility-status {
            font-size: var(--tmu-font-xs); margin-top: 4px; color: var(--tmu-text-faint); font-weight: 600;
        }
        .rnd-venue-facility.active .rnd-venue-facility-status { color: var(--tmu-accent); }
    `;
    document.head.appendChild(s);
};

export const TmMatchVenueNew = {
    create(match) {
        ensureVenueStyles();

        const venue = match.venue || {};
        const fac = venue.facilities || {};

        const weatherBase = (venue.weather || '').replace(/\d+/g, '');
        const weatherMap = {
            sunny:    { icon: '☀️', text: 'Sunny',    desc: 'Clear skies'     },
            cloudy:   { icon: '⛅', text: 'Cloudy',   desc: 'Partly cloudy'   },
            rainy:    { icon: '🌧️', text: 'Rain',     desc: 'Wet conditions'  },
            snow:     { icon: '❄️', text: 'Snow',     desc: 'Snowy pitch'     },
            overcast: { icon: '☁️', text: 'Overcast', desc: 'Heavy clouds'    },
        };
        const w = weatherMap[weatherBase] || {
            icon: '🌤️',
            text: weatherBase ? weatherBase.charAt(0).toUpperCase() + weatherBase.slice(1) : '—',
            desc: '',
        };

        const capacity   = venue.capacity || 0;
        const attendance = match.attendance || 0;
        const attPct     = capacity ? Math.round(attendance / capacity * 100) : 0;
        const pitchPct   = venue.pitchCondition || 0;

        const stadiumSvg = `<svg class="rnd-venue-stadium-svg" width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="110" cy="65" rx="100" ry="12" fill="var(--tmu-success-fill)" stroke="var(--tmu-accent-fill)" stroke-width="1"/>
            <path d="M25 65 L25 30 Q25 22 33 20 L55 16 Q60 15 60 20 L60 65" fill="var(--tmu-surface-panel)" stroke="var(--tmu-accent-fill)" stroke-width="0.8"/>
            <path d="M60 65 L60 22 Q60 14 68 12 L102 6 Q110 5 110 12 L110 65" fill="var(--tmu-surface-card-soft)" stroke="var(--tmu-accent-fill)" stroke-width="0.8"/>
            <path d="M110 65 L110 12 Q110 5 118 6 L152 12 Q160 14 160 22 L160 65" fill="var(--tmu-surface-card-soft)" stroke="var(--tmu-accent-fill)" stroke-width="0.8"/>
            <path d="M160 65 L160 20 Q160 15 165 16 L187 20 Q195 22 195 30 L195 65" fill="var(--tmu-surface-panel)" stroke="var(--tmu-accent-fill)" stroke-width="0.8"/>
            <rect x="70" y="50" width="80" height="15" rx="2" fill="var(--tmu-accent-fill)" stroke="var(--tmu-accent-fill)" stroke-width="0.6"/>
            <line x1="110" y1="50" x2="110" y2="65" stroke="var(--tmu-accent-fill)" stroke-width="0.4"/>
            <circle cx="110" cy="57" r="4" stroke="var(--tmu-accent-fill)" stroke-width="0.4" fill="none"/>
            <rect x="72" y="53" width="12" height="9" rx="1" fill="none" stroke="var(--tmu-accent-fill)" stroke-width="0.4"/>
            <rect x="136" y="53" width="12" height="9" rx="1" fill="none" stroke="var(--tmu-accent-fill)" stroke-width="0.4"/>
            ${[35, 50, 65, 80, 140, 155, 170, 185].map(x => `<rect x="${x - 1}" y="28" width="2" height="4" rx="0.5" fill="var(--tmu-success)" opacity="0.5"/>`).join('')}
        </svg>`;

        const facilities = [
            { key: 'sprinklers', icon: '💧', label: 'Sprinklers' },
            { key: 'draining',   icon: '🚰', label: 'Draining'   },
            { key: 'pitchcover', icon: '🛡️', label: 'Pitch Cover' },
            { key: 'heating',    icon: '🔥', label: 'Heating'    },
        ];

        const pitchColor = pitchPct >= 80 ? 'var(--tmu-success)' : pitchPct >= 50 ? 'var(--tmu-warning-soft)' : 'var(--tmu-danger-strong)';

        const el = document.createElement('div');
        el.className = 'rnd-venue-wrap';
        el.innerHTML = `
            <div class="rnd-venue-hero">
                ${stadiumSvg}
                <div class="rnd-venue-name">${venue.name || '—'}</div>
                <div class="rnd-venue-city">📍 ${venue.city || '—'}</div>
                ${match.competition?.name ? `<div class="rnd-venue-tournament"><span>🏆 ${match.competition.name}</span></div>` : ''}
            </div>

            <div class="rnd-venue-cards">
                <div class="rnd-venue-card">
                    <div class="rnd-venue-card-icon">🏟️</div>
                    <div class="rnd-venue-card-value">${capacity ? capacity.toLocaleString() : '—'}</div>
                    <div class="rnd-venue-card-label">Capacity</div>
                </div>
                <div class="rnd-venue-card">
                    <div class="rnd-venue-card-icon">👥</div>
                    <div class="rnd-venue-card-value">${attendance ? attendance.toLocaleString() : '—'}</div>
                    <div class="rnd-venue-card-label">Attendance</div>
                </div>
            </div>

            ${attendance && capacity ? `
            <div class="rnd-venue-gauge-wrap">
                <div class="rnd-venue-gauge-header">
                    <span class="rnd-venue-gauge-title">Stadium Fill</span>
                    <span class="rnd-venue-gauge-value">${attPct}%</span>
                </div>
                <div class="rnd-venue-gauge-bar"><div class="rnd-venue-gauge-fill attendance" style="width:${attPct}%"></div></div>
            </div>` : ''}

            <div class="rnd-venue-weather">
                <div class="rnd-venue-weather-icon">${w.icon}</div>
                <div class="rnd-venue-weather-info">
                    <div class="rnd-venue-weather-text">${w.text}</div>
                    <div class="rnd-venue-weather-sub">${w.desc}</div>
                </div>
            </div>

            <div class="rnd-venue-gauge-wrap">
                <div class="rnd-venue-gauge-header">
                    <span class="rnd-venue-gauge-title">Pitch Condition</span>
                    <span class="rnd-venue-gauge-value">${pitchPct}%</span>
                </div>
                <div class="rnd-venue-gauge-bar"><div class="rnd-venue-gauge-fill" style="width:${pitchPct}%;background:${pitchColor}"></div></div>
            </div>

            <div class="rnd-venue-facilities">
                ${facilities.map(f => `
                <div class="rnd-venue-facility ${fac[f.key] ? 'active' : ''}">
                    <div class="rnd-venue-facility-icon">${f.icon}</div>
                    <div class="rnd-venue-facility-label">${f.label}</div>
                    <div class="rnd-venue-facility-status">${fac[f.key] ? '✓ Yes' : '✗ No'}</div>
                </div>`).join('')}
            </div>
        `;

        return el;
    },
};
