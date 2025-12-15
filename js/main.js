/* === CUSTOM CURSOR === */
document.addEventListener("DOMContentLoaded", function () {

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

    /* === TIMELINE === */
    const timeline = document.querySelector(".timeline-container");
    const items = document.querySelectorAll(".timeline-item");
    let dots = []; // Global array of dynamic dots
    let isDesktop = false; // Flag to trace state

    // Line that gradually fills (as page gets scrolled down) - Fixed, can be hidden via-CSS if needed
    const fill = document.createElement("div");
    fill.className = "timeline-fill";
    timeline.appendChild(fill);

    // function that fills the dots within timeline (desktop only - smaller sizes are done manually) as the page is scrolled down
    function createDots() {

        if (dots.length > 0) return;

        items.forEach(item => {
            const dot = document.createElement("div");
            dot.className = "timeline-dot"; // reminder: .timeline-dot must be absolute

            const itemTop = item.offsetTop;
            const itemHeight = item.offsetHeight;
            dot.style.top = `${itemTop + itemHeight / 2}px`;

            timeline.appendChild(dot);
            dots.push(dot);
        });
    }

    // function that unfills the dots as the page is scrolled up
    function removeDots() {
        dots.forEach(dot => dot.remove());
        dots = [];
    }

    // function to "sense" the dots needing to be filled / emptied
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

    // function to see current scroll-status within page
    function recalcPositions() {
        if (dots.length === 0) return;
        items.forEach((item, i) => {
            const itemTop = item.offsetTop;
            const itemHeight = item.offsetHeight;
            if (dots[i]) dots[i].style.top = `${itemTop + itemHeight / 2}px`;
        });
    }

    // function to only put the dots in desktop and remove them from mobile / tablet
    function checkResolution() {
        const width = window.innerWidth;

        if (width >= 992) { // Dots for desktop only
            if (!isDesktop) {
                createDots();
                isDesktop = true;
            }
            recalcPositions();
        } else { // Dots when we are not in desktop resolution are removed (as stated before: they are done manually)
            if (isDesktop) {
                removeDots();
                isDesktop = false;
            }
        }
        updateTimeline();
    }

    // Event listener to update the timeline based on scroll
    window.addEventListener("scroll", updateTimeline);

    // Event listener to update the timeline based on width (if the window is resized it gets dynamically changed)
    window.addEventListener("resize", () => {
        checkResolution();
    });

    // Adjust dots position based on image position (dot position is fixed to halfway (vertically) from the image next ot it)
    document.querySelectorAll('.timeline-item img').forEach(img => {
        img.addEventListener('load', () => {
            if (isDesktop) {
                recalcPositions();
                updateTimeline();
            }
        });
    });

    // Start the timeline handling process
    checkResolution();

})


/* toDo: delete once new logic is working */
/* === VIDEO, AUDIO (music) & RELATED BUTTONS === */
/*document.addEventListener("DOMContentLoaded", () => {

    let currentAudio = null;
    let currentVideo = null;
    let currentButton = null;
    let currentInterval = null; // Manages the fade-in/out timer

    function addMediaControl(btnId, audioUrl) {

        const btn = document.getElementById(btnId);
        const audio = new Audio(audioUrl); // Audio is created once per button and stays in memory

        // button's event listener
        btn.addEventListener("click", function () {

            const item = this.closest(".timeline-item");
            const video = item ? item.querySelector("video") : null;

            // IMPORTANT: Stop any ongoing speed/volume transition immediately (to prevent conflicts between clicks)
            if (currentInterval) clearInterval(currentInterval);

            // = CASE 1: CLICK ON THE SAME BUTTON (STOP / PAUSE) =
            if (currentButton === this) {

                // Audio: PAUSE & RESET
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
                            // Time is not reset, the video saves its position
                            currentVideo.pause();
                            clearInterval(currentInterval);
                        } else {
                            currentVideo.playbackRate = rate; // video visibly slows down
                        }
                    }, 50); // every 50ms
                }

                // UI Update
                this.classList.remove('attivo');

                // Reset Global Variables
                currentAudio = null;
                currentVideo = null;
                currentButton = null;
                return;
            }

            // = CASE 2: CLICK ON A DIFFERENT BUTTON (SWITCH ITEM) =
            // Handle Previous Audio
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            // Handle Previous Video
            if (currentVideo && currentVideo !== video) {
                currentVideo.pause();
                // The previous's video currentTime is not reset, it's just frozen where it was
                currentVideo.playbackRate = 1; // Reset speed for the next time it plays
            }

            // Handle Previous Button UI
            if (currentButton && currentButton !== this) {
                currentButton.classList.remove('attivo');
            }

            // = CASE 3: START NEW AUDIO =
            audio.currentTime = 0;
            audio.play();

            // CASE 4: START NEW VIDEO (FADE IN / SOFT START)
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

});*/

