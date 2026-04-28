const { supabaseRequest } = require('../lib/supabase');
const { findSchoolById } = require('../lib/schools');

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).send('Method Not Allowed');
    }

    const projectName = req.query.name;
    if (!projectName) {
        return res.status(400).send('Nom du projet manquant');
    }

    try {
        // 1. Récupérer le projet depuis Supabase
        const result = await supabaseRequest('GET', `/Projects?project_name=eq.${encodeURIComponent(projectName)}&limit=1`);
        
        if (!result || result.length === 0) {
            return res.status(404).send('Projet non trouvé');
        }

        const project = result[0];
        let html = project.html;

        // 2. Extraire l'ID de l'école (format: school-xxx__name)
        const schoolMatch = projectName.match(/^school-([a-z0-9-]+)__/);
        if (schoolMatch) {
            const schoolId = schoolMatch[1];
            const school = findSchoolById(schoolId);
            
            if (school) {
                const primary = school.color || '#3b82f6';
                const secondary = school.secondaryColor || (schoolId === 'efap' ? '#1a1a1a' : '#2563eb');
                
                const brandStyles = `
                    <style id="brand-variables-preview">
                        :root {
                            --brand-primary: ${primary};
                            --brand-secondary: ${secondary};
                        }
                    </style>
                `;
                // Injecter les styles dans le head
                html = html.replace('</head>', `${brandStyles}</head>`);
            }
        }

        // 3. Servir le HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(html);

    } catch (e) {
        console.error('❌ Erreur Preview:', e.message);
        return res.status(500).send('Error: ' + e.message);
    }
};
