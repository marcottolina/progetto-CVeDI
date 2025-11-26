document.addEventListener("DOMContentLoaded", () => {
    /* =========================
       CURSOR PERSONALIZZATO
    ========================== */
    const circleElement = document.querySelector(".circle");

    const mouse = {x: 0, y: 0};
    const previousMouse = {x: 0, y: 0};
    const circle = {x: 0, y: 0};

    let currentScale = 0;
    let currentAngle = 0;
    const speed = 0.17;

    window.addEventListener("mousemove", e => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    const tick = () => {
        circle.x += (mouse.x - circle.x) * speed;
        circle.y += (mouse.y - circle.y) * speed;
        const translateTransform = `translate(${circle.x}px, ${circle.y}px)`;

        const deltaMouseX = mouse.x - previousMouse.x;
        const deltaMouseY = mouse.y - previousMouse.y;
        previousMouse.x = mouse.x;
        previousMouse.y = mouse.y;
        const mouseVelocity = Math.min(Math.sqrt(deltaMouseX ** 2 + deltaMouseY ** 2) * 4, 150);
        const scaleValue = (mouseVelocity / 150) * 0.5;
        currentScale += (scaleValue - currentScale) * speed;
        const scaleTransform = `scale(${1 + currentScale}, ${1 - currentScale})`;

        const angle = (Math.atan2(deltaMouseY, deltaMouseX) * 180) / Math.PI;
        if (mouseVelocity > 5) currentAngle = angle;
        const rotateTransform = `rotate(${currentAngle}deg)`;

        circleElement.style.transform = `${translateTransform} ${rotateTransform} ${scaleTransform}`;

        requestAnimationFrame(tick);
    };
    tick();

    /* =========================
     TIMELINE
  ========================== */
    const timeline = document.querySelector(".timeline-container");
const items = document.querySelectorAll(".timeline-item");
let dots = []; // Array globale per i dot dinamici
let isDesktop = false; // Flag per tracciare lo stato

// Linea rossa (Questa rimane fissa, se vuoi nasconderla su mobile fallo via CSS)
const fill = document.createElement("div");
fill.className = "timeline-fill";
timeline.appendChild(fill);


function createDots() {

    if (dots.length > 0) return;

    items.forEach(item => {
        const dot = document.createElement("div");
        dot.className = "timeline-dot"; // Assicurati di avere il CSS per .timeline-dot absolute

        const itemTop = item.offsetTop;
        const itemHeight = item.offsetHeight;
        dot.style.top = `${itemTop + itemHeight / 2}px`;

        timeline.appendChild(dot);
        dots.push(dot);
    });
}

function removeDots() {
    dots.forEach(dot => dot.remove());
    dots = [];
}

function updateTimeline() {
    const scrollTop = window.scrollY;
    const viewportHeight = window.innerHeight;
    const timelineTop = timeline.offsetTop;
    const timelineHeight = timeline.offsetHeight;

    let fillHeight = scrollTop + viewportHeight / 1.5 - timelineTop;
    fillHeight = Math.max(0, Math.min(fillHeight, timelineHeight));
    fill.style.height = fillHeight + "px";

    if (dots.length > 0) {
        dots.forEach(dot => {
            const dotTop = dot.offsetTop;
            if (dotTop <= fillHeight) dot.classList.add("active");
            else dot.classList.remove("active");
        });
    }
}
function recalcPositions() {
    if (dots.length === 0) return;
    items.forEach((item, i) => {
        const itemTop = item.offsetTop;
        const itemHeight = item.offsetHeight;
        if(dots[i]) dots[i].style.top = `${itemTop + itemHeight / 2}px`;
    });
}

function checkResolution() {
    const width = window.innerWidth;

    if (width >= 992) {
        // Entriamo in Desktop
        if (!isDesktop) {
            createDots();
            isDesktop = true;
        }
        recalcPositions();
    } else {
        // Entriamo in Mobile
        if (isDesktop) {
            removeDots();
            isDesktop = false;
        }
    }
    updateTimeline();
}

// --- Event Listeners ---
window.addEventListener("scroll", updateTimeline);

window.addEventListener("resize", () => {
    checkResolution(); // Controlla se creare o distruggere
});

// Gestione immagini (ricalcola solo se siamo su desktop)
document.querySelectorAll('.timeline-item img').forEach(img => {
    img.addEventListener('load', () => {
        if (isDesktop) {
            recalcPositions();
            updateTimeline();
        }
    });
});

// Avvio iniziale
checkResolution();

// ==========================
// GLOBAL STATE
// ==========================
let currentAudio = null;
let currentVideo = null;
let currentButton = null;
let currentInterval = null; // Manages the fade-in/out timer

function addMediaControl(btnId, audioUrl) {
    const btn = document.getElementById(btnId);
    
    // Audio is created once per button and stays in memory
    const audio = new Audio(audioUrl); 

    btn.addEventListener("click", function () {

        const item = this.closest(".timeline-item");
        const video = item ? item.querySelector("video") : null;

        // IMPORTANT: Stop any ongoing speed/volume transition immediately
        // to prevent conflicts between clicks.
        if (currentInterval) clearInterval(currentInterval);

        // ==========================
        // 1. CASE: CLICK ON THE SAME BUTTON (STOP / PAUSE)
        // ==========================
        if (currentButton === this) {
            
            // Audio: Pause and RESET
            // (Usually, music sounds better if it starts over, but you can remove 
            // .currentTime = 0 if you want it to resume)
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0; 
            }

            // Video: FADE OUT (Slow down until stop)
            if (currentVideo) {
                let rate = currentVideo.playbackRate;
                
                currentInterval = setInterval(() => {
                    rate -= 0.1; // Decrease speed
                    
                    if (rate <= 0.1) {
                        currentVideo.pause(); 
                        // KEY POINT: We DO NOT reset the time.
                        // The video saves its position.
                        clearInterval(currentInterval);
                    } else {
                        currentVideo.playbackRate = rate;
                    }
                }, 50);
            }

            // UI Update
            this.classList.remove('attivo');
            
            // Reset Global Variables
            currentAudio = null;
            currentVideo = null;
            currentButton = null;
            return;
        }

        // ==========================
        // 2. CASE: CLICK ON A DIFFERENT BUTTON (SWITCH ITEM)
        // ==========================
        
        // Handle Previous Audio
        if (currentAudio && currentAudio !== audio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }

        // Handle Previous Video
        if (currentVideo && currentVideo !== video) {
            currentVideo.pause();
            // We DO NOT reset currentTime here either.
            // The previous video "freezes" exactly where it was.
            currentVideo.playbackRate = 1; // Reset speed for the next time it plays
        }

        // Handle Previous Button UI
        if (currentButton && currentButton !== this) {
            currentButton.classList.remove('attivo');
        }

        // ==========================
        // 3. START NEW AUDIO
        // ==========================
        audio.currentTime = 0;
        audio.play();

        // ==========================
        // 4. START NEW VIDEO (FADE IN / SOFT START)
        // ==========================
        if (video) {
            // Start at slow speed
            video.playbackRate = 0.1;
            video.play();

            let rate = 0.1;
            currentInterval = setInterval(() => {
                rate += 0.1; // Increase speed
                
                if (rate >= 1) {
                    video.playbackRate = 1; // Normal speed reached
                    clearInterval(currentInterval);
                } else {
                    video.playbackRate = rate;
                }
            }, 50);
        }

        // Update global state with the new active button
        currentAudio = audio;
        currentVideo = video;
        currentButton = this;
        this.classList.add('attivo');
    });
}

// Initialization
addMediaControl("music-start1", "../media/audio/thalassa.mp3");
addMediaControl("music-start2", "../media/audio/rihanna.mp3");
addMediaControl("music-start3", "../media/audio/thalassa.mp3");

});

