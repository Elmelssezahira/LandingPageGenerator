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
    default: 'assets/block-thumbnails/default.svg'
};

document.addEventListener('DOMContentLoaded', () => {
    const editor = grapesjs.init({
        container: '#gjs',
        height: '100%',
        width: 'auto',
        storageManager: {
            type: 'local',
            autosave: true,
            stepsBeforeSave: 1,
            key: 'efap-brassart-builder__gjsProject',
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
            defaults: [], // We use our own UI
        },
        deviceManager: {
            devices: [
                {
                    name: 'Desktop',
                    width: '', // default
                },
                {
                    name: 'Tablet',
                    width: '600px',
                    widthMedia: '600px',
                },
                {
                    name: 'Mobile',
                    width: '375px',
                    widthMedia: '375px',
                },
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

    editor.on('load', () => {
        // If there's no component in the wrapper, it's a new or empty project
        const wrapper = editor.getWrapper();
        if (!wrapper || wrapper.components().length === 0) {
            loadDefaultTemplate(editor);
        }
    });

    // Global access for debugging
    window.editor = editor;
});

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
    
    // Structure fidèle aux maquettes HubSpot client :
    // Header → Hero → Programme → 3 Bonnes Raisons → Formulaire → CTA → Footer
    const defaultBlocks = [
        'header-brassart',
        'hero',
        'bande-rose',
        'horizontal-menu',
        'programme-list',
        'trois-raisons',
        'form-sfmc',
        'cta-button',
        'footer-brassart'
    ];
    
    defaultBlocks.forEach(blockId => {
        const block = editor.BlockManager.get(blockId);
        if (block) {
            editor.addComponents(block.get('content'));
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
    const welcomeStorageKey = 'efap-brassart-builder__hideWelcome';

    function closeWelcome() {
        if (welcomeDismissToggle.checked) {
            localStorage.setItem(welcomeStorageKey, 'true');
        }

        welcomeOverlay.classList.add('hidden');
    }

    if (localStorage.getItem(welcomeStorageKey) !== 'true') {
        welcomeOverlay.classList.remove('hidden');
    }

    welcomeStartButton.onclick = closeWelcome;

    function closeModal() {
        modal.classList.add('hidden');
        modalTitle.textContent = '';
        modalBody.innerHTML = '';
        modalFooter.innerHTML = '';
        modalCloseButton.style.display = '';
        delete modal.dataset.dismissible;
    }

    function openModal({
        title,
        body = '',
        actions = [],
        dismissible = true,
        onOpen
    }) {
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

        if (onOpen) {
            onOpen();
        }
    }

    function showAlert({
        title = 'Notice',
        message,
        confirmLabel = 'OK'
    }) {
        return new Promise(resolve => {
            openModal({
                title,
                body: `<p class="modal-message">${message}</p>`,
                actions: [
                    {
                        label: confirmLabel,
                        className: 'btn-primary',
                        onClick: () => {
                            closeModal();
                            resolve();
                        }
                    }
                ]
            });
        });
    }

    function showConfirm({
        title = 'Confirm action',
        message,
        confirmLabel = 'Continue',
        cancelLabel = 'Cancel',
        confirmClassName = 'btn-primary'
    }) {
        return new Promise(resolve => {
            openModal({
                title,
                body: `<p class="modal-message">${message}</p>`,
                actions: [
                    {
                        label: cancelLabel,
                        className: 'btn-secondary',
                        onClick: () => {
                            closeModal();
                            resolve(false);
                        }
                    },
                    {
                        label: confirmLabel,
                        className: confirmClassName,
                        onClick: () => {
                            closeModal();
                            resolve(true);
                        }
                    }
                ]
            });
        });
    }

    function showPrompt({
        title,
        message,
        defaultValue = '',
        placeholder = '',
        confirmLabel = 'OK',
        cancelLabel = 'Cancel'
    }) {
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
                    <input
                        id="${inputId}"
                        class="modal-input"
                        type="text"
                        value="${escapeHtml(defaultValue)}"
                        placeholder="${escapeHtml(placeholder)}"
                    >
                `,
                actions: [
                    {
                        label: cancelLabel,
                        className: 'btn-secondary',
                        onClick: () => {
                            closeModal();
                            resolve(null);
                        }
                    },
                    {
                        label: confirmLabel,
                        className: 'btn-primary',
                        onClick: submit
                    }
                ],
                onOpen: () => {
                    const input = document.getElementById(inputId);
                    input.focus();
                    input.select();
                    input.addEventListener('keydown', event => {
                        if (event.key === 'Enter') {
                            event.preventDefault();
                            submit();
                        }
                    });
                }
            });
        });
    }

    modalCloseButton.onclick = closeModal;
    modal.onclick = event => {
        if (event.target === modal && modal.dataset.dismissible !== 'false') {
            closeModal();
        }
    };

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden') && modal.dataset.dismissible !== 'false') {
            closeModal();
        }
    });

    // Device Switcher
    const deviceDesktop = document.getElementById('device-desktop');
    const deviceTablet = document.getElementById('device-tablet');
    const deviceMobile = document.getElementById('device-mobile');

    deviceDesktop.onclick = () => {
        editor.setDevice('Desktop');
        setActiveDevice(deviceDesktop);
    };
    deviceTablet.onclick = () => {
        editor.setDevice('Tablet');
        setActiveDevice(deviceTablet);
    };
    deviceMobile.onclick = () => {
        editor.setDevice('Mobile');
        setActiveDevice(deviceMobile);
    };

    function setActiveDevice(el) {
        document.querySelectorAll('.device-btn').forEach(btn => btn.classList.remove('active'));
        el.classList.add('active');
    }

    // Undo/Redo
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

    // Block Search
    document.getElementById('block-search').oninput = (e) => {
        const val = e.target.value.toLowerCase();
        const blocks = editor.BlockManager.getAll();
        blocks.forEach(block => {
            const label = block.get('label').toLowerCase();
            const category = (block.get('category') || '').toLowerCase();
            const visible = label.includes(val) || category.includes(val);
            // GrapesJS doesn't have a direct "hide" method for blocks in DOM if appendTo is used, 
            // but we can toggle a class on the block element.
            const el = block.get('el');
            if (el) {
                el.style.display = visible ? 'flex' : 'none';
            }
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
            localStorage.removeItem('efap-brassart-builder__currentProject');
            localStorage.removeItem('efap-brassart-builder__gjsProject');
            loadDefaultTemplate(editor);
        }
    };

    const CURRENT_KEY = 'efap-brassart-builder__currentProject';

    function buildPreviewHtml(name, html, css) {
        const baseHref = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}`;
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <base href="${baseHref}">
    <title>${escapeHtml(name)}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>${css}</style>
</head>
<body>${html}</body>
</html>`;
    }

    // Save Project (Supabase via /api/save)
    document.getElementById('btn-save').onclick = async () => {
        const current = localStorage.getItem(CURRENT_KEY);

        const projectName = await showPrompt({
            title: 'Enregistrer le projet',
            message: 'Donnez un nom à cette landing page. Réutiliser un nom existant le mettra à jour.',
            defaultValue: current || 'mon-projet',
            placeholder: 'mon-projet',
            confirmLabel: 'Enregistrer'
        });

        if (!projectName) return;

        try {
            const response = await fetch('/api/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectName,
                    html: editor.getHtml(),
                    css: editor.getCss(),
                    projectData: editor.getProjectData()
                })
            });

            if (!response.ok) {
                throw new Error(`status ${response.status}`);
            }

            localStorage.setItem(CURRENT_KEY, projectName);
            await showAlert({
                title: 'Projet enregistré',
                message: `"${projectName}" a bien été sauvegardé.`
            });
        } catch (e) {
            console.error('Save failed', e);
            await showAlert({
                title: 'Sauvegarde impossible',
                message: 'Nous n\'avons pas pu enregistrer votre projet. Vérifiez votre connexion puis réessayez.'
            });
        }
    };

    // Preview: open a Blob URL in a new tab (no server-side preview)
    document.getElementById('btn-preview').onclick = () => {
        const name = localStorage.getItem(CURRENT_KEY) || 'preview';
        const fullHtml = buildPreviewHtml(name, editor.getHtml(), editor.getCss());
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
    };

    // Open saved project (from Supabase)
    document.getElementById('btn-open').onclick = async () => {
        let projects;
        try {
            const response = await fetch('/api/projects');
            if (!response.ok) throw new Error(`status ${response.status}`);
            projects = await response.json();
        } catch (e) {
            console.error('Fetch projects failed', e);
            await showAlert({
                title: 'Liste indisponible',
                message: 'Impossible de récupérer vos projets pour l\'instant. Vérifiez votre connexion puis réessayez.'
            });
            return;
        }

        if (!projects || projects.length === 0) {
            await showAlert({
                title: 'Aucun projet enregistré',
                message: 'Vous n\'avez encore aucun projet sauvegardé. Cliquez sur "Save Project" pour en créer un.'
            });
            return;
        }

        projects.sort((a, b) =>
            (b.created_at || '').localeCompare(a.created_at || '')
        );

        const list = projects.map(p => {
            const created = p.created_at
                ? new Date(p.created_at).toLocaleString()
                : '';
            return `
                <li class="project-row">
                    <div class="project-row__info">
                        <strong>${escapeHtml(p.project_name)}</strong>
                        <span class="project-row__date">${escapeHtml(created)}</span>
                    </div>
                    <div class="project-row__actions">
                        <button type="button" class="btn-secondary" data-load="${escapeHtml(p.project_name)}">Ouvrir</button>
                    </div>
                </li>`;
        }).join('');

        openModal({
            title: 'Ouvrir un projet',
            body: `<ul class="project-list">${list}</ul>`,
            actions: [
                { label: 'Fermer', className: 'btn-secondary', onClick: closeModal }
            ],
            onOpen: () => {
                modalBody.querySelectorAll('[data-load]').forEach(btn => {
                    btn.onclick = async () => {
                        const name = btn.dataset.load;
                        try {
                            const r = await fetch(`/api/project/${encodeURIComponent(name)}`);
                            if (!r.ok) throw new Error(`status ${r.status}`);
                            const project = await r.json();
                            const projectData = typeof project.project_data === 'string'
                                ? JSON.parse(project.project_data)
                                : project.project_data;

                            if (projectData) {
                                editor.loadProjectData(projectData);
                            } else {
                                editor.setComponents(project.html || '');
                                editor.setStyle(project.css || '');
                            }
                            localStorage.setItem(CURRENT_KEY, project.project_name);
                            closeModal();
                        } catch (err) {
                            console.error('Load project failed', err);
                            closeModal();
                            await showAlert({
                                title: 'Ouverture impossible',
                                message: 'Le projet n\'a pas pu être chargé. Réessayez dans un instant.'
                            });
                        }
                    };
                });
            }
        });
    };

    // Import JSON: load a previously exported project.json (local backup)
    document.getElementById('import-json').onclick = (e) => {
        e.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.onchange = async () => {
            const file = input.files && input.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                editor.loadProjectData(data);
                await showAlert({
                    title: 'Projet importé',
                    message: `"${file.name}" a bien été chargé. Cliquez sur "Save Project" pour le conserver.`
                });
            } catch (err) {
                console.error('Import failed', err);
                await showAlert({
                    title: 'Import impossible',
                    message: 'Ce fichier ne semble pas être un projet valide. Choisissez un fichier JSON exporté depuis ce builder.'
                });
            }
        };
        input.click();
    };

    // Custom Block Creator
    btnCreateBlock.onclick = () => {
        openModal({
            title: 'Create New Custom Block',
            body: `
                <div class="form-group">
                    <label>Block Label</label>
                    <input type="text" id="custom-block-label" placeholder="e.g. My Custom Section">
                </div>
                <div class="form-group">
                    <label>HTML Content</label>
                    <textarea id="custom-block-html" rows="5" placeholder="<div>Your HTML here</div>"></textarea>
                </div>
                <div class="form-group">
                    <label>CSS Styles (Optional)</label>
                    <textarea id="custom-block-css" rows="3" placeholder=".my-class { color: red; }"></textarea>
                </div>
                <p id="custom-block-error" class="modal-hint is-error hidden">Label and HTML are required.</p>
            `,
            actions: [
                {
                    label: 'Cancel',
                    className: 'btn-secondary',
                    onClick: closeModal
                },
                {
                    label: 'Save to Library',
                    className: 'btn-primary',
                    onClick: () => {
                        const label = document.getElementById('custom-block-label').value.trim();
                        const html = document.getElementById('custom-block-html').value.trim();
                        const css = document.getElementById('custom-block-css').value;
                        const error = document.getElementById('custom-block-error');

                        if (!(label && html)) {
                            error.classList.remove('hidden');
                            return;
                        }

                        error.classList.add('hidden');

                        const content = `${html}<style>${css}</style>`;
                        editor.BlockManager.add(`custom-${Date.now()}`, {
                            label,
                            content,
                            category: 'Custom Blocks',
                            attributes: { class: 'gjs-fonts gjs-f-b1' }
                        });
                        
                        const customBlocks = JSON.parse(localStorage.getItem('efap-brassart-builder__customBlocks') || '[]');
                        customBlocks.push({ label, html, css });
                        localStorage.setItem('efap-brassart-builder__customBlocks', JSON.stringify(customBlocks));

                        closeModal();
                    }
                }
            ],
            onOpen: () => {
                document.getElementById('custom-block-label').focus();
            }
        });
    };

    // Load custom blocks on start
    const savedCustomBlocks = JSON.parse(localStorage.getItem('efap-brassart-builder__customBlocks') || '[]');
    savedCustomBlocks.forEach((b, i) => {
        editor.BlockManager.add(`custom-saved-${i}`, {
            label: b.label,
            content: `${b.html}<style>${b.css}</style>`,
            category: 'Custom Blocks',
            attributes: { class: 'gjs-fonts gjs-f-b1' }
        });
    });
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
