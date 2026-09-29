
// =========================
// MOBILE NAVBAR
// =========================

// =========================
// MOBILE NAVBAR
// =========================

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {

    // Open / close hamburger menu
    hamburger.addEventListener("click", () => {

        navLinks.classList.toggle("active");

    });

    // Close menu when any navigation option is clicked
    navLinks.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navLinks.classList.remove("active");

        });

    });

}

// =========================
// SWIPER HERO
// =========================

// const heroSwiper = new Swiper(".heroSwiper", {

//     loop: true,

//     effect: "fade",

//     autoplay: {

//         delay: 4000,

//         disableOnInteraction: false,

//     },

//     speed: 1200,

// });


// =========================
// CURSOR GLOW
// =========================

const cursorGlow = document.querySelector(".cursor-glow");

document.addEventListener("mousemove", (e) => {

    if (cursorGlow) {

        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;

    }

});


// =========================
// PORTFOLIO FILTER
// =========================

const filterButtons =
    document.querySelectorAll(".portfolio-filters button");

const portfolioCards =
    document.querySelectorAll(".portfolio-card");

filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

        filterButtons.forEach((btn) =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        const category =
            button.textContent.toLowerCase();

        portfolioCards.forEach((card) => {

            const cardCategory =
                card.dataset.category;

            if (
                category === "all" ||
                cardCategory === category
            ) {

                card.style.display = "block";

            } else {

                card.style.display = "none";

            }

        });

    });

});


// =========================
// AOS INIT
// =========================

// AOS.init({

//     duration: 1000,

//     once: true,

// });


// =========================
// NAVBAR BACKGROUND
// =========================

// const navbar = document.querySelector(".navbar");

// window.addEventListener("scroll", () => {

//     if (window.scrollY > 50) {

//         navbar.style.background =
//             "rgba(10,10,10,0.92)";

//     } else {

//         navbar.style.background =
//             "rgba(10,10,10,0.5)";

//     }

// });
// =========================
// STATS COUNTER
// =========================

const counters = document.querySelectorAll(".counter");

const counterObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (!entry.isIntersecting) return;

            const counter = entry.target;
            const target = Number(counter.dataset.target);

            let current = 0;

            const increment = target / 60;

            const updateCounter = () => {

                current += increment;

                if (current < target) {

                    counter.textContent = Math.ceil(current);

                    requestAnimationFrame(updateCounter);

                } else {

                    if (target === 50) {
                        counter.textContent = "50+";
                    }
                    else if (target === 5) {
                        counter.textContent = "5+";
                    }
                    else if (target === 100) {
                        counter.textContent = "100%";
                    }
                    else {
                        counter.textContent = target;
                    }

                }

            };

            updateCounter();

            counterObserver.unobserve(counter);

        });

    },
    {
        threshold: 0.5
    }
);

counters.forEach((counter) => {
    counterObserver.observe(counter);
});

// =========================================================
// SERVICES IMAGE PREVIEW
// =========================================================

const serviceCards =
    document.querySelectorAll(".service-item");

const servicePreview =
    document.getElementById("servicePreview");

const defaultServiceImage =
    "assets/images/SDNC_Team.webp";


if (servicePreview && serviceCards.length) {

    serviceCards.forEach(card => {

        // Show service image on hover
        card.addEventListener("mouseenter", () => {

            const image =
                card.dataset.image;

            if (!image) return;

            servicePreview.style.opacity = "0";

            setTimeout(() => {

                servicePreview.src = image;

                servicePreview.style.opacity = "1";

            }, 150);

        });


        // Return to SDNC Team image when mouse leaves
        card.addEventListener("mouseleave", () => {

            servicePreview.style.opacity = "0";

            setTimeout(() => {

                servicePreview.src = defaultServiceImage;

                servicePreview.style.opacity = "1";

            }, 150);

        });

    });

}



// document.addEventListener("DOMContentLoaded", function () {

//     const form = document.getElementById("contactForm");

//     const nameInput = document.getElementById("leadName");
//     const phoneInput = document.getElementById("leadPhone");
//     const emailInput = document.getElementById("leadEmail");
//     const cityInput = document.getElementById("leadCity");
//     const serviceInput = document.getElementById("leadService");
//     const messageInput = document.getElementById("leadMessage");

//     const whatsappBtn = document.getElementById("whatsappBtn");
//     const emailBtn = document.getElementById("emailBtn");

//     const formStatus = document.getElementById("formStatus");

