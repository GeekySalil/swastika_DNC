document.addEventListener("DOMContentLoaded", () => {

    const filters = document.querySelectorAll(".blog-filter");
    const cards = document.querySelectorAll(".blog-card");

    if (!filters.length || !cards.length) {
        return;
    }


    /* =====================================================
       GET NAVBAR HEIGHT
    ====================================================== */

    function getNavbarOffset() {

        const navbar =
            document.querySelector(".navbar") ||
            document.querySelector("header");

        if (navbar) {
            return navbar.offsetHeight + 20;
        }

        return 90;
    }


    /* =====================================================
       SCROLL TO FIRST MATCHING CARD
    ====================================================== */

    function scrollToFirstCard() {

        const visibleCard =
            Array.from(cards).find(
                card => !card.classList.contains("hidden")
            );

        if (!visibleCard) {
            return;
        }


        const navbarOffset = getNavbarOffset();

        const cardPosition =
            visibleCard.getBoundingClientRect().top +
            window.scrollY -
            navbarOffset;


        window.scrollTo({
            top: cardPosition,
            behavior: "smooth"
        });

    }


    /* =====================================================
       CATEGORY FILTERING
    ====================================================== */

    filters.forEach(filter => {

        filter.addEventListener("click", () => {

            const selectedCategory =
                filter.getAttribute("data-category");


            /* ---------------------------------------------
               Active category
            --------------------------------------------- */

            filters.forEach(button => {
                button.classList.remove("active");
            });

            filter.classList.add("active");


            /* ---------------------------------------------
               Filter cards
            --------------------------------------------- */

            cards.forEach(card => {

                const cardCategory =
                    card.getAttribute("data-category");


                if (
                    selectedCategory === "all" ||
                    cardCategory === selectedCategory
                ) {

                    card.classList.remove("hidden");

                } else {

                    card.classList.add("hidden");

                }

            });


            /* ---------------------------------------------
               Wait for DOM layout to update, then scroll
            --------------------------------------------- */

            requestAnimationFrame(() => {

                requestAnimationFrame(() => {

                    scrollToFirstCard();

                });

            });

        });

    });

});
