import { initStorage } from './storage.js';
import { initExport } from './export.js';
import { registerBlocks } from '../blocks/index.js';

const BLOCK_THUMBNAILS = {
    'header-efap': 'assets/block-thumbnails/header-efap.svg',
    'header-brassart': 'assets/block-thumbnails/header-brassart.svg',
    'footer-efap': 'assets/block-thumbnails/footer-efap.svg',
    'footer-brassart': 'assets/block-thumbnails/footer-brassart.svg',
    hero: 'assets/block-thumbnails/hero.svg',
    'two-column': 'assets/block-thumbnails/two-column.svg',
    'rich-text': 'assets/block-thumbnails/rich-text.svg',
    'cta-button': 'assets/block-thumbnails/cta-button.svg',
    'image-caption': 'assets/block-thumbnails/image-caption.svg',
    spacer: 'assets/block-thumbnails/spacer.svg',
    'horizontal-menu': 'assets/block-thumbnails/horizontal-menu.svg',
    'bande-rose': 'assets/block-thumbnails/bande-rose.svg',
    'programme-list': 'assets/block-thumbnails/programme-list.svg',
    'programme-editorial': 'assets/block-thumbnails/programme-editorial.svg',
    'trois-raisons': 'assets/block-thumbnails/trois-raisons.svg',
    'form-sfmc': 'assets/block-thumbnails/form-sfmc.svg',
    'chiffres-cles': 'assets/block-thumbnails/chiffres-cles.svg',
    Carrousel: 'assets/block-thumbnails/carrousel.svg',
    CarrouselTemoignages: 'assets/block-thumbnails/carrousel-temoignages.svg',
    CarrouselCampus: 'assets/block-thumbnails/carrousel-campus.svg',
    'header-icart': 'assets/block-thumbnails/header-icart.svg',
    'footer-icart': 'assets/block-thumbnails/footer-icart.svg',
    'horizontal-menu-icart': 'assets/block-thumbnails/horizontal-menu.svg',
    'bande-orange-icart': 'assets/block-thumbnails/bande-orange.svg',
    'programme-list-icart': 'assets/block-thumbnails/programme-list.svg',
    'chiffres-cles-icart': 'assets/block-thumbnails/chiffres-cles.svg',
    'carrousel-campus-icart': 'assets/block-thumbnails/carrousel-campus.svg',
    'carrousel-temoignages-icart': 'assets/block-thumbnails/carrousel-temoignages.svg',
    'reasons-icart': 'assets/block-thumbnails/trois-raisons.svg',
    default: 'assets/block-thumbnails/default.svg'
};

// School context
let CURRENT_SCHOOL = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Detect school from URL
    const params = new URLSearchParams(window.location.search);
    const schoolId = params.get('school');

    if (!schoolId) {
        window.location.href = 'school-selector.html'; // Redirect to selector if no school
        return;
    }

    // 2. Fetch school config (MANDATORY BEFORE INIT)
    try {
        const response = await fetch(`/api/school/${schoolId}`);
        if (response.ok) {
            CURRENT_SCHOOL = await response.json();
            updateSchoolUI(CURRENT_SCHOOL);
        } else if (schoolId === 'master') {
            CURRENT_SCHOOL = { id: 'master', name: 'MASTER', color: '#c9b87a', defaultBlocks: [] };
            updateSchoolUI(CURRENT_SCHOOL);
        } else {
            console.error('School not found in API');
        }
    } catch (e) {
        console.error('Failed to load school config', e);
    }

    // Now initialize editor
    initEditor(schoolId);
});

