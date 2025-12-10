// Simple Cambodia phone validator API
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

export default async function handler(req, res) {
    // Set CORS headers
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Only allow GET
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    try {
        const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
        const phone = searchParams.get('phone');
        
        if (!phone) {
            return res.status(400).json({ 
                success: false, 
                error: 'Phone number required. Example: ?phone=+85512345678' 
            });
        }
        
        // Simple validation logic
        const result = validateCambodiaPhone(phone);
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
        
        res.status(200).json({
            success: true,
            validation: result,
            clientInfo: {
                ip: clientIP,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Server error: ' + error.message 
        });
    }
}

function validateCambodiaPhone(phone) {
    // Clean phone number
    let clean = phone.replace(/\D/g, '');
    
    // Add country code if missing
    if (clean.startsWith('0')) {
        clean = '855' + clean.substring(1);
    }
    
    if (!clean.startsWith('855')) {
        clean = '855' + clean;
    }
    
    const localNumber = clean.substring(3);
    
    // Basic validation
    const valid = localNumber.length >= 8 && localNumber.length <= 9;
    
    // Operator detection
    const prefix2 = localNumber.substring(0, 2);
    const prefix3 = localNumber.substring(0, 3);
    
    let operator = 'Unknown';
    let region = 'Unknown';
    
    // Operator mapping
    const operators = {
        '10': 'Cellcard', '11': 'Cellcard', '12': 'Cellcard',
        '15': 'Smart', '16': 'Smart', '69': 'Smart',
        '70': 'Metfone', '71': 'Metfone', 
        '77': 'Cellcard', '78': 'Cellcard',
        '81': 'Smart', '85': 'Cellcard', '86': 'Smart',
        '88': 'Seatel', '89': 'Cellcard', '90': 'Cellcard',
        '92': 'Cellcard', '93': 'Cellcard', '95': 'Cellcard',
        '96': 'Smart', '97': 'Metfone', '98': 'Smart', '99': 'Cellcard'
    };
    
    // Area codes
    const areas = {
        '23': 'Phnom Penh', '24': 'Phnom Penh', '25': 'Phnom Penh',
        '32': 'Kampong Cham', '42': 'Battambang', '44': 'Siem Reap',
        '63': 'Siem Reap', '72': 'Banteay Meanchey', '73': 'Kandal'
    };
    
    if (operators[prefix2]) {
        operator = operators[prefix2];
        region = 'Nationwide';
    } else if (areas[prefix2]) {
        operator = 'Landline';
        region = areas[prefix2];
    }
    
    return {
        valid,
        normalized: clean,
        localNumber,
        formats: {
            international: `+${clean}`,
            local: `0${localNumber}`,
            formatted: `+855 ${localNumber.substring(0, 3)} ${localNumber.substring(3, 6)} ${localNumber.substring(6)}`
        },
        operator,
        region,
        country: 'Cambodia',
        countryCode: 'KH',
        numberType: operator === 'Landline' ? 'landline' : 'mobile',
        technology: ['4G'],
        mcc: '456',
        compliance: {
            trc: valid,
            nrst: true
        }
    };
}        
        if (!phone) {
            return new Response(
                JSON.stringify({ 
                    success: false,
                    error: 'Phone number is required',
                    example: '/api/validate?phone=+85512345678'
                }),
                { status: 400, headers: corsHeaders }
            );
        }

        const result = validator.validateNRST(phone);
        
        return new Response(
            JSON.stringify({
                success: true,
                validation: result,
                clientInfo: {
                    ip: clientIP,
                    timestamp: new Date().toISOString(),
                    userAgent: req.headers.get('user-agent') || 'unknown'
                }
            }),
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        return new Response(
            JSON.stringify({ 
                success: false,
                error: error.message || 'Validation failed'
            }),
            { status: 500, headers: corsHeaders }
        );
    }
}

export const config = {
    runtime: 'edge'
};
