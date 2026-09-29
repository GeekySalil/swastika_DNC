import { db }
from "./firebase.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


const offerRef =
    doc(
        db,
        "offers",
        "mainOffer"
    );


/* =========================================================
   OFFER LOADER
========================================================= */

async function loadOffer() {

    const snapshot =
        await getDoc(
            offerRef
        );


    if (
        !snapshot.exists()
    ) {
        return;
    }


    const offer =
        snapshot.data();


    const section =
        document.getElementById(
            "offer"
        );


    if (!section) {
        return;
    }


    /* =====================================================
       OFFER DISABLED
    ===================================================== */

    if (
        !offer.enabled
    ) {
        section.remove();
        return;
    }


    /* =====================================================
       SHOW OFFER
    ===================================================== */

    section.style.display =
        "block";


    /* =====================================================
       OFFER CONTENT
    ===================================================== */

    const title =
        offer.title || "";


    const highlightedTitle =
        title.replace(
            /(\d+%)/,
            "<span>$1</span>"
        );


    const offerTitle =
        document.getElementById(
            "offerTitle"
        );


    if (offerTitle) {
        offerTitle.innerHTML =
            highlightedTitle;
    }


    const offerDescription =
        document.getElementById(
            "offerDescription"
        );


    if (offerDescription) {
        offerDescription.textContent =
            offer.description || "";
    }


    const offerExpiry =
        document.getElementById(
            "offerExpiry"
        );


    if (offerExpiry) {
        offerExpiry.textContent =
            "Offer Valid Till: " +
            (offer.expiry || "");
    }


    const offerButton =
        document.getElementById(
            "offerButton"
        );


    if (offerButton) {
        offerButton.textContent =
            offer.button || "";
    }


    /* =====================================================
       OPEN OFFER FROM SHARED LINK

       Shared URL:

       https://swastikadnc.com/?offer=1

    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    if (
        params.get("offer") === "1"
    ) {

        /*
         * Wait for the current page to finish loading.
         * Then wait for the browser to complete layout
         * after the Firebase offer becomes visible.
         */

        const scrollToOffer =
            () => {

                requestAnimationFrame(() => {

                    requestAnimationFrame(() => {

                        setTimeout(() => {

                            section.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                        }, 150);

                    });

                });

            };


        if (
            document.readyState === "complete"
        ) {

            scrollToOffer();

        } else {

            window.addEventListener(
                "load",
                scrollToOffer,
                {
                    once: true
                }
            );

        }

    }

}


/* =========================================================
   LOAD OFFER
========================================================= */

loadOffer();