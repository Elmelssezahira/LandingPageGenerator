const { readSchools } = require('../lib/schools');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        return res.status(200).json(readSchools());
    } catch (e) {
        return res.status(500).json({
            error: 'Unable to read schools configuration',
            details: e.message,
        });
    }
};
