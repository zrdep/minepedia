document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const cardContainer = document.querySelector('.card-container');
    const loadMoreButton = document.querySelector('.load-more-button');
    const backToTopButton = document.getElementById('back-to-top');
    const tagMenu = document.querySelector('.tag-menu ul');
    const searchInput = document.querySelector('.search-container input');
    const searchButton = document.querySelector('.search-button');

    // Estado da aplicação
    let allItems = [];
    let filteredItems = [];
    let itemsToShow = 9;
    let currentSearchTerm = '';
    let currentFilterTag = null;

    // Funções de cards com animações variadas
    function createCard(item, relativeIndex = 0) {
        const card = document.createElement('article');
        card.className = 'card';
        
        // Animação simples
        card.className = 'card card-animation-1';
        
        card.innerHTML = `
            <div class="card-tags">
                ${item.tags.slice(0, 2).map(tag => `<span>${tag}</span>`).join('')}
            </div>
            <h2>${item.nome}</h2>
            <p><strong>Versão:</strong> ${item.data_criacao}</p>
            <p>${item.descricao}</p>
            <a href="${item.link}" target="_blank">Saiba Mais</a>
        `;
        
        // Delay baseado no índice relativo (dentro do grupo que está sendo adicionado)
        // Limitar delay máximo para não demorar muito
        card.style.animationDelay = `${relativeIndex * 0.05}s`;
        
        return card;
    }

    function renderCards(append = false) {
        // Se não for para adicionar, limpa tudo
        if (!append) {
            cardContainer.innerHTML = '';
        }
        
        const itemsToRender = filteredItems.slice(0, itemsToShow);
        
        if (itemsToRender.length === 0 && !append) {
            cardContainer.innerHTML = `
                <div class="no-results" style="animation: fadeInScale 0.5s ease-out;">
                    <p>🔍 Nenhum item encontrado!</p>
                    <p>Tente buscar por outro termo ou filtrar por tags.</p>
                </div>
            `;
            loadMoreButton.style.display = 'none';
            return;
        }
        
        // Se estiver adicionando, só adiciona os novos cards
        const startIndex = append ? cardContainer.children.length : 0;
        const itemsToAdd = append ? filteredItems.slice(startIndex, itemsToShow) : itemsToRender;
        
        // Usar índice relativo (0-8 para os novos cards) ao invés de absoluto
        itemsToAdd.forEach((item, relativeIndex) => {
            const card = createCard(item, relativeIndex);
            cardContainer.appendChild(card);
        });
        
        // Mostrar/ocultar botão com animação
        if (itemsToShow >= filteredItems.length) {
            loadMoreButton.style.display = 'none';
        } else {
            loadMoreButton.style.display = 'inline-block';
            // Reiniciar animação ao mostrar botão
            if (!append) {
                loadMoreButton.style.animation = 'none';
                setTimeout(() => {
                    loadMoreButton.style.animation = 'fadeInScale 0.5s ease-out forwards';
                }, 10);
            }
        }
    }

    function performSearch(term) {
        currentSearchTerm = term.toLowerCase().trim();
        applyFilters();
    }

    function applyFilter(tag) {
        currentFilterTag = tag;
        applyFilters();
    }

    function applyFilters() {
        itemsToShow = 9;
        let filtered = [...allItems];
        
        // Aplicar filtro de tag
        if (currentFilterTag) {
            filtered = filtered.filter(item => item.tags.includes(currentFilterTag));
        }
        
        // Aplicar busca
        if (currentSearchTerm) {
            filtered = filtered.filter(item => 
                item.nome.toLowerCase().includes(currentSearchTerm) ||
                item.descricao.toLowerCase().includes(currentSearchTerm) ||
                item.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm))
            );
        }
        
        filteredItems = filtered;
        renderCards();
        updateStats();
        
        // Notificações removidas para manter simplicidade
    }
    
    function updateStats() {
        const statsElement = document.querySelector('.stats-counter');
        if (statsElement) {
            statsElement.textContent = `${filteredItems.length} de ${allItems.length} itens`;
        }
    }

    // Carregar dados
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allItems = data;
            applyFilters();
            updateStats();
        });

    // Busca
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });

    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '') {
            performSearch('');
        }
    });

    // Event listeners - Cards
    loadMoreButton.addEventListener('click', () => {
        const previousCount = itemsToShow;
        itemsToShow += 9;
        renderCards(true); // Passa true para indicar que é para adicionar, não substituir
    });

    tagMenu.addEventListener('click', (e) => {
        e.preventDefault();
        const clickedTag = e.target;
        
        if (clickedTag.classList.contains('clear-filter-button')) {
            tagMenu.querySelectorAll('a').forEach(tag => tag.classList.remove('active'));
            currentFilterTag = null;
            applyFilters();
        } else if (clickedTag.dataset.tag) {
            tagMenu.querySelectorAll('a').forEach(tag => tag.classList.remove('active'));
            clickedTag.classList.add('active');
            applyFilter(clickedTag.dataset.tag);
        }
    });

    // Event listeners - Scroll
    window.addEventListener('scroll', () => {
        backToTopButton.classList.toggle('show', window.scrollY > 300);
    });

    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Player de Música
    const backgroundMusic = document.getElementById('background-music');
    const volumeSlider = document.getElementById('volume-slider');
    const muteButton = document.getElementById('mute-button');
    const clickSound = new Audio('sounds/click.mp3');
    clickSound.volume = 0.5;

    // Fade-in do volume quando a música começar
    function fadeInVolume() {
        backgroundMusic.volume = 0;
        const targetVolume = parseInt(volumeSlider.value, 10) / 100;
        const fadeDuration = 5000;
        const steps = 50;
        const stepTime = fadeDuration / steps;
        const volumeIncrement = targetVolume / steps;
        let currentStep = 0;
        
        const volumeInterval = setInterval(() => {
            currentStep++;
            backgroundMusic.volume += volumeIncrement;
            if (currentStep >= steps) {
                backgroundMusic.volume = targetVolume;
                clearInterval(volumeInterval);
            }
        }, stepTime);
    }

    // Configuração do volume
    function setVolume() {
        backgroundMusic.volume = volumeSlider.value / 100;
        updateMuteButton();
    }

    function updateMuteButton() {
        const muteImage = muteButton.querySelector('img');
        muteImage.style.opacity = (backgroundMusic.volume === 0 || backgroundMusic.muted) ? '0.5' : '1';
    }

    function toggleMute() {
        backgroundMusic.muted = !backgroundMusic.muted;
        updateMuteButton();
    }

    // Tenta tocar a música automaticamente
    backgroundMusic.addEventListener('play', fadeInVolume, { once: true });
    backgroundMusic.play().catch(() => {
        // Se falhar, tenta novamente após um pequeno delay
        setTimeout(() => backgroundMusic.play().catch(() => {}), 100);
    });

    // Event listeners
    volumeSlider.addEventListener('input', setVolume);
    muteButton.addEventListener('click', toggleMute);
    setVolume();

    // Efeitos sonoros de clique
    document.querySelectorAll('button:not(#mute-button), a').forEach(elem => {
        elem.addEventListener('click', () => {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        });
    });

    // Sistema de notificações simplificado removido

    // Confetes removidos


    // Tooltips removidos


    // Efeitos simplificados removidos para manter simplicidade
}); 
