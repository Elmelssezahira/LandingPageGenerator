/**
 
 * Required environment variables:
 *   SFMC_SUBDOMAIN       e.g. "mc6abc123def456"
 *   SFMC_CLIENT_ID       Installed package Client ID
 *   SFMC_CLIENT_SECRET   Installed package Client Secret
 *   SFMC_ACCOUNT_ID      (optional) MID of the Business Unit to target
 *   SFMC_CATEGORY_NAME     (optional) Content Builder folder/category name
 *   SFMC_ASSET_TYPE_ID   (optional) Override the asset type id (default 220 = code snippet)
 */

const SFMC_SUBDOMAIN = process.env.SFMC_SUBDOMAIN;
const SFMC_CLIENT_ID = process.env.SFMC_CLIENT_ID;
const SFMC_CLIENT_SECRET = process.env.SFMC_CLIENT_SECRET;
const SFMC_ACCOUNT_ID = process.env.SFMC_ACCOUNT_ID || null;
const SFMC_CATEGORY_ID = process.env.SFMC_CATEGORY_ID
    ? parseInt(process.env.SFMC_CATEGORY_ID, 10)
    : null;
const SFMC_CATEGORY_NAME = (process.env.SFMC_CATEGORY_NAME || '').trim() || null;
const SFMC_ASSET_TYPE_ID = process.env.SFMC_ASSET_TYPE_ID
    ? parseInt(process.env.SFMC_ASSET_TYPE_ID, 10)
    : 220; // 220 = code snippert
const SFMC_ASSET_TYPE_NAME = process.env.SFMC_ASSET_TYPE_NAME || 'webpage';

let cachedToken = null;
let cachedCategoryId = null;


function stripSchoolPrefix(projectName) {
    if (!projectName) return projectName;
    return projectName.replace(/^school-[^_]+__/, '');
}


/**
 From CustomerKey spec: "Code Snippet customer keys may only contain alpha-numeric characters, 
 underscores, dashes, periods, and slashes. No spaces are allowed."
 */
function slugify(s) {
    return String(s || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Za-z0-9_./-]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^[-_]+|[-_]+$/g, '');
}

/**
 * Build the customerKey ("template key") used in SFMC.
 */
function customerKeyFor(projectName) {
    return slugify(stripSchoolPrefix(projectName));
}

/**
 * Build the asset display name shown in Content Builder. Just the school
 * prefix stripped — no slugification, so spaces/casing are preserved.
 */
function assetNameFor(projectName) {
    return stripSchoolPrefix(projectName);
}

function isSfmcConfigured() {
    return Boolean(SFMC_SUBDOMAIN && SFMC_CLIENT_ID && SFMC_CLIENT_SECRET);
}

function assertConfigured() {
    if (!isSfmcConfigured()) {
        const err = new Error(
            'Missing SFMC env vars (SFMC_SUBDOMAIN / SFMC_CLIENT_ID / SFMC_CLIENT_SECRET)'
        );
        err.code = 'SFMC_ENV_MISSING';
        throw err;
    }
}

/**
 * Fetch (or reuse) an OAuth2 access token. 
 */
async function getAccessToken() {
    assertConfigured();

    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt - 60_000 > now) {
        return cachedToken;
    }

    const url = `https://${SFMC_SUBDOMAIN}.auth.marketingcloudapis.com/v2/token`;
    const body = {
        grant_type: 'client_credentials',
        client_id: SFMC_CLIENT_ID,
        client_secret: SFMC_CLIENT_SECRET
    };
    if (SFMC_ACCOUNT_ID) body.account_id = SFMC_ACCOUNT_ID;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        let payload = null;
        try { payload = await response.json(); } catch { /* ignore */ }
        const err = new Error(`SFMC auth failed (HTTP ${response.status})`);
        err.code = 'SFMC_AUTH_ERROR';
        err.status = response.status;
        err.payload = payload;
        throw err;
    }

    const data = await response.json();
    cachedToken = {
        accessToken: data.access_token,
        restBase: data.rest_instance_url,
        expiresAt: now + (data.expires_in || 1080) * 1000
    };
    return cachedToken;
}

/**
 * Make an authenticated request against the Content Builder REST API.
 */
async function sfmcFetch(method, path, body = null) {
    const { accessToken, restBase } = await getAccessToken();
    const url = restBase.replace(/\/$/, '') + path;

    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    let payload = null;
    try { payload = await response.json(); } catch {}

    if (!response.ok) {
        const err = new Error(`SFMC ${method} ${path} failed (HTTP ${response.status})`);
        err.code = 'SFMC_HTTP_ERROR';
        err.status = response.status;
        err.payload = payload;
        throw err;
    }

    return payload;
}