//Gestione del bottone in descrizione piatto
document.addEventListener('DOMContentLoaded', () => {
    function addMediaControl2(btnId, audioUrl) {
        //riproduzione della canzone
        const playBtn = document.getElementById(btnId);
        const audio = new Audio(audioUrl);

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                // Sostituisce completamente il contenuto del pulsante
                playBtn.innerHTML = '<i class="bi bi-soundwave"></i>';
                playBtn.classList.add('btn-sound', 'attivo');
            } else {
                audio.pause();
                audio.currentTime = 0; // riporta all'inizio
                playBtn.innerHTML = 'Riproduci <i class="bi bi-arrow-right"></i>';
                playBtn.classList.remove('btn-sound', 'attivo');
            }
        });
    }

    addMediaControl2("music-startdesc1", "../media/audio/thalassa.mp3");
    addMediaControl2("music-startdesc2", "../media/audio/thalassa.mp3");
    addMediaControl2("music-startdesc3", "../media/audio/thalassa.mp3");

});


let myHoverables = document.getElementsByClassName("hoverable");
for (let i = 0; i < myHoverables.length; i++) {
    myHoverables[i].addEventListener("mouseover", function () {
        document.getElementsByClassName("circle")[0].classList.add("hovered");
        document.getElementsByClassName("circle")[0].classList.remove("not-hovered");
        console.log('sopra');
    });
    myHoverables[i].addEventListener("mouseout", function () {
        document.getElementsByClassName("circle")[0].classList.remove("hovered");
        document.getElementsByClassName("circle")[0].classList.add("not-hovered");
        console.log('sotto');
    });
}