function initEditor(schoolId) {
    const editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: 'auto',
        storageManager: {
            type: 'local',
            autosave: true,
            stepsBeforeSave: 1,
            key: `reetain-builder__${schoolId}__gjsProject`,
        },
        assetManager: {
            upload: false,
            assets: [
                'https://via.placeholder.com/350x250/78c5d6/fff',
                'https://via.placeholder.com/350x250/459ba8/fff',
                'https://via.placeholder.com/350x250/79c267/fff',
                'https://via.placeholder.com/350x250/c5d647/fff',
                'https://via.placeholder.com/350x250/f28c33/fff',
            ],
        },
        blockManager: {
            appendTo: '#blocks',
        },
        styleManager: {
            appendTo: '#styles-container',
        },
        layerManager: {
            appendTo: '#layers-container',
        },
        traitManager: {
            appendTo: '#traits-container',
        },
        panels: {
            defaults: [],
        },
        deviceManager: {
            devices: [
                { name: 'Desktop', width: '' },
                { name: 'Tablet', width: '600px', widthMedia: '600px' },
                { name: 'Mobile', width: '375px', widthMedia: '375px' },
            ],
        },
    });

    // Custom UI Logic
    initUI(editor);
    initBlockThumbnailMedia(editor);
    
    // Register Modules
    initStorage(editor);
    initExport(editor);
    registerBlocks(editor);

    // Apply school-based block filtering
    editor.on('load', () => {
        filterBlocksBySchool(editor, schoolId);
        
        const wrapper = editor.getWrapper();
        if (!wrapper || wrapper.components().length === 0) {
            loadDefaultTemplate(editor);
        }
    });

    // --- Specific Logic for ICART ---
    if (schoolId === 'icart') {
        initIcartSpecifics(editor);
    }

    window.editor = editor;
}

function filterBlocksBySchool(editor, schoolId) {
    if (!schoolId || schoolId === 'master') return;

    // Preserve timeout because some blocks register slightly after editor load
    setTimeout(() => {
        const bm = editor.BlockManager;

        // Use models snapshot from main to avoid mutation issues during removal
        const allBlocks = bm.getAll().models;

        const targetSchoolName = schoolId.toUpperCase();
        const defaultBlocks = CURRENT_SCHOOL?.defaultBlocks || [];

        const blocksToRemove = [];

        allBlocks.forEach(block => {
            const id = block.get('id');
            const category = block.get('category');

            const categoryLabel =
                (typeof category === 'object'
                    ? category.get('id')
                    : category) || '';

            const isTargetSchool =
                categoryLabel === `${targetSchoolName} Components`;

            const isOtherSchool =
                categoryLabel.includes(' Components') && !isTargetSchool;

            const isRequiredByDefault =
                defaultBlocks.includes(id);

            if (isOtherSchool && !isRequiredByDefault) {
                blocksToRemove.push(id);
            }
        });

        console.log(
            `🧹 Removing ${blocksToRemove.length} blocks from other schools for ${schoolId}`
        );

        blocksToRemove.forEach(id => bm.remove(id));

        bm.render();
    }, 50);
}

function updateSchoolUI(school) {
    const indicator = document.getElementById('school-indicator');
    const dot = document.getElementById('school-dot');
    const label = document.getElementById('school-label');

    if (indicator && school) {
        indicator.style.display = 'flex';
        dot.style.backgroundColor = school.color;
        label.textContent = school.name;
    }
}

function initBlockThumbnailMedia(editor) {
    const blockManager = editor.BlockManager;
    const originalAdd = blockManager.add.bind(blockManager);

    blockManager.add = (id, properties = {}) => {
        const label = properties.label || id;
        const thumbnail = BLOCK_THUMBNAILS[id] || BLOCK_THUMBNAILS.default;

        if (!properties.media) {
            properties.media = `
                <div class="block-thumbnail">
                    <div class="block-thumbnail__frame">
                        <img class="block-thumbnail__image" src="${escapeHtml(thumbnail)}" alt="${escapeHtml(label)}">
                    </div>
                </div>
            `;
        }

        return originalAdd(id, properties);
    };
}

function loadDefaultTemplate(editor) {
    editor.setComponents('');
    editor.setStyle('');
    
    // Use school specific blocks or fallback to a safe generic list
    const defaultBlocks = CURRENT_SCHOOL?.defaultBlocks || [
        'hero',
        'rich-text',
        'cta-button'
    ];
    
    console.log(`Loading default template for ${CURRENT_SCHOOL?.name || 'unknown'}:`, defaultBlocks);

    defaultBlocks.forEach(blockId => {
        const block = editor.BlockManager.get(blockId);
        if (block) {
            editor.addComponents(block.get('content'));
        } else {
            console.warn(`Default block not found: ${blockId}`);
        }
    });
}