/* toDo: delete once new logic is working */
/* === BUTTON FUNCTIONALITY FOR PLATE DESCRPTION === */
/*document.addEventListener('DOMContentLoaded', () => {

    function addMediaControl2(btnId, audioUrl) { // Note: "addMediaControl2" to not cause a conflict with previous VIDEO / AUDIO handles

        const playBtn = document.getElementById(btnId);
        const audio = new Audio(audioUrl);

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = '<i class="bi bi-soundwave"></i>';
                playBtn.classList.add('btn-sound', 'attivo');
            } else {
                audio.pause();
                audio.currentTime = 0; // restarts (from start)
                playBtn.innerHTML = 'Riproduci <i class="bi bi-arrow-right"></i>';
                playBtn.classList.remove('btn-sound', 'attivo');
            }
        });
    }

    addMediaControl2("music-startdesc1", "../media/audio/thalassa.mp3");
    addMediaControl2("music-startdesc2", "../media/audio/thalassa.mp3");
    addMediaControl2("music-startdesc3", "../media/audio/thalassa.mp3");

}); */

/* toDo: delete once new logic is working */
/* === ADDING THE 'ACTIVE' / 'INACTIVE' STATE TO AUDIO BUTTONS === */
/*document.addEventListener('DOMContentLoaded', function() {

    let buttonSound = document.getElementsByClassName("btn-sound");
    for (let i = 0; i < buttonSound.length; i++) {
        buttonSound[i].addEventListener("click", function () {
            this.classList.toggle("attivo");
        });
    }

});*/

/* === HIDING THE MOUSE CURSOS OVER HOVERABLE ITEMS === */
document.addEventListener('DOMContentLoaded', function () {

    let myHoverables = document.getElementsByClassName("hoverable");
    for (let i = 0; i < myHoverables.length; i++) {
        myHoverables[i].addEventListener("mouseover", function () {
            document.getElementsByClassName("circle")[0].classList.add("hovered");
            document.getElementsByClassName("circle")[0].classList.remove("not-hovered");
        });
        myHoverables[i].addEventListener("mouseout", function () {
            document.getElementsByClassName("circle")[0].classList.remove("hovered");
            document.getElementsByClassName("circle")[0].classList.add("not-hovered");
        });
    }

});

/* === OFFCANVAS FULLPAGE INTERACTIVITY === */

/* = OPENING OFFCANVAS = */
document.addEventListener('show.bs.offcanvas', () => {
    document.body.classList.add('offcanvas-open');
});

/* = CLOSING OFFCANVAS = */
document.addEventListener('hide.bs.offcanvas', () => {
    document.body.classList.remove('offcanvas-open');
});

/* = REMOVING SCROLLABILITY (FROM PAGE) WHEN ENTERING OFFCANVAS = */
document.addEventListener('show.bs.offcanvas', () => {
    document.body.classList.add('no-scroll');
});

/* = ENABLING BACK SCROLLABILITY (FOR PAGE) WHEN EXITING OFFCANVAS = */
document.addEventListener('hide.bs.offcanvas', () => {
    document.body.classList.remove('no-scroll');
});