//     /* --------------------------------
//        Validation helpers
//     -------------------------------- */

//     function setError(input, errorElementId, message) {

//         const field = input.closest(".form-field");
//         const error = document.getElementById(errorElementId);

//         field.classList.add("has-error");
//         error.textContent = message;
//     }

//     function clearError(input, errorElementId) {

//         const field = input.closest(".form-field");
//         const error = document.getElementById(errorElementId);

//         field.classList.remove("has-error");
//         error.textContent = "";
//     }

//     function clearAllErrors() {

//         clearError(nameInput, "nameError");
//         clearError(phoneInput, "phoneError");
//         clearError(emailInput, "emailError");
//         clearError(cityInput, "cityError");
//         clearError(serviceInput, "serviceError");
//         clearError(messageInput, "messageError");

//         formStatus.className = "form-status";
//         formStatus.textContent = "";
//     }


//     /* --------------------------------
//        Individual validation
//     -------------------------------- */

//     function validateName() {

//         const value = nameInput.value.trim();

//         if (!value) {
//             setError(
//                 nameInput,
//                 "nameError",
//                 "Please enter your full name."
//             );
//             return false;
//         }

//         if (value.length < 2) {
//             setError(
//                 nameInput,
//                 "nameError",
//                 "Name must contain at least 2 characters."
//             );
//             return false;
//         }

//         if (value.length > 60) {
//             setError(
//                 nameInput,
//                 "nameError",
//                 "Name cannot exceed 60 characters."
//             );
//             return false;
//         }

//         /* Allows letters, spaces, dots, apostrophes and hyphens */
//         const namePattern = /^[A-Za-zÀ-ÿ.'\-\s]+$/;

//         if (!namePattern.test(value)) {
//             setError(
//                 nameInput,
//                 "nameError",
//                 "Please enter a valid name."
//             );
//             return false;
//         }

//         clearError(nameInput, "nameError");
//         return true;
//     }


//     function validatePhone() {

//         /*
//          * Accepts:
//          * 9876543210
//          * +919876543210
//          * 919876543210
//          * 09876543210
//          */

//         const value = phoneInput.value.trim();

//         if (!value) {
//             setError(
//                 phoneInput,
//                 "phoneError",
//                 "Please enter your phone number."
//             );
//             return false;
//         }

//         const cleaned = value.replace(/[\s()-]/g, "");

//         const phonePattern = /^(?:\+91|91|0)?[6-9]\d{9}$/;

//         if (!phonePattern.test(cleaned)) {
//             setError(
//                 phoneInput,
//                 "phoneError",
//                 "Please enter a valid 10-digit Indian mobile number."
//             );
//             return false;
//         }

//         clearError(phoneInput, "phoneError");
//         return true;
//     }


//     function validateEmail() {

//         const value = emailInput.value.trim();

//         /*
//          * Email is OPTIONAL.
//          * Empty = valid.
//          */

//         if (!value) {
//             clearError(emailInput, "emailError");
//             return true;
//         }

//         const emailPattern =
//             /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

//         if (!emailPattern.test(value)) {
//             setError(
//                 emailInput,
//                 "emailError",
//                 "Please enter a valid email address."
//             );
//             return false;
//         }

//         if (value.length > 100) {
//             setError(
//                 emailInput,
//                 "emailError",
//                 "Email address is too long."
//             );
//             return false;
//         }

//         clearError(emailInput, "emailError");
//         return true;
//     }


//     function validateCity() {

//         const value = cityInput.value.trim();

//         if (!value) {
//             setError(
//                 cityInput,
//                 "cityError",
//                 "Please enter your city."
//             );
//             return false;
//         }

//         if (value.length < 2) {
//             setError(
//                 cityInput,
//                 "cityError",
//                 "Please enter a valid city."
//             );
//             return false;
//         }

//         if (value.length > 60) {
//             setError(
//                 cityInput,
//                 "cityError",
//                 "City name cannot exceed 60 characters."
//             );
//             return false;
//         }

//         const cityPattern = /^[A-Za-zÀ-ÿ.'\-\s]+$/;

//         if (!cityPattern.test(value)) {
//             setError(
//                 cityInput,
//                 "cityError",
//                 "Please enter a valid city name."
//             );
//             return false;
//         }

//         clearError(cityInput, "cityError");
//         return true;
//     }


//     function validateService() {

//         if (!serviceInput.value) {

