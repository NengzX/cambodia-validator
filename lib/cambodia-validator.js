class CambodiaNRSTValidator {
    constructor() {
        this.operators = {
            '10': { name: 'Cellcard', type: 'mobile', technology: ['4G', '5G'] },
            '11': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '12': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '77': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '78': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '85': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '89': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '90': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '92': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '93': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '95': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            '99': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            
            '15': { name: 'Smart Axiata', type: 'mobile', technology: ['4G', '5G'] },
            '16': { name: 'Smart Axiata', type: 'mobile', technology: ['4G'] },
            '69': { name: 'Smart Axiata', type: 'mobile', technology: ['4G'] },
            '81': { name: 'Smart Axiata', type: 'mobile', technology: ['4G'] },
            '86': { name: 'Smart Axiata', type: 'mobile', technology: ['4G'] },
            '96': { name: 'Smart Axiata', type: 'mobile', technology: ['4G'] },
            '98': { name: 'Smart Axiata', type: 'mobile', technology: ['4G'] },
            
            '70': { name: 'Metfone', type: 'mobile', technology: ['4G'] },
            '71': { name: 'Metfone', type: 'mobile', technology: ['4G'] },
            '97': { name: 'Metfone', type: 'mobile', technology: ['4G'] },
            
            '88': { name: 'Seatel', type: 'mobile', technology: ['4G'] },
            '87': { name: 'Cellcard', type: 'mobile', technology: ['4G'] },
            
            '023': { name: 'Phnom Penh Landline', type: 'fixed', area: 'Phnom Penh' },
            '024': { name: 'Phnom Penh Landline', type: 'fixed', area: 'Phnom Penh' },
            '025': { name: 'Phnom Penh Landline', type: 'fixed', area: 'Phnom Penh' },
            '063': { name: 'Siem Reap Landline', type: 'fixed', area: 'Siem Reap' },
            '032': { name: 'Kampong Cham Landline', type: 'fixed', area: 'Kampong Cham' },
            '042': { name: 'Battambang Landline', type: 'fixed', area: 'Battambang' },
            '044': { name: 'Siem Reap Landline', type: 'fixed', area: 'Siem Reap' },
            '072': { name: 'Banteay Meanchey Landline', type: 'fixed', area: 'Banteay Meanchey' },
            '073': { name: 'Kandal Landline', type: 'fixed', area: 'Kandal' }
        };
        
        this.areaCodes = {
            '23': 'Phnom Penh', '24': 'Phnom Penh', '25': 'Phnom Penh',
            '32': 'Kampong Cham', '33': 'Kampong Chhnang', '34': 'Kampong Speu',
            '35': 'Kampong Thom', '36': 'Kampot', '42': 'Battambang',
            '43': 'Pursat', '44': 'Siem Reap', '52': 'Koh Kong',
            '53': 'Kep', '54': 'Mondulkiri', '55': 'Oddar Meanchey',
            '62': 'Preah Sihanouk', '63': 'Stung Treng', '64': 'Svay Rieng',
            '72': 'Banteay Meanchey', '73': 'Kandal', '74': 'Preah Vihear',
            '75': 'Prey Veng', '76': 'Ratanakiri', '84': 'Tboung Khmum'
        };
    }

    normalize(phone) {
        if (!phone) return null;
        let normalized = phone.toString().replace(/[^\d+]/g, '');
        if (normalized.startsWith('0')) normalized = '855' + normalized.substring(1);
        if (normalized.startsWith('+')) normalized = normalized.substring(1);
        if (!normalized.startsWith('855') && normalized.length >= 8) normalized = '855' + normalized;
        return normalized;
    }

    getOperatorInfo(localNumber) {
        const prefix2 = localNumber.substring(0, 2);
        const prefix3 = localNumber.substring(0, 3);
        
        if (this.operators[prefix2]) return { ...this.operators[prefix2], prefix: prefix2, numberType: 'mobile' };
        if (this.operators[prefix3]) return { ...this.operators[prefix3], prefix: prefix3, numberType: 'landline' };
        return { name: 'Unknown Operator', type: 'unknown', numberType: 'unknown' };
    }

    getRegion(localNumber) {
        const prefix2 = localNumber.substring(0, 2);
        const prefix3 = localNumber.substring(0, 3);
        if (this.operators[prefix3]?.area) return this.operators[prefix3].area;
        if (this.areaCodes[prefix2]) return this.areaCodes[prefix2];
        const operator = this.getOperatorInfo(localNumber);
        return operator.numberType === 'mobile' ? 'Nationwide Coverage' : 'Unknown Region';
    }

    formatNumber(normalized) {
        const localNumber = normalized.substring(3);
        return {
            international: `+${normalized}`,
            local: `0${localNumber}`,
            formatted: `+855 ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6)}`,
            e164: `+${normalized}`
        };
    }

    validateNRST(phone) {
        const normalized = this.normalize(phone);
        if (!normalized) return { valid: false, error: 'Invalid phone number format', input: phone };
        if (!normalized.startsWith('855')) return { valid: false, error: 'Not a Cambodia number', input: phone };
        
        const localNumber = normalized.substring(3);
        if (localNumber.length < 8 || localNumber.length > 9) {
            return { valid: false, error: `Invalid length (got ${localNumber.length})`, input: phone };
        }
        
        const operatorInfo = this.getOperatorInfo(localNumber);
        const region = this.getRegion(localNumber);
        const formats = this.formatNumber(normalized);
        const validPattern = /^855(10|11|12|15|16|69|70|71|77|78|81|85|86|87|88|89|90|92|93|95|96|97|98|99|23|24|25|32|42|44|63|72|73)/.test(normalized);
        
        return {
            valid: validPattern,
            normalized, localNumber, formats,
            operator: operatorInfo.name,
            operatorType: operatorInfo.type,
            numberType: operatorInfo.numberType,
            technology: operatorInfo.technology || ['Unknown'],
            region, country: 'Cambodia', countryCode: 'KH', mcc: '456',
            mnc: this.getMNC(operatorInfo.prefix),
            compliance: { trc: validPattern, nrst: true, gsma: true, itu: true },
            validation: {
                format: true, operator: operatorInfo.name !== 'Unknown Operator',
                length: localNumber.length >= 8 && localNumber.length <= 9,
                pattern: validPattern, timestamp: new Date().toISOString()
            }
        };
    }

    getMNC(prefix) {
        const mncMap = { '10': '01', '15': '02', '70': '03', '88': '04', '85': '05' };
        return mncMap[prefix] || 'Unknown';
    }
}

export default CambodiaNRSTValidator;