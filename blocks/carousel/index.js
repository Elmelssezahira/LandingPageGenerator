export default function (editor, categories) {
    editor.BlockManager.add('Carrousel', {
        label: 'Carrousel',
        category: categories.ESSENTIAL,
        content: {
            type: 'carrousel-component',
            content: `
            <section class="carrous-section">
                <div class="carrous-container">
                    <div class="carrous-track">

                        <div class="carrous-card orange">
                            <div class="card-inner">
                                <div class="card-header">CLASSE PRÉPARATOIRE<br>ARTS APPLIQUÉS</div>
                                    <img src="assets/classe-preparatoire.jpg"/>
                                <div class="card-body">
                                    La classe préparatoire en Arts Appliqués est une année pluridisciplinaire accessible après le Bac. Elle permet d'acquérir les fondamentaux de la conception de l'image, du graphisme et de la création digitale.
                                </div>
                            </div>
                        </div>

                        <div class="carrous-card pink">
                            <div class="card-inner">
                                <div class="card-header">DIRECTION ARTISTIQUE</div>
                                    <img src="assets/direction-artistique.jpg"/>
                                <div class="card-body">
                                    Le programme Direction Artistique a pour objectif de former des futurs professionnels capables de créer et penser de nouvelles expériences utilisateurs qu'elles soient digitales ou physiques.
                                    <ul>
                                        <li>Cursus en 5 ans</li>
                                        <li>Classe Préparatoire en Arts appliqués</li>
                                        <li>Cursus en anglais possible (Nantes)</li>
                                        <li>Alternance en 5e année</li>
                                        <li>2 spécialisations dès la 4ème année : interactivité &amp; innovation et Espaces &amp; Concepts immersifs</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="carrous-card purple">
                            <div class="card-inner">
                                <div class="card-header">ANIMATION 3D &amp; IMMERSION</div>
                                <img src="assets/animation-3d-immersion.jpg"/>
                                <div class="card-body">
                                    Le programme Animation 3D &amp; Immersion forme des experts de la 3D capables de concevoir des expériences visuelles immersives pour le jeu vidéo, l'animation, la publicité, l'architecture, la santé...
                                    <ul>
                                        <li>Cursus en 5 ans</li>
                                        <li>Classe Préparatoire en Arts appliqués</li>
                                        <li>Double Diplôme possible à Montréal en partenariat avec NAD-UQAC</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="carrous-card orange">
                            <div class="card-inner">
                                <div class="card-header">DESIGN GRAPHIQUE</div>
                                <img src="assets/design-graphique.jpg"/>
                                <div class="card-body">
                                    Le programme Design Graphique forme des concepteurs visuels capables de répondre aux enjeux de communication actuels, du print au digital.
                                    <ul>
                                        <li>Cursus en 5 ans</li>
                                        <li>Spécialisation identité de marque</li>
                                        <li>Projets en partenariat avec des entreprises</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="carrous-nav">
                    <button class="carrous-prev">&#8249;</button>
                    <button class="carrous-next">&#8250;</button>
                </div>
            </section>

            <style>
            * { box-sizing: border-box; }

            .carrous-section {
                padding: 60px 20px;
            }

            .carrous-container {
                max-width: 1100px;
                margin: auto;
                overflow: hidden;
            }

            .carrous-track {
                display: flex;
                transition: transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            }

            /* Desktop → 3 cartes */
            .carrous-card {
                flex: 0 0 calc(100% / 3);
                padding: 8px;
            }

            .card-inner {
                background: #fff;
                border: 2px solid;
                height: 100%;
                display: flex;
                flex-direction: column;
            }

            .card-header {
                color: #fff;
                padding: 14px 16px;
                font-weight: 700;
                font-size: 13px;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                line-height: 1.3;
                min-height: 56px;
                display: flex;
                align-items: center;
            }

            .card-inner img {
                width: 100%;
                height: 200px;
                object-fit: cover;
                display: block;
            }

            .card-body {
                padding: 16px;
                font-size: 13.5px;
                color: #333;
                line-height: 1.6;
                flex: 1;
            }

            .card-body ul {
                margin-top: 10px;
                padding-left: 0;
                list-style: none;
            }

            .card-body ul li::before {
                content: "• ";
            }

            /* COLORS */
            .orange .card-inner { border-color: #e8891a; }
            .orange .card-header { background: #e8891a; }

            .pink .card-inner { border-color: #c0175e; }
            .pink .card-header { background: #c0175e; }

            .purple .card-inner { border-color: #8B3FA8; }
            .purple .card-header { background: #8B3FA8; }

            /* NAV */
            .carrous-nav {
                text-align: center;
                margin-top: 24px;
            }

            .carrous-prev,
            .carrous-next {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                border: 2px solid #555;
                background: #fff;
                cursor: pointer;
                font-size: 22px;
                line-height: 1;
                margin: 0 5px;
                transition: background 0.2s, color 0.2s;
                color: #333;
            }

            .carrous-prev:hover,
            .carrous-next:hover {
                background: #333;
                color: #fff;
            }

            /* Tablette → 2 cartes */
            @media (max-width: 1024px) and (min-width: 581px) {
                .carrous-card {
                    flex: 0 0 50%;
                }
            }

            /* Mobile → 1 carte */
            @media (max-width: 580px) {
                .carrous-card {
                    flex: 0 0 100%;
                }
            }
            </style>
            `
        },
        attributes: { class: 'gjs-fonts gjs-f-carrousel' }
    });

    editor.DomComponents.addType('carrousel-component', {
        model: {
            defaults: {
                script: function() {
                    const el = this;
                    const track = el.querySelector('.carrous-track');
                    const nextBtn = el.querySelector('.carrous-next');
                    const prevBtn = el.querySelector('.carrous-prev');
                    let index = 0;

                    function getVisible() {
                        if (window.innerWidth <= 580) return 1;
                        if (window.innerWidth <= 1024) return 2;
                        return 3;
                    }

                    const update = () => {
                        const itemsVisible = getVisible();
                        const cardWidth = track.firstElementChild.offsetWidth;
                        const maxIndex = track.children.length - itemsVisible;

                        if (index > maxIndex) index = maxIndex;
                        if (index < 0) index = 0;

                        track.style.transform = `translateX(-${index * cardWidth}px)`;
                    };

                    nextBtn.addEventListener('click', () => {
                        const itemsVisible = getVisible();
                        if (index < track.children.length - itemsVisible) {
                            index++;
                        } else {
                            index = 0;
                        }
                        update();
                    });

                    prevBtn.addEventListener('click', () => {
                        if (index > 0) {
                            index--;
                        } else {
                            const itemsVisible = getVisible();
                            index = track.children.length - itemsVisible;
                        }
                        update();
                    });

                    window.addEventListener('resize', () => {
                        update();
                    });

                    update();
                }
            }
        }
    });
}