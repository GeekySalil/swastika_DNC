
// =========================
// GSAP + SCROLLTRIGGER
// =========================

// gsap.registerPlugin(ScrollTrigger);
const isDesktop = window.innerWidth > 768;

// =========================
// HERO CINEMATIC INTRO
// =========================

// gsap.from(".hero-mini-title", {

//     y: 40,
//     opacity: 0,

//     duration: 1,

//     ease: "power4.out"

// });

// gsap.from(".hero-content h1", {

//     y: 80,
//     opacity: 0,

//     duration: 1.4,

//     delay: 0.2,

//     ease: "power4.out"

// });

// gsap.from(".founder-line span", {

//     y: 30,
//     opacity: 0,

//     stagger: 0.15,

//     duration: 1,

//     delay: 0.5,

//     ease: "power3.out"

// });
/*
gsap.from(".hero-buttons a", {

    y: 30,
    opacity: 0,

    stagger: 0.15,

    duration: 1,

    delay: 0.8,

    ease: "power3.out"

});
*/
const heroButtons =
    document.querySelectorAll(".hero-buttons a");

if (heroButtons.length > 0) {

    gsap.from(heroButtons, {

        y: 30,

        opacity: 0,

        stagger: 0.15,

        duration: 1,

        delay: 0.8,

        ease: "power3.out",

        clearProps: "all"

    });

}
// gsap.from(".stat-card", {

//     y: 50,
//     opacity: 0,

//     stagger: 0.12,

//     duration: 1.1,

//     delay: 1,

//     ease: "power3.out"

// });

// gsap.from(".stats-section .stat-card", {

//     scrollTrigger: {

//         trigger: ".stats-section",

//         start: "top 75%"

//     },

//     opacity: 0,

//     y: 60,

//     stagger: 0.15,

//     duration: 1,

//     ease: "power3.out"

// });
// =========================
// HERO PARALLAX
// =========================

// HERO PARALLAX

// if (isDesktop) {

//     gsap.to(".heroSwiper img", {

//         yPercent: 8,

//         ease: "none",

//         scrollTrigger: {

//             trigger: ".hero",

//             start: "top top",

//             end: "bottom top",

//             scrub: true

//         }

//     });

// }

// =========================
// SECTION REVEALS
// =========================

// const revealSections =
//     document.querySelectorAll(
//         ".about-section, .services-section, .portfolio-section, .testimonials-section, .contact-section"
//     );

// revealSections.forEach((section) => {

//     gsap.from(section, {

//         y: 100,

//         opacity: 0,

//         duration: 1.4,

//         ease: "power4.out",

//         scrollTrigger: {

//             trigger: section,

//             start: "top 80%",

//             toggleActions: "play none none reverse"

//         }

//     });

// });


// =========================
// SERVICE CARD FLOAT
// =========================

// if (isDesktop) {

//     gsap.utils.toArray(".service-card").forEach((card, index) => {

//         gsap.from(card, {

//             y: 80,

//             opacity: 0,

//             duration: 1,

//             delay: index * 0.08,

//             ease: "power3.out",

//             scrollTrigger: {

//                 trigger: card,

//                 start: "top 88%"

//             }

//         });

//     });

// }


// =========================
// PORTFOLIO CINEMATIC SCALE
// =========================

// if (isDesktop) {

//     gsap.utils.toArray(".portfolio-card").forEach((card) => {

//         gsap.from(card, {

//             scale: 0.92,

//             opacity: 0,

//             duration: 1.2,

//             ease: "power4.out",

//             scrollTrigger: {

//                 trigger: card,

//                 start: "top 85%"

//             }

//         });

//     });

// }


// =========================
// PARALLAX IMAGES
// =========================

// if (isDesktop) {

//     gsap.utils.toArray(
//         ".portfolio-card img, .gallery-grid img"
//     ).forEach((image) => {

//         gsap.to(image, {

//             yPercent: 10,

//             ease: "none",

//             scrollTrigger: {

//                 trigger: image,

//                 start: "top bottom",

//                 end: "bottom top",

//                 scrub: true

//             }

//         });

//     });

// }


// =========================
// TESTIMONIAL CARDS
// =========================

// if (isDesktop) {

//     gsap.from(".testimonial-card", {

//         y: 80,

//         opacity: 0,

//         stagger: 0.2,

//         duration: 1.2,

//         ease: "power4.out",

//         scrollTrigger: {

//             trigger: ".testimonials-section",

//             start: "top 75%"

//         }

//     });

// }




// =========================
// CONTACT SECTION REVEAL
// =========================

// gsap.from(".contact-left", {

//     x: -80,

//     opacity: 0,

