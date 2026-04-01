export const TmMatchVenue = {
        render(body, mData) {
        const md = mData.match_data;
        const venue = md.venue;
        const weatherBase = (venue.weather || '').replace(/\d+/g, '');
        const weatherMap = {
            sunny: { icon: '☀️', text: 'Sunny', desc: 'Clear skies' },
            cloudy: { icon: '⛅', text: 'Cloudy', desc: 'Partly cloudy' },
            rainy: { icon: '🌧️', text: 'Rain', desc: 'Wet conditions' },
            snow: { icon: '❄️', text: 'Snow', desc: 'Snowy pitch' },
            overcast: { icon: '☁️', text: 'Overcast', desc: 'Heavy clouds' }
        };
        const w = weatherMap[weatherBase] || { icon: '🌤️', text: weatherBase.charAt(0).toUpperCase() + weatherBase.slice(1), desc: '' };

        const capacity = Number(venue.capacity) || 0;
        const attendance = Number(md.attendance) || 0;
        const attPct = capacity ? Math.round(attendance / capacity * 100) : 0;
        const pitchPct = Number(venue.pitch_condition) || 0;

        // Stadium SVG illustration
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
            ${[35, 50, 65, 80, 140, 155, 170, 185].map(x => `<rect x="${x - 1}" y="${x < 110 ? 28 : 28}" width="2" height="4" rx="0.5" fill="var(--tmu-success)" opacity="0.5"/>`).join('')}
            <ellipse cx="45" cy="26" rx="14" ry="3" fill="none" stroke="var(--tmu-accent-fill)" stroke-width="0.4" opacity="0.4"/>
            <ellipse cx="175" cy="26" rx="14" ry="3" fill="none" stroke="var(--tmu-accent-fill)" stroke-width="0.4" opacity="0.4"/>
        </svg>`;

        let html = '<div class="rnd-venue-wrap">';

        // Hero section with stadium
        html += '<div class="rnd-venue-hero">';
        html += stadiumSvg;
        html += `<div class="rnd-venue-name">${venue.name}</div>`;
        html += `<div class="rnd-venue-city">📍 ${venue.city}</div>`;
        html += `<div class="rnd-venue-tournament"><span>🏆 ${venue.tournament}</span></div>`;
        html += '</div>';

        // Capacity & Attendance cards
        html += '<div class="rnd-venue-cards">';
        html += `<div class="rnd-venue-card">
            <div class="rnd-venue-card-icon">🏟️</div>
            <div class="rnd-venue-card-value">${capacity.toLocaleString()}</div>
            <div class="rnd-venue-card-label">Capacity</div>
        </div>`;
        html += `<div class="rnd-venue-card">
            <div class="rnd-venue-card-icon">👥</div>
            <div class="rnd-venue-card-value">${attendance ? attendance.toLocaleString() : '—'}</div>
            <div class="rnd-venue-card-label">Attendance</div>
        </div>`;
        html += '</div>';

        // Attendance gauge bar
        if (attendance && capacity) {
            html += '<div class="rnd-venue-gauge-wrap">';
            html += '<div class="rnd-venue-gauge-header">';
            html += '<span class="rnd-venue-gauge-title">Stadium Fill</span>';
            html += `<span class="rnd-venue-gauge-value">${attPct}%</span>`;
            html += '</div>';
            html += `<div class="rnd-venue-gauge-bar"><div class="rnd-venue-gauge-fill attendance" style="width:${attPct}%"></div></div>`;
            html += '</div>';
        }

        // Weather card
        html += '<div class="rnd-venue-weather">';
        html += `<div class="rnd-venue-weather-icon">${w.icon}</div>`;
        html += '<div class="rnd-venue-weather-info">';
        html += `<div class="rnd-venue-weather-text">${w.text}</div>`;
        html += `<div class="rnd-venue-weather-sub">${w.desc}</div>`;
        html += '</div></div>';

        // Pitch condition gauge
        html += '<div class="rnd-venue-gauge-wrap">';
        html += '<div class="rnd-venue-gauge-header">';
        html += '<span class="rnd-venue-gauge-title">Pitch Condition</span>';
        html += `<span class="rnd-venue-gauge-value">${pitchPct}%</span>`;
        html += '</div>';
        const pitchColor = pitchPct >= 80 ? 'var(--tmu-success)' : pitchPct >= 50 ? 'var(--tmu-warning-soft)' : 'var(--tmu-danger-strong)';
        html += `<div class="rnd-venue-gauge-bar"><div class="rnd-venue-gauge-fill" style="width:${pitchPct}%;background:${pitchColor}"></div></div>`;
        html += '</div>';

        // Facilities grid
        html += '<div class="rnd-venue-facilities">';
        const facilities = [
            { key: 'sprinklers', icon: '💧', label: 'Sprinklers' },
            { key: 'draining', icon: '🚰', label: 'Draining' },
            { key: 'pitchcover', icon: '🛡️', label: 'Pitch Cover' },
            { key: 'heating', icon: '🔥', label: 'Heating' },
        ];
        facilities.forEach(f => {
            const active = venue[f.key] ? 'active' : '';
            html += `<div class="rnd-venue-facility ${active}">
                <div class="rnd-venue-facility-icon">${f.icon}</div>
                <div class="rnd-venue-facility-label">${f.label}</div>
                <div class="rnd-venue-facility-status">${venue[f.key] ? '✓ Yes' : '✗ No'}</div>
            </div>`;
        });
        html += '</div>';

        html += '</div>';
        body.html(html);
        }
    };