function initUI(editor) {
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const welcomeStartButton = document.getElementById('welcome-start');
    const welcomeDismissToggle = document.getElementById('welcome-dismiss-toggle');
    const modal = document.getElementById('modal-container');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    const modalFooter = modal.querySelector('.modal-footer');
    const modalCloseButton = modal.querySelector('.modal-header .close-modal');
    const btnCreateBlock = document.getElementById('btn-create-block');
    const welcomeStorageKey = 'reetain-builder__hideWelcome';

    function closeWelcome() {
        if (welcomeDismissToggle && welcomeDismissToggle.checked) {
            localStorage.setItem(welcomeStorageKey, 'true');
        }
        if (welcomeOverlay) welcomeOverlay.classList.add('hidden');
    }

    if (localStorage.getItem(welcomeStorageKey) !== 'true' && welcomeOverlay) {
        welcomeOverlay.classList.remove('hidden');
    }

    if (welcomeStartButton) welcomeStartButton.onclick = closeWelcome;

    function closeModal() {
        modal.classList.add('hidden');
        modalTitle.textContent = '';
        modalBody.innerHTML = '';
        modalFooter.innerHTML = '';
        modalCloseButton.style.display = '';
        delete modal.dataset.dismissible;
    }

    function openModal({ title, body = '', actions = [], dismissible = true, onOpen }) {
        modalTitle.textContent = title;
        modalBody.innerHTML = body;
        modalFooter.innerHTML = '';
        modal.dataset.dismissible = dismissible ? 'true' : 'false';
        modalCloseButton.style.display = dismissible ? '' : 'none';

        actions.forEach(action => {
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = action.label;
            button.className = action.className;
            button.onclick = () => action.onClick();
            modalFooter.appendChild(button);
        });

        modal.classList.remove('hidden');
        if (onOpen) onOpen();
    }

    function showAlert({ title = 'Notice', message, confirmLabel = 'OK' }) {
        return new Promise(resolve => {
            openModal({
                title,
                body: `<p class="modal-message">${message}</p>`,
                actions: [{
                    label: confirmLabel,
                    className: 'btn-primary',
                    onClick: () => { closeModal(); resolve(); }
                }]
            });
        });
    }

    function showConfirm({ title = 'Confirm action', message, confirmLabel = 'Continue', cancelLabel = 'Cancel', confirmClassName = 'btn-primary' }) {
        return new Promise(resolve => {
            openModal({
                title,
                body: `<p class="modal-message">${message}</p>`,
                actions: [
                    { label: cancelLabel, className: 'btn-secondary', onClick: () => { closeModal(); resolve(false); } },
                    { label: confirmLabel, className: confirmClassName, onClick: () => { closeModal(); resolve(true); } }
                ]
            });
        });
    }

    function showPrompt({ title, message, defaultValue = '', placeholder = '', confirmLabel = 'OK', cancelLabel = 'Cancel' }) {
        return new Promise(resolve => {
            const inputId = 'modal-prompt-input';
            const submit = () => {
                const value = document.getElementById(inputId).value.trim();
                closeModal();
                resolve(value || null);
            };
            openModal({
                title,
                body: `
                    <p class="modal-message">${message}</p>
                    <input id="${inputId}" class="modal-input" type="text" value="${escapeHtml(defaultValue)}" placeholder="${escapeHtml(placeholder)}">
                `,
                actions: [
                    { label: cancelLabel, className: 'btn-secondary', onClick: () => { closeModal(); resolve(null); } },
                    { label: confirmLabel, className: 'btn-primary', onClick: submit }
                ],
                onOpen: () => {
                    const input = document.getElementById(inputId);
                    input.focus();
                    input.select();
                    input.addEventListener('keydown', event => {
                        if (event.key === 'Enter') { event.preventDefault(); submit(); }
                    });
                }
            });
        });
    }

    modalCloseButton.onclick = closeModal;
    modal.onclick = event => {
        if (event.target === modal && modal.dataset.dismissible !== 'false') closeModal();
    };

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden') && modal.dataset.dismissible !== 'false') closeModal();
    });

    // Device Switcher
    const deviceDesktop = document.getElementById('device-desktop');
    const deviceTablet = document.getElementById('device-tablet');
    const deviceMobile = document.getElementById('device-mobile');

    deviceDesktop.onclick = () => { editor.setDevice('Desktop'); setActiveDevice(deviceDesktop); };
    deviceTablet.onclick = () => { editor.setDevice('Tablet'); setActiveDevice(deviceTablet); };
    deviceMobile.onclick = () => { editor.setDevice('Mobile'); setActiveDevice(deviceMobile); };

    function setActiveDevice(el) {
        document.querySelectorAll('.device-btn').forEach(btn => btn.classList.remove('active'));
        el.classList.add('active');
    }

    // History
    document.getElementById('btn-undo').onclick = () => editor.UndoManager.undo();
    document.getElementById('btn-redo').onclick = () => editor.UndoManager.redo();

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-panel`).classList.remove('hidden');
        };
    });

    // Search
    document.getElementById('block-search').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        const blocks = editor.BlockManager.getAll();
        blocks.forEach(block => {
            const label = block.get('label').toLowerCase();
            const category = (block.get('category') || '').toLowerCase();
            const visible = label.includes(val) || category.includes(val);
            const el = block.get('el');
            if (el) el.style.display = visible ? 'flex' : 'none';
        });
    };

    // New Project
    document.getElementById('btn-new').onclick = async () => {
        const shouldReset = await showConfirm({
            title: 'Create New Project',
            message: 'All unsaved changes will be lost. Do you want to start from a fresh landing page?',
            confirmLabel: 'Start New Project',
            confirmClassName: 'btn-danger'
        });
        if (shouldReset) {
            editor.setComponents('');
            editor.setStyle('');
            const schoolId = CURRENT_SCHOOL?.id || 'unknown';
            localStorage.removeItem(`reetain-builder__${schoolId}__currentProject`);
            localStorage.removeItem(`reetain-builder__${schoolId}__gjsProject`);
            loadDefaultTemplate(editor);
        }
    };

    // Save
    document.getElementById('btn-save').onclick = async () => {
        const schoolId = CURRENT_SCHOOL?.id || 'unknown';
        const storageKey = `reetain-builder__${schoolId}__currentProject`;
        let projectName = localStorage.getItem(storageKey);
        
        const newName = await showPrompt({
            title: 'Save Project',
            message: `Choose a name for this ${CURRENT_SCHOOL?.name || 'school'} project.`,
            defaultValue: projectName || 'my-project',
            placeholder: 'my-project',
            confirmLabel: 'Save Project'
        });

        if (!newName) return;
        
        projectName = newName;
        localStorage.setItem(storageKey, projectName);

        // Naming convention: school-{id}__name
        const fullProjectName = `school-${schoolId}__${projectName}`;

        const projectData = {
            projectName: fullProjectName,
            html: editor.getHtml(),
            css: editor.getCss(),
            projectData: editor.getProjectData()
        };

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
            const result = await response.json();
            await showAlert({ title: 'Project Saved', message: result.message });
        } catch (e) {
            console.error('Save failed', e);
            await showAlert({ title: 'Save Failed', message: 'Error saving project' });
        }
    };

    // Preview
    document.getElementById('btn-preview').onclick = async () => {
        const schoolId = CURRENT_SCHOOL?.id || 'unknown';
        const storageKey = `reetain-builder__${schoolId}__currentProject`;
        let projectName = localStorage.getItem(storageKey);

        if (!projectName) {
            projectName = await showPrompt({
                title: 'Preview Project',
                message: 'Please name your project before previewing.',
                defaultValue: 'preview-project',
                placeholder: 'preview-project',
                confirmLabel: 'Open Preview'
            });
            if (!projectName) return;
            localStorage.setItem(storageKey, projectName);
        }

        const fullProjectName = `school-${schoolId}__${projectName}`;

        const projectData = {
            projectName: fullProjectName,
            html: editor.getHtml(),
            css: editor.getCss(),
            projectData: editor.getProjectData()
        };

        try {
            await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
            
            // Note: server.js handles project serving via Supabase or projects/ folder? 
            // Current server.js saves to Supabase but doesn't have a direct /projects/ route.
            // However, previous versions had projects folder.
            // Let's just show an alert for now if the preview route is not yet implemented on server.
            await showAlert({ title: 'Preview', message: 'Preview is being generated. You can find it in your project list.' });
        } catch (e) {
            console.error('Preview failed', e);
            await showAlert({ title: 'Preview Failed', message: 'Error preparing preview' });
        }
    };

    // Custom Block Creator
    btnCreateBlock.onclick = () => {
        openModal({
            title: 'Create New Custom Block',
            body: `
                <div class="form-group"><label>Block Label</label><input type="text" id="custom-block-label" placeholder="e.g. My Custom Section"></div>
                <div class="form-group"><label>HTML Content</label><textarea id="custom-block-html" rows="5" placeholder="<div>Your HTML here</div>"></textarea></div>
                <div class="form-group"><label>CSS Styles (Optional)</label><textarea id="custom-block-css" rows="3" placeholder=".my-class { color: red; }"></textarea></div>
                <p id="custom-block-error" class="modal-hint is-error hidden">Label and HTML are required.</p>
            `,
            actions: [
                { label: 'Cancel', className: 'btn-secondary', onClick: closeModal },
                {
                    label: 'Save to Library',
                    className: 'btn-primary',
                    onClick: () => {
                        const label = document.getElementById('custom-block-label').value.trim();
                        const html = document.getElementById('custom-block-html').value.trim();
                        const css = document.getElementById('custom-block-css').value;
                        const error = document.getElementById('custom-block-error');

                        if (!(label && html)) { error.classList.remove('hidden'); return; }
                        error.classList.add('hidden');

                        const content = `${html}<style>${css}</style>`;
                        editor.BlockManager.add(`custom-${Date.now()}`, { label, content, category: 'Custom Blocks', attributes: { class: 'gjs-fonts gjs-f-b1' } });
                        
                        const schoolId = CURRENT_SCHOOL?.id || 'global';
                        const customBlocks = JSON.parse(localStorage.getItem(`reetain-builder__${schoolId}__customBlocks`) || '[]');
                        customBlocks.push({ label, html, css });
                        localStorage.setItem(`reetain-builder__${schoolId}__customBlocks`, JSON.stringify(customBlocks));
                        closeModal();
                    }
                }
            ],
            onOpen: () => { document.getElementById('custom-block-label').focus(); }
        });
    };

    // Load custom blocks
    const schoolId = CURRENT_SCHOOL?.id || 'global';
    const savedCustomBlocks = JSON.parse(localStorage.getItem(`reetain-builder__${schoolId}__customBlocks`) || '[]');
    savedCustomBlocks.forEach((b, i) => {
        editor.BlockManager.add(`custom-saved-${i}`, {
            label: b.label,
            content: `${b.html}<style>${b.css}</style>`,
            category: 'Custom Blocks',
            attributes: { class: 'gjs-fonts gjs-f-b1' }
        });
    });
}

function initIcartSpecifics(editor) {
    console.log('🎭 ICART Specific Logic Initialized');
    
    editor.on('load', () => {
        setTimeout(() => {
            const bm = editor.BlockManager;
            const icartCat = bm.getCategories().find(c => (c.get('id') || '').includes('ICART'));
            if (icartCat) icartCat.set('open', true);
            
            bm.getCategories().forEach(c => {
                const catId = c.get('id') || '';
                if (!catId.includes('ICART') && !catId.includes('Essential')) {
                    c.set('open', false);
                }
            });
        }, 200);
    });
}

function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}