/* toDo: delete once new logic is working */
/*document.addEventListener('DOMContentLoaded', function() {

    document.querySelectorAll(".btn-sound").forEach(btn => {

        btn.addEventListener("click", function () {

            const item = this.closest(".timeline-item");
            const video = item.querySelector("video");

            if (!video) return;

            // If video is currently being reproduced → soft-stop
            if (!video.paused) {
                let rate = video.playbackRate;
                const interval = setInterval(() => {
                    rate -= 0.1; // slow-down effect (analogous to previous code)
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

});*/

/* === VIDEO, AUDIO (music) & RELATED BUTTONS === */
document.addEventListener("DOMContentLoaded", () => {

    /* --- GLOBAL STATE --- */
    let currentAudio = null;
    let currentVideo = null;
    let currentButton = null;
    let currentInterval = null;

    function addMediaControl(btnId, audioUrl) {

        const btn = document.getElementById(btnId);
        if (!btn) return;

        const audio = new Audio(audioUrl);

        btn.addEventListener("click", function () {

            const item = this.closest(".timeline-item");
            const video = item ? item.querySelector("video") : null;

            // Immediate STOP of any previous transitions
            if (currentInterval) clearInterval(currentInterval);

            // === CASE 1: CLICK ON THE SAME BUTTON (STOP / PAUSE) ===
            if (currentButton === this) {

                // Audio: PAUSE & RESET
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                }

                // Video: FADE OUT
                // FIX: Save reference to the video BEFORE setting currentVideo to null
                if (currentVideo) {
                    const videoToFade = currentVideo; // Safe local reference
                    let rate = videoToFade.playbackRate;

                    currentInterval = setInterval(() => {
                        rate -= 0.1;

                        // Safety check: if rate becomes too low or negative
                        if (rate <= 0.1) {
                            videoToFade.pause();
                            videoToFade.currentTime = 0; // Reset the video to the beginning
                            videoToFade.playbackRate = 1; // Reset speed for the future
                            clearInterval(currentInterval);
                        } else {
                            videoToFade.playbackRate = rate;
                        }
                    }, 50);
                }

                // UI Update
                this.classList.remove('attivo');

                // Reset Global Variables
                currentAudio = null;
                currentVideo = null; // This was the error: it made the reference null inside the interval
                currentButton = null;
                return;
            }

            // === CASE 2: CLICK ON A DIFFERENT BUTTON (CHANGE) ===

            // Stop Previous Audio
            if (currentAudio && currentAudio !== audio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }

            // Stop Previous Video
            // FIX: Added currentTime = 0 to completely reset the previous video
            if (currentVideo && currentVideo !== video) {
                currentVideo.pause();
                currentVideo.currentTime = 0; // Important: rewind the previous video
                currentVideo.playbackRate = 1; // Reset speed
            }

            // Reset UI of Previous Button
            if (currentButton && currentButton !== this) {
                currentButton.classList.remove('attivo');
            }

            // === CASE 3: START NEW AUDIO ===
            audio.currentTime = 0;
            audio.play();

            // === CASE 4: START NEW VIDEO (FADE IN) ===
            if (video) {
                video.currentTime = 0; // Ensure it starts from the beginning
                video.playbackRate = 0.1;
                video.play();

                let rate = 0.1;
                currentInterval = setInterval(() => {
                    rate += 0.1;
                    if (rate >= 1) {
                        video.playbackRate = 1;
                        clearInterval(currentInterval);
                    } else {
                        video.playbackRate = rate;
                    }
                }, 50);
            }

            // Update global state
            currentAudio = audio;
            currentVideo = video;
            currentButton = this;
            this.classList.add('attivo');
        });
    }

    /* * SECONDARY FUNCTION: Handles plate descriptions (Audio only) */
    function addSimpleAudioControl(btnId, audioUrl) {
        const playBtn = document.getElementById(btnId);
        if (!playBtn) return;

        const audio = new Audio(audioUrl);

        playBtn.addEventListener('click', () => {

            /* toDo: edit this part so that the video stops rather than resetting */
            if (currentVideo) {
                currentVideo.pause();
                currentVideo.currentTime = 0;
                currentVideo = null;
            }
            if (currentButton) {
                currentButton.classList.remove('attivo');
                currentButton = null;
            }
            if (currentAudio) { // Stop the audio of the timeline
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentAudio = null;
            }

            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = '<i class="bi bi-soundwave"></i>';
                playBtn.classList.add('attivo');
            } else {
                audio.pause();
                audio.currentTime = 0;
                playBtn.innerHTML = 'Play <i class="bi bi-arrow-right"></i>';
                playBtn.classList.remove('attivo');
            }
        });
    }

    // === INITIALIZATION ===
    addMediaControl("music-start1", "../media/audio/thalassa.mp3");
    addMediaControl("music-start2", "../media/audio/rihanna.mp3");
    addMediaControl("music-start3", "../media/audio/thalassa.mp3");

    addSimpleAudioControl("music-startdesc1", "../media/audio/thalassa.mp3");
    addSimpleAudioControl("music-startdesc2", "../media/audio/thalassa.mp3");
    addSimpleAudioControl("music-startdesc3", "../media/audio/thalassa.mp3");

});


