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

    let dots = []; // Global array of dynamic dots
    let isDesktop = false; // Flag to trace state
    if (timeline) {
        const items = document.querySelectorAll(".timeline-container > .timeline-item");
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

            if (width >= 768) { // Dots for desktop only
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
    }
})

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
/* <editor-fold> */

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

/* </editor-fold> */

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
            const bubbleImg = item ? item.querySelector(".bubble-box img") : null;

            // Immediate STOP of any previous transitions
            if (currentInterval) clearInterval(currentInterval);

            // === CASE 1: CLICK ON THE SAME BUTTON (STOP / PAUSE) ===
            if (currentButton === this) {

                // Audio: PAUSE & RESET
                if (currentAudio) {
                    currentAudio.pause();
                }

                /* NEW: Reset bubble to static image */
                if (bubbleImg) {
                    bubbleImg.src = bubbleImg.getAttribute('data-static');
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
                            videoToFade.playbackRate = 1; // Reset speed for the future
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

            /* Reset previous bubble to static before switching */
            if (currentButton) {
                const prevItem = currentButton.closest(".timeline-item");
                const prevBubble = prevItem ? prevItem.querySelector(".bubble-box img") : null;
                if (prevBubble) {
                    prevBubble.src = prevBubble.getAttribute('data-static');
                }
            }

            // Stop Previous Video
            if (currentVideo && currentVideo !== video) {
                currentVideo.pause();
                currentVideo.playbackRate = 1; // Reset speed
            }

            // Reset UI of Previous Button
            if (currentButton && currentButton !== this) {
                currentButton.classList.remove('attivo');
            }

            // === CASE 3: START NEW AUDIO ===
            audio.currentTime = 0;
            audio.play();

            /* Activate animated bubble (GIF) */
            if (bubbleImg) {
                bubbleImg.src = bubbleImg.getAttribute('data-gif');
            }

            // === CASE 4: START NEW VIDEO (FADE IN) ===
            if (video) {
                video.playbackRate = 0.1;
                video.play();

                let rate = 0.1;
                currentInterval = setInterval(() => {
                    rate += 0.1;
                    if (rate >= 1) {
                        video.playbackRate = 1;
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

    /* SECONDARY FUNCTION: Handles plate descriptions (Audio only) */
    function addSimpleAudioControl(btnId, audioUrl) {
        const playBtn = document.getElementById(btnId);
        if (!playBtn) return;

        const audio = new Audio(audioUrl);

        playBtn.addEventListener('click', () => {

            /* toDo: edit this part so that the video stops rather than resetting */
            if (currentVideo) {
                currentVideo.pause();
                currentVideo = null;
            }

            /* Reset any active bubble in the timeline when playing simple audio */
            if (currentButton) {
                const activeItem = currentButton.closest(".timeline-item");
                const activeBubble = activeItem ? activeItem.querySelector(".bubble-box img") : null;
                if (activeBubble) {
                    activeBubble.src = activeBubble.getAttribute('data-static');
                }
                currentButton.classList.remove('attivo');
                currentButton = null;
            }

            if (currentAudio) { // Stop the audio of the timeline
                currentAudio.pause();
                currentAudio = null;
            }

            if (audio.paused) {
                audio.play();
                playBtn.classList.add('attivo');
            } else {
                audio.pause();
                audio.currentTime = 0;
                playBtn.classList.remove('attivo');
            }
        });
    }

    // === INITIALIZATION ===
    addMediaControl("music-start1", "../media/audio/thalassa-hans-zimmer-cornfields.aac");
    addMediaControl("music-start2", "../media/audio/madreperla-mr-kitty-after-dark.aac");
    addMediaControl("music-start3", "../media/audio/bioluma-the-chainsmokers-breathe.aac");

    addMediaControl("music-startdesc1", "../media/audio/thalassa-hans-zimmer-cornfields.aac");
    addMediaControl("music-startdesc2", "../media/audio/madreperla-mr-kitty-after-dark.aac");
    addMediaControl("music-startdesc3", "../media/audio/bioluma-the-chainsmokers-breathe.aac");

});

/* === CAROUSELS LOGIC & SETTINGS (from SwiperJS) === */
document.addEventListener('DOMContentLoaded', function () {
    // Controlla se Swiper è definito E se esiste l'elemento nella pagina
    if (typeof Swiper !== 'undefined') {
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

        /* Carousel 1: the one with only multiple-images (uses .swiper-images class) */
        const swiperHome = new Swiper('.swiper-home', {

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
                el: '.swiper-home .swiper-pagination', // specific scoping
                type: 'progressbar',
            },

            // specific scoping for buttons
            navigation: {
                nextEl: '.swiper-home .swiper-button-next',
                prevEl: '.swiper-home .swiper-button-prev',
            },

            scrollbar: {
                el: '.swiper-home .swiper-scrollbar',
            },
        });
    }
});

/* === INTERACTIVE MAP WITH D3 === */
/* === INTERACTIVE MAP WITH D3 === */
document.addEventListener("DOMContentLoaded", function () {
    if (typeof d3 !== 'undefined') {
        // Size configuration
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Placing an SVG in the map container
        const container = d3.select("#map-container");
        const svg = container.append("svg");

        // = SVG setup (to make it a map) =

        // define SVG sizes (must add an attribute for it)
        svg.attr("width", width);
        svg.attr("height", height);

        // Close tooltip when clicking on the empty background (essential for mobile)
        svg.on("click", () => {
            hideTooltip();
        });

        // sub-element "g" will contain the actual map (with seas and nations)
        const mapLayer = svg.append("g");

        // Tooltip selection
        const tooltip = d3.select("#map-tooltip");

        // function for tooltip interaction that gets the pointer's coordinates (or clicked coordinates) and places the tooltip next to it
        const moveTooltip = (event) => {
            const [x, y] = d3.pointer(event, container.node()); // get pointer coordinates
            tooltip.style("transform", `translate(${x + 15}px, ${y + 15}px) translate(-50%, -150%)`); // place tooltip next to pointer
        };

        // function to hide tooltip
        const hideTooltip = () => {
            tooltip.style("opacity", 0);
        };

        // sea labels coordinates (only in the restaurant's general area)
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

        // = Setup & Protection of the 3D D3 map on a 2D plane =

        // Setup projection
        const projection = d3.geoMercator();
        projection.center([128, -5]); // set initial position (on Indonesia)
        projection.scale(2000); // set initial zoom level
        projection.translate([width / 2, height / 2]); // align map at the center of the container

        // Make projection
        const path = d3.geoPath().projection(projection);


        // = Setup & Add Zoom / Pan handling for the map =

        let isMapDragging = false;

        // Setup zoom (so it only works when holding ALT)
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .filter((event) => {
                if (event.type === 'wheel' && !event.altKey) {
                    return false;
                }
                return true;
            })
            .on("start", () => {

                isMapDragging = false;
                document.body.classList.add("is-map-interacting");
                hideTooltip();
            })
            .on("zoom", (event) => {
                isMapDragging = true;
                mapLayer.attr("transform", event.transform);
                hideTooltip();
            })
            .on("end", () => {
                document.body.classList.remove("is-map-interacting");
                if (isMapDragging) {
                    setTimeout(() => {
                        isMapDragging = false;
                    }, 100);
                }
            })
        ;

        svg.call(zoom);

        // Atlas and Riff's position (object)
        const cityData = [
            {
                name: "Riff",
                coords: [127, -7],
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

                    // some flavor information to differentiate some countries from one another
                    switch (exName) {
                        case "Ex-Australia":
                            tooltip.style("opacity", 1)
                                .html(`<b>${exName}</b><br/><b>Stato:</b> semi-sommersa <br><b>Navigabilità: </b>accesso proibito`)
                            ;
                            break;
                        case "Ex-East Timor":
                            tooltip.style("opacity", 1)
                                .html(`<b>${exName}</b><br/><b>Stato:</b> sommerso <br><b>Navigabilità: </b>accesso proibito (attività vulcanica)`)
                            ;
                            break;
                        default:
                            tooltip.style("opacity", 1)
                                .html(`<b>${exName}</b><br/><b>Stato:</b> sommerso <br><b>Navigabilità: </b>accesso consentito`)
                            ;
                    }

                    moveTooltip(event); // to put the tooltip in the right position when clicking on mobile

                })
                // Click event to handle mobile interaction (tap)
                .on("click", function(event, d) {
                    event.stopPropagation(); // Stop propagation to prevent SVG background click from firing

                    // Re-run the same logic as mouseover
                    d3.select(this).raise();
                    const countryName = d.properties.name;
                    const exName = "Ex-" + countryName;

                    switch (exName) {
                        case "Ex-Australia":
                            tooltip.style("opacity", 1)
                                .html(`<b>${exName}</b><br/><b>Stato:</b> semi-sommersa <br><b>Navigabilità: </b>accesso proibito`);
                            break;
                        case "Ex-East Timor":
                            tooltip.style("opacity", 1)
                                .html(`<b>${exName}</b><br/><b>Stato:</b> sommerso <br><b>Navigabilità: </b>accesso proibito (attività vulcanica)`);
                            break;
                        default:
                            tooltip.style("opacity", 1)
                                .html(`<b>${exName}</b><br/><b>Stato:</b> sommerso <br><b>Navigabilità: </b>accesso consentito`);
                    }
                    moveTooltip(event);
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
                    .html(`<b>${d.name}</b><br> <b>Settore:</b> Oceano Australe<br> <b>Viabilità: </b>aperta al traffico`)
                ;
                moveTooltip(event); // to put the tooltip in the right position when clicking on mobile
            })
                // Click event for mobile (seas)
                .on("click", function(event, d) {
                    event.stopPropagation(); // Stop propagation
                    tooltip.style("opacity", 1)
                        .html(`<b>${d.name}</b><br> <b>Settore:</b> Oceano Australe<br> <b>Viabilità: </b>aperta al traffico`);
                    moveTooltip(event);
                })
                .on("mousemove", moveTooltip)
                .on("mouseout", hideTooltip);

            // = Draw Riff Location =
            const locations = mapLayer.selectAll(".location-group")
                .data(cityData)
                .enter()
                .append("g")
                .attr("class", "location-group")
                .attr("transform", d => `translate(${projection(d.coords)})`)
            ;

            // 1. Transparent "Hitbox" circle (keeps it easy to click on mobile)
            locations.append("circle")
                .attr("r", 30) // Generous hitbox
                .attr("fill", "transparent")
                .style("cursor", "pointer")
            ;

            // 2. The Orange Glowing Marker (Single circle)
            locations.append("circle")
                .attr("r", 14)
                .attr("class", "riff-marker")
            ;

            // 3. Text Label ("Riff")
            locations.append("text")
                .attr("class", "location-label")
                .text(d => d.name)
            ;

            // Interaction: Mouseover (Riff Location)
            locations.on("mouseover", function (event, d) {
                // ADD the variant class to apply the orange style
                tooltip.classed("riff-variant", true);

                tooltip.style("opacity", 1)
                    .html(`
                        <b>Riff</b><br/>
                        <span style="opacity: 0.8">Atlas, P.zza Corolleo 1<br/>
                        24°N - 46°O, -230 m<br/>
                        Settore abissale Ovest</span>
                    `);

                moveTooltip(event);
            });

            // Interaction: Click (Mobile/Touch)
            locations.on("click", function (event, d) {
                // If the map was moving, exit.
                // Thanks to the correction above, if it's a simple tap, isMapDragging will be false.
                if (isMapDragging) return;

                event.stopPropagation(); // Stop the click before it reaches the background (which would close the tooltip)

                // ADD the variant class
                tooltip.classed("riff-variant", true);

                tooltip.style("opacity", 1)
                    .html(`
                        <b>Riff</b><br/>
                        <span style="opacity: 0.8">Atlas, P.zza Corolleo 1<br/>
                        24°N - 46°O, -230 m<br/>
                        Settore abissale Ovest</span>
                    `);

                moveTooltip(event);
            });


            // Move tooltip with mouse inside the location radius
            locations.on("mousemove", moveTooltip);

            // Interaction: Mouseout (Reset)
            locations.on("mouseout", function () {
                hideTooltip();
                // REMOVE the variant class when exiting to reset style for other elements
                tooltip.classed("riff-variant", false);
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
    }
});

/* === BOOKING SECTION'S CALENDAR AND SELECT SCRIPT === */
/* <editor-fold> */

/* --- SELECT --- */
document.addEventListener('DOMContentLoaded', function () {

    /* --- 1. CUSTOM SELECT DROPDOWN MANAGEMENT --- */
    // Synchronizes simulated div-dropdowns with hidden native select elements
    const customSelectWrappers = document.querySelectorAll('.custom-select-wrapper');

    customSelectWrappers.forEach(wrapper => {
        const targetSelectId = wrapper.getAttribute('data-target');
        const originalSelect = document.getElementById(targetSelectId);
        if (!originalSelect) return;

        const selectedDiv = wrapper.querySelector('.select-selected');
        const itemsDiv = wrapper.querySelector('.select-items');

        /**
         * Safely updates text without deleting <img> icons
         */
        const updateTextSafely = (div, newText) => {
            const textNode = Array.from(div.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (textNode) {
                textNode.textContent = newText;
            } else if (div.firstChild) {
                div.insertBefore(document.createTextNode(newText), div.firstChild);
            } else {
                div.prepend(document.createTextNode(newText));
            }
        };

        // Initial sync: text from native select
        updateTextSafely(selectedDiv, originalSelect.options[originalSelect.selectedIndex].text);

        // Build simulated options based on native <select>
        itemsDiv.innerHTML = '';
        Array.from(originalSelect.options).forEach(option => {
            if (option.disabled && option.selected) return; // Skip placeholders

            const item = document.createElement('div');
            item.innerHTML = option.text;
            item.setAttribute('data-value', option.value);

            if (option.selected && !option.disabled) {
                item.classList.add('same-as-selected');
            }

            item.addEventListener('click', function (e) {
                e.stopPropagation();
                updateTextSafely(selectedDiv, this.innerHTML);
                originalSelect.value = this.getAttribute('data-value');

                // UI update for selection
                Array.from(itemsDiv.children).forEach(child => child.classList.remove('same-as-selected'));
                this.classList.add('same-as-selected');

                // Fire change event for validation engine
                originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
                closeDropdown(wrapper, selectedDiv, itemsDiv);
            });
            itemsDiv.appendChild(item);
        });

        // Toggle dropdown on click
        selectedDiv.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = !itemsDiv.classList.contains('select-hide');
            closeAllSelects(wrapper);
            if (!isOpen) {
                wrapper.classList.add('select-is-open');
                selectedDiv.classList.add('select-arrow-active');
                itemsDiv.classList.remove('select-hide');
            } else {
                closeDropdown(wrapper, selectedDiv, itemsDiv);
            }
        });
    });

    /* --- 2. DROPDOWN UTILITY FUNCTIONS --- */

    function closeDropdown(wrapper, selectedDiv, itemsDiv) {
        wrapper.classList.remove('select-is-open');
        selectedDiv.classList.remove('select-arrow-active');
        itemsDiv.classList.add('select-hide');
    }

    function closeAllSelects(exceptionWrapper = null) {
        document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
            if (wrapper !== exceptionWrapper) {
                const selectedDiv = wrapper.querySelector('.select-selected');
                const itemsDiv = wrapper.querySelector('.select-items');
                closeDropdown(wrapper, selectedDiv, itemsDiv);
            }
        });
    }

    document.addEventListener('click', () => closeAllSelects());

    /* --- 3. SURGICAL VALIDATION ENGINE --- */

    function validateCustomField(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return true;

        const columnContainer = element.closest('.col-md-6');
        let visualTarget = null;
        let errorText = '';

        // Clean up previous error states
        const oldError = columnContainer.querySelector('.custom-error');
        if (oldError) oldError.remove();

        // ---- LOGIC FOR CUSTOM SELECTS ----
        if (element.tagName === 'SELECT') {
            const wrapper = columnContainer.querySelector('.custom-select-wrapper');
            visualTarget = wrapper.querySelector('.select-selected');
            errorText = (elementId === 'selectPersone') ? 'Selezionare il numero di persone' : 'Selezionare un orario';

            const isInvalid = element.value === '' || element.selectedIndex === 0;

            if (isInvalid) {
                visualTarget.classList.add('is-invalid');
                const error = document.createElement('div');
                error.className = 'custom-error';
                error.textContent = errorText;
                wrapper.after(error); // Places error right below the select wrapper
                return false;
            } else {
                visualTarget.classList.remove('is-invalid');
                return true;
            }
        }

        // ---- LOGIC FOR DATE INPUTS ----
        if (elementId.includes('bookingDate')) {
            const inputGroup = element.closest('.input-group');
            visualTarget = element;
            errorText = 'Selezionare una data';

            const isInvalid = element.value.trim() === '';

            if (isInvalid) {
                visualTarget.classList.add('is-invalid');
                const error = document.createElement('div');
                error.className = 'custom-error';
                error.textContent = errorText;
                inputGroup.after(error); // Places error right below the input group
                return false;
            } else {
                visualTarget.classList.remove('is-invalid');
                return true;
            }
        }
        return true;
    }

    /* --- 4. FORM SUBMISSION MANAGEMENT --- */
    const allForms = document.querySelectorAll('.needs-validation');

    allForms.forEach(form => {
        form.addEventListener('submit', function (event) {
            let isFormValid = true;

            // Dynamically identify required custom fields in the current form
            const customFields = form.querySelectorAll('select[required], input[id^="bookingDate"]');

            customFields.forEach(field => {
                if (!validateCustomField(field.id)) {
                    isFormValid = false;
                }
            });

            // Standard Bootstrap validation + Custom check
            if (form.checkValidity() === false || !isFormValid) {
                event.preventDefault();
                event.stopPropagation();
            }

            form.classList.add('was-validated');
        }, false);
    });

    /* --- 5. REAL-TIME VALIDATION LISTENERS --- */
    document.querySelectorAll('select[required], input[id^="bookingDate"]').forEach(input => {
        input.addEventListener('change', () => validateCustomField(input.id));
    });

    /* --- 6. DATEPICKER SETUP --- */
    // Italian locale definition
    if (typeof Datepicker !== 'undefined' && Datepicker.locales && !Datepicker.locales.it) {
        Datepicker.locales.it = {
            days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
            daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
            daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
            months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            monthsShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
            today: "Oggi", clear: "Cancella", dateFormat: "dd/mm/yyyy", titleFormat: "MM yyyy", weekStart: 1
        };
    }

    const datepickerOptions = {
        autohide: true,
        todayHighlight: true,
        startDate: new Date(),
        format: 'dd/mm/yyyy',
        language: 'it',
        container: 'body', // Critical: prevents clipping in Liquid Glass boxes
        beforeShowDay: (date) => {
            const day = date.getDay();
            const today = new Date();
            today.setHours(0,0,0,0);
            return day !== 1 && date >= today; // Disable Mondays and past dates
        }
    };

    document.querySelectorAll('input[id^="bookingDate"]').forEach(input => {
        new Datepicker(input, datepickerOptions);
        // Validates immediately after a date is picked
        input.addEventListener('changeDate', () => validateCustomField(input.id));
    });

});

/* === FILTER IN MENU.HTML === */
document.addEventListener("DOMContentLoaded", function () {

    /* === ALLERGEN CHIPS (& their logic) === */

    const chipsButtons = document.querySelectorAll('.chips'); // select all plates from the menu that have an allergen (allergens are contained in these 'chips')

    // Toggles 'chips-active' class upon clicking an allergen's chip
    chipsButtons.forEach(button => {
        button.addEventListener('click', function () {
            this.classList.toggle('chips-active'); // toDo: complete logic of what needs to happen when this is toggled
        });
    });

    //put active the corrispective allergen in the menu
    const buttons = document.querySelectorAll('.btn-filter');
    const allAllergens = document.querySelectorAll('[class*="allergen-"]');
    const allPreference = document.querySelectorAll('[class*="preference-"]');

    buttons.forEach(button => {
        button.addEventListener('click', () => {

            const target = button.getAttribute('data-target');

            allAllergens.forEach(item => {

                if (item.classList.contains(`allergen-${target}`)) {
                    item.classList.toggle('allergen-active');
                }
            });

            allPreference.forEach(item => {

                if (item.classList.contains(`preference-${target}`)) {
                    item.classList.toggle('preference-active');
                }
            });
        });
    });

    //reset all filters in menu and filter section
    const resetBtn = document.querySelector('.btn-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            allAllergens.forEach(item => {
                item.classList.remove('allergen-active');
            });
            allPreference.forEach(item => {
                item.classList.remove('preference-active');
            });
            buttons.forEach(button => {
                button.classList.remove('chips-active');
            })
        });
    }
});

