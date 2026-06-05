
// =========================
// MOBILE NAVBAR
// =========================

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");

if (hamburger && navLinks) {

    hamburger.addEventListener("click", () => {

        navLinks.classList.toggle("active");

    });

}


// =========================
// SWIPER HERO
// =========================

const heroSwiper = new Swiper(".heroSwiper", {

    loop: true,

    effect: "fade",

    autoplay: {

        delay: 4000,

        disableOnInteraction: false,

    },

    speed: 1200,

});


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

AOS.init({

    duration: 1000,

    once: true,

});


// =========================
// NAVBAR BACKGROUND
// =========================

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.style.background =
            "rgba(10,10,10,0.92)";

    } else {

        navbar.style.background =
            "rgba(10,10,10,0.5)";

    }

});
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
const serviceCards =
document.querySelectorAll(".service-item");

const servicePreview =
document.getElementById("servicePreview");

const servicePreviewBg =
document.getElementById("servicePreviewBg");

serviceCards.forEach(card => {

    const activateCard = () => {

        serviceCards.forEach(item =>
            item.classList.remove("active")
        );

        card.classList.add("active");

        if(servicePreview && servicePreviewBg){

            const image =
                card.dataset.image;

            servicePreview.style.opacity = "0";

            setTimeout(() => {

                servicePreview.src = image;
                servicePreviewBg.src = image;

                servicePreview.style.opacity = "1";

            }, 150);

        }

    };

    card.addEventListener(
        "mouseenter",
        activateCard
    );

    card.addEventListener(
        "click",
        activateCard
    );

});

