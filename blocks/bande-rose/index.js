export default function(editor, categories) {
    editor.BlockManager.add('bande-rose', {
        label: 'Bande Rose',
        category: categories.BRASSART,
        content: `
            <section class="bande-rose-wrapper">
                <div class="bande-rose-content">
                    <img src="https://via.placeholder.com/600x120/A8174F/FFFFFF?text=Image+Bande+Rose" alt="Bande" class="bande-rose-img" />
                </div>
            </section>
            <style>
                .bande-rose-wrapper {
                    background-color: #A8174F;
                    width: 100%;
                    min-height: 80px;
                    display: flex;
                    justify-content: center;
                    align-items: stretch;
                    position: relative;
                    overflow: hidden;
                }
                .bande-rose-content {
                    width: 100%;
                    max-width: 1200px;
                    margin: 0 auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .bande-rose-img {
                    max-height: 120px;
                    width: auto;
                    object-fit: cover;
                    display: block;
                }
                @media (max-width: 768px) {
                    .bande-rose-wrapper {
                        min-height: 60px;
                    }
                    .bande-rose-img {
                        display: none; /* On mobile, usually it's just the pink pattern according to your mockup */
                    }
                }
            </style>
        `,
        attributes: { class: 'gjs-fonts gjs-f-b1' }
    });
}
