class NrstValidator {
    constructor() { this.apiBaseUrl = window.location.origin; this.init(); }
    async init() {
        this.phoneInput = document.getElementById('phoneInput');
        this.validateBtn = document.getElementById('validateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.loading = document.getElementById('loading');
        this.errorMessage = document.getElementById('errorMessage');
        this.resultsSection = document.getElementById('resultsSection');
        this.ipAddressEl = document.getElementById('ipAddress');
        
        this.validateBtn.addEventListener('click', () => this.validate());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.phoneInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.validate(); });
        this.phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 9) value = value.substring(0, 9);
            e.target.value = value;
        });
        await this.fetchUserIP();
    }
    async fetchUserIP() {
        try { const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json(); this.ipAddressEl.textContent = data.ip;
        } catch { this.ipAddressEl.textContent = 'Unable to detect IP'; }
    }
    async validate() {
        const phone = this.phoneInput.value.trim();
        if (!phone) { this.showError('Please enter a phone number'); return; }
        const formattedNumber = phone.startsWith('0') ? '+855' + phone.substring(1) :
                               phone.length >= 8 ? '+855' + phone : phone;
        this.showLoading(); this.hideError(); this.hideResults();
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/validate?phone=${encodeURIComponent(formattedNumber)}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.error || 'Validation failed');
            this.displayResults(data);
        } catch (error) { this.showError(`Validation Error: ${error.message}`); }
        finally { this.hideLoading(); }
    }
    displayResults(data) {
        const result = data.validation; const clientInfo = data.clientInfo;
        const html = `<div class="validation-card">
            <div class="status-badge ${result.valid ? 'status-valid' : 'status-invalid'}">
                ${result.valid ? '✓ VALID NRST NUMBER' : '✗ INVALID NRST NUMBER'}
            </div>
            <div class="number-display">${result.formats?.formatted || result.normalized || 'N/A'}</div>
            ${!result.valid ? `<div class="error-message" style="display: block; margin: 20px 0;">
                ${result.error || 'Invalid number format'}</div>` : ''}
            <div class="details-grid">
                <div class="detail-item"><div class="detail-label">Phone Number</div><div class="detail-value">${result.formats?.formatted || 'N/A'}</div></div>
                <div class="detail-item"><div class="detail-label">Operator Name</div><div class="detail-value">
                    ${result.operator || 'Unknown'} ${result.operator ? `<div class="operator-badge">${result.operatorType || 'Mobile'}</div>` : ''}
                </div></div>
                <div class="detail-item"><div class="detail-label">Location</div><div class="detail-value">${result.region || 'Unknown'}</div></div>
                <div class="detail-item"><div class="detail-label">Number Type</div><div class="detail-value">${result.numberType || 'Unknown'}</div></div>
                <div class="detail-item"><div class="detail-label">Technology</div><div class="detail-value">${(result.technology || []).join(', ') || 'Unknown'}</div></div>
                <div class="detail-item"><div class="detail-label">Country</div><div class="detail-value">${result.country || 'Cambodia'} (${result.countryCode || 'KH'})</div></div>
                <div class="detail-item"><div class="detail-label">Your IP Address</div><div class="detail-value">${clientInfo.ip || 'Unknown'}</div></div>
                <div class="detail-item"><div class="detail-label">Validation Time</div><div class="detail-value">${new Date(clientInfo.timestamp).toLocaleString()}</div></div>
            </div>
            ${result.valid ? `<div class="compliance-badges">
                <div class="compliance-badge">TRC Compliant</div>
                <div class="compliance-badge">NRST Standard</div>
                <div class="compliance-badge">GSMA Format</div>
                <div class="compliance-badge">ITU E.164</div>
            </div>` : ''}
        </div>`;
        this.resultsSection.innerHTML = html; this.resultsSection.classList.add('active');
    }
    clear() { this.phoneInput.value = ''; this.hideError(); this.hideResults(); this.phoneInput.focus(); }
    showLoading() { this.loading.classList.add('active'); this.validateBtn.disabled = true; }
    hideLoading() { this.loading.classList.remove('active'); this.validateBtn.disabled = false; }
    showError(message) { this.errorMessage.textContent = message; this.errorMessage.classList.add('active'); }
    hideError() { this.errorMessage.classList.remove('active'); }
    hideResults() { this.resultsSection.classList.remove('active'); this.resultsSection.innerHTML = ''; }
}
document.addEventListener('DOMContentLoaded', () => { window.validator = new NrstValidator(); });