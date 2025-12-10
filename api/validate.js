import CambodiaNRSTValidator from '../lib/cambodia-validator.js';

const validator = new CambodiaNRSTValidator();

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    try {
        // Get phone number from query
        const { phone } = req.query;
        
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: 'Phone number is required'
            });
        }
        
        // Validate the number
        const result = validator.validateNRST(phone);
        
        // Get client IP
        const clientIP = req.headers['x-forwarded-for'] || 
                        req.headers['x-real-ip'] || 
                        req.connection.remoteAddress;
        
        // Return response
        res.status(200).json({
            success: true,
            validation: result,
            clientInfo: {
                ip: clientIP,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error: ' + error.message
        });
    }
}
