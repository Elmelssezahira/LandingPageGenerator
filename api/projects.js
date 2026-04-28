const { supabaseRequest } = require('../lib/supabase');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const result = await supabaseRequest('GET', '/Projects?select=project_name,created_at');
        return res.status(200).json(result || []);
    } catch (e) {
        if (e.code === 'ENV_MISSING') {
            return res.status(500).json({ error: 'Server misconfigured: Supabase credentials missing' });
        }
        if (e.code === 'SUPABASE_HTTP_ERROR') {
            return res.status(502).json({
                error: 'Supabase rejected the request',
                details: e.payload
            });
        }
        return res.status(500).json({ error: e.message });
    }
};