/* === CAROUSELS LOGIC & SETTINGS (from SwiperJS) === */
document.addEventListener('DOMContentLoaded', function () {

    /* Carousel 1: the one with only multiple-images (uses .swiper-images class) */
    const swiperImages = new Swiper('.swiper-images', {

        direction: 'horizontal',
        loop: true,
        centeredSlides: true,
        spaceBetween: 5,

        breakpoints: {
            0: {
                slidesPerView: 1,
            },
            768: {
                slidesPerView: 3,
            }
        },

        pagination: {
            el: '.swiper-images .swiper-pagination', // specific scoping
            type: 'progressbar',
        },

        // specific scoping for buttons
        navigation: {
            nextEl: '.swiper-images .swiper-button-next',
            prevEl: '.swiper-images .swiper-button-prev',
        },

        scrollbar: {
            el: '.swiper-images .swiper-scrollbar',
        },
    });

    /* Carousel 2: reviews carousel (uses .swiper-reviews class) */
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

/* === ALLERGEN CHIPS (& their logic) === */
document.addEventListener('DOMContentLoaded', function () {

    const chipsButtons = document.querySelectorAll('.chips'); // select all plates from the menu that have an allergen (allergens are contained in these 'chips')

    // Toggles 'chips-active' class upon clicking an allergen's chip
    chipsButtons.forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('chips-active'); // toDo: complete logic of what needs to happen when this is toggled
        });
    });
});