let buttonSound = document.getElementsByClassName("btn-sound");
for (let i = 0; i < buttonSound.length; i++) {
    buttonSound[i].addEventListener("click", function () {
        this.classList.toggle("attivo");
    });
}

document.addEventListener('show.bs.offcanvas', () => {
    document.body.classList.add('offcanvas-open');
});
document.addEventListener('hide.bs.offcanvas', () => {
    document.body.classList.remove('offcanvas-open');
});

document.addEventListener('show.bs.offcanvas', () => {
    document.body.classList.add('no-scroll');
});

document.addEventListener('hide.bs.offcanvas', () => {
    document.body.classList.remove('no-scroll');
});


/* toDo: change comments to italian */
document.querySelectorAll(".btn-sound").forEach(btn => {
    btn.addEventListener("click", function () {
        const item = this.closest(".timeline-item");
        const video = item.querySelector("video");

        if (!video) return;

        // Se il video è in riproduzione → soft-stop
        if (!video.paused) {
            let rate = video.playbackRate;
            const interval = setInterval(() => {
                rate -= 0.1;                   // rallenta
                video.playbackRate = Math.max(rate, 0.1);

                if (rate <= 0.1) {
                    clearInterval(interval);
                    video.pause();
                    video.playbackRate = 1;      // reset per la prossima riproduzione
                }
            }, 40);
            return;
        }

        // Se il video è fermo → soft-start
        video.play();
        video.playbackRate = 0.1;

        let rate = 0.1;
        const interval = setInterval(() => {
            rate += 0.1;                     // accelera
            video.playbackRate = rate;

            if (rate >= 1) {
                video.playbackRate = 1;
                clearInterval(interval);
            }
        }, 40);
    });
});

document.addEventListener('DOMContentLoaded', function() {

    /* =========================================
       1. CAROSELLO IMMAGINI (Multiplo)
       Usa la classe specifica .swiper-images
       ========================================= */
    const swiperImages = new Swiper('.swiper-images', {
        direction: 'horizontal',
        loop: true,
        centeredSlides: true,
        spaceBetween: 5,

        // Breakpoints specifici per questo carosello
        breakpoints: {
            0: {
                slidesPerView: 1,
            },
            768: {
                slidesPerView: 3,
            }
        },

        pagination: {
            el: '.swiper-images .swiper-pagination', // Scoping specifico
            type: 'progressbar',
        },

        // Scoping specifico dei bottoni: cerca solo dentro .swiper-images
        navigation: {
            nextEl: '.swiper-images .swiper-button-next',
            prevEl: '.swiper-images .swiper-button-prev',
        },

        scrollbar: {
            el: '.swiper-images .swiper-scrollbar',
        },
    });

    /* =========================================
       2. CAROSELLO RECENSIONI (Singolo)
       Usa la classe specifica .swiper-reviews
       ========================================= */
let swiperReviews = new Swiper('.swiper-reviews', {
    direction: 'horizontal',
    loop: true,
    spaceBetween: 0,
    centeredSlides: true,

    breakpoints: {
        0: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 1
        }
    },

    navigation: {
        nextEl: '.swiper-reviews .swiper-button-next',
        prevEl: '.swiper-reviews .swiper-button-prev'
    },

    pagination: {
        el: '.swiper-pagination',
        type: 'progressbar',
    },

    scrollbar: {
        el: '.swiper-scrollbar'
    }

});


});

document.addEventListener('DOMContentLoaded', function() {
    // Seleziona tutti i bottoni con classe 'chips'
    const chipsButtons = document.querySelectorAll('.chips');

    chipsButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Aggiunge o rimuove la classe 'chips-active'
            this.classList.toggle('chips-active');
            
            // Opzionale: Log in console per verifica
            console.log('Stato bottone:', this.classList.contains('chips-active') ? 'Attivo' : 'Inattivo');
        });
    });
});