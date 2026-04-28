require('dotenv').config();

const http = require('http');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 8000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Variables SUPABASE_URL ou SUPABASE_KEY manquantes dans .env');
    process.exit(1);
}

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
};

async function supabaseRequest(method, endpoint, body = null) {
    const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
    console.log(`📡 Supabase ${method} → ${url}`);
    if (body) console.log(`📦 Body envoyé:`, JSON.stringify(body).substring(0, 200) + '...');

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : ''
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    console.log(`✅ Supabase réponse status: ${response.status}`);

    if (response.status === 204 || response.status === 201) {
        console.log(`✅ Supabase OK (pas de contenu retourné)`);
        return null;
    }

    const result = await response.json();
    console.log(`📬 Supabase réponse body:`, JSON.stringify(result).substring(0, 300));
    return result;
}

http.createServer(async (req, res) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }

    // Sauvegarder un projet
    if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                const { projectName, html, css, projectData } = data;

                console.log(`\n💾 Sauvegarde projet: "${projectName}"`);

                if (!projectName) {
                    res.writeHead(400);
                    return res.end('Project name is required');
                }

                const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectName}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>${css}</style>
</head>
<body>${html}</body>
</html>`;

                const supaResult = await supabaseRequest('POST', '/Projects', {
                    project_name: projectName,
                    html: fullHtml,
                    css: css,
                    project_data: JSON.stringify(projectData),
                    created_at: new Date().toISOString()
                });

                if (supaResult && supaResult.code) {
                    console.log(`❌ Erreur Supabase:`, supaResult);
                    res.writeHead(500);
                    return res.end('Erreur Supabase: ' + JSON.stringify(supaResult));
                }

                console.log(`✅ Projet "${projectName}" sauvegardé avec succès!`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Project saved!', projectName }));

            } catch (e) {
                console.log(`❌ Erreur catch:`, e.message);
                res.writeHead(500);
                res.end('Error: ' + e.message);
            }
        });
        return;
    }

    // Récupérer tous les projets
    if (req.method === 'GET' && req.url === '/api/projects') {
        try {
            console.log(`\n📋 Récupération de tous les projets`);
            const result = await supabaseRequest('GET', '/Projects?select=project_name,created_at');
            console.log(`📋 ${result?.length || 0} projet(s) trouvé(s)`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result || []));
        } catch (e) {
            console.log(`❌ Erreur:`, e.message);
            res.writeHead(500);
            res.end('Error: ' + e.message);
        }
        return;
    }

    // Récupérer un projet par nom
    if (req.method === 'GET' && req.url.startsWith('/api/project/')) {
        try {
            const projectName = decodeURIComponent(req.url.replace('/api/project/', ''));
            console.log(`\n🔍 Récupération projet: "${projectName}"`);
            const result = await supabaseRequest('GET', `/Projects?project_name=eq.${encodeURIComponent(projectName)}&limit=1`);
            if (!result || result.length === 0) {
                console.log(`❌ Projet non trouvé`);
                res.writeHead(404);
                return res.end('Project not found');
            }
            console.log(`✅ Projet trouvé!`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result[0]));
        } catch (e) {
            console.log(`❌ Erreur:`, e.message);
            res.writeHead(500);
            res.end('Error: ' + e.message);
        }
        return;
    }

    // Fichiers statiques
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(error.code == 'ENOENT' ? 404 : 500);
            res.end(error.code == 'ENOENT' ? 'File not found' : 'Server error');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });

}).listen(port, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${port}/`);
    console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
});