/* === INTERACTIVE MAP WITH D3 === */
/* toDo: finish converting comments to Italian */
document.addEventListener("DOMContentLoaded", function () {

    // = Size configuration =
    const width = window.innerWidth;
    const height = window.innerHeight;

    const container = d3.select("#map-container"); // select the HTML container for the map
    const svg = container.append("svg"); // append a SVG to this container

    // code from now on is all about setting the SVG to be the interactive map

    // add sizes (D3 notation for adding an attribute to an SVG that will be a map
    svg.attr("width", width);
    svg.attr("height", height);

    // sub-element "g" will contain the actual map (with seas and nations)
    const mapLayer = svg.append("g");

    // Tooltip selection
    const tooltip = d3.select("#tooltip");

    // Helper functions for tooltip interaction
    const moveTooltip = (event) => {

        // Get the pointer's coordinates relative to the map container
        const [x, y] = d3.pointer(event, container.node());

        // put the tooltip next to the pointer (on the interactive object)
        tooltip.style("transform", `translate(${x + 15}px, ${y + 15}px) translate(-50%, -150%)`);
    };

    const hideTooltip = () => {
        tooltip.style("opacity", 0);
    };

    // Sea labels coordinates (only in the Restaurant's local area)
    const seaData = [
        {name: "Mare di Giava", coords: [112, -5]},
        {name: "Mare di Celebes", coords: [122, 3]},
        {name: "Mare di Banda", coords: [128, -5.5]},
        {name: "Mare di Arafura", coords: [135, -9]},
        {name: "Mare di Timor", coords: [126, -11]},
        {name: "Mare di Bismarck", coords: [147, -3.5]},
        {name: "Mare di Salomone", coords: [152, -8]},
        {name: "Mare dei Coralli", coords: [152, -16]},
        {name: "Mare delle Filippine", coords: [130, 15]}
    ];

    // Initial projection on Indonesia
    const projection = d3.geoMercator();
    projection.center([128, -5]);
    projection.scale(2000); // initial zoom level
    projection.translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // --- ZOOM SETUP (MODIFICATO: Solo con ALT) ---
    const zoom = d3.zoom()
        .scaleExtent([1, 8])
        .filter((event) => {
            // Filtro eventi:
            // Se è un evento rotellina (wheel) E il tasto ALT NON è premuto...
            if (event.type === 'wheel' && !event.altKey) {
                return false; // ...ignora l'evento (niente zoom, niente lampeggiamento)
            }
            // Altrimenti consenti (se è trascinamento o se ALT è premuto)
            return true;
        })
        .on("zoom", (event) => {
            mapLayer.attr("transform", event.transform);
        });

    svg.call(zoom)
        .on("dblclick.zoom", null); // Opzionale: disabilita zoom doppio click

    // Atlas and Riff's position (object)
    const cityData = [
        {
            regionName: "Atlas",
            pointName: "Riff",
            coords: [127, -7], // Coordinate leggermente spostate nel Mare di Banda
            desc: "Città Sommersa"
        }
    ];

    // World-Map loading
    d3.json("./media/map/worldGeoJSON.json").then(function (data) { // wordGeoJSON taken from "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson" (and downloaded locally)

        // Draw STATES (Ex-Nations)
        mapLayer.selectAll("path")
            .data(data.features)
            .join("path")
            .attr("class", "country")
            .attr("d", path)
            .on("mouseover", function (event, d) { // ability to interact with countries (tooltip pops up on mouseover)
                d3.select(this).raise(); // Bring country forward

                // add "Ex-" in front of the CountryName (Ex-Malesia, Ex-Australia, ...)
                const countryName = d.properties.name;
                const exName = "Ex-" + countryName;

                // toDo: put relevant country information here (currents, access-status, transportation, ...)
                switch (exName) {
                    case "Ex-Australia":
                        tooltip.style("opacity", 1)
                            .html(`<b>${exName}</b><br/><b>Stato:</b> semi-sommersa <br><b>Navigabilità: </b>accesso proibito`)
                        ;
                        break;
                    case "Ex-East Timor":
                        tooltip.style("opacity", 1)
                            .html(`<b>${exName}</b><br/><b>Stato:</b> sommersa <br><b>Navigabilità: </b>accesso proibito (attività vulcanica)`)
                        ;
                        break;
                    default:
                        tooltip.style("opacity", 1)
                            .html(`<b>${exName}</b><br/><b>Stato:</b> sommerso <br><b>Navigabilità: </b>accesso consentito`)
                        ;
                }

            })
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip)
        ;

        // Draw seas
        const seas = mapLayer.selectAll(".sea-group")
            .data(seaData)
            .enter()
            .append("g")
            .attr("class", "sea-group")
            .attr("transform", d => `translate(${projection(d.coords)})`)
        ;

        // "hitbox" circle (for the pop-up)
        seas.append("circle")
            .attr("r", 25)
            .attr("fill", "transparent")
        ;

        // Visible text
        seas.append("text")
            .attr("class", "sea-label-text")
            .attr("y", 5)
            .text((d) => d.name)
        ;

        // mouseover for seas
        seas.on("mouseover", function (event, d) {
            tooltip.style("opacity", 1)
                .html(`<b>${d.name}</b><br> <b>Settore:</b> Oceano Australe<br> <b>Viabilità: </b>aperta al traffico`);
        })
            .on("mousemove", moveTooltip)
            .on("mouseout", hideTooltip);

        // = Draw Atlas & Riff =
        const locations = mapLayer.selectAll(".location-group")
            .data(cityData)
            .enter()
            .append("g")
            .attr("class", "location-group")
            .attr("transform", d => `translate(${projection(d.coords)})`)
        ;

        // --- FIX START ---
        // Add a transparent "Hitbox" circle larger than the max pulse radius (which is 10px)
        // to avoid "flickering" effect on certain mouseovers at the edges
        // Making it 20px also should make it easier to press on mobile
        locations.append("circle")
            .attr("r", 20)
            .attr("fill", "transparent") // make the circle transparent (otherwise it's visually displayed)
            .style("cursor", "pointer") // Ensures the hand cursor shows
        ;
        // --- FIX END ---

        // Draw atlas circle
        locations.append("circle")
            .attr("r", 16)
            .attr("class", "atlas-marker")
        ;

        // Draw the internal point for the Riff
        locations.append("circle")
            .attr("r", 2.5)
            .attr("class", "riff-point")
        ;

        // Text-label for locations (Riff)
        locations.append("text")
            .attr("class", "location-label")
            .text(d => d.regionName) // writes "Atlas"
        ;

        // mouseover for Atlas & Riff
        locations.on("mouseover", function (event, d) {
            tooltip.style("opacity", 1)
                .style("border-color", "#FF327A")
                .style("color", "#FF327A")
                .html(`<b>Riff</b><br/>Atlas, P.zza Corolleo 1 24°N - 46°O, -230 m<br/>Settore abissale Ovest`)
            ;
        });

        // if mouse is moved within Atlas radius, the label moves as well
        locations.on("mousemove", moveTooltip);

        // reset previous style upon mouseout (= mouseover end)
        locations.on("mouseout", function () {
            hideTooltip();
            tooltip.style("border-color", "var(--blue70-100)")
                .style("color", "var(--blue70-100)");
        });

    }).catch(err => console.error("Errore dati:", err));
    // d3 can throw an error, basic catch-and-display-problem-in-console

    // Resize responsive
    window.addEventListener('resize', () => {

        const w = window.innerWidth;
        const h = window.innerHeight;

        // Update map (note: elements on the map still have to be updated)
        svg.attr("width", w).attr("height", h);
        projection.translate([w / 2, h / 2]);

        // Update countries
        mapLayer.selectAll("path").attr("d", path);

        // Update seas
        mapLayer.selectAll(".sea-group")
            .attr("transform", (d) => `translate(${projection(d.coords)})`)
        ;

        // Update Atlas & Riff
        mapLayer.selectAll(".location-group")
            .attr("transform", (d) => `translate(${projection(d.coords)})`)
        ;
    });

});

