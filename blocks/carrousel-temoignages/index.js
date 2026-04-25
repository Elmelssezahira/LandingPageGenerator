export default function (editor, categories) {
    editor.BlockManager.add('CarrouselTemoignages', {
        label: 'Témoignages',
        category: categories.ESSENTIAL,
        content: {
            type: 'carrousel-temoignages-component',
            content: `
            <section class="ctm-section">

                <!-- Titre du bloc -->
                <div class="ctm-header">
                    <h2 class="ctm-title-bloc">Témoignages</h2>
                </div>

                <div class="ctm-container">
                    <div class="ctm-track">

                        <div class="ctm-slide">
                            <div class="ctm-media">
                                <img src="assets/cedric-humeau.webp" alt="Cédric Humeau"/>
                            </div>
                            <div class="ctm-content">
                                <blockquote class="ctm-quote">
                                    "La formation BRASSART m'a apporté toutes les connaissances nécessaires pour mon métier de Directeur Artistique."
                                </blockquote>
                                <div class="ctm-author">
                                    <img class="ctm-logo" src="assets/logo-carpool-studio.png" alt="Carpool Studio"/>
                                    <div class="ctm-author-info">
                                        <span class="ctm-name">Cédric Humeau</span>
                                        <span class="ctm-role">Art Director - BRASSART 1997</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="ctm-slide">
                            <div class="ctm-media">
                                <img src="assets/Antoine-Provost.jpg" alt="Antoine Provost"/>
                            </div>
                            <div class="ctm-content">
                                <blockquote class="ctm-quote">
                                    "BRASSART m'a permis de développer une vision créative forte et de m'intégrer rapidement dans le monde professionnel."
                                </blockquote>
                                <div class="ctm-author">
                                    <img class="ctm-logo" src="assets/logo-TBWA.png" alt="Agence"/>
                                    <div class="ctm-author-info">
                                        <span class="ctm-name">Antoine Provost</span>
                                        <span class="ctm-role">étudiant en Direction Artistique en alternance chez TBWA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="ctm-slide">
                            <div class="ctm-media">
                                <video controls poster="assets/temoignage-photo.jpg">
                                    <source src="assets/temoignage-video.mp4" type="video/mp4"/>
                                </video>
                            </div>
                            <div class="ctm-content">
                                <blockquote class="ctm-quote">
                                    "Rejoignez BRASSART, l'école des métiers de la création !"
                                </blockquote>
                                <div class="ctm-author">
                                    <img class="ctm-logo" src="assets/brassart-logo.png" alt="Studio"/>
                                    <div class="ctm-author-info">
                                        <span class="ctm-name">Léo &amp; Eliott en filière Animation 3D &amp; VFX</span>
                                        <span class="ctm-role">étudiants en filière Animation 3D &amp; VFX - BRASSART</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Navigation en dehors des cartes -->
                <div class="ctm-nav">
                    <button class="ctm-prev">&#8249;</button>
                    <button class="ctm-next">&#8250;</button>
                </div>

            </section>

            <style>
            * { box-sizing: border-box; }

            .ctm-section {
                padding: 60px 20px;
                background: #fff;
            }

            /* ── TITRE BLOC ── */
            .ctm-header {
                max-width: 900px;
                margin: 0 auto 32px auto;
            }

            .ctm-title-bloc {
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                color: #111;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* ── CONTAINER ── */
            .ctm-container {
                max-width: 900px;
                margin: auto;
                overflow: hidden;
            }

            .ctm-track {
                display: flex;
                transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            /* ── SLIDE ── */
            .ctm-slide {
                flex: 0 0 100%;
                display: flex;
                align-items: stretch;
                gap: 0;
            }

            /* ── MEDIA (photo / vidéo) ── */
            .ctm-media {
                flex: 0 0 40%;
                max-width: 40%;
                overflow: hidden;
            }

            .ctm-media img,
            .ctm-media video {
                width: 100%;
                height: 100%;
                object-fit: cover;
                display: block;
            }

            /* ── CONTENU ── */
            .ctm-content {
                flex: 1;
                padding: 36px 40px;
                border: 2px solid #c0175e;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 24px;
            }

            /* ── CITATION ── */
            .ctm-quote {
                margin: 0;
                font-size: 15px;
                line-height: 1.65;
                color: #222;
                font-style: normal;
            }

            /* ── AUTEUR ── */
            .ctm-author {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .ctm-logo {
                width: 64px;
                height: 64px;
                object-fit: contain;
                flex-shrink: 0;
            }

            .ctm-author-info {
                display: flex;
                flex-direction: column;
                gap: 3px;
            }

            .ctm-name {
                font-weight: 700;
                font-size: 13px;
                color: #111;
            }

            .ctm-role {
                font-size: 12px;
                color: #555;
            }

            /* ── NAV EXTERNE ── */
            .ctm-nav {
                text-align: center;
                margin-top: 24px;
            }

            .ctm-prev,
            .ctm-next {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                border: 2px solid #555;
                background: #fff;
                cursor: pointer;
                font-size: 22px;
                line-height: 1;
                transition: background 0.2s, color 0.2s, border-color 0.2s;
                color: #333;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin: 0 5px;
            }

            .ctm-prev:hover,
            .ctm-next:hover {
                background: #333;
                color: #fff;
                border-color: #333;
            }

            /* ── MOBILE ── */
            @media (max-width: 640px) {
                .ctm-slide {
                    flex-direction: column;
                }

                .ctm-media {
                    flex: none;
                    max-width: 100%;
                    width: 100%;
                    height: 260px;
                }

                .ctm-content {
                    padding: 24px 20px;
                    border-top: none;
                }
            }
            </style>
            `
        },
        attributes: { class: 'gjs-fonts gjs-f-carrousel-temoignages' }
    });

    editor.DomComponents.addType('carrousel-temoignages-component', {
        model: {
            defaults: {
                script: function () {
                    const el = this;
                    const track = el.querySelector('.ctm-track');
                    const prevBtn = el.querySelector('.ctm-prev');
                    const nextBtn = el.querySelector('.ctm-next');
                    const slides = track.querySelectorAll('.ctm-slide');
                    let index = 0;
                    const total = slides.length;

                    const update = () => {
                        const slideWidth = slides[0].offsetWidth;
                        track.style.transform = `translateX(-${index * slideWidth}px)`;
                    };

                    nextBtn.addEventListener('click', () => {
                        index = (index + 1) % total;
                        update();
                    });

                    prevBtn.addEventListener('click', () => {
                        index = (index - 1 + total) % total;
                        update();
                    });

                    window.addEventListener('resize', update);
                    update();
                }
            }
        }
    });
}