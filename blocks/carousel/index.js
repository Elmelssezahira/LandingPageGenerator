export default function(editor, categories) {
    editor.BlockManager.add('carousel', {
        label: 'Carrousel',
        category: categories.ESSENTIAL,
        content: `
            <section class="carousel-section">
                <div class="carousel-wrapper">
                    <h3 class="carousel-title">Nos Campus</h3>
                    <div class="carousel-track">
                        <div class="carousel-slide">
                            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80" alt="Campus Paris" class="slide-img">
                            <div class="slide-caption">Paris</div>
                        </div>
                        <div class="carousel-slide">
                            <img src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80" alt="Campus Lyon" class="slide-img">
                            <div class="slide-caption">Lyon</div>
                        </div>
                        <div class="carousel-slide">
                            <img src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80" alt="Campus Bordeaux" class="slide-img">
                            <div class="slide-caption">Bordeaux</div>
                        </div>
                    </div>
                </div>
            </section>
            <style>
                .carousel-section {
                    padding: 60px 0;
                    background: #fff;
                    font-family: 'Inter', sans-serif;
                }
                .carousel-wrapper {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 20px;
                }
                .carousel-title {
                    text-align: center;
                    font-size: 28px;
                    font-weight: 800;
                    margin-bottom: 30px;
                    color: #111;
                }
                .carousel-track {
                    display: flex;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    gap: 20px;
                    padding-bottom: 20px;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: thin;
                    scrollbar-color: #ccc transparent;
                }
                .carousel-track::-webkit-scrollbar {
                    height: 8px;
                }
                .carousel-track::-webkit-scrollbar-track {
                    background: transparent;
                }
                .carousel-track::-webkit-scrollbar-thumb {
                    background-color: #ccc;
                    border-radius: 10px;
                }
                .carousel-slide {
                    flex: 0 0 85%;
                    max-width: 600px;
                    scroll-snap-align: center;
                    position: relative;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }
                .slide-img {
                    width: 100%;
                    height: 350px;
                    object-fit: cover;
                    display: block;
                }
                .slide-caption {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    padding: 20px;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                    color: #fff;
                    font-size: 20px;
                    font-weight: 700;
                }
                @media (min-width: 768px) {
                    .carousel-slide {
                        flex: 0 0 45%;
                    }
                }
            </style>
        `,
        attributes: { class: 'gjs-fonts gjs-f-carousel' }
    });
}
