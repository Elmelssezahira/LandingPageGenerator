const { findSchoolById } = require('../../lib/schools');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'School id is required' });
        }

        const school = findSchoolById(id);

        if (!school) {
            return res.status(404).json({ error: 'School not found' });
        }

        return res.status(200).json(school);
    } catch (e) {
        return res.status(500).json({
            error: 'Unable to read school configuration',
            details: e.message,
        });
    }
};
