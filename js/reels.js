document.addEventListener('DOMContentLoaded', () => {
    const reelData = [
        { title: "Un protector solar que impresiona desde su primer uso", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DRigW-VETIT/", thumb: "./images/IG1.jpg" },
        { title: "¿Ya probaste la mascarilla que deja tu piel jugosa en minutos? 💧✨", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DMfzH0Es5_n/", thumb: "./images/IG2.jpg" },
        { title: " ¿Maquillaje resistente? No hay problema.", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DKQiYmRMX2i/", thumb: "./images/IG3.jpg" },
        { title: "¡Tu piel merece este mimo! ✨🥛", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DKM1w1FOWbz/", thumb: "./images/IG4.jpg" },
        { title: "¿Piel sensible, irritada o sedienta? 👀", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DR2mOK9EXWf/", thumb: "./images/IG5.jpg" },
        { title: "Dile adiós a los brotes y hola a una piel renovada.🧄💆‍♂️💆‍♀️✨️", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DR2ki7vEWEI/", thumb: "./images/IG6.jpg" },
        { title: "Ideal para todo tipo de piel, incluso las más sensibles.", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DMawIb-Re8I/", thumb: "./images/IG7.jpg" },
        { title: "Repara, nutre y deja la piel con un glow saludable", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DLp-KrMx9kZ/", thumb: "./images/IG8.jpg" },
        { title: "Calma, hidrata y transforma tu piel desde el primer uso.", platform: "instagram", icon: "fab fa-instagram", link: "https://www.instagram.com/reel/DMdQi4NRQnX/", thumb: "./images/IG9.jpg" }
    ];

    const wrapper = document.getElementById('reel-items-wrapper');
    if (!wrapper) return;

    const createReelCard = (item) => {
        return `
            <a href="${item.link}" target="_blank" class="reel-item" role="listitem">
                <div class="platform-badge"><i class="${item.icon}"></i></div>
                <img src="${item.thumb}" alt="${item.title}" class="reel-thumb" loading="lazy">
                <div class="reel-overlay"><h3>${item.title}</h3></div>
            </a>
        `;
    };

    const renderContent = () => {
        const contentHTML = reelData.map(item => createReelCard(item)).join('');
        // Duplicar para efecto marquee infinito
        wrapper.innerHTML = contentHTML + contentHTML;
    };

    renderContent();

    // Pausar animación al tocar en móviles
    wrapper.addEventListener('touchstart', () => { wrapper.style.animationPlayState = 'paused'; }, {passive: true});
    wrapper.addEventListener('touchend', () => { wrapper.style.animationPlayState = 'running'; });
});