//             setError(
//                 serviceInput,
//                 "serviceError",
//                 "Please select a service."
//             );

//             return false;
//         }

//         clearError(serviceInput, "serviceError");
//         return true;
//     }


//     /*
//      * Project Brief is OPTIONAL.
//      * We only reject it if someone exceeds the maxlength.
//      */
//     function validateMessage() {

//         const value = messageInput.value.trim();

//         if (value.length > 1000) {

//             setError(
//                 messageInput,
//                 "messageError",
//                 "Project brief cannot exceed 1000 characters."
//             );

//             return false;
//         }

//         clearError(messageInput, "messageError");
//         return true;
//     }


//     /* --------------------------------
//        Validate complete form
//     -------------------------------- */

//     function validateForm() {

//         clearAllErrors();

//         const validName = validateName();
//         const validPhone = validatePhone();
//         const validEmail = validateEmail();
//         const validCity = validateCity();
//         const validService = validateService();
//         const validMessage = validateMessage();

//         const isValid =
//             validName &&
//             validPhone &&
//             validEmail &&
//             validCity &&
//             validService &&
//             validMessage;

//         if (!isValid) {

//             formStatus.className = "form-status error";
//             formStatus.textContent =
//                 "Please correct the highlighted fields before continuing.";

//             /*
//              * Focus the first invalid field
//              */
//             const firstError =
//                 form.querySelector(".has-error input, .has-error select, .has-error textarea");

//             if (firstError) {
//                 firstError.focus();
//             }

//             return false;
//         }

//         return true;
//     }


//     /* --------------------------------
//        Live validation
//     -------------------------------- */

//     nameInput.addEventListener("blur", validateName);
//     phoneInput.addEventListener("blur", validatePhone);
//     emailInput.addEventListener("blur", validateEmail);
//     cityInput.addEventListener("blur", validateCity);
//     serviceInput.addEventListener("change", validateService);
//     messageInput.addEventListener("blur", validateMessage);


//     /*
//      * Remove invalid characters from phone field
//      */
//     phoneInput.addEventListener("input", function () {

//         this.value = this.value.replace(/[^\d+\s()-]/g, "");

//     });


//     /* --------------------------------
//        WhatsApp
//     -------------------------------- */

//     whatsappBtn.addEventListener("click", function () {

//         if (!validateForm()) {
//             return;
//         }

//         const name = nameInput.value.trim();
//         const phone = phoneInput.value.trim();
//         const email = emailInput.value.trim();
//         const city = cityInput.value.trim();
//         const service = serviceInput.value;
//         const message = messageInput.value.trim();

//         let whatsappMessage =
// `Hello Swastika Design & Constructions,

// I would like to enquire about your services.

// Name: ${name}
// Phone: ${phone}
// ${email ? `Email: ${email}\n` : ""}City: ${city}
// Service Required: ${service}
// ${message ? `Project Brief: ${message}` : ""}`;

//         /*
//          * Replace the number below with your actual
//          * Swastika WhatsApp business number.
//          *
//          * Format:
//          * 91XXXXXXXXXX
//          */
//         const whatsappNumber = "91XXXXXXXXXX";

//         const whatsappURL =
//             "https://wa.me/" +
//             whatsappNumber +
//             "?text=" +
//             encodeURIComponent(whatsappMessage);

//         window.open(whatsappURL, "_blank");

//     });


//     /* --------------------------------
//        Email submission
//     -------------------------------- */

//     form.addEventListener("submit", function (event) {

//         /*
//          * Stop submission if validation fails.
//          */
//         if (!validateForm()) {
//             event.preventDefault();
//             return;
//         }

//         /*
//          * Allow normal POST submission to FormSubmit.
//          */
//         emailBtn.disabled = true;
//         emailBtn.textContent = "Sending...";

//     });

// });