// RESET BUTTON IN FORM
document.addEventListener('DOMContentLoaded', function () {
    const btnCancella = document.getElementById('btnCancella');

    if (btnCancella) {
        btnCancella.addEventListener('click', function () {
            const form = this.closest('form');
            if (!form) return;

            // 1. Manual Clear: set all inputs to an empty string
            form.querySelectorAll('input').forEach(input => {
                input.value = "";
            });

            // 2. Reset Native Selects to the first (disabled) option
            form.querySelectorAll('select').forEach(select => {
                select.selectedIndex = 0;
            });

            // 3. Update Custom Select UI to show the placeholder text
            const customSelects = form.querySelectorAll('.custom-select-wrapper');
            customSelects.forEach(wrapper => {
                const targetId = wrapper.getAttribute('data-target');
                const nativeSelect = document.getElementById(targetId);
                const selectedDiv = wrapper.querySelector('.select-selected');

                if (nativeSelect && selectedDiv) {
                    // Get the text of the first option (placeholder like "Persone*" or "Orario*")
                    const placeholderText = nativeSelect.options[0].text;

                    // Update only the text node to preserve your icons (calendar/clock)
                    const textNode = Array.from(selectedDiv.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
                    if (textNode) {
                        textNode.textContent = placeholderText;
                    }
                }
            });

            // 4. Clean up validation: remove error messages and orange borders
            form.classList.remove('was-validated');
            form.querySelectorAll('.custom-error').forEach(error => error.remove());
            form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
            form.querySelectorAll('.same-as-selected').forEach(el => el.classList.remove('same-as-selected'));

            console.log("Form emptied successfully!");
        });
    }
});

/* === CHANGE LANGUAGE === */
document.addEventListener("DOMContentLoaded", function () {
    // Select all language toggle buttons by class
    const itaBtns = document.querySelectorAll('.btn-lan-ita');
    const medBtns = document.querySelectorAll('.btn-lan-med');

    // Select all content elements for both languages
    const itaContent = document.querySelectorAll('.lan-ita');
    const medContent = document.querySelectorAll('.lan-med');

    // Select the "prenota" buttons in nav
    const itaNavPrenota = document.querySelectorAll('.nav-lan-ita');
    const medNavPrenota = document.querySelectorAll('.nav-lan-med');

    function switchLanguage(lang) {
        if (lang === 'ita') {
            // Show all Italian elements and hide Medusiano elements
            itaContent.forEach(item => item.classList.remove('d-none'));
            medContent.forEach(item => item.classList.add('d-none'));

            itaNavPrenota.forEach(el => {
                el.classList.add('d-none', 'd-md-inline-block');
            });
            medNavPrenota.forEach(el => {
                el.classList.add('d-none');
                el.classList.remove('d-md-inline-block');
            });

            // Update styles for all buttons (underline the active one)
            itaBtns.forEach(btn => btn.style.textDecoration = 'underline');
            medBtns.forEach(btn => btn.style.textDecoration = 'none');
        } else {
            // Show all Medusiano elements and hide Italian elements
            medContent.forEach(item => item.classList.remove('d-none'));
            itaContent.forEach(item => item.classList.add('d-none'));

            medNavPrenota.forEach(el => {
                el.classList.add('d-none', 'd-md-inline-block');
            });
            itaNavPrenota.forEach(el => {
                el.classList.add('d-none');
                el.classList.remove('d-md-inline-block');
            });

            // Update styles for all buttons
            medBtns.forEach(btn => btn.style.textDecoration = 'underline');
            itaBtns.forEach(btn => btn.style.textDecoration = 'none');
        }
    }

    // Attach click event listeners to every Italian language button found
    itaBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            switchLanguage('ita');
        });
    });

    // Attach click event listeners to every Medusiano language button found
    medBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            switchLanguage('med');
        });
    });

    // Set the initial state to Italian on page load
    switchLanguage('ita');
});