//     duration: 1.2,

//     ease: "power4.out",

//     scrollTrigger: {

//         trigger: ".contact-section",

//         start: "top 75%"

//     }

// });

// gsap.from(".contact-right", {

//     x: 80,

//     opacity: 0,

//     duration: 1.2,

//     ease: "power4.out",

//     scrollTrigger: {

//         trigger: ".contact-section",

//         start: "top 75%"

//     }

// });


// =========================
// FOOTER REVEAL
// =========================

// if (isDesktop) {

//     gsap.from(".footer-container", {

//         y: 80,

//         opacity: 0,

//         duration: 1.2,

//         ease: "power4.out",

//         scrollTrigger: {

//             trigger: ".footer",

//             start: "top 90%"

//         }

//     });

// }


// =========================
// FLOATING BUTTONS ANIMATION
// =========================

// if (isDesktop) {

//     gsap.to(".whatsapp-float", {

//         y: -10,

//         duration: 1.5,

//         repeat: -1,

//         yoyo: true,

//         ease: "power1.inOut"

//     });

// }

// if (isDesktop) {

//     gsap.to(".chatbot-button", {

//         y: -10,

//         duration: 1.5,

//         repeat: -1,

//         yoyo: true,

//         ease: "power1.inOut",

//         delay: 0.4

//     });

// }


// =========================
// SMOOTH NAVBAR FADE
// =========================

// gsap.from(".navbar", {

//     y: -100,

//     opacity: 0,

//     duration: 1.2,

//     ease: "power4.out"

// });

// if (isDesktop) {

//     gsap.from(".offer-card", {

//         scrollTrigger: {

//             trigger: ".offer-section",

//             start: "top 75%"

//         },

//         opacity: 0,

//         scale: 0.9,

//         duration: 1.2,

//         ease: "power3.out"

//     });

// }
// gsap.from(".reviews-quote-icon", {

//     scale: 0,

//     rotation: 180,

//     duration: 1.2,

//     ease: "back.out(1.7)",

//     scrollTrigger: {

//         trigger: ".reviews-hero",

//         start: "top 80%"

//     }

// });

// gsap.from(".google-trust-badge", {

//     opacity: 0,

//     y: 40,

//     duration: 1,

//     delay: 0.2,

//     scrollTrigger: {

//         trigger: ".reviews-hero",

//         start: "top 80%"

//     }

// });
/* =========================================================
   FAST + SMOOTH PRELOADER
========================================================= */

// (function () {

//     const preloader = document.querySelector(".preloader");
//     const logo = document.querySelector(".preloader-logo");
//     const tagline = document.querySelectorAll(
//         ".preloader-tagline span"
//     );

//     if (!preloader) return;

//     const startPreloader = () => {

//         /* Make sure preloader starts visible */
//         preloader.style.display = "flex";
//         preloader.style.opacity = "1";

//         /*
//          * LOGO
//          */
//         if (logo) {

//             gsap.fromTo(
//                 logo,
//                 {
//                     opacity: 0,
//                     scale: 0.88
//                 },
//                 {
//                     opacity: 1,
//                     scale: 1,
//                     duration: 0.55,
//                     ease: "power2.out"
//                 }
//             );

//         }

//         /*
//          * TAGLINE
//          */
//         if (tagline.length) {

//             gsap.fromTo(
//                 tagline,
//                 {
//                     opacity: 0,
//                     y: 6
//                 },
//                 {
//                     opacity: 1,
//                     y: 0,
//                     duration: 0.25,
//                     stagger: 0.08,
//                     delay: 0.15,
//                     ease: "power2.out"
//                 }
//             );

//         }

//         /*
//          * REMOVE PRELOADER QUICKLY
//          *
//          * IMPORTANT:
//          * This timer is independent of page loading.
//          */
//         setTimeout(() => {

//             gsap.to(
//                 preloader,
//                 {
//                     opacity: 0,
//                     duration: 0.35,
//                     ease: "power2.out",

//                     onComplete: () => {

//                         preloader.style.display = "none";

//                         document.body.classList.remove(
//                             "loading"
//                         );

//                         document.body.classList.add(
//                             "preloader-finished"
//                         );

//                     }
//                 }
//             );

//         }, 800);

//     };


//     /*
//      * DO NOT USE window.load
//      */

//     if (document.readyState === "loading") {

//         document.addEventListener(
//             "DOMContentLoaded",
//             () => {

//                 requestAnimationFrame(() => {
//                     startPreloader();
//                 });

//             },
//             { once: true }
//         );

//     } else {

//         requestAnimationFrame(() => {
//             startPreloader();
//         });

//     }

// })();
