import { initStorage } from './storage.js';
import { initExport } from './export.js';
import { registerBlocks } from '../blocks/index.js';

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
    document.getElementById('btn-new').onclick = () => {
        if (confirm('Are you sure? All unsaved changes will be lost.')) {
            editor.setComponents('');
            editor.setStyle('');
            localStorage.removeItem('efap-brassart-builder__currentProject');
            localStorage.removeItem('efap-brassart-builder__gjsProject');
            loadDefaultTemplate(editor);
        }
    };

    // Save Project with folder architecture
    document.getElementById('btn-save').onclick = async () => {
        let projectName = localStorage.getItem('efap-brassart-builder__currentProject');
        
        // Always ask if they want a new name or use current
        const newName = prompt('Enter project name:', projectName || 'my-project');
        if (!newName) return;
        
        projectName = newName;
        localStorage.setItem('efap-brassart-builder__currentProject', projectName);

        const projectData = {
            projectName,
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
            alert(result.message);
        } catch (e) {
            console.error('Save failed', e);
            alert('Error saving project');
        }
    };

    // Preview: Exit builder and show real page
    document.getElementById('btn-preview').onclick = async () => {
        let projectName = localStorage.getItem('efap-brassart-builder__currentProject');
        if (!projectName) {
            projectName = prompt('Please name your project before previewing:', 'preview-project');
            if (!projectName) return;
            localStorage.setItem('efap-brassart-builder__currentProject', projectName);
        }

        // Save first to ensure preview is up to date
        const projectData = {
            projectName,
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
            
            // Open the real page in a new window
            window.open(`/projects/${projectName}/index.html`, '_blank');
        } catch (e) {
            console.error('Preview failed', e);
            alert('Error preparing preview');
        }
    };

    // Custom Block Creator
    const modal = document.getElementById('modal-container');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    const btnCreateBlock = document.getElementById('btn-create-block');
    const closeModalBtns = document.querySelectorAll('.close-modal');

    btnCreateBlock.onclick = () => {
        modalTitle.innerText = 'Create New Custom Block';
        modalBody.innerHTML = `
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
            <button class="btn-primary w-100" id="btn-save-custom-block">Save to Library</button>
        `;
        modal.classList.remove('hidden');

        document.getElementById('btn-save-custom-block').onclick = () => {
            const label = document.getElementById('custom-block-label').value;
            const html = document.getElementById('custom-block-html').value;
            const css = document.getElementById('custom-block-css').value;

            if (label && html) {
                const content = `${html}<style>${css}</style>`;
                editor.BlockManager.add(`custom-${Date.now()}`, {
                    label,
                    content,
                    category: 'Custom Blocks',
                    attributes: { class: 'gjs-fonts gjs-f-b1' }
                });
                
                // Persistence for custom blocks
                const customBlocks = JSON.parse(localStorage.getItem('efap-brassart-builder__customBlocks') || '[]');
                customBlocks.push({ label, html, css });
                localStorage.setItem('efap-brassart-builder__customBlocks', JSON.stringify(customBlocks));

                modal.classList.add('hidden');
            } else {
                alert('Label and HTML are required');
            }
        };
    };

    closeModalBtns.forEach(btn => {
        btn.onclick = () => modal.classList.add('hidden');
    });

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