/**
 * Resolve a Content Builder category (folder) by its name to its numeric id.
 */
async function resolveCategoryIdByName(name) {
    if (!name) return null;
    if (cachedCategoryId) return cachedCategoryId;

    const pageSize = 500;
    const maxPages = 20;

    for (let page = 1; page <= maxPages; page++) {
        const path = `/asset/v1/content/categories?$pagesize=${pageSize}&$page=${page}`;
        const result = await sfmcFetch('GET', path);

        const items = (result && Array.isArray(result.items)) ? result.items : [];
        if (items.length === 0) break;

        // Prefer exact match, fall back to case-insensitive.
        const exact = items.find(c => c.name === name);
        if (exact) {
            cachedCategoryId = exact.id;
            return cachedCategoryId;
        }
        const ci = items.find(c => c.name && c.name.toLowerCase() === name.toLowerCase());
        if (ci) {
            cachedCategoryId = ci.id;
            return cachedCategoryId;
        }

        if (items.length < pageSize) break;
    }

    return null;
}

/**
 * Look up an existing asset by customerKey.
 */
async function findAssetIdByCustomerKey(customerKey) {
    const result = await sfmcFetch('POST', '/asset/v1/content/assets/query', {
        page: { page: 1, pageSize: 1 },
        query: {
            property: 'customerKey',
            simpleOperator: 'equal',
            value: customerKey
        },
        fields: ['id', 'customerKey', 'name']
    });

    if (result && Array.isArray(result.items) && result.items.length > 0) {
        return result.items[0].id;
    }
    return null;
}

/**
 * Build the SFMC asset payload from the project save data.
 */
async function buildAssetPayload({ projectName, fullHtml }) {
    const payload = {
        name: assetNameFor(projectName),
        customerKey: customerKeyFor(projectName),
        assetType: { id: SFMC_ASSET_TYPE_ID, name: SFMC_ASSET_TYPE_NAME },
        content: fullHtml,
        views: {
            html: { content: fullHtml }
        }
    };

    let categoryId = SFMC_CATEGORY_ID;
    if (!categoryId && SFMC_CATEGORY_NAME) {
        try {
            categoryId = await resolveCategoryIdByName(SFMC_CATEGORY_NAME);
            if (!categoryId) {
                console.warn(`⚠️  SFMC: folder "${SFMC_CATEGORY_NAME}" not found in Content Builder — asset will land in the default folder.`);
            }
        } catch (e) {
            console.warn(`⚠️  SFMC: failed to resolve folder "${SFMC_CATEGORY_NAME}":`, e.message);
        }
    }
    if (categoryId) {
        payload.category = { id: categoryId };
    }
    return payload;
}

/**
 * Upsert a project into SFMC Content Builder. If an asset with the same
 * key exists, update it otherwise create.
 */
async function syncProjectToSfmc({ projectName, fullHtml }) {
    if (!isSfmcConfigured()) {
        console.log('⏭️  SFMC sync skipped (env vars not configured).');
        return { skipped: true, action: 'skipped' };
    }
    if (!projectName) {
        return { skipped: true, action: 'skipped', error: 'projectName missing' };
    }

    const payload = await buildAssetPayload({ projectName, fullHtml });
    const folderId = payload.category && payload.category.id;
    const folderLabel = folderId
        ? `"${SFMC_CATEGORY_NAME}" (id=${folderId})`
        : 'Content Builder root';

    const existingId = await findAssetIdByCustomerKey(customerKeyFor(projectName));

    if (existingId) {
        const updated = await sfmcFetch('PATCH', `/asset/v1/content/assets/${existingId}`, payload);
        const assetName = (updated && updated.name) || projectName;
        console.log(`☁️  SFMC: asset updated → "${assetName}" (id=${existingId}, folder=${folderLabel})`);
        return { skipped: false, action: 'updated', id: existingId, name: assetName, folderId, asset: updated };
    }

    const created = await sfmcFetch('POST', '/asset/v1/content/assets', payload);
    const assetName = (created && created.name) || projectName;
    const newId = created && created.id;
    console.log(`☁️  SFMC: asset created → "${assetName}" (id=${newId}, folder=${folderLabel})`);
    return { skipped: false, action: 'created', id: newId, name: assetName, folderId, asset: created };
}

module.exports = {
    isSfmcConfigured,
    syncProjectToSfmc,
    getAccessToken,
    sfmcFetch,
    findAssetIdByCustomerKey,
    resolveCategoryIdByName
};
