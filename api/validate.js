import CambodiaNRSTValidator from '../lib/cambodia-validator.js';
import { rateLimit } from './middleware.js';

const validator = new CambodiaNRSTValidator();

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    const clientIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown';

    const rateLimitCheck = await rateLimit(clientIP);
    if (rateLimitCheck.limited) {
        return new Response(
            JSON.stringify({ 
                success: false,
                error: 'Rate limit exceeded. Try again later.'
            }),
            { status: 429, headers: corsHeaders }
        );
    }

    try {
        const url = new URL(req.url);
        const phone = url.searchParams.get('phone');
        
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
