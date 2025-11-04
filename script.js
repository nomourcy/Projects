document.addEventListener('DOMContentLoaded', () => {

    const body = document.body;
    let allProducts = []; 
    
    // Kunci untuk localStorage
    const SEARCH_HISTORY_KEY = 'calveri_search_history';

    // ===== 1. FUNGSI SPLASH PAGE & SUARA =====
    const discoverBtn = document.getElementById('discover-btn');
    const flipSound = document.getElementById('flip-sound');
    const splashPage = document.getElementById('splash-page');
    const mainContent = document.getElementById('main-content');

    if (discoverBtn) {
        discoverBtn.addEventListener('click', () => {
            if (flipSound) {
                flipSound.currentTime = 0; 
                flipSound.play();
            }
            body.classList.add('page-flipped');
            mainContent.style.visibility = 'visible'; 
            splashPage.style.pointerEvents = 'none';

            mainContent.addEventListener('transitionend', () => {
                if (body.classList.contains('page-flipped')) {
                    mainContent.style.overflowY = 'auto';
                }
            }, { once: true });
        });
    }

    // ===== 2. FUNGSI MENU NAVIGASI =====
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const navCloseBtn = document.getElementById('nav-close-btn');
    const navOverlay = document.getElementById('nav-overlay');

    function toggleNav() {
        body.classList.toggle('nav-open');
    }
    if (navToggleBtn) navToggleBtn.addEventListener('click', toggleNav);
    if (navCloseBtn) navCloseBtn.addEventListener('click', toggleNav);
    if (navOverlay) navOverlay.addEventListener('click', toggleNav); 

    // ===== 3. FUNGSI SEARCH (DIROMBAK) =====
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const searchInput = document.getElementById('search-input');
    const suggestionsContainer = document.getElementById('search-suggestions-container');
    const resultsContainer = document.getElementById('search-results-container');
    const searchHistoryContainer = document.getElementById('search-history-container'); // BARU

    function toggleSearchOverlay() {
        body.classList.toggle('search-overlay-open');
        
        if (body.classList.contains('search-overlay-open')) {
            if (flipSound) {
                flipSound.currentTime = 0; 
                flipSound.play();
            }
            setTimeout(() => searchInput.focus(), 100); // Beri waktu animasi
            showSuggestions(); // Tampilkan riwayat & "FOR YOU"
        } else {
            searchInput.value = ''; // Bersihkan input saat ditutup
        }
    }

    function handleSearchInput() {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length === 0) {
            showSuggestions();
            return;
        }

        showResults();
        
        const results = allProducts.filter(product => 
            product.name.toLowerCase().includes(query) // Diubah ke 'includes' agar lebih fleksibel
        );
        
        resultsContainer.innerHTML = ''; 
        
        if (results.length > 0) {
            results.forEach(item => {
                // HASIL PENCARIAN VISUAL (BARU)
                resultsContainer.innerHTML += `
                    <a href="#" class="search-result-item" data-name="${item.name}" data-available="${item.available}">
                        <img src="${item.image}" alt="${item.name}" class="search-result-image" onerror="this.style.display='none'">
                        <div class="search-result-info">
                            <h3 class="search-result-name">${item.name}</h3>
                            <p class="search-result-desc">${item.description}</p>
                        </div>
                    </a>
                `;
            });
        } else {
            resultsContainer.innerHTML = '<p class="search-no-result" style="padding: 15px 5px; color: var(--text-color-subtle);">No products found matching your search.</p>';
        }
    }
    
    // Menampilkan Riwayat & "FOR YOU"
    function showSuggestions() {
        suggestionsContainer.style.display = 'block';
        searchHistoryContainer.style.display = 'block'; // BARU
        resultsContainer.style.display = 'none';
        displayHistory(); // BARU: Panggil fungsi untuk render riwayat
    }
    
    // Hanya menampilkan hasil pencarian
    function showResults() {
        suggestionsContainer.style.display = 'none';
        searchHistoryContainer.style.display = 'none'; // BARU
        resultsContainer.style.display = 'block';
    }

    if (searchBtn) searchBtn.addEventListener('click', toggleSearchOverlay);
    if (searchCloseBtn) searchCloseBtn.addEventListener('click', toggleSearchOverlay);
    if (searchInput) searchInput.addEventListener('input', handleSearchInput);

    // --- FUNGSI RIWAYAT PENCARIAN (BARU) ---
    
    // Mengambil riwayat dari localStorage
    function getHistory() {
        const history = localStorage.getItem(SEARCH_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    }

    // Menambah item ke riwayat
    function addToHistory(productName) {
        let history = getHistory();
        // Hapus jika sudah ada (agar pindah ke atas)
        history = history.filter(item => item !== productName);
        // Tambahkan ke paling atas
        history.unshift(productName);
        // Batasi 5 item
        if (history.length > 5) {
            history.pop();
        }
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    }

    // Merender riwayat ke HTML
    function displayHistory() {
        const history = getHistory();
        searchHistoryContainer.innerHTML = ''; // Kosongkan dulu
        if (history.length > 0) {
            let itemsHTML = history.map(item => `<a href="#" class="history-item">${item}</a>`).join('');
            searchHistoryContainer.innerHTML = `
                <h2 class="search-section-title">RECENT SEARCHES</h2>
                <div class="history-items-wrapper">
                    ${itemsHTML}
                </div>
                <button id="clear-history-btn" class="btn-outline">Clear History</button>
            `;
            // Pasang event listener ke tombol clear
            document.getElementById('clear-history-btn').addEventListener('click', clearHistory);
        }
    }

    // Menghapus riwayat
    function clearHistory() {
        localStorage.removeItem(SEARCH_HISTORY_KEY);
        displayHistory(); // Render ulang (akan jadi kosong)
    }

    // --- EVENT LISTENER BARU UNTUK RIWAYAT & HASIL ---

    // Saat item hasil pencarian di-klik
    resultsContainer.addEventListener('click', (e) => {
        const resultItem = e.target.closest('.search-result-item');
        if (resultItem) {
            e.preventDefault();
            
            const isAvailable = resultItem.dataset.available === 'true';
            const productName = resultItem.dataset.name;

            if (isAvailable) {
                // Jika produk ada, tambahkan ke riwayat
                addToHistory(productName);
                
                // Tindakan selanjutnya: (Contoh: tutup search & tampilkan alert)
                // toggleSearchOverlay();
                alert(`This will redirect to ${productName} page.`); 
                
            } else {
                // Jika produk tidak ada, tampilkan modal
                showAvailabilityModal();
            }
        }
    });

    // Saat item riwayat di-klik
    searchHistoryContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('history-item')) {
            e.preventDefault();
            const productName = e.target.textContent;
            // Masukkan nama produk ke search bar & jalankan pencarian
            searchInput.value = productName;
            handleSearchInput();
        }
    });


    // ===== 4. FUNGSI DARK/LIGHT MODE (DIRANCANG ULANG) =====
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
        
        function enableDarkMode() {
            body.classList.add('dark-mode');
            themeToggleBtn.classList.add('active'); 
            localStorage.setItem('theme', 'dark');
        }

        function enableLightMode() {
            body.classList.remove('dark-mode');
            themeToggleBtn.classList.remove('active'); 
            localStorage.setItem('theme', 'light');
        }

        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            enableDarkMode();
        } else {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && !currentTheme) {
                enableDarkMode();
            } else {
                enableLightMode();
            }
        }

        themeToggleBtn.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                enableLightMode();
            } else {
                enableDarkMode();
            }
        });
    }
    
    // ===== 5. FUNGSI DETEKSI BAHASA (DIRANCANG ULANG) =====
    const langBtn = document.getElementById('language-btn');
    if (langBtn) {
        const langTextActive = document.getElementById('lang-text-active');
        const langOptions = document.querySelectorAll('.lang-option');
        
        langTextActive.textContent = 'ENGLISH'; 
        
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault(); 
                const selectedLang = e.target.textContent;
                langTextActive.textContent = selectedLang; 
                
                const dropdownContent = langBtn.nextElementSibling;
                langBtn.classList.remove('active');
                dropdownContent.style.maxHeight = null;
                
                alert('Language changed to ' + selectedLang);
            });
        });
    }
    
    // ===== 6. FUNGSI DROPDOWN/ACCORDION (Update) =====
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const dropdownContent = toggle.nextElementSibling;
            toggle.classList.toggle('active');
            
            if (dropdownContent.style.maxHeight) {
                dropdownContent.style.maxHeight = null;
            } else {
                dropdownContent.style.maxHeight = dropdownContent.scrollHeight + 'px';
            } 
        });
    });

    // ===== 7. FUNGSI HERO SLIDER (LOGIKA DIPISAH) =====
    const slider = document.querySelector('.hero-slider');
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    
    if (slider && sliderTrack && slides.length > 0) {
        
        const indicators = document.querySelectorAll('.indicator-bar');
        const slideVideos = document.querySelectorAll('.slide-video');
        const playPauseBtn = document.getElementById('play-pause-btn'); 
        const playIcon = '<i class="fa-solid fa-play"></i>';
        const pauseIcon = '<i class="fa-solid fa-pause"></i>';
    
        const totalSlides = slides.length; 
        const slideCount = totalSlides - 2; 
        const autoSlideTimeout = 10000; // 10 detik
        
        let currentIndex = 1; 
        let autoSlideTimerID = null;
        let startX = 0;
        let isAutoSliding = true; // Auto-slide aktif secara default
        let canSlide = true; 

        function setInitialPosition() {
            sliderTrack.style.transition = 'none';
            sliderTrack.style.transform = `translateX(-${currentIndex * (100 / totalSlides)}%)`;
        }

        function getRealIndex(index) {
            if (index === 0) return slideCount - 1; 
            if (index === slideCount + 1) return 0; 
            return index - 1; 
        }
        
        // Fungsi untuk menggeser slide
        function goToSlide(index) {
            if (!canSlide && index !== currentIndex) return; 
            
            canSlide = false; 
            
            sliderTrack.style.transition = 'transform 0.8s ease-in-out';
            sliderTrack.style.transform = `translateX(-${index * (100 / totalSlides)}%)`;
            
            currentIndex = index;
            const realIndex = getRealIndex(index);

            indicators.forEach(ind => ind.classList.remove('active'));
            if(indicators[realIndex]) indicators[realIndex].classList.add('active');
            
            slideVideos.forEach((video) => video.pause());
            updatePlayPauseButton(false);
        }

        // --- Fungsi Kontrol Auto-Slide ---
        function startAutoSlide() {
            if (!isAutoSliding) return; 
            clearTimeout(autoSlideTimerID); 
            autoSlideTimerID = setTimeout(nextSlide, autoSlideTimeout);
        }
        
        function pauseAutoSlide() {
            isAutoSliding = false;
            clearTimeout(autoSlideTimerID);
        }
        
        function resumeAutoSlide() {
            isAutoSliding = true;
            startAutoSlide();
        }

        // --- Fungsi Kontrol Video ---
        function toggleVideoPlayback() {
            const currentVideo = slides[currentIndex].querySelector('.slide-video');
            if (!currentVideo) return;

            if (currentVideo.paused) {
                currentVideo.muted = true; 
                currentVideo.play();
                updatePlayPauseButton(true);
                pauseAutoSlide(); 
            } else {
                currentVideo.pause();
                updatePlayPauseButton(false);
                resumeAutoSlide();
            }
        }
        
        function updatePlayPauseButton(isPlaying) {
            playPauseBtn.innerHTML = isPlaying ? pauseIcon : playIcon;
            const icon = playPauseBtn.querySelector('i');
            if (icon) {
                 icon.style.transform = isPlaying ? 'none' : 'translateX(1px)'; 
            }
        }

        // --- Fungsi Navigasi Slide ---
        function nextSlide() { 
            if (!canSlide) return;
            goToSlide(currentIndex + 1); 
        }
        
        function prevSlide() { 
            if (!canSlide) return;
            goToSlide(currentIndex - 1); 
        }

        // --- Event Listeners ---
        sliderTrack.addEventListener('transitionend', () => {
            canSlide = true; 
            
            if (currentIndex === slideCount + 1) { 
                sliderTrack.style.transition = 'none'; 
                currentIndex = 1; 
                sliderTrack.style.transform = `translateX(-${currentIndex * (100 / totalSlides)}%)`;
            }
            if (currentIndex === 0) {
                sliderTrack.style.transition = 'none'; 
                currentIndex = slideCount; 
                sliderTrack.style.transform = `translateX(-${currentIndex * (100 / totalSlides)}%)`;
            }
            
            if (isAutoSliding) {
                startAutoSlide();
            }
        });

        slideVideos.forEach(video => {
            video.addEventListener('ended', () => {
                updatePlayPauseButton(false); 
                resumeAutoSlide(); 
            });
        });

        // Event listener untuk swipe manual
        function swipeStart(e) {
            if (!canSlide) return; 
            
            startX = e.type.includes('touch') ? e.touches[0].clientX : e.pageX;
            pauseAutoSlide(); 
            sliderTrack.style.transition = 'none'; 
        }
        
        function swipeEnd(e) {
            if (startX === 0) return; 
            if (!canSlide) return; 
            
            const endX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.pageX;
            const diff = startX - endX; 
            startX = 0; 

            if (diff > 50) { 
                nextSlide(); 
            } else if (diff < -50) { 
                prevSlide(); 
            } else {
                sliderTrack.style.transition = 'transform 0.8s ease-in-out';
                resumeAutoSlide();
            }
        }

        slider.addEventListener('mousedown', swipeStart);
        slider.addEventListener('mouseup', swipeEnd);
        slider.addEventListener('mouseleave', (e) => {
            if(startX === 0) return; 
            startX = 0; 
            sliderTrack.style.transition = 'transform 0.8s ease-in-out';
            goToSlide(currentIndex); 
            resumeAutoSlide(); 
        });
        
        slider.addEventListener('touchstart', swipeStart, { passive: true }); 
        slider.addEventListener('touchend', swipeEnd);
        
        playPauseBtn.addEventListener('click', toggleVideoPlayback); 

        // --- Inisialisasi ---
        setInitialPosition(); 
        updatePlayPauseButton(false);
        startAutoSlide();
    }
    
    // ===== 8. FUNGSI "AUTO DETEKSI" PRODUK (DIUBAH) =====
    function buildProductDatabase() {
        allProducts = []; 
        const productSlides = document.querySelectorAll('.slide:not(.clone)');
        
        const availableProducts = ['TEXAS', 'GARDENIA ROSE']; // Produk aslimu

        productSlides.forEach(slide => {
            const nameElement = slide.querySelector('h2');
            const descElement = slide.querySelector('p');
            
            if (nameElement && descElement) {
                const productName = nameElement.textContent.trim();
                const productDesc = descElement.textContent.trim();
                const imagePath = `/assets/images/${productName.toLowerCase().replace(/ /g, '-')}.png`;
                
                // Pastikan produk unik
                if (!allProducts.find(p => p.name === productName)) {
                    allProducts.push({
                        name: productName,
                        description: productDesc,
                        image: imagePath,
                        available: availableProducts.includes(productName) // Cek ketersediaan
                    });
                }
            }
        });
    }
    
    buildProductDatabase();

    
    // ===== 9. FUNGSI MODAL "NOT AVAILABLE" (BARU) =====
    const availabilityModal = document.getElementById('availability-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    function showAvailabilityModal() {
        availabilityModal.classList.add('visible');
    }

    function hideAvailabilityModal() {
        availabilityModal.classList.remove('visible');
    }

    // Listener global untuk semua klik di dokumen
    document.addEventListener('click', (e) => {
        // Cek apakah yang diklik adalah elemen dengan data-available="false"
        const unavailableItem = e.target.closest('[data-available="false"]');
        if (unavailableItem) {
            e.preventDefault(); // Hentikan link/tombol
            showAvailabilityModal(); // Tampilkan modal
        }
    });

    // Listener untuk tombol close di modal
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideAvailabilityModal);

    // Listener untuk klik di luar area konten modal (di overlay)
    if (availabilityModal) {
        availabilityModal.addEventListener('click', (e) => {
            if (e.target === availabilityModal) {
                hideAvailabilityModal();
            }
        });
    }

});