/* </editor-fold> */

/* === NEWSLETTER === */
document.addEventListener("DOMContentLoaded", function () {

    // get references to buttons
    const newsletterButton = document.querySelector('footer form button');
    const newsletterInput = document.querySelector('footer input[type="text"]');

    // get references to popup divs
    const invalidPopup = document.querySelector('footer .invalid-popup-container');
    const validPopup = document.querySelector('footer .valid-popup-container');

    // hide popup by default
    invalidPopup.classList.add('d-none');
    validPopup.classList.add('d-none');

    let userInput = "";

    // function to validate the email (containing an unholy regex)
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const delay = ms => new Promise(res => setTimeout(res, ms));

    // function to hide a confirmation message after 5 seconds
    const fadeOutPopup = async (element) => {
        await delay(5000);
        element.classList.add('d-none');
    }

    // function to hide an input validity error message after 5 seconds
    const removeInputError = async (element) => {
        await delay(5000);
        element.classList.remove('is-invalid');
        element.classList.remove('invalid-input');
    }

    newsletterButton.addEventListener('click', function (event) {

        event.preventDefault(); // prevents page refresh

        // hide previous confirmation messages
        validPopup.classList.add('d-none');
        invalidPopup.classList.add('d-none');

        // hide previous input validity error messages
        newsletterInput.classList.remove('is-invalid');
        newsletterInput.classList.remove('is-valid');

        // get value of the user input
        userInput = newsletterInput.value;

        if (validateEmail(userInput)) { // if inserted mail is valid

            newsletterInput.classList.add('is-valid');

            validPopup.classList.remove('d-none');
            fadeOutPopup(validPopup); // delete popup in 5 seconds

            newsletterInput.value = ''; // clear input

        } else { // if inserted mail is not valid

            newsletterInput.classList.add('invalid-input'); // edit look of the input itself (orange border)
            newsletterInput.classList.add('is-invalid'); // show input error
            invalidPopup.classList.remove('d-none'); // show error popup

            removeInputError(newsletterInput); // delete input in 5 seconds
            fadeOutPopup(invalidPopup); // delete popup in 5 seconds
        }
    });

})

/* === TOOLTIPI ENABLING === */
document.addEventListener('DOMContentLoaded', () => {
    // selects and enables all the tooltip elements
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
});

/* === ALLERGENS HANDLING === */
document.addEventListener('DOMContentLoaded', () => {
    let f = document.getElementById('filter');
    let a = document.getElementById('allergens');
    f.addEventListener('click', () => {
        a.classList.toggle('d-none');
    });
});