/* =========================================================
   STATS COUNTERS
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const counters = document.querySelectorAll(".counter");

    if (!counters.length) return;

    const animateCounter = (counter) => {

        const target = Number(
            counter.getAttribute("data-target")
        );

        if (!Number.isFinite(target)) return;

        const duration = 1200;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(elapsed / duration, 1);

            /*
             * Smooth ease-out
             */
            const eased =
                1 - Math.pow(1 - progress, 3);

            const value =
                Math.floor(target * eased);

            counter.textContent = value;

            if (progress < 1) {

                requestAnimationFrame(
                    updateCounter
                );

            } else {

                counter.textContent = target;

            }
        };

        requestAnimationFrame(updateCounter);
    };


    if ("IntersectionObserver" in window) {

        const observer =
            new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            animateCounter(
                                entry.target
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.35
                }
            );

        counters.forEach(counter => {
            observer.observe(counter);
        });

    } else {

        /*
         * Fallback for older browsers
         */
        counters.forEach(counter => {

            counter.textContent =
                counter.getAttribute(
                    "data-target"
                );

        });

    }

});
/* =========================================================
   CLIENT REVIEWS AUTO CAROUSEL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const carousel =
        document.getElementById("reviewsCarousel");

    const track =
        document.getElementById("reviewsTrack");

    if (!carousel || !track) return;


    const cards =
        Array.from(
            track.querySelectorAll(".review-card")
        );

    if (cards.length <= 1) return;


    let currentIndex = 0;

    let autoSlide = null;

    let isPaused = false;


    /* =====================================================
       GET CURRENT SLIDE WIDTH
    ===================================================== */

    function getStep() {

        const card = cards[0];

        const cardWidth =
            card.getBoundingClientRect().width;

        const trackStyle =
            window.getComputedStyle(track);

        const gap =
            parseFloat(trackStyle.columnGap) ||
            parseFloat(trackStyle.gap) ||
            0;

        return cardWidth + gap;
    }


    /* =====================================================
       NUMBER OF VISIBLE CARDS
    ===================================================== */

    function getVisibleCards() {

        return window.innerWidth <= 768
            ? 1
            : 3;
    }


    /* =====================================================
       MOVE CAROUSEL
    ===================================================== */

    function updateCarousel() {

        const step = getStep();

        const visibleCards =
            getVisibleCards();

        const maxIndex =
            Math.max(
                0,
                cards.length - visibleCards
            );


        /*
           Loop back to beginning
        */

        if (currentIndex > maxIndex) {
            currentIndex = 0;
        }


        track.style.transform =
            `translateX(-${currentIndex * step}px)`;
    }


    /* =====================================================
       NEXT REVIEW
    ===================================================== */

    function nextReview() {

        if (isPaused) return;

        const visibleCards =
            getVisibleCards();

        const maxIndex =
            Math.max(
                0,
                cards.length - visibleCards
            );


        currentIndex++;


        if (currentIndex > maxIndex) {
            currentIndex = 0;
        }


        updateCarousel();
    }


    /* =====================================================
       START AUTOPLAY
    ===================================================== */

    function startAutoSlide() {

        stopAutoSlide();

        autoSlide =
            setInterval(
                nextReview,
                2500
            );
    }


    /* =====================================================
       STOP AUTOPLAY
    ===================================================== */

    function stopAutoSlide() {

        if (autoSlide) {

            clearInterval(autoSlide);

            autoSlide = null;
        }
    }


    /* =====================================================
       PAUSE ON HOVER
    ===================================================== */

    carousel.addEventListener(
        "mouseenter",
        () => {

            isPaused = true;

            stopAutoSlide();
        }
    );


    /* =====================================================
       RESUME AFTER HOVER
    ===================================================== */

    carousel.addEventListener(
        "mouseleave",
        () => {

            isPaused = false;

            startAutoSlide();
        }
    );


    /* =====================================================
       PAUSE WHEN FOCUSED
    ===================================================== */

    carousel.addEventListener(
        "focusin",
        () => {

            isPaused = true;

            stopAutoSlide();
        }
    );


    /* =====================================================
       RESUME AFTER FOCUS LEAVES
    ===================================================== */

    carousel.addEventListener(
        "focusout",
        () => {

            setTimeout(() => {

                if (
                    !carousel.contains(
                        document.activeElement
                    )
                ) {

                    isPaused = false;

                    startAutoSlide();
                }

            }, 50);
        }
    );


    /* =====================================================
       RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            updateCarousel();

        }
    );


    /* =====================================================
       REDUCED MOTION
    ===================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    if (reducedMotion.matches) {

        isPaused = true;

    } else {

        startAutoSlide();
    }


    reducedMotion.addEventListener(
        "change",
        event => {

            if (event.matches) {

                isPaused = true;

                stopAutoSlide();

            } else {

                isPaused = false;

                startAutoSlide();
            }

        }
    );


    /* =====================================================
       INITIAL POSITION
    ===================================================== */

    updateCarousel();

});


