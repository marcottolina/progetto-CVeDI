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
        const items = document.querySelectorAll(".timeline-item");
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

            // Immediate STOP of any previous transitions
            if (currentInterval) clearInterval(currentInterval);

            // === CASE 1: CLICK ON THE SAME BUTTON (STOP / PAUSE) ===
            if (currentButton === this) {

                // Audio: PAUSE & RESET
                if (currentAudio) {
                    currentAudio.pause();
                    //currentAudio.currentTime = 0;
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
                            //videoToFade.currentTime = 0;
                            videoToFade.playbackRate = 1; // Reset speed for the future
                            //clearInterval(currentInterval);
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
                //currentVideo.currentTime = 0; // Important: rewind the previous video
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
                //video.currentTime = 0;
                video.playbackRate = 0.1;
                video.play();

                let rate = 0.1;
                currentInterval = setInterval(() => {
                    rate += 0.1;
                    if (rate >= 1) {
                        video.playbackRate = 1;
                        //clearInterval(currentInterval);
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
                //currentVideo.currentTime = 0;
                currentVideo = null;
            }
            if (currentButton) {
                currentButton.classList.remove('attivo');
                currentButton = null;
            }
            if (currentAudio) { // Stop the audio of the timeline
                currentAudio.pause();
                //currentAudio.currentTime = 0;
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

    addSimpleAudioControl("music-startdesc1", "../media/audio/thalassa-hans-zimmer-cornfields.aac");
    addSimpleAudioControl("music-startdesc2", "../media/audio/madreperla-mr-kitty-after-dark.aac");
    addSimpleAudioControl("music-startdesc3", "../media/audio/bioluma-the-chainsmokers-breathe.aac");

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

        // sub-element "g" will contain the actual map (with seas and nations)
        const mapLayer = svg.append("g");

        // Tooltip selection
        const tooltip = d3.select("#tooltip");

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

        // Setup zoom (so it only works when holding ALT)
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .filter((event) => {
                if (event.type === 'wheel' && !event.altKey) {  // if it's a scroll (event === 'wheel') but ALT is not pressed ...
                    return false;
                }
                return true;
            })

            .on("start", () => {
                document.body.classList.add("is-map-interacting"); // add "being-interacted-with" class when interactions starts
                hideTooltip(); // hide currently shown tooltip when moving the map around
            })
            .on("zoom", (event) => {
                mapLayer.attr("transform", event.transform); // transform map when it is being zoomed
                hideTooltip(); // hide currently shown tooltip when map is being zoomed
            })
            .on("end", () => {
                document.body.classList.remove("is-map-interacting"); // remove "being-interacted-with" class when interaction ends (will show the tooltip back)
            })
        ;

        svg.call(zoom); // attach the now set-up zoom component to the SVG

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

                    moveTooltip(event); //  to put the tooltip in the right position when clicking on mobile

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
                moveTooltip(event); //  to put the tooltip in the right position when clicking on mobile
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

            // Add a transparent "Hitbox" circle larger than the max pulse radius (which is 10px)
            // to avoid "flickering" effect on certain mouseovers at the edges
            // Making it 20px also should make it easier to press on mobile
            locations.append("circle")
                .attr("r", 20)
                .attr("fill", "transparent") // make the circle transparent (otherwise it's visually displayed)
                .style("cursor", "pointer") // Ensures the hand cursor shows
            ;

            // Draw Atlas circle
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

            // Mouseover for Atlas & Riff
            locations.on("mouseover", function (event, d) {
                tooltip.style("opacity", 1)
                    .style("border-color", "#FF3276") // couldn't use var(--pink) here
                    .style("color", "#FF3276")
                    .html(`<b>Riff</b><br/>Atlas, P.zza Corolleo 1 24°N - 46°O, -230 m<br/>Settore abissale Ovest`)
                ;
                moveTooltip(event); // to put the tooltip in the right position when clicking on mobile
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
    }
});

/* === BOOKING SECTION'S CALENDAR AND SELECT SCRIPT === */
/* <editor-fold> */

/* --- SELECT --- */
document.addEventListener('DOMContentLoaded', function () {

    const customSelectWrappers = document.querySelectorAll('.custom-select-wrapper');

    /* --- Management functions --- */
    function openDropdown(wrapper, selectedDiv, itemsDiv) {
        // Apply opening classes
        wrapper.classList.add('select-is-open'); // Attiva Z-Index
        selectedDiv.classList.add('select-arrow-active');
        itemsDiv.classList.remove('select-hide');
    }

    function closeDropdown(wrapper, selectedDiv, itemsDiv) {
        // Remove closing classes
        wrapper.classList.remove('select-is-open'); // Disattiva Z-Index
        selectedDiv.classList.remove('select-arrow-active');
        itemsDiv.classList.add('select-hide');
    }

    function closeAllSelects(exceptionWrapper) {
        const wrappers = document.querySelectorAll(".custom-select-wrapper");

        wrappers.forEach(wrapper => {
            // If the current wrapper is NOT the exception (the select being clicked)
            if (wrapper !== exceptionWrapper) {
                const selectedDiv = wrapper.querySelector('.select-selected');
                const itemsDiv = wrapper.querySelector('.select-items');

                // Explicitly close if it is open
                if (itemsDiv && !itemsDiv.classList.contains('select-hide')) {
                    closeDropdown(wrapper, selectedDiv, itemsDiv);
                }
            }
        });
    }

    customSelectWrappers.forEach(wrapper => {
        const targetSelectId = wrapper.getAttribute('data-target');
        const originalSelect = document.getElementById(targetSelectId);

        if (!originalSelect) return; // Exit if the native select doesn't exist

        const selectedDiv = wrapper.querySelector('.select-selected');
        const itemsDiv = wrapper.querySelector('.select-items');

        // Sync the visible div with the initial value of the native select
        selectedDiv.innerHTML = originalSelect.options[originalSelect.selectedIndex].text;

        // Generate visible options based on the native select
        itemsDiv.innerHTML = ''; // Clear initial content
        Array.from(originalSelect.options).forEach(option => {
            if (option.disabled && option.selected) return; // Skip placeholder

            const item = document.createElement('div');
            item.innerHTML = option.text;
            item.setAttribute('data-value', option.value);

            // Apply 'same-as-selected' class if it's the currently chosen option
            if (option.selected && !option.disabled) {
                item.classList.add('same-as-selected');
            }

            item.addEventListener('click', function (e) {
                // Click on a simulated option: update value and close
                const value = this.getAttribute('data-value');
                selectedDiv.innerHTML = this.innerHTML;

                // Update the native select
                originalSelect.value = value;

                // Remove 'same-as-selected' class from all and add it to the new element
                Array.from(itemsDiv.children).forEach(child => child.classList.remove('same-as-selected'));
                this.classList.add('same-as-selected');

                // Simulate 'change' event on the native select (useful for validation)
                originalSelect.dispatchEvent(new Event('change'));

                // Close dropdown (including activation classes and z-index)
                closeDropdown(wrapper, selectedDiv, itemsDiv);
                e.stopPropagation();
            });
            itemsDiv.appendChild(item);
        });

        // Click on the selected element: toggle the dropdown
        selectedDiv.addEventListener('click', function (e) {
            e.stopPropagation();
            // Check if it's already open
            const isCurrentlyOpen = itemsDiv.classList.contains('select-hide') === false;
            closeAllSelects(wrapper);

            if (!isCurrentlyOpen) {
                // If it wasn't open, open it
                openDropdown(wrapper, selectedDiv, itemsDiv);
            } else {
                // If it was open, close it (closeAllSelects doesn't close it if passed as argument)
                closeDropdown(wrapper, selectedDiv, itemsDiv);
            }
        });

    });

    // Click anywhere on the document: close all open dropdowns
    document.addEventListener('click', () => closeAllSelects(null));


    // --- SINGLE CUSTOM VALIDATION FUNCTION FOR ALL FIELDS ---

    function validateCustomField(elementId) {
        const element = document.getElementById(elementId);
        if (!element) return true;

        const inputGroup = element.closest('.input-group');
        let visibleElement = null;
        let errorText = '';

        // Remove previous error (if it exists)
        // Note: for date fields, the error is on the parent (handled in the DATA block), but this generic cleanup helps.
        const oldError = element.closest('.col-md-5')?.querySelector('.custom-error') || inputGroup?.querySelector('.custom-error');
        if (oldError) oldError.remove();

        // ---- SELECT CUSTOM ----
        if (element.tagName === 'SELECT') {
            const wrapper = inputGroup.querySelector('.custom-select-wrapper');
            visibleElement = wrapper.querySelector('.select-selected');

            errorText =
                elementId === 'selectPersone'
                    ? 'Selezionare il numero di persone'
                    : 'Selezionare un orario';

            const isInvalid = element.value === '' || element.selectedIndex === 0;

            if (isInvalid) {
                visibleElement.classList.add('is-invalid');

                const error = document.createElement('div');
                error.className = 'custom-error';
                error.textContent = errorText;
                visibleElement.after(error);

                return false;
            } else {
                visibleElement.classList.remove('is-invalid');
                return true;
            }
        }

        // ---- INPUT DATA ----
        // For both IDs
        if (elementId === 'bookingDate' || elementId === 'bookingDate1') {
            const inputGroup = element.closest('.input-group');
            const parent = inputGroup.parentElement;

            // Remove previous error from main container (col-md-5)
            const errorContainer = parent.closest('.col-md-5');
            const oldErrorData = errorContainer.querySelector('.custom-error');
            if (oldErrorData) oldErrorData.remove();


            const isInvalid = element.value === '';

            if (isInvalid) {
                element.classList.add('is-invalid');

                const error = document.createElement('div');
                error.className = 'custom-error';
                error.textContent = 'Selezionare una data';

                // Insert error after the inputGroup
                inputGroup.after(error);

                return false;
            } else {
                // Remove 'is-invalid' class on success
                element.classList.remove('is-invalid');
                return true;
            }
        }
    }

    // --- SUBMISSION AND VALIDATION MANAGEMENT FOR ALL FORMS ---
    const allForms = document.querySelectorAll('.needs-validation');

    allForms.forEach(form => {
        form.addEventListener('submit', function (event) {
            let isFormValid = true;

            // 1. 'selectPersone' validation (only if present in the form)
            if (form.querySelector('#selectPersone')) {
                if (!validateCustomField('selectPersone')) {
                    isFormValid = false;
                }
            }

            // 2. Date validation (check which date ID is present in this form)
            const bookingDateId = form.querySelector('#bookingDate') ? 'bookingDate' :
                form.querySelector('#bookingDate1') ? 'bookingDate1' : null;

            if (bookingDateId && !validateCustomField(bookingDateId)) {
                isFormValid = false;
            }


            const selectOrarioId = form.querySelector('#selectOrario') ? 'selectOrario' :
                form.querySelector('#selectOrario1') ? 'selectOrario1' : null;

            if (selectOrarioId && !validateCustomField(selectOrarioId)) {
                isFormValid = false;
            }

            // If native validation or custom validation fails
            if (form.checkValidity() === false || !isFormValid) {
                event.preventDefault();
                event.stopPropagation();
            }

            // Apply 'was-validated' class (also triggered in the initial Bootstrap snippet)
            form.classList.add('was-validated');
        }, false);
    });

    // --- REMOVE ERROR ON VALUE CHANGE (Change Listeners) ---

    // Listener for the Date
    document.querySelectorAll('#bookingDate, #bookingDate1').forEach(input => {
        input.addEventListener('change', function () {
            validateCustomField(this.id);
        });
    });

    // Listener for 'selectPersone'
    document.getElementById('selectPersone')?.addEventListener('change', function () {
        validateCustomField('selectPersone');
    });

    // Listener for 'selectOrario'
    document.querySelectorAll('#selectOrario, #selectOrario1').forEach(input => {
        input.addEventListener('change', function () {
            validateCustomField(this.id);
        });
    });

    /* --- CALENDAR MANAGEMENT ---*/

    // 1. Define Italian locale (Workaround in case it.js doesn't load correctly)
    // Object taken directly from the Datepicker library documentation.
    if (typeof Datepicker !== 'undefined' && typeof Datepicker.locales !== 'undefined' && typeof Datepicker.locales.it === 'undefined') {
        Datepicker.locales.it = {
            days: ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"],
            daysShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
            daysMin: ["Do", "Lu", "Ma", "Me", "Gi", "Ve", "Sa"],
            months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
            monthsShort: ["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"],
            today: "Oggi",
            clear: "Cancella",
            dateFormat: "dd/mm/yyyy",
            titleFormat: "MM yyyy",
            weekStart: 1
        };
    }

    // --- 1. CONFIGURATION FOR BOTH CALENDARS ---
    const datepickerOptions = {
        autohide: true,
        todayHighlight: true,
        startDate: new Date(), // parte da oggi
        format: 'dd/mm/yyyy',
        weekStart: 1, // lunedì
        buttonClass: 'btn btn-sm btn-outline-light',
        language: 'it',
        beforeShowDay: function (date) {
            const today = new Date();
            const day = date.getDay();

            // Disable Monday
            if (day === 1) {
                return false;
            }

            // 2. Disable all dates BEFORE the current date (TODAY)
            // If the calendar date is strictly less than today
            if (date < today) {
                return false;
            }

            return true;
        }
    };

    // --- INITIALIZATION OF THE 2 CALENDARS ---
    const dateInput1 = document.getElementById('bookingDate');
    if (dateInput1) {
        const datepicker1 = new Datepicker(dateInput1, datepickerOptions);

        //Listen for specific Datepicker event
        dateInput1.addEventListener('changeDate', function () {
            validateCustomField('bookingDate');
        });
    }

    const dateInput2 = document.getElementById('bookingDate1');
    if (dateInput2) {
        const datepicker2 = new Datepicker(dateInput2, datepickerOptions);

        dateInput2.addEventListener('changeDate', function () {
            validateCustomField('bookingDate1');
        });
    }

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

    buttons.forEach(button => {
        button.addEventListener('click', () => {

            const targetAllergen = button.getAttribute('data-target');

            allAllergens.forEach(item => {

                if (item.classList.contains(`allergen-${targetAllergen}`)) {
                    item.classList.toggle('allergen-active');
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
            buttons.forEach(button => {
                button.classList.remove('chips-active');
            })
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

            newsletterInput.classList.add('is-invalid'); // show input error
            invalidPopup.classList.remove('d-none'); // show error popup

            removeInputError(newsletterInput); // delete input in 5 seconds
            fadeOutPopup(invalidPopup); // delete popup in 5 seconds
        }
    });

})