/* === BOOKING SECTION'S CALENDAR SCRIPT === */
document.addEventListener("DOMContentLoaded", function () {

    document.addEventListener('DOMContentLoaded', (event) => {

        const dateInput1 = document.getElementById('InputDate');
        const dateInput2 = document.getElementById('InputDate1');

        // flatpickr (= calendar) library configurations
        const flatpickrConfig = {

            placeholder: "gg/mm/aaaa",
            dateFormat: "d/m/Y",
            locale: {
                weekdays: {
                    shorthand: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'],
                    longhand: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
                },
                months: {
                    shorthand: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
                    longhand: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
                },
                firstDayOfWeek: 1,
                scrollTitle: "Scorri per cambiare",
                toggleTitle: "Clicca per cambiare",
                amPM: ["AM", "PM"],
                rangeSeparator: " a ",
                time_24hr: true,
            },

            // disables Mondays (Restaurant is closed)
            disable: [
                function (date) {
                    return (date.getDay() === 1);
                }
            ],

            // Set minimum date
            minDate: "today",
        };

        // Initialize flatpickr (= library to put the calendar) for first field
        if (dateInput1 && typeof flatpickr !== 'undefined') {
            flatpickr(dateInput1, flatpickrConfig);
        }

        // Initialize flatpickr (= library to put the calendar) for second field
        if (dateInput2 && typeof flatpickr !== 'undefined') {
            flatpickr(dateInput2, flatpickrConfig);
        }
    });

});