document.addEventListener("DOMContentLoaded", function () {

    const shareBtn = document.getElementById("shareOfferBtn");
    const sharePopup = document.getElementById("shareOfferPopup");
    const shareOverlay = document.getElementById("shareOfferOverlay");
    const closeShare = document.getElementById("closeShareOffer");

    const whatsappBtn = document.getElementById("shareWhatsApp");
    const facebookBtn = document.getElementById("shareFacebook");
    const xBtn = document.getElementById("shareX");
    const telegramBtn = document.getElementById("shareTelegram");

    const copyBtn = document.getElementById("copyOfferLink");
    const copyText = document.getElementById("copyOfferText");

    const nativeShareBtn = document.getElementById("nativeShareOffer");

    if (!shareBtn || !sharePopup) return;


    /* =========================================================
       OFFER DETAILS
    ========================================================== */

   const offerTitle =
    document.getElementById("offerTitle")?.innerText.trim()
    || "Save 25% on Design Services,";

const offerExpiry =
    document.getElementById("offerExpiry")?.innerText.trim()
    || "Offer Valid Till: 31 Dec 2026.";


const shareUrl =
    `${window.location.origin}${window.location.pathname}?offer=1`;
       const shareMessage =
    `${offerTitle},\n\n` +
    `${offerExpiry}.\n\n` +
    `View this offer and claim it here:\n${shareUrl}`;


    /* =========================================================
       OPEN POPUP
    ========================================================== */

    function openSharePopup() {

        sharePopup.classList.add("active");
        shareOverlay.classList.add("active");

        sharePopup.setAttribute("aria-hidden", "false");
        shareBtn.setAttribute("aria-expanded", "true");

        document.body.style.overflow = "hidden";

        updateShareLinks();
    }


    /* =========================================================
       CLOSE POPUP
    ========================================================== */

    function closeSharePopup() {

        sharePopup.classList.remove("active");
        shareOverlay.classList.remove("active");

        sharePopup.setAttribute("aria-hidden", "true");
        shareBtn.setAttribute("aria-expanded", "false");

        document.body.style.overflow = "";
    }


    /* =========================================================
       UPDATE SOCIAL SHARE LINKS
    ========================================================== */

    function updateShareLinks() {

        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedText = encodeURIComponent(shareMessage);

        /* WhatsApp */
        whatsappBtn.href =
            `https://wa.me/?text=${encodedText}`;

        /* Facebook */
        facebookBtn.href =
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

        /* X */
        xBtn.href =
            `https://twitter.com/intent/tweet?text=${encodedText}`;

        /* Telegram */
        telegramBtn.href =
            `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(offerTitle)}`;
    }


    /* =========================================================
       OPEN / CLOSE EVENTS
    ========================================================== */

    shareBtn.addEventListener("click", function () {

        if (sharePopup.classList.contains("active")) {
            closeSharePopup();
        } else {
            openSharePopup();
        }

    });

    closeShare.addEventListener("click", closeSharePopup);

    shareOverlay.addEventListener("click", closeSharePopup);


    /* =========================================================
       ESC KEY
    ========================================================== */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape" &&
            sharePopup.classList.contains("active")) {

            closeSharePopup();

        }

    });


    /* =========================================================
       COPY LINK
    ========================================================== */

    copyBtn.addEventListener("click", async function () {

        try {

            await navigator.clipboard.writeText(shareMessage);

            copyText.textContent = "Copied!";

            setTimeout(function () {
                copyText.textContent = "Copy Link";
            }, 2000);

        } catch (error) {

            /* Fallback for older browsers */

            const textarea = document.createElement("textarea");

            textarea.value = shareUrl;

            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            try {
                document.execCommand("copy");
                copyText.textContent = "Copied!";
            } catch (err) {
                copyText.textContent = "Copy Failed";
            }

            textarea.remove();

            setTimeout(function () {
                copyText.textContent = "Copy Link";
            }, 2000);

        }

    });


    /* =========================================================
       NATIVE SHARE
    ========================================================== */

    nativeShareBtn.addEventListener("click", async function () {

        if (!navigator.share) {

            copyText.textContent = "Use the options above";

            setTimeout(function () {
                copyText.textContent = "Copy Link";
            }, 2000);

            return;
        }

        try {

            await navigator.share({
                title: offerTitle,
                text: shareMessage,
                url: shareUrl
            });

            closeSharePopup();

        } catch (error) {

            /* User cancelled sharing — do nothing */

            if (error.name !== "AbortError") {
                console.error("Share failed:", error);
            }

        }

    });

});