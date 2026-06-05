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

async function loadOffer() {

    const snapshot =
    await getDoc(
        offerRef
    );

    if (
        !snapshot.exists()
    ) return;

    const offer =
    snapshot.data();

    const section =
    document.getElementById(
        "offer"
    );
    

    if (
        !offer.enabled
    ) {

        section.remove();

        return;

    }
    section.style.display = "block";

    const title =
offer.title;

const highlightedTitle =
title.replace(
    /(\d+%)/,
    "<span>$1</span>"
);

document.getElementById(
    "offerTitle"
).innerHTML =
highlightedTitle;

    document.getElementById(
        "offerDescription"
    ).textContent =
    offer.description;

    document.getElementById(
        "offerExpiry"
    ).textContent =
    "Offer Valid Till: " +
    offer.expiry;

    document.getElementById(
        "offerButton"
    ).textContent =
    offer.button;

}

loadOffer();