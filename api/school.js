const { readSchools, findSchoolById } = require('../lib/schools');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { id } = req.query;
        
        if (id) {
            const school = findSchoolById(id);
            if (!school) {
                return res.status(404).json({ error: `School with ID ${id} not found` });
            }
            return res.status(200).json(school);
        }

        // Fallback: return all schools if no ID provided
        return res.status(200).json(readSchools());
    } catch (e) {
        return res.status(500).json({
            error: 'Unable to read schools configuration',
            details: e.message,
        });
    }
};
