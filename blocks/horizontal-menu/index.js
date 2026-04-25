export default function(editor, categories) {
    editor.BlockManager.add('horizontal-menu', {
        label: 'Horizontal Menu',
        category: categories.ESSENTIAL,
        content: `
            <div class="hm-wrapper">
                <div class="hm-band-top"></div>
                <nav class="hm-nav-bar">
                    <div class="hm-scroll-container">
                        <ul class="hm-nav-list">
                            <li><a href="#pourquoi-brassart" class="hm-nav-item">Pourquoi BRASSART</a></li>
                            <li><a href="#programmes" class="hm-nav-item">Programmes</a></li>
                            <li><a href="#metiers" class="hm-nav-item">Métiers</a></li>
                            <li><a href="#insertion-professionnelle" class="hm-nav-item">Insertion professionnelle</a></li>
                            <li><a href="#reconnaissance" class="hm-nav-item">Reconnaissance</a></li>
                            <li><a href="#pedagogie" class="hm-nav-item">Pédagogie</a></li>
                            <li><a href="#international" class="hm-nav-item">International</a></li>
                            <li><a href="#evenements" class="hm-nav-item">Événements</a></li>
                            <li><a href="#campus" class="hm-nav-item">Campus</a></li>
                            <li><a href="#admission" class="hm-nav-item">Admission</a></li>
                            <li><a href="#faq" class="hm-nav-item">Foire aux questions</a></li>
                        </ul>
                    </div>
                </nav>
                <div class="hm-band-bottom"></div>
            </div>
            <style>
                .hm-wrapper {
                    width: 100%;
                    position: relative;
                    /* Ajout de coins arrondis si c'est un bloc isolé comme sur l'image */
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .hm-band-top {
                    width: 100%;
                    height: 45px;
                    background-color: #A8174F;
                }
                .hm-band-bottom {
                    display: none; /* Masqué sur Desktop */
                }
                .hm-nav-bar {
                    background-color: #ffffff;
                    border-bottom: 1px solid #eaeaea;
                    position: sticky;
                    top: 0;
                    z-index: 999;
                    font-family: 'Inter', Arial, sans-serif;
                }
                .hm-scroll-container {
                    width: 100%;
                    overflow-x: auto;
                    padding: 15px 10px; /* Laisse 10px par rapport au début */
                    -webkit-overflow-scrolling: touch;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hm-scroll-container::-webkit-scrollbar {
                    display: none;
                }
                .hm-nav-list {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    gap: 20px; /* Espace entre les éléments */
                }
                .hm-nav-list li {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                }
                .hm-nav-item {
                    color: #000000;
                    text-decoration: none;
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    transition: color 0.3s ease;
                    display: block;
                    position: relative;
                    padding-bottom: 4px;
                }
                /* Hover effect */
                .hm-nav-item::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: 0;
                    left: 0;
                    background-color: #A8174F;
                    transition: width 0.3s ease;
                }
                .hm-nav-item:hover {
                    color: #A8174F;
                }
                .hm-nav-item:hover::after {
                    width: 100%;
                }
                @media (max-width: 768px) {
                    /* On affiche la bande du bas sur mobile */
                    .hm-band-bottom {
                        display: block;
                        width: 100%;
                        height: 45px;
                        background-color: #A8174F;
                    }
                    /* Espacement mobile */
                    .hm-nav-list {
                        gap: 25px; 
                    }
                    /* N'afficher que Pourquoi BRASSART et Programmes sur mobile */
                    .hm-nav-list li:nth-child(n+3) {
                        display: none;
                    }
                    .hm-nav-item {
                        font-size: 14px;
                        text-transform: none; /* Titre normal sur mobile */
                        font-weight: 600;
                    }
                }
            </style>
        `,
        attributes: { class: 'gjs-fonts gjs-f-b1' }
    });
}
