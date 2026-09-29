import {
    storage
}
from "./firebase.js";

import {

    ref,

    uploadBytes,

    uploadBytesResumable,

    getDownloadURL,

    deleteObject

}
from
"https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

import {

    doc,

    getDoc,

    setDoc,

    updateDoc,

    collection,

    addDoc,

    Timestamp,

    getDocs,
    query,
    orderBy,
    writeBatch,

    deleteDoc,
    where

}
from
"https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


import {
    db,
    auth
}
from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
}
from
"https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

/* =========================================================
   ADMIN LOGOUT
========================================================= */

document
.getElementById("logoutBtn")
?.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.replace(
                "index.html"
            );

        }

        catch(error) {

            console.error(
                "Logout Error:",
                error
            );

            alert(
                "Logout failed. Please try again."
            );

        }

    }
);

/* =========================================================
   ADMIN AUTHENTICATION GUARD
========================================================= */

/* =========================================================
   ADMIN AUTHENTICATION + AUTHORIZATION GUARD
========================================================= */

const ADMIN_UIDS = [
    "LhOv7g1OuYP4ELdkxBGBXVf565A2",
    "X8TTAKUrHMTnYhtXvN1CdXhdJ552"
];

onAuthStateChanged(
    auth,
    (user) => {

        /*
         * STEP 1:
         * User is not authenticated.
         */

        if (!user) {

            window.location.replace(
                "index.html"
            );

            return;
        }


        /*
         * STEP 2:
         * User is authenticated.
         * Now check whether the UID belongs to the admin.
         */

        if (
            !ADMIN_UIDS.includes(user.uid)
        ) {

            alert(
                "You are authenticated, but you are not authorized to access the Admin Dashboard."
            );

            window.location.replace(
                "index.html"
            );

            return;
        }
const adminEmail =
    document.getElementById("loggedInAdminEmail");

if (adminEmail) {
    adminEmail.textContent =
        user.email || "Administrator";
}

        /*
         * STEP 3:
         * Authentication + authorization confirmed.
         */

        document.body.classList.remove(
            "admin-auth-checking"
        );


        /*
         * STEP 4:
         * Load dashboard data only for the admin.
         */

        loadLeads();

        loadProjects();

        loadDashboardStats();

        loadLeadAnalytics();

    }
);

async function loadLeads() {

    const tbody =
    document.getElementById(
        "leadsTableBody"
    );
//     const leadDate =
// lead.createdAt
// ? new Date(
//     lead.createdAt.seconds * 1000
// ).toLocaleString()
// : "-";
    tbody.innerHTML = "";

    const q = query(

        collection(
            db,
            "leads"
        ),

        orderBy(
            "createdAt",
            "desc"
        )

    );

    const snapshot =
    await getDocs(q);

    snapshot.forEach(docItem => {

    const lead =
    docItem.data();

    const leadDate =
    lead.createdAt
    ? lead.createdAt
        .toDate()
        .toLocaleString()
    : "-";

        tbody.innerHTML += `

<tr>

    <td>${lead.name || ""}</td>

    <td>

    <a
        class="whatsapp-link"
        href="https://wa.me/91${lead.phone}"
        target="_blank">

        ${lead.phone}

        <i class="fab fa-whatsapp"></i>

    </a>

</td>

    <td>${lead.email || ""}</td>

    <td>${lead.city || ""}</td>

    <td>${lead.service || ""}</td>

    <td>${lead.projectBrief || ""}</td>

    <td>

        <select
            class="status-select"
            onchange="updateLeadStatus(
    '${docItem.id}',
    this.value
)">

            <option
                value="New"
                ${lead.status === "New" ? "selected" : ""}>

                New

            </option>

            <option
                value="Contacted"
                ${lead.status === "Contacted" ? "selected" : ""}>

                Contacted

            </option>

            <option
                value="Meeting Scheduled"
                ${lead.status === "Meeting Scheduled" ? "selected" : ""}>

                Meeting Scheduled

            </option>

            <option
                value="Quotation Sent"
                ${lead.status === "Quotation Sent" ? "selected" : ""}>

                Quotation Sent

            </option>

            <option
                value="Converted"
                ${lead.status === "Converted" ? "selected" : ""}>

                Converted

            </option>

            <option
                value="Lost"
                ${lead.status === "Lost" ? "selected" : ""}>

                Lost

            </option>

        </select>

    </td>

    <td>${leadDate}</td>
    <td>

    <button
        class="notes-btn"
        onclick="openNotesModal('${docItem.id}')">

        Notes

    </button>

</td>

    <td>${lead.source || ""}</td>
    <td>

    <button
        class="lead-delete-btn"
        onclick="deleteLead('${docItem.id}')">

        Delete

    </button>

</td>
    

</tr>

`;

    });

}
async function loadLeadAnalytics() {

    const snapshot =
    await getDocs(

        collection(
            db,
            "leads"
        )

    );
    let totalLeads = 0;
    let newLeads = 0;

    let contacted = 0;
    let meetingScheduled = 0;

    let quotation = 0;

    let converted = 0;

    let lost = 0;

    snapshot.forEach(doc => {
        totalLeads++;
        const lead =
        doc.data();

        switch(
            lead.status
        ) {

            case "New":

                newLeads++;

                break;

            case "Contacted":

                contacted++;

                break;
            case "Meeting Scheduled":

                meetingScheduled++;

                break;

            case "Quotation Sent":

                quotation++;

                break;

            case "Converted":

                converted++;

                break;

            case "Lost":

                lost++;

                break;

        }

    });
    document.getElementById(
    "totalLeadsCount"
).textContent =
totalLeads;
    document.getElementById(
        "newLeadsCount"
    ).textContent =
    newLeads;

    document.getElementById(
        "contactedLeadsCount"
    ).textContent =
    contacted;

    document.getElementById(
        "meetingScheduledLeadsCount"
    ).textContent =
    meetingScheduled;

    document.getElementById(
        "quotationLeadsCount"
    ).textContent =
    quotation;

    document.getElementById(
        "convertedLeadsCount"
    ).textContent =
    converted;

    document.getElementById(
        "lostLeadsCount"
    ).textContent =
    lost;

}
window.deleteLead =
async function(leadId) {

    const confirmed =
    confirm(
        "Delete this lead permanently?"
    );

    if (!confirmed)
        return;

    try {

        await deleteDoc(

            doc(
                db,
                "leads",
                leadId
            )

        );

        alert(
            "Lead deleted successfully"
        );

        loadLeads();

        loadDashboardStats();
        loadLeadAnalytics();

    }

    catch(error) {

        console.error(
            error
        );

        alert(
            error.message
        );

    }

};
window.openNotesModal =
async function(leadId) {

    currentLeadId =
    leadId;

    const snapshot =
    await getDoc(

        doc(
            db,
            "leads",
            leadId
        )

    );

    const lead =
    snapshot.data();

    document.getElementById(
        "leadNotesInput"
    ).value =
    lead.notes || "";

    document.getElementById(
        "notesModal"
    ).classList.add(
        "show"
    );

};
document
.getElementById(
    "closeNotesBtn"
)
?.addEventListener(
    "click",
    () => {

        document
        .getElementById(
            "notesModal"
        )
        .classList.remove(
            "show"
        );

    }
);
document
.getElementById(
    "saveNotesBtn"
)
?.addEventListener(
    "click",
    async () => {

        const notes =
        document.getElementById(
            "leadNotesInput"
        ).value;

        await updateDoc(

            doc(
                db,
                "leads",
                currentLeadId
            ),

            {
                notes
            }

        );

        document
        .getElementById(
            "notesModal"
        )
        .classList.remove(
            "show"
        );

        alert(
            "Notes Saved"
        );

    }
);
window.updateLeadStatus =
async function(
    leadId,
    status
) {

    

    try {

        await updateDoc(

            doc(
                db,
                "leads",
                leadId
            ),

            {
                status
            }

        );

        loadLeadAnalytics();

    }

    catch(error) {

        console.error(
            error
        );

    }

};
const progressFill =
document.getElementById(
    "progressFill"
);

const progressText =
document.getElementById(
    "progressText"
);

const progressPercent =
document.getElementById(
    "progressPercent"
);
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
        snapshot.exists()
    ) {

        const offer =
        snapshot.data();

        document.getElementById(
            "offerEnabled"
        ).checked =
        offer.enabled;

        document.getElementById(
            "offerTitle"
        ).value =
        offer.title;

        document.getElementById(
            "offerDescription"
        ).value =
        offer.description;

        document.getElementById(
            "offerExpiry"
        ).value =
        offer.expiry;

        document.getElementById(
            "offerButton"
        ).value =
        offer.button;

    }

}

loadOffer();

document
.getElementById(
    "saveOffer"
)
.addEventListener(
    "click",
    async () => {

        await setDoc(
            offerRef,
            {

                enabled:
                document.getElementById(
                    "offerEnabled"
                ).checked,

                title:
                document.getElementById(
                    "offerTitle"
                ).value,

                description:
                document.getElementById(
                    "offerDescription"
                ).value,

                expiry:
                document.getElementById(
                    "offerExpiry"
                ).value,

                button:
                document.getElementById(
                    "offerButton"
                ).value

            }
        );

        alert(
            "Offer Saved Successfully"
        );
        loadDashboardStats();

    }
);
/* =========================================================
   PORTFOLIO PROJECT + IMAGE MANAGEMENT
========================================================= */

const previewGrid =
    document.getElementById("previewGrid");

const saveProjectBtn =
    document.getElementById("saveProject");

let editingProjectId = null;


/* =========================================================
   NEW PORTFOLIO IMAGE SYSTEM
========================================================= */

const portfolioImageInput =
    document.getElementById(
        "portfolioImageInput"
    );

const choosePortfolioImages =
    document.getElementById(
        "choosePortfolioImages"
    );

const portfolioImageEditor =
    document.getElementById(
        "portfolioImageEditor"
    );

const selectedImageCount =
    document.getElementById(
        "selectedImageCount"
    );


/* =========================================================
   DEFAULT IMAGE CATEGORIES
========================================================= */

const DEFAULT_PORTFOLIO_CATEGORIES = [

    "living",
    "ceiling",
    "bedroom",
    "kitchen",
    "staircase",
    "lobby",
    "lounge",
    "tv-unit",
    "bathroom",
    "temple",
    "wardrobe",
    "drawing",
    "office",
    "shop",
    "corridor",
    "reception",
    "3d-render",
    "site-photos"

];


/* =========================================================
   DEFAULT SUBCATEGORIES
========================================================= */

const DEFAULT_PORTFOLIO_SUBCATEGORIES = {

    ceiling: [

        "ceiling-office",
        "ceiling-living",
        "porch-ceiling"

    ],

    living: [

        "living-dining",
        "living-pooja",
        "living-vanity",
        "living-tv-unit"

    ],

    office: [

        "office-chair",
        "office-toilet",
        "office-reception"

    ]

};


/* =========================================================
   RUNTIME TAXONOMY
========================================================= */

let portfolioCategories = [
    ...DEFAULT_PORTFOLIO_CATEGORIES
];

let portfolioSubcategories = {
    ...DEFAULT_PORTFOLIO_SUBCATEGORIES
};


/*
 * New images selected from the file picker.
 *
 * These remain in browser memory until
 * Save Project / Update Project is clicked.
 */

let newPortfolioImages = [];


/* =========================================================
   PORTFOLIO IMAGE PROCESSING

   Images are processed once in the admin browser before
   they are uploaded to Firebase Storage.

   Pipeline:
   Original image
       -> resize oversized image
       -> apply centered watermark
       -> convert to WebP
       -> upload optimized file

   This keeps the public portfolio fast because visitors
   only download the already-optimized final image.
========================================================= */

const PORTFOLIO_WATERMARK_URL =
    "./watermark.png";

const PORTFOLIO_FULL_MAX_IMAGE_DIMENSION =
    1600;

const PORTFOLIO_FULL_WEBP_QUALITY =
    0.80;

const PORTFOLIO_THUMB_MAX_IMAGE_DIMENSION =
    400;

const PORTFOLIO_THUMB_WEBP_QUALITY =
    0.70;

const PORTFOLIO_WATERMARK_OPACITY =
    0.55;

const PORTFOLIO_WATERMARK_SIZE_RATIO =
    0.18;

const PORTFOLIO_MAX_WATERMARK_SIZE =
    500;

let portfolioWatermarkPromise =
    null;


/*
 * Load the watermark once and cache the
 * promise so six uploaded images do not
 * repeatedly download/decode the same file.
 */
function loadPortfolioWatermark() {

    if (portfolioWatermarkPromise) {
        return portfolioWatermarkPromise;
    }

    portfolioWatermarkPromise =
        new Promise(
            (resolve, reject) => {

                const image =
                    new Image();

                image.decoding =
                    "async";

                image.onload = () =>
                    resolve(image);

                image.onerror = () => {

                    portfolioWatermarkPromise =
                        null;

                    reject(
                        new Error(
                            `Unable to load watermark.png from ${PORTFOLIO_WATERMARK_URL}. Place watermark.png next to admin.html.`
                        )
                    );

                };

                image.src =
                    PORTFOLIO_WATERMARK_URL;

            }
        );

    return portfolioWatermarkPromise;

}


/*
 * Decode an uploaded image while respecting
 * EXIF orientation where the browser supports
 * createImageBitmap(imageOrientation: from-image).
 */
async function decodePortfolioSourceImage(file) {

    if (
        typeof createImageBitmap ===
        "function"
    ) {

        try {

            return await createImageBitmap(
                file,
                {
                    imageOrientation:
                        "from-image"
                }
            );

        } catch (error) {

            console.warn(
                "createImageBitmap orientation decode failed; using Image fallback.",
                error
            );

        }

    }


    return await new Promise(
        (resolve, reject) => {

            const objectUrl =
                URL.createObjectURL(file);

            const image =
                new Image();

            image.decoding =
                "async";

            image.onload = () => {

                URL.revokeObjectURL(
                    objectUrl
                );

                resolve(image);

            };

            image.onerror = () => {

                URL.revokeObjectURL(
                    objectUrl
                );

                reject(
                    new Error(
                        `Unable to decode image: ${file.name}`
                    )
                );

            };

            image.src =
                objectUrl;

        }
    );

}


/*
 * Convert the selected image into the final
 * web-ready image that will be stored in Firebase.
 *
 * - Never upscales a small image.
 * - Caps the longest dimension at 2400px.
 * - Applies the watermark at 55% opacity.
 * - Watermark size is 18% of the smaller image
 *   dimension, capped at 500px.
 * - Outputs WebP at quality 0.86.
 */
async function renderPortfolioImageVariant(
    source,
    maxDimension,
    quality,
    watermark
) {

    const sourceWidth =
        source.width;

    const sourceHeight =
        source.height;


    const scale =
        Math.min(
            1,
            maxDimension /
                Math.max(
                    sourceWidth,
                    sourceHeight
                )
        );


    const width =
        Math.max(
            1,
            Math.round(
                sourceWidth * scale
            )
        );

    const height =
        Math.max(
            1,
            Math.round(
                sourceHeight * scale
            )
        );


    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        width;

    canvas.height =
        height;


    const context =
        canvas.getContext(
            "2d",
            {
                alpha: true
            }
        );


    if (!context) {
        throw new Error(
            "Your browser could not create an image processing canvas."
        );
    }


    context.imageSmoothingEnabled =
        true;

    context.imageSmoothingQuality =
        "high";


    context.drawImage(
        source,
        0,
        0,
        width,
        height
    );


    const watermarkTargetSize =
        Math.min(
            PORTFOLIO_MAX_WATERMARK_SIZE,
            Math.round(
                Math.min(
                    width,
                    height
                ) *
                PORTFOLIO_WATERMARK_SIZE_RATIO
            )
        );


    if (
        watermarkTargetSize > 0 &&
        watermark?.naturalWidth &&
        watermark?.naturalHeight
    ) {

        const watermarkRatio =
            watermark.naturalWidth /
            watermark.naturalHeight;

        const watermarkWidth =
            watermarkTargetSize;

        const watermarkHeight =
            Math.max(
                1,
                Math.round(
                    watermarkTargetSize /
                    watermarkRatio
                )
            );


        const watermarkX =
            Math.round(
                (width - watermarkWidth) /
                2
            );

        const watermarkY =
            Math.round(
                (height - watermarkHeight) /
                2
            );


        context.save();

        context.globalAlpha =
            PORTFOLIO_WATERMARK_OPACITY;

        context.imageSmoothingEnabled =
            true;

        context.imageSmoothingQuality =
            "high";

        context.drawImage(
            watermark,
            watermarkX,
            watermarkY,
            watermarkWidth,
            watermarkHeight
        );

        context.restore();

    }


    const blob =
        await new Promise(
            (resolve, reject) => {

                canvas.toBlob(
                    result => {

                        if (result) {
                            resolve(result);
                            return;
                        }

                        reject(
                            new Error(
                                "Browser could not create the optimized WebP image."
                            )
                        );

                    },
                    "image/webp",
                    quality
                );

            }
        );


    return {
        blob,
        width,
        height
    };
}


/*
 * Creates exactly two stored image variants:
 * - 1600px max / WebP 0.80 for cards, opened images and fullscreen.
 * - 400px max / WebP 0.70 for modal thumbnails.
 */
async function preparePortfolioImage(file) {

    if (
        !file ||
        !file.type?.startsWith("image/")
    ) {

        throw new Error(
            `Invalid image file: ${file?.name || "Unknown file"}`
        );

    }


    const source =
        await decodePortfolioSourceImage(
            file
        );


    if (
        !source.width ||
        !source.height
    ) {

        if (typeof source.close === "function") {
            source.close();
        }

        throw new Error(
            `Could not determine dimensions for ${file.name}`
        );

    }


    try {

        const watermark =
            await loadPortfolioWatermark();


        const full =
            await renderPortfolioImageVariant(
                source,
                PORTFOLIO_FULL_MAX_IMAGE_DIMENSION,
                PORTFOLIO_FULL_WEBP_QUALITY,
                watermark
            );


        const thumbnail =
            await renderPortfolioImageVariant(
                source,
                PORTFOLIO_THUMB_MAX_IMAGE_DIMENSION,
                PORTFOLIO_THUMB_WEBP_QUALITY,
                watermark
            );


        const baseName =
            file.name
                .replace(/\.[^/.]+$/, "")
                .replace(/[^a-zA-Z0-9_-]+/g, "-")
                .replace(/^-+|-+$/g, "") ||
            "portfolio-image";


        return {

            full: {
                ...full,
                fileName:
                    `${baseName}.webp`
            },

            thumbnail: {
                ...thumbnail,
                fileName:
                    `${baseName}-thumb.webp`
            }

        };

    } finally {

        if (
            typeof source.close ===
            "function"
        ) {
            source.close();
        }

    }

}


/* =========================================================
   UPLOAD OPTIMIZED IMAGE VARIANT
========================================================= */

async function uploadPortfolioVariant(
    blob,
    fileName,
    progressStart,
    progressEnd,
    progressFill,
    progressPercent,
    progressText,
    label
) {

    const storageRef =
        ref(
            storage,
            `projects/${Date.now()}-${crypto.randomUUID()}-${fileName}`
        );


    const uploadTask =
        uploadBytesResumable(
            storageRef,
            blob,
            {
                contentType:
                    "image/webp",
                cacheControl:
                    "public,max-age=31536000,immutable"
            }
        );


    await new Promise(
        (resolve, reject) => {

            uploadTask.on(
                "state_changed",

                snapshot => {

                    const localPercent =
                        snapshot.totalBytes
                            ? (
                                snapshot.bytesTransferred /
                                snapshot.totalBytes
                            ) * 100
                            : 0;

                    const globalPercent =
                        Math.round(
                            progressStart +
                            (
                                localPercent /
                                100
                            ) *
                            (
                                progressEnd -
                                progressStart
                            )
                        );

                    if (progressFill) {
                        progressFill.style.width =
                            `${globalPercent}%`;
                    }

                    if (progressPercent) {
                        progressPercent.textContent =
                            `${globalPercent}%`;
                    }

                    if (progressText) {
                        progressText.textContent =
                            `${label} ${globalPercent}%`;
                    }

                },

                reject,
                resolve
            );

        }
    );


    return {
        url:
            await getDownloadURL(
                storageRef
            ),
        path:
            storageRef.fullPath
    };
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value = "") {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   DISPLAY LABEL
========================================================= */

function prettyPortfolioTag(value = "") {

    return String(value)

        .replace(
            /-/g,
            " "
        )

        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );

}


/* =========================================================
   NORMALIZE TAG VALUE
========================================================= */

function normalizePortfolioValue(value = "") {

    return String(value)

        .trim()

        .toLowerCase()

        .replace(
            /&/g,
            "and"
        )

        .replace(
            /[^a-z0-9]+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}


/* =========================================================
   LOAD PORTFOLIO TAXONOMY
========================================================= */

async function loadPortfolioTaxonomy() {

    try {

        const taxonomyRef =
            doc(
                db,
                "portfolioConfig",
                "taxonomy"
            );


        const snapshot =
            await getDoc(
                taxonomyRef
            );


        /*
         * First installation:
         * create default taxonomy.
         */

        if (!snapshot.exists()) {

            await setDoc(
                taxonomyRef,
                {

                    categories:
                        DEFAULT_PORTFOLIO_CATEGORIES,

                    subcategories:
                        DEFAULT_PORTFOLIO_SUBCATEGORIES

                }
            );


            portfolioCategories = [
                ...DEFAULT_PORTFOLIO_CATEGORIES
            ];


            portfolioSubcategories = {
                ...DEFAULT_PORTFOLIO_SUBCATEGORIES
            };


            return;

        }


        const data =
            snapshot.data();


        portfolioCategories =
            Array.isArray(
                data.categories
            )
                ? data.categories
                : [
                    ...DEFAULT_PORTFOLIO_CATEGORIES
                ];


        portfolioSubcategories =
            data.subcategories &&
            typeof data.subcategories === "object"

                ? data.subcategories

                : {
                    ...DEFAULT_PORTFOLIO_SUBCATEGORIES
                };

    }

    catch(error) {

        console.error(
            "Portfolio taxonomy loading failed:",
            error
        );


        /*
         * Keep default categories available
         * even if Firestore config cannot load.
         */

        portfolioCategories = [
            ...DEFAULT_PORTFOLIO_CATEGORIES
        ];


        portfolioSubcategories = {
            ...DEFAULT_PORTFOLIO_SUBCATEGORIES
        };

    }

}


/* =========================================================
   SAVE PORTFOLIO TAXONOMY
========================================================= */

async function savePortfolioTaxonomy() {

    await setDoc(

        doc(
            db,
            "portfolioConfig",
            "taxonomy"
        ),

        {

            categories:
                portfolioCategories,

            subcategories:
                portfolioSubcategories

        }

    );

}


/* =========================================================
   ADD CATEGORY
========================================================= */

async function createPortfolioCategory() {

    const entered =
        prompt(
            "Enter the new image category:"
        );


    if (
        entered === null
    ) {

        return null;

    }


    const category =
        normalizePortfolioValue(
            entered
        );


    if (!category) {

        alert(
            "Category name cannot be empty."
        );

        return null;

    }


    /*
     * Existing category
     */

    if (
        portfolioCategories.includes(
            category
        )
    ) {

        alert(
            "This category already exists."
        );

        return category;

    }


    /*
     * Add locally immediately.
     */

    portfolioCategories.push(
        category
    );


    /*
     * Create empty subcategory list.
     */

    if (
        !portfolioSubcategories[
            category
        ]
    ) {

        portfolioSubcategories[
            category
        ] = [];

    }


    /*
     * Save globally.
     *
     * Firestore failure must not prevent
     * the category from being used
     * during this Admin session.
     */

    try {

        await savePortfolioTaxonomy();

    } catch (error) {

        console.error(
            "Portfolio taxonomy save failed:",
            error
        );

        alert(
            `The category "${prettyPortfolioTag(
                category
            )}" was added for this session, but could not be saved to the global category list.`
        );

    }


    /*
     * Always return the category.
     */

    return category;

}

/* =========================================================
   DELETE PORTFOLIO CATEGORY GLOBALLY
========================================================= */

async function deletePortfolioCategory(
    category
) {

    const normalizedCategory =
        normalizePortfolioValue(
            category
        );


    if (!normalizedCategory) {
        return;
    }


    if (
        !portfolioCategories.includes(
            normalizedCategory
        )
    ) {

        alert(
            "This category no longer exists."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete "${prettyPortfolioTag(
                normalizedCategory
            )}" permanently?\n\n` +

            `This will:\n` +
            `• Remove the category from the global list\n` +
            `• Delete all of its subcategories\n` +
            `• Remove this category from every saved image tag\n\n` +

            `This action cannot be undone unless you create the category again.`
        );


    if (!confirmed) {
        return;
    }


    try {

        /* -------------------------------------------------
           1. Remove category from taxonomy
        ------------------------------------------------- */

        portfolioCategories =
            portfolioCategories.filter(
                item =>
                    item !== normalizedCategory
            );


        delete portfolioSubcategories[
            normalizedCategory
        ];


        await savePortfolioTaxonomy();


        /* -------------------------------------------------
           2. Remove category from ALL saved images
        ------------------------------------------------- */

        const projectsSnapshot =
            await getDocs(
                collection(
                    db,
                    "projects"
                )
            );


        const updates = [];


        projectsSnapshot.forEach(
            projectDoc => {

                const project =
                    projectDoc.data();


                if (
                    !Array.isArray(
                        project.images
                    )
                ) {
                    return;
                }


                let changed = false;


                const cleanedImages =
                    project.images.map(
                        image => {

                            if (
                                !Array.isArray(
                                    image.tags
                                )
                            ) {
                                return image;
                            }


                            const cleanedTags =
                                image.tags.filter(
                                    tag => {

                                        const tagCategory =
                                            normalizePortfolioValue(
                                                tag?.category
                                            );


                                        if (
                                            tagCategory ===
                                            normalizedCategory
                                        ) {

                                            changed = true;

                                            return false;

                                        }


                                        return true;

                                    }
                                );


                            if (
                                cleanedTags.length !==
                                image.tags.length
                            ) {

                                return {
                                    ...image,
                                    tags: cleanedTags
                                };

                            }


                            return image;

                        }
                    );


                if (changed) {

                    updates.push({

                        ref:
                            projectDoc.ref,

                        images:
                            cleanedImages

                    });

                }

            }
        );


        /* -------------------------------------------------
           3. Save image-tag cleanup
           Firestore batches max 500 writes.
        ------------------------------------------------- */

        for (
            let i = 0;
            i < updates.length;
            i += 450
        ) {

            const batch =
                writeBatch(db);


            const chunk =
                updates.slice(
                    i,
                    i + 450
                );


            chunk.forEach(
                update => {

                    batch.update(
                        update.ref,
                        {
                            images:
                                update.images
                        }
                    );

                }
            );


            await batch.commit();

        }


        /* -------------------------------------------------
           4. Clean current editing state too
        ------------------------------------------------- */

        if (
            Array.isArray(
                editingProjectImages
            )
        ) {

            editingProjectImages =
                editingProjectImages.map(
                    image => ({

                        ...image,

                        tags:
                            Array.isArray(
                                image.tags
                            )
                                ? image.tags.filter(
                                    tag =>
                                        normalizePortfolioValue(
                                            tag?.category
                                        ) !==
                                        normalizedCategory
                                )
                                : []

                    })
                );

        }


        /* -------------------------------------------------
           5. Clean currently selected new images
        ------------------------------------------------- */

        newPortfolioImages =
            newPortfolioImages.map(
                image => ({

                    ...image,

                    tags:
                        Array.isArray(
                            image.tags
                        )
                            ? image.tags.filter(
                                tag =>
                                    normalizePortfolioValue(
                                        tag?.category
                                    ) !==
                                    normalizedCategory
                            )
                            : []

                })
            );


        /* -------------------------------------------------
           6. Refresh UI
        ------------------------------------------------- */

        renderNewPortfolioImages();


        if (
            editingProjectId
        ) {

            renderExistingPortfolioImages(
                editingProjectId,
                editingProjectImages,
                editingMainImageIndex
            );

        }

localStorage.setItem(
    "sdnc_portfolio_data_version",
    String(Date.now())
);
        alert(
            `"${prettyPortfolioTag(
                normalizedCategory
            )}" was permanently deleted and removed from all saved image tags.`
        );

    }

    catch (error) {

        console.error(
            "Portfolio category deletion failed:",
            error
        );


        alert(
            "The category could not be deleted completely. Please check the console and try again."
        );

    }

}
/* =========================================================
   DELETE PORTFOLIO SUBCATEGORY GLOBALLY
========================================================= */

async function deletePortfolioSubcategory(
    category,
    subcategory
) {

    const normalizedCategory =
        normalizePortfolioValue(
            category
        );


    const normalizedSubcategory =
        normalizePortfolioValue(
            subcategory
        );


    if (
        !normalizedCategory ||
        !normalizedSubcategory
    ) {
        return;
    }


    const categorySubcategories =
        portfolioSubcategories[
            normalizedCategory
        ];


    if (
        !Array.isArray(
            categorySubcategories
        ) ||
        !categorySubcategories.includes(
            normalizedSubcategory
        )
    ) {

        alert(
            "This subcategory no longer exists."
        );

        return;

    }


    const confirmed =
        confirm(
            `Delete "${prettyPortfolioTag(
                normalizedSubcategory
            )}" permanently?\n\n` +

            `This will remove it from:\n` +
            `• The global subcategory list\n` +
            `• Every saved image tag using this subcategory\n\n` +

            `The parent category "${prettyPortfolioTag(
                normalizedCategory
            )}" will remain.`
        );


    if (!confirmed) {
        return;
    }


    try {

        /* -------------------------------------------------
           1. Remove from global taxonomy
        ------------------------------------------------- */

        portfolioSubcategories[
            normalizedCategory
        ] =
            categorySubcategories.filter(
                item =>
                    item !==
                    normalizedSubcategory
            );


        await savePortfolioTaxonomy();


        /* -------------------------------------------------
           2. Remove from every saved image
        ------------------------------------------------- */

        const projectsSnapshot =
            await getDocs(
                collection(
                    db,
                    "projects"
                )
            );


        const updates = [];


        projectsSnapshot.forEach(
            projectDoc => {

                const project =
                    projectDoc.data();


                if (
                    !Array.isArray(
                        project.images
                    )
                ) {
                    return;
                }


                let changed = false;


                const cleanedImages =
                    project.images.map(
                        image => {

                            if (
                                !Array.isArray(
                                    image.tags
                                )
                            ) {
                                return image;
                            }


                            let imageChanged =
                                false;


                            const cleanedTags =
                                image.tags.map(
                                    tag => {

                                        if (
                                            normalizePortfolioValue(
                                                tag?.category
                                            ) !==
                                            normalizedCategory
                                        ) {

                                            return tag;

                                        }


                                        const oldSubcategories =
                                            Array.isArray(
                                                tag.subcategories
                                            )
                                                ? tag.subcategories
                                                : [];


                                        const cleanedSubcategories =
                                            oldSubcategories.filter(
                                                item =>
                                                    normalizePortfolioValue(
                                                        item
                                                    ) !==
                                                    normalizedSubcategory
                                            );


                                        if (
                                            cleanedSubcategories.length !==
                                            oldSubcategories.length
                                        ) {

                                            imageChanged =
                                                true;

                                        }


                                        return {

                                            ...tag,

                                            subcategories:
                                                cleanedSubcategories

                                        };

                                    }
                                );


                            if (
                                imageChanged
                            ) {

                                changed =
                                    true;


                                return {

                                    ...image,

                                    tags:
                                        cleanedTags

                                };

                            }


                            return image;

                        }
                    );


                if (changed) {

                    updates.push({

                        ref:
                            projectDoc.ref,

                        images:
                            cleanedImages

                    });

                }

            }
        );


        /* -------------------------------------------------
           3. Commit in safe Firestore batches
        ------------------------------------------------- */

        for (
            let i = 0;
            i < updates.length;
            i += 450
        ) {

            const batch =
                writeBatch(db);


            const chunk =
                updates.slice(
                    i,
                    i + 450
                );


            chunk.forEach(
                update => {

                    batch.update(
                        update.ref,
                        {
                            images:
                                update.images
                        }
                    );

                }
            );


            await batch.commit();

        }


        /* -------------------------------------------------
           4. Clean current editing state
        ------------------------------------------------- */

        const cleanImageTags =
            images => {

                if (
                    !Array.isArray(images)
                ) {
                    return images;
                }


                return images.map(
                    image => ({

                        ...image,

                        tags:
                            Array.isArray(
                                image.tags
                            )
                                ? image.tags.map(
                                    tag => {

                                        if (
                                            normalizePortfolioValue(
                                                tag?.category
                                            ) !==
                                            normalizedCategory
                                        ) {

                                            return tag;

                                        }


                                        return {

                                            ...tag,

                                            subcategories:
                                                Array.isArray(
                                                    tag.subcategories
                                                )
                                                    ? tag.subcategories.filter(
                                                        item =>
                                                            normalizePortfolioValue(
                                                                item
                                                            ) !==
                                                            normalizedSubcategory
                                                    )
                                                    : []

                                        };

                                    }
                                )
                                : []

                    })
                );

            };


        editingProjectImages =
            cleanImageTags(
                editingProjectImages
            );


        newPortfolioImages =
            cleanImageTags(
                newPortfolioImages
            );


        /* -------------------------------------------------
           5. Refresh UI
        ------------------------------------------------- */

        renderNewPortfolioImages();


        if (
            editingProjectId
        ) {

            renderExistingPortfolioImages(
                editingProjectId,
                editingProjectImages,
                editingMainImageIndex
            );

        }
localStorage.setItem(
    "sdnc_portfolio_data_version",
    String(Date.now())
);

        alert(
            `"${prettyPortfolioTag(
                normalizedSubcategory
            )}" was permanently deleted.`
        );

    }

    catch (error) {

        console.error(
            "Portfolio subcategory deletion failed:",
            error
        );


        alert(
            "The subcategory could not be deleted completely. Please check the console and try again."
        );

    }

}
/* =========================================================
   PORTFOLIO TAXONOMY MANAGER
========================================================= */

function createPortfolioTaxonomyManager() {

    if (
        document.getElementById(
            "portfolioTaxonomyManager"
        )
    ) {
        return;
    }


    const manager =
        document.createElement(
            "div"
        );


    manager.id =
        "portfolioTaxonomyManager";

    manager.className =
        "portfolio-taxonomy-manager";


    manager.innerHTML = `

        <div class="portfolio-taxonomy-overlay"
             data-taxonomy-close>

            <div
                class="portfolio-taxonomy-modal"
                role="dialog"
                aria-modal="true"
            >

                <div class="portfolio-taxonomy-header">

                    <div>

                        <span class="portfolio-taxonomy-eyebrow">
                            IMAGE SYSTEM
                        </span>

                        <h2>
                            Manage Categories
                        </h2>

                        <p>
                            Delete categories or subcategories
                            globally from the image taxonomy.
                        </p>

                    </div>

                    <button
                        type="button"
                        class="portfolio-taxonomy-close"
                        data-taxonomy-close
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                <div
                    id="portfolioTaxonomyContent"
                    class="portfolio-taxonomy-content"
                ></div>


                <div class="portfolio-taxonomy-footer">

                    <span>
                        Changes affect all saved project images.
                    </span>

                    <button
                        type="button"
                        class="portfolio-taxonomy-done"
                        data-taxonomy-close
                    >
                        Done
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        manager
    );


    manager.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    "[data-taxonomy-close]"
                )
            ) {

                manager.classList.remove(
                    "is-open"
                );

            }

        }
    );


    renderPortfolioTaxonomyManager();

}


function renderPortfolioTaxonomyManager() {

    const content =
        document.getElementById(
            "portfolioTaxonomyContent"
        );


    if (!content) {
        return;
    }


    const categories =
        Array.isArray(
            portfolioCategories
        )
            ? portfolioCategories
            : [];


    content.innerHTML = categories
        .map(
            category => {

                const subcategories =
                    Array.isArray(
                        portfolioSubcategories[
                            category
                        ]
                    )
                        ? portfolioSubcategories[
                            category
                        ]
                        : [];


                return `

                    <div
                        class="portfolio-taxonomy-category"
                    >

                        <div
                            class="portfolio-taxonomy-category-row"
                        >

                            <div>

                                <strong>
                                    ${escapeHtml(
                                        prettyPortfolioTag(
                                            category
                                        )
                                    )}
                                </strong>

                                <span>
                                    ${subcategories.length}
                                    subcategor${subcategories.length === 1 ? "y" : "ies"}
                                </span>

                            </div>


                            <button
                                type="button"
                                class="portfolio-taxonomy-delete"
                                data-delete-category="${escapeHtml(category)}"
                                title="Delete category"
                            >
                                ×
                            </button>

                        </div>


                        ${
                            subcategories.length
                                ? `
                                    <div
                                        class="portfolio-taxonomy-subcategories"
                                    >

                                        ${subcategories
                                            .map(
                                                subcategory => `

                                                    <div
                                                        class="portfolio-taxonomy-subcategory"
                                                    >

                                                        <span>
                                                            ${escapeHtml(
                                                                prettyPortfolioTag(
                                                                    subcategory
                                                                )
                                                            )}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            class="portfolio-taxonomy-delete-sub"
                                                            data-delete-subcategory="${escapeHtml(subcategory)}"
                                                            data-subcategory-category="${escapeHtml(category)}"
                                                            title="Delete subcategory"
                                                        >
                                                            ×
                                                        </button>

                                                    </div>

                                                `
                                            )
                                            .join("")}

                                    </div>
                                `
                                : `
                                    <div
                                        class="portfolio-taxonomy-empty"
                                    >
                                        No subcategories
                                    </div>
                                `
                        }

                    </div>

                `;

            }
        )
        .join("");


    content
        .querySelectorAll(
            "[data-delete-category]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await deletePortfolioCategory(
                            button.dataset.deleteCategory
                        );

                    }
                );

            }
        );


    content
        .querySelectorAll(
            "[data-delete-subcategory]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await deletePortfolioSubcategory(

                            button.dataset
                                .subcategoryCategory,

                            button.dataset
                                .deleteSubcategory

                        );

                    }
                );

            }
        );

}
/* =========================================================
   TAXONOMY MANAGER BUTTON
========================================================= */

function setupPortfolioTaxonomyManager() {

    createPortfolioTaxonomyManager();


    const button =
        document.getElementById(
            "managePortfolioTaxonomyBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            const manager =
                document.getElementById(
                    "portfolioTaxonomyManager"
                );


            if (!manager) {
                return;
            }


            renderPortfolioTaxonomyManager();


            manager.classList.add(
                "is-open"
            );

        }
    );

}


/* =========================================================
   ADD SUBCATEGORY
========================================================= */

async function createPortfolioSubcategory(
    selectedCategory = ""
) {

    let category =
        selectedCategory;


    /*
     * If no category was supplied,
     * ask the admin which category it
     * belongs to.
     */

    if (!category) {

        if (
            !portfolioCategories.length
        ) {

            alert(
                "Create a category first."
            );

            return null;

        }


        const categoryText =
            prompt(

                "Enter the category this subcategory belongs to:\n\n" +

                portfolioCategories
                    .map(
                        item =>
                            prettyPortfolioTag(
                                item
                            )
                    )
                    .join(", ")

            );


        if (
            categoryText === null
        ) {

            return null;

        }


        category =
            normalizePortfolioValue(
                categoryText
            );

    }


    if (
        !portfolioCategories.includes(
            category
        )
    ) {

        alert(
            "That category does not exist."
        );

        return null;

    }


    const entered =
        prompt(
            `Enter a new subcategory for ${prettyPortfolioTag(category)}:`
        );


    if (
        entered === null
    ) {

        return null;

    }


    const subcategory =
        normalizePortfolioValue(
            entered
        );


    if (!subcategory) {

        alert(
            "Subcategory name cannot be empty."
        );

        return null;

    }


    if (
        !portfolioSubcategories[
            category
        ]
    ) {

        portfolioSubcategories[
            category
        ] = [];

    }


    if (
        portfolioSubcategories[
            category
        ].includes(
            subcategory
        )
    ) {

        alert(
            "This subcategory already exists for this category."
        );

        return subcategory;

    }


    portfolioSubcategories[
        category
    ].push(
        subcategory
    );


    await savePortfolioTaxonomy();


    return subcategory;

}


/* =========================================================
   IMAGE TAG HELPERS
========================================================= */

function cloneTags(tags) {

    if (
        !Array.isArray(tags)
    ) {

        return [];

    }


    return tags.map(
        tag => ({

            category:
                tag.category || "",

            subcategories:
                Array.isArray(
                    tag.subcategories
                )

                    ? [
                        ...tag.subcategories
                    ]

                    : []

        })
    );

}


/* =========================================================
   ADD CATEGORY TO IMAGE
========================================================= */

function addCategoryToImage(
    image,
    category
) {

    if (
        !image ||
        !category
    ) {
        return;
    }


    /*
     * Always make sure the image has
     * a tags array before using it.
     */

    if (
        !Array.isArray(
            image.tags
        )
    ) {

        image.tags = [];

    }


    const normalizedCategory =
        normalizePortfolioValue(
            category
        );


    if (!normalizedCategory) {
        return;
    }


    /*
     * Do not add the same category twice.
     */

    const alreadyAssigned =
        image.tags.some(
            tag =>
                normalizePortfolioValue(
                    tag?.category
                ) === normalizedCategory
        );


    if (
        alreadyAssigned
    ) {

        return;

    }


    /*
     * Assign the category immediately
     * to the image.
     */

    image.tags.push({

        category:
            normalizedCategory,

        subcategories: []

    });

}


/* =========================================================
   REMOVE CATEGORY FROM IMAGE
========================================================= */

function removeCategoryFromImage(
    image,
    category
) {

    image.tags =
        image.tags.filter(
            tag =>
                tag.category !== category
        );

}


/* =========================================================
   ADD SUBCATEGORY TO IMAGE
========================================================= */

function addSubcategoryToImage(
    image,
    category,
    subcategory
) {

    if (
        !category ||
        !subcategory
    ) {

        return;

    }


    const tag =
        image.tags.find(
            item =>
                item.category === category
        );


    /*
     * Subcategory can only exist
     * under an image category tag.
     */

    if (!tag) {

        return;

    }


    if (
        !Array.isArray(
            tag.subcategories
        )
    ) {

        tag.subcategories = [];

    }


    if (
        !tag.subcategories.includes(
            subcategory
        )
    ) {

        tag.subcategories.push(
            subcategory
        );

    }

}


/* =========================================================
   REMOVE SUBCATEGORY
========================================================= */

function removeSubcategoryFromImage(
    image,
    category,
    subcategory
) {

    const tag =
        image.tags.find(
            item =>
                item.category === category
        );


    if (!tag) {
        return;
    }


    tag.subcategories =
        tag.subcategories.filter(
            item =>
                item !== subcategory
        );

}


/* =========================================================
   NEW IMAGE SELECTOR
========================================================= */

choosePortfolioImages?.addEventListener(
    "click",
    () => {

        portfolioImageInput?.click();

    }
);


portfolioImageInput?.addEventListener(
    "change",
    event => {

        const files =
            Array.from(
                event.target.files || []
            );


        if (!files.length) {
            return;
        }


        const availableSlots =
            6 -
            newPortfolioImages.length;


        if (
            availableSlots <= 0
        ) {

            alert(
                "You already have 6 new images selected. Save these images before adding another batch."
            );


            portfolioImageInput.value =
                "";

            return;

        }


        const acceptedFiles =
            files.slice(
                0,
                availableSlots
            );


        if (
            files.length >
            availableSlots
        ) {

            alert(
                `Only ${availableSlots} more image${availableSlots === 1 ? "" : "s"} can be added in this batch.`
            );

        }


        acceptedFiles.forEach(
            file => {

                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    return;

                }


                newPortfolioImages.push({

                    id:
                        crypto.randomUUID(),

                    file,

                    previewUrl:
                        URL.createObjectURL(
                            file
                        ),

                    tags: []

                });

            }
        );


        /*
         * Reset the input so the same
         * file can be selected again.
         */

        portfolioImageInput.value =
            "";


        renderNewPortfolioImages();

    }
);


/* =========================================================
   RENDER NEW IMAGES
========================================================= */

function renderNewPortfolioImages() {

    if (
        !portfolioImageEditor
    ) {

        return;

    }


    if (
        selectedImageCount
    ) {

        selectedImageCount.textContent =
            `${newPortfolioImages.length} / 6 images selected`;

    }


    portfolioImageEditor.innerHTML =
        newPortfolioImages
            .map(
                (
                    image,
                    index
                ) =>
                    renderNewPortfolioImageCard(
                        image,
                        index
                    )
            )
            .join("");


    attachPortfolioImageEvents();

}


/* =========================================================
   CATEGORY SELECT OPTIONS
========================================================= */

function renderCategoryOptions(
    image
) {

    return portfolioCategories

        .filter(
            category =>
                !image.tags.some(
                    tag =>
                        tag.category ===
                        category
                )
        )

        .map(
            category =>
                `
                <option value="${escapeHtml(category)}">
                    ${escapeHtml(
                        prettyPortfolioTag(
                            category
                        )
                    )}
                </option>
                `
        )

        .join("");

}


/* =========================================================
   SUBCATEGORY CATEGORY OPTIONS
========================================================= */

function renderSubcategoryCategoryOptions(
    image
) {

    return image.tags

        .map(
            tag =>
                `
                <option value="${escapeHtml(tag.category)}">
                    ${escapeHtml(
                        prettyPortfolioTag(
                            tag.category
                        )
                    )}
                </option>
                `
        )

        .join("");

}


/* =========================================================
   SUBCATEGORY OPTIONS
========================================================= */

function renderSubcategoryOptions(
    category,
    image
) {

    if (!category) {

        return `
            <option value="">
                Select Subcategory
            </option>
        `;

    }


    const options =
        (
            portfolioSubcategories[
                category
            ] || []
        )

        .filter(
            subcategory => {

                const tag =
                    image.tags.find(
                        item =>
                            item.category ===
                            category
                    );


                return !tag?.subcategories
                    ?.includes(
                        subcategory
                    );

            }
        )

        .map(
            subcategory =>
                `
                <option value="${escapeHtml(subcategory)}">
                    ${escapeHtml(
                        prettyPortfolioTag(
                            subcategory
                        )
                    )}
                </option>
                `
        )

        .join("");


    return `
        <option value="">
            Select Subcategory
        </option>

        ${options}
    `;

}


/* =========================================================
   CATEGORY TAG HTML
========================================================= */

function renderImageCategoryTags(
    image
) {

    if (
        !image.tags.length
    ) {

        return `
            <span class="field-help">
                No categories assigned
            </span>
        `;

    }


    return image.tags

        .map(
            tag =>
                `
                <span
                    class="portfolio-category-tag">

                    ${escapeHtml(
                        prettyPortfolioTag(
                            tag.category
                        )
                    )}

                    <button
                        type="button"
                        data-action="remove-category"
                        data-image-id="${escapeHtml(image.id)}"
                        data-category="${escapeHtml(tag.category)}"
                        aria-label="Remove category">

                        ×

                    </button>

                </span>
                `
        )

        .join("");

}


/* =========================================================
   SUBCATEGORY TAG HTML
========================================================= */

function renderImageSubcategoryGroups(
    image
) {

    return image.tags

        .filter(
            tag =>
                Array.isArray(
                    tag.subcategories
                ) &&
                tag.subcategories.length
        )

        .map(
            tag =>
                `
                <div
                    class="portfolio-subcategory-group">

                    <p
                        class="portfolio-subcategory-group-title">

                        ${escapeHtml(
                            prettyPortfolioTag(
                                tag.category
                            )
                        )}

                    </p>

                    <div
                        class="portfolio-subcategory-tags">

                        ${tag.subcategories
                            .map(
                                subcategory =>
                                    `
                                    <span
                                        class="portfolio-subcategory-tag">

                                        ${escapeHtml(
                                            prettyPortfolioTag(
                                                subcategory
                                            )
                                        )}

                                        <button
                                            type="button"
                                            data-action="remove-subcategory"
                                            data-image-id="${escapeHtml(image.id)}"
                                            data-category="${escapeHtml(tag.category)}"
                                            data-subcategory="${escapeHtml(subcategory)}">

                                            ×

                                        </button>

                                    </span>
                                    `
                            )
                            .join("")}

                    </div>

                </div>
                `
        )

        .join("");

}


/* =========================================================
   NEW IMAGE CARD
========================================================= */

function renderNewPortfolioImageCard(
    image,
    index
) {

    return `

        <article
            class="portfolio-image-card"
            data-image-id="${escapeHtml(image.id)}">


            <div
                class="portfolio-image-preview">

                <span
                    class="portfolio-image-number">

                    Image ${index + 1}

                </span>


                <button
                    type="button"
                    class="remove-portfolio-image-btn"
                    data-action="remove-image"
                    data-image-id="${escapeHtml(image.id)}">

                    <i
                        class="fa-solid fa-xmark">
                    </i>

                </button>


                <img
                    src="${escapeHtml(image.previewUrl)}"
                    alt="Portfolio image ${index + 1}">

            </div>


            <div
                class="portfolio-image-card-body">


                <h4
                    class="portfolio-image-card-title">

                    Image ${index + 1}

                </h4>


                <label
                    class="portfolio-main-image-option">

                    <input
                        type="radio"
                        name="newMainPortfolioImage"
                        value="${escapeHtml(image.id)}">

                    <span>
                        Set as Main Image
                    </span>

                </label>


                <!-- CATEGORIES -->

                <div
                    class="portfolio-tag-section">

                    <label>
                        Categories
                    </label>


                    <div
                        class="portfolio-category-tags">

                        ${renderImageCategoryTags(
                            image
                        )}

                    </div>


                    <div
                        class="portfolio-add-tag-row">

                       <select
    data-role="category-select"
    data-image-id="${escapeHtml(image.id)}"
    multiple>

    ${renderCategoryOptions(
        image
    )}

</select>


                        <button
                            type="button"
                            data-action="add-category"
                            data-image-id="${escapeHtml(image.id)}">

                            Add

                        </button>

                    </div>


                    <button
                        type="button"
                        class="portfolio-create-tag-btn"
                        data-action="create-category"
                        data-image-id="${escapeHtml(image.id)}">

                        + Create New Category

                    </button>

                </div>


                <!-- SUBCATEGORIES -->

                <div
                    class="portfolio-tag-section">

                    <label>
                        Subcategories
                    </label>


                    ${renderImageSubcategoryGroups(
                        image
                    )}


                    <div
                        class="portfolio-add-tag-row">

                        <select
                            data-role="subcategory-category-select"
                            data-image-id="${escapeHtml(image.id)}">

                            <option value="">
                                Select Category
                            </option>

                            ${renderSubcategoryCategoryOptions(
                                image
                            )}

                        </select>


                        <select
                            data-role="subcategory-select"
                            data-image-id="${escapeHtml(image.id)}"
                            disabled>

                            <option value="">
                                Select Subcategory
                            </option>

                        </select>


                        <button
                            type="button"
                            data-action="add-subcategory"
                            data-image-id="${escapeHtml(image.id)}">

                            Add

                        </button>

                    </div>


                    <button
                        type="button"
                        class="portfolio-create-tag-btn"
                        data-action="create-subcategory"
                        data-image-id="${escapeHtml(image.id)}">

                        + Create New Subcategory

                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   UPDATE SUBCATEGORY DROPDOWN
========================================================= */

function updateSubcategoryDropdown(
    imageId
) {

    const image =
        newPortfolioImages.find(
            item =>
                item.id === imageId
        );


    if (!image) {
        return;
    }


    const categorySelect =
        portfolioImageEditor.querySelector(
            `[data-role="subcategory-category-select"][data-image-id="${CSS.escape(imageId)}"]`
        );


    const subcategorySelect =
        portfolioImageEditor.querySelector(
            `[data-role="subcategory-select"][data-image-id="${CSS.escape(imageId)}"]`
        );


    if (
        !categorySelect ||
        !subcategorySelect
    ) {

        return;

    }


    const category =
        categorySelect.value;


    subcategorySelect.innerHTML =
        renderSubcategoryOptions(
            category,
            image
        );


    subcategorySelect.disabled =
        !category;

}


/* =========================================================
   ATTACH IMAGE EVENTS
========================================================= */

function attachPortfolioImageEvents() {

    if (
        !portfolioImageEditor
    ) {

        return;

    }


    portfolioImageEditor
        .querySelectorAll(
            "[data-role='subcategory-category-select']"
        )
        .forEach(
            select => {

                select.addEventListener(
                    "change",
                    () => {

                        updateSubcategoryDropdown(
                            select.dataset.imageId
                        );

                    }
                );

            }
        );


    portfolioImageEditor
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const action =
                            button.dataset.action;


                        const imageId =
                            button.dataset.imageId;


                        const image =
                            newPortfolioImages.find(
                                item =>
                                    item.id ===
                                    imageId
                            );


                        if (
                            !image &&
                            action !==
                            "create-category"
                        ) {

                            return;

                        }


                        if (
                            action ===
                            "remove-image"
                        ) {

                            if (
                                image.previewUrl
                            ) {

                                URL.revokeObjectURL(
                                    image.previewUrl
                                );

                            }


                            newPortfolioImages =
                                newPortfolioImages.filter(
                                    item =>
                                        item.id !==
                                        imageId
                                );


                            renderNewPortfolioImages();

                            return;

                        }


                        if (
    action ===
    "add-category"
) {

    const select =
        portfolioImageEditor.querySelector(
            `[data-role="category-select"][data-image-id="${CSS.escape(imageId)}"]`
        );


    if (!select) {
        return;
    }


    const selectedCategories =
        Array.from(
            select.selectedOptions || []
        )
            .map(
                option =>
                    normalizePortfolioValue(
                        option.value
                    )
            )
            .filter(Boolean);


    if (!selectedCategories.length) {
        return;
    }


    selectedCategories.forEach(
        category => {

            addCategoryToImage(
                image,
                category
            );

        }
    );


    renderNewPortfolioImages();

    return;

}


                        if (
                            action ===
                            "remove-category"
                        ) {

                            removeCategoryFromImage(
                                image,
                                button.dataset.category
                            );


                            renderNewPortfolioImages();

                            return;

                        }


                        if (
                            action ===
                            "add-subcategory"
                        ) {

                            const categorySelect =
                                portfolioImageEditor.querySelector(
                                    `[data-role="subcategory-category-select"][data-image-id="${CSS.escape(imageId)}"]`
                                );


                            const subcategorySelect =
                                portfolioImageEditor.querySelector(
                                    `[data-role="subcategory-select"][data-image-id="${CSS.escape(imageId)}"]`
                                );


                            const category =
                                categorySelect?.value;


                            const subcategory =
                                subcategorySelect?.value;


                            if (
                                !category ||
                                !subcategory
                            ) {

                                alert(
                                    "Select a category and subcategory first."
                                );

                                return;

                            }


                            addSubcategoryToImage(
                                image,
                                category,
                                subcategory
                            );


                            renderNewPortfolioImages();

                            return;

                        }


                        if (
                            action ===
                            "remove-subcategory"
                        ) {

                            removeSubcategoryFromImage(
                                image,
                                button.dataset.category,
                                button.dataset.subcategory
                            );


                            renderNewPortfolioImages();

                            return;

                        }


                        if (
                            action ===
                            "create-category"
                        ) {

                            const category =
                                await createPortfolioCategory();


                            if (
                                category
                            ) {

                                addCategoryToImage(
                                    image,
                                    category
                                );


                                renderNewPortfolioImages();

                            }


                            return;

                        }


                        if (
                            action ===
                            "create-subcategory"
                        ) {

                            const categorySelect =
                                portfolioImageEditor.querySelector(
                                    `[data-role="subcategory-category-select"][data-image-id="${CSS.escape(imageId)}"]`
                                );


                            const category =
                                categorySelect?.value ||
                                "";


                            const subcategory =
                                await createPortfolioSubcategory(
                                    category
                                );


                            if (
                                subcategory
                            ) {

                                /*
                                 * If category was not
                                 * selected before creating
                                 * the subcategory, the
                                 * function will have asked
                                 * for it. We need to find
                                 * which category owns it.
                                 */

                                let ownerCategory =
                                    category;


                                if (
                                    !ownerCategory
                                ) {

                                    ownerCategory =
                                        Object.keys(
                                            portfolioSubcategories
                                        ).find(
                                            key =>
                                                portfolioSubcategories[
                                                    key
                                                ].includes(
                                                    subcategory
                                                )
                                        );

                                }


                                if (
                                    ownerCategory
                                ) {

                                    /*
                                     * The image must have
                                     * that category before
                                     * the subcategory can
                                     * be attached.
                                     */

                                    addCategoryToImage(
                                        image,
                                        ownerCategory
                                    );


                                    addSubcategoryToImage(
                                        image,
                                        ownerCategory,
                                        subcategory
                                    );

                                }


                                renderNewPortfolioImages();

                            }


                            return;

                        }

                    }
                );

            }
        );

}


/* =========================================================
   MAIN IMAGE RADIO
========================================================= */

function getSelectedNewMainImageId() {

    return document.querySelector(
        'input[name="newMainPortfolioImage"]:checked'
    )?.value || null;

}


/* =========================================================
   RESET PROJECT FORM
========================================================= */

function resetProjectForm() {

    [
        "projectTitle",
        "projectDescription",
        "projectLocation",
        "projectArea",
        "projectYear"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );

            if (element) {
                element.value = "";
            }

        }
    );


    [
        "projectCategory",
        "projectSubcategory",
        "projectWorkType",
        "projectStatus"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );

            if (element) {
                element.selectedIndex = 0;
            }

        }
    );


    const falseRadio =
        document.querySelector(
            'input[name="projectFeatured"][value="false"]'
        );


    if (falseRadio) {
        falseRadio.checked = true;
    }


    document.getElementById(
        "existingImages"
    ).innerHTML = "";


    if (portfolioImageEditor) {
        portfolioImageEditor.innerHTML = "";
    }


    newPortfolioImages.forEach(
        image => {

            if (image.previewUrl) {

                URL.revokeObjectURL(
                    image.previewUrl
                );

            }

        }
    );


    newPortfolioImages = [];


    if (portfolioImageInput) {
        portfolioImageInput.value = "";
    }


    if (selectedImageCount) {

        selectedImageCount.textContent =
            "0 / 6 images selected";

    }


    if (previewGrid) {
        previewGrid.innerHTML = "";
    }

}


/* =========================================================
   FEATURED PROJECT HELPERS
========================================================= */

function setFeaturedValue(
    value
) {

    const radio =
        document.querySelector(
            `input[name="projectFeatured"][value="${value ? "true" : "false"}"]`
        );


    if (radio) {
        radio.checked = true;
    }

}


async function getFeaturedCount(
    excludeId = null
) {

    const snapshot =
        await getDocs(
            query(
                collection(
                    db,
                    "projects"
                ),

                where(
                    "featured",
                    "==",
                    true
                )
            )
        );


    return snapshot.docs.filter(
        item =>
            item.id !== excludeId
    ).length;

}


async function validateFeatured(
    featured,
    excludeId = null
) {

    if (!featured) {
        return true;
    }


    const count =
        await getFeaturedCount(
            excludeId
        );


    if (
        count >= 6
    ) {

        alert(
            "Already 6 projects exist as featured, remove one to add this."
        );


        return false;

    }


    return true;

}


/* =========================================================
   SAVE / UPDATE PROJECT
========================================================= */

saveProjectBtn?.addEventListener(
    "click",
    saveProject
);


async function saveProject() {

    try {

        saveProjectBtn.disabled =
            true;


        saveProjectBtn.textContent =
            editingProjectId
                ? "Updating..."
                : "Uploading...";


        progressFill.style.width =
            "0%";


        progressPercent.textContent =
            "0%";


        progressText.textContent =
            "Preparing Upload...";


        /* -----------------------------------------
           EXISTING PROJECT FIELDS
           KEEPING YOUR CURRENT SYSTEM UNCHANGED
        ----------------------------------------- */

        const title =
            document.getElementById(
                "projectTitle"
            ).value.trim();


        const description =
            document.getElementById(
                "projectDescription"
            ).value.trim();


        const category =
            document.getElementById(
                "projectCategory"
            ).value;


        const subcategory =
            document.getElementById(
                "projectSubcategory"
            ).value;


        const workType =
            document.getElementById(
                "projectWorkType"
            ).value;


        const location =
            document.getElementById(
                "projectLocation"
            ).value.trim();


        const area =
            document.getElementById(
                "projectArea"
            ).value;


        const year =
            document.getElementById(
                "projectYear"
            ).value;


        const status =
            document.getElementById(
                "projectStatus"
            ).value;


        const featured =
            document.querySelector(
                'input[name="projectFeatured"]:checked'
            )?.value === "true";


        /*
         * Existing project validation stays.
         */

        if (
            !title ||
            !category ||
            !subcategory ||
            !workType ||
            !location ||
            !year ||
            !status
        ) {

            alert(
                "Please fill all required project fields."
            );


            saveProjectBtn.disabled =
                false;


            saveProjectBtn.textContent =
                editingProjectId
                    ? "Update Project"
                    : "Save Project";


            return;

        }


        if (
            !(await validateFeatured(
                featured,
                editingProjectId
            ))
        ) {

            saveProjectBtn.disabled =
                false;


            saveProjectBtn.textContent =
                editingProjectId
                    ? "Update Project"
                    : "Save Project";


            return;

        }


        /* -----------------------------------------
           GET EXISTING PROJECT
        ----------------------------------------- */

        let existingProject =
            null;


        let existingImages =
            [];


        if (editingProjectId) {

            const snapshot =
                await getDoc(
                    doc(
                        db,
                        "projects",
                        editingProjectId
                    )
                );


            if (
                !snapshot.exists()
            ) {

                throw new Error(
                    "Project no longer exists."
                );

            }


            existingProject =
                snapshot.data();


          /*
 * IMPORTANT:
 * When editing an existing project, use the
 * current in-memory image array.
 *
 * This contains category/subcategory changes
 * made in the existing-image editor.
 */

existingImages =
    Array.isArray(
        editingProjectImages
    )
        ? JSON.parse(
            JSON.stringify(
                editingProjectImages
            )
        )
        : [];

        }


        /* -----------------------------------------
           NEW IMAGE UPLOADS
        ----------------------------------------- */

        const uploadedImages =
            [];


        const totalFiles =
            newPortfolioImages.length;


        let uploaded =
            0;


        for (
            const imageItem
            of newPortfolioImages
        ) {

            uploaded++;


            progressText.textContent =
                `Optimizing image ${uploaded} of ${totalFiles}...`;

            progressPercent.textContent =
                "0%";

            progressFill.style.width =
                "0%";


            const processedImages =
                await preparePortfolioImage(
                    imageItem.file
                );


            progressText.textContent =
                `Uploading image ${uploaded} of ${totalFiles} — main image...`;


            const uploadedFull =
                await uploadPortfolioVariant(
                    processedImages.full.blob,
                    processedImages.full.fileName,
                    0,
                    75,
                    progressFill,
                    progressPercent,
                    progressText,
                    `Uploading image ${uploaded} of ${totalFiles} — main image...`
                );


            progressText.textContent =
                `Uploading image ${uploaded} of ${totalFiles} — thumbnail...`;


            const uploadedThumbnail =
                await uploadPortfolioVariant(
                    processedImages.thumbnail.blob,
                    processedImages.thumbnail.fileName,
                    75,
                    100,
                    progressFill,
                    progressPercent,
                    progressText,
                    `Uploading image ${uploaded} of ${totalFiles} — thumbnail...`
                );


            uploadedImages.push({

                url:
                    uploadedFull.url,

                path:
                    uploadedFull.path,

                thumbnailUrl:
                    uploadedThumbnail.url,

                thumbnailPath:
                    uploadedThumbnail.path,

                tags:
                    cloneTags(
                        imageItem.tags
                    )

            });


            const percent =
                totalFiles
                    ? Math.round(
                        (
                            uploaded /
                            totalFiles
                        ) * 100
                    )
                    : 100;


            progressFill.style.width =
                `${percent}%`;


            progressPercent.textContent =
                `${percent}%`;

        }

        /* -----------------------------------------
           FINAL IMAGE ARRAY
        ----------------------------------------- */

        const images = [

            ...existingImages,

            ...uploadedImages

        ];


        /*
         * A new project must still have
         * at least one image, exactly like
         * your existing system.
         */

        if (
            images.length === 0
        ) {

            alert(
                "Please upload at least one image."
            );


            saveProjectBtn.disabled =
                false;


            saveProjectBtn.textContent =
                editingProjectId
                    ? "Update Project"
                    : "Save Project";


            return;

        }


        /* -----------------------------------------
           MAIN IMAGE
        ----------------------------------------- */

        let mainImageIndex =
    editingProjectId &&
    Number.isInteger(
        Number(editingMainImageIndex)
    )
        ? Number(editingMainImageIndex)
        : existingProject?.mainImageIndex;


const selectedNewMainId =
    getSelectedNewMainImageId();

        /*
         * If admin explicitly selected a new
         * image as main, use that image.
         */

        if (
            selectedNewMainId
        ) {

            const newIndex =
                newPortfolioImages.findIndex(
                    image =>
                        image.id ===
                        selectedNewMainId
                );


            if (
                newIndex !== -1
            ) {

                mainImageIndex =
                    existingImages.length +
                    newIndex;

            }

        }


        /*
         * New project:
         * first image becomes main if the admin
         * did not explicitly select one.
         */

        if (
            typeof mainImageIndex !== "number" ||
            mainImageIndex < 0 ||
            mainImageIndex >= images.length
        ) {

            mainImageIndex = 0;

        }


        /* -----------------------------------------
           PROJECT DATA
        ----------------------------------------- */

        const projectData = {

            title,

            description,

            category,

            subcategory,

            workType,

            location,

            area,

            year,

            status,

            featured,

            images,

            mainImageIndex

        };


        /* -----------------------------------------
           SAVE / UPDATE
        ----------------------------------------- */

        /* -----------------------------------------
   SAVE / UPDATE
----------------------------------------- */

const wasUpdatingProject =
    !!editingProjectId;


/* -----------------------------------------
   SAVE / UPDATE
----------------------------------------- */

if (editingProjectId) {

    await updateDoc(
        doc(
            db,
            "projects",
            editingProjectId
        ),
        projectData
    );

    /*
     * Firestore update completed successfully.
     * Show confirmation immediately.
     */
    progressFill.style.width =
        "100%";

    progressPercent.textContent =
        "100%";

    progressText.textContent =
        "Project Updated Successfully ✓";

    alert(
        "Project Updated Successfully ✓"
    );

}
else {

    await addDoc(
        collection(
            db,
            "projects"
        ),
        {
            ...projectData,
            createdAt:
                Timestamp.now()
        }
    );

    progressFill.style.width =
        "100%";

    progressPercent.textContent =
        "100%";

    progressText.textContent =
        "Project Saved Successfully ✓";

    alert(
        "Project Saved Successfully ✓"
    );

}


       /* -----------------------------------------
   REFRESH
----------------------------------------- */

await loadProjects();

await loadDashboardStats();


progressFill.style.width =
    "100%";

progressPercent.textContent =
    "100%";


// const successMessage =
//     wasUpdatingProject
//         ? "Project Updated Successfully ✓"
//         : "Project Saved Successfully ✓";


// progressText.textContent =
//     successMessage;


/*
 * Reset the editing state only AFTER
 * everything has been successfully updated.
 */

editingProjectId =
    null;

resetProjectForm();


document.querySelector(
    "#projectManagement h2"
).textContent =
    "Portfolio Management";


saveProjectBtn.disabled =
    false;

saveProjectBtn.textContent =
    "Save Project";


/*
 * Show a clear success message to the admin.
 */

// alert(
//     successMessage
// );


setTimeout(
    () => {

        progressFill.style.width =
            "0%";

        progressPercent.textContent =
            "0%";

        progressText.textContent =
            "Ready";

    },
    2500
);
    }

    catch(error) {

        console.error(
            "Save Project Error:",
            error
        );


        progressText.textContent =
            "Upload Failed";


        saveProjectBtn.disabled =
            false;


        saveProjectBtn.textContent =
            editingProjectId
                ? "Update Project"
                : "Save Project";


        alert(
            error.message
        );

    }

}
/* =========================================================
   EDIT PROJECTS — CATEGORY NAVIGATION
   ========================================================= */

let activeAdminProjectCategory = "Design + Build";


/* ---------------------------------------------------------
   GET MAIN PROJECT IMAGE
   --------------------------------------------------------- */

function getAdminProjectMainImage(project) {

    const images =
        Array.isArray(project?.images)
            ? project.images
            : [];


    if (!images.length) {
        return "";
    }


    const mainIndex =
        Number.isInteger(
            Number(project?.mainImageIndex)
        )
            ? Number(project.mainImageIndex)
            : 0;


    return (
        images[mainIndex]?.url ||
        images[0]?.url ||
        ""
    );
}


/* ---------------------------------------------------------
   ESCAPE ADMIN PROJECT TEXT
   --------------------------------------------------------- */

function escapeAdminProjectValue(value) {

    return String(value ?? "")
        .replace(/[&<>'"]/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        }[char]));

}


/* ---------------------------------------------------------
   RENDER EDIT PROJECTS
   --------------------------------------------------------- */

async function loadProjects() {

    const projectsList =
        document.getElementById(
            "projectsList"
        );


    if (!projectsList) {
        return;
    }


    projectsList.innerHTML = `
        <div class="admin-project-loading">
            Loading projects...
        </div>
    `;


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "projects"
                )
            );


        const projects =
            snapshot.docs.map(
                docItem => ({

                    id:
                        docItem.id,

                    ...docItem.data()

                })
            );


        const categories = [
            "Design + Build",
            "Interiors",
            "Elevation"
        ];


        /*
         * Count projects in each category.
         */

        const categoryCounts = {

            "Design + Build":
                projects.filter(
                    project =>
                        project.category ===
                        "Design + Build"
                ).length,

            "Interiors":
                projects.filter(
                    project =>
                        project.category ===
                        "Interiors"
                ).length,

            "Elevation":
                projects.filter(
                    project =>
                        project.category ===
                        "Elevation"
                ).length

        };


        /*
         * Keep the selected category valid.
         */

        if (
            !categories.includes(
                activeAdminProjectCategory
            )
        ) {

            activeAdminProjectCategory =
                "Design + Build";

        }


        /*
         * CATEGORY NAVIGATION
         */

        const tabsHtml = `
            <div class="admin-project-category-tabs">

                ${categories.map(category => `

                    <button
                        type="button"
                        class="
                            admin-project-category-tab
                            ${
                                activeAdminProjectCategory ===
                                category
                                    ? "active"
                                    : ""
                            }
                        "
                        data-admin-project-category="${escapeAdminProjectValue(
                            category
                        )}"
                    >

                        <span>
                            ${escapeAdminProjectValue(
                                category
                            ).toUpperCase()}
                        </span>

                        <strong>
                            (${categoryCounts[category]})
                        </strong>

                    </button>

                `).join("")}

            </div>
        `;


        /*
         * FILTER PROJECTS
         */

        const filteredProjects =
            projects
                .filter(
                    project =>
                        project.category ===
                        activeAdminProjectCategory
                )
                .sort(
                    (a, b) =>
                        String(
                            a.title || ""
                        ).localeCompare(
                            String(
                                b.title || ""
                            )
                        )
                );


        /*
         * PROJECT LIST
         */

        const projectsHtml =
            filteredProjects.length

                ? filteredProjects
                    .map(project => {

                        const thumbnail =
                            getAdminProjectMainImage(
                                project
                            );


                        const title =
                            escapeAdminProjectValue(
                                project.title ||
                                "Untitled Project"
                            );


                        const location =
                            escapeAdminProjectValue(
                                project.location ||
                                "Location not specified"
                            );


                        const subcategory =
                            escapeAdminProjectValue(
                                project.subcategory ||
                                ""
                            );


                        const workType =
                            escapeAdminProjectValue(
                                project.workType ||
                                ""
                            );


                        const featuredBadge =
                            project.featured === true
                                ? `
                                    <span class="admin-project-featured-badge">
                                        Featured
                                    </span>
                                `
                                : "";


                        return `

                            <article
                                class="admin-project-row"
                                data-admin-project-id="${escapeAdminProjectValue(
                                    project.id
                                )}"
                            >

                                <div class="admin-project-main">

                                    <div
                                        class="admin-project-thumbnail"
                                    >

                                        ${
                                            thumbnail
                                                ? `
                                                    <img
                                                        src="${escapeAdminProjectValue(
                                                            thumbnail
                                                        )}"
                                                        alt="${title}"
                                                        loading="lazy"
                                                        decoding="async"
                                                    >
                                                `
                                                : `
                                                    <div class="admin-project-no-image">
                                                        <i class="fa-solid fa-image"></i>
                                                    </div>
                                                `
                                        }

                                    </div>


                                    <div class="admin-project-details">

                                        <div class="admin-project-title-row">

                                            <h4>
                                                ${title}
                                            </h4>

                                            ${featuredBadge}

                                        </div>


                                        <p class="admin-project-location">

                                            <i class="fa-solid fa-location-dot"></i>

                                            ${location}

                                        </p>


                                        <div class="admin-project-meta">

                                            ${
                                                subcategory
                                                    ? `
                                                        <span>
                                                            ${subcategory}
                                                        </span>
                                                    `
                                                    : ""
                                            }

                                            ${
                                                workType
                                                    ? `
                                                        <span>
                                                            ${workType}
                                                        </span>
                                                    `
                                                    : ""
                                            }

                                        </div>

                                    </div>

                                </div>


                                <div class="admin-project-actions">

                                    <button
                                        type="button"
                                        class="edit-btn"
                                        onclick="editProject('${escapeAdminProjectValue(
                                            project.id
                                        )}')"
                                    >
                                        <i class="fa-solid fa-pen-to-square"></i>
                                        <span>Edit</span>
                                    </button>


                                    <button
                                        type="button"
                                        class="delete-btn admin-project-delete-btn"
                                        onclick="deleteProject('${escapeAdminProjectValue(
                                            project.id
                                        )}')"
                                    >
                                        <i class="fa-solid fa-trash"></i>
                                        <span>Delete</span>
                                    </button>

                                </div>

                            </article>

                        `;

                    })
                    .join("")

                : `

                    <div class="admin-project-empty">

                        <i class="fa-solid fa-folder-open"></i>

                        <h4>
                            No ${escapeAdminProjectValue(
                                activeAdminProjectCategory
                            )} Projects
                        </h4>

                        <p>
                            Projects added under this category
                            will appear here.
                        </p>

                    </div>

                `;


        projectsList.innerHTML = `
            ${tabsHtml}

            <div class="admin-project-category-content">

                ${projectsHtml}

            </div>
        `;


        /*
         * CATEGORY TAB EVENTS
         */

        projectsList
            .querySelectorAll(
                "[data-admin-project-category]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        activeAdminProjectCategory =
                            button.dataset
                                .adminProjectCategory;

                        loadProjects();

                    }
                );

            });


    } catch (error) {

        console.error(
            "Error loading projects:",
            error
        );


        projectsList.innerHTML = `

            <div class="admin-project-empty">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h4>
                    Unable to load projects
                </h4>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}

window.deleteProject=async function(id){
    if(!confirm("Delete this project?")) return;
    try{
        const projectRef=doc(db,"projects",id); const snapshot=await getDoc(projectRef);
        if(snapshot.exists()){
            const project=snapshot.data();
            for(const image of (project.images||[])) {
                if(image.path){
                    try{
                        await deleteObject(ref(storage,image.path));
                    }catch(e){
                        console.log("Image already missing:",image.path);
                    }
                }
                if(image.thumbnailPath){
                    try{
                        await deleteObject(ref(storage,image.thumbnailPath));
                    }catch(e){
                        console.log("Thumbnail already missing:",image.thumbnailPath);
                    }
                }
            }
        }
        await deleteDoc(projectRef); alert("Project Deleted Successfully"); await loadProjects(); await loadDashboardStats();
    }catch(error){console.error(error);alert(error.message);}
};

/* =========================================================
   EXISTING PROJECT IMAGE MANAGEMENT
   ========================================================= */

let editingProjectImages = [];
let editingMainImageIndex = 0;


/* ---------------------------------------------------------
   Render Existing Image Tags
   --------------------------------------------------------- */

function renderExistingPortfolioImages(
    projectId,
    images = [],
    mainImageIndex = 0
) {
    const container =
        document.getElementById("existingImages");

    if (!container) return;

    editingProjectImages = JSON.parse(
        JSON.stringify(images || [])
    );

    editingMainImageIndex =
        Number.isInteger(mainImageIndex)
            ? mainImageIndex
            : 0;

    if (!editingProjectImages.length) {
        container.innerHTML = `
            <div class="portfolio-empty-state">
                No existing images in this project.
            </div>
        `;
        return;
    }

    container.innerHTML =
        editingProjectImages
            .map((image, index) =>
                existingImageCard(
                    projectId,
                    image,
                    index
                )
            )
            .join("");
}


/* ---------------------------------------------------------
   Existing Image Card
   --------------------------------------------------------- */

function existingImageCard(
    projectId,
    image,
    index
) {
    const tags =
        Array.isArray(image.tags)
            ? image.tags
            : [];

    const mainChecked =
        editingMainImageIndex === index
            ? "checked"
            : "";

    const categoryTags = tags.length
        ? tags
            .map(tag => {

                const category =
                    normalizePortfolioValue(
                        tag.category
                    );

                if (!category) return "";

                return `
                    <div class="portfolio-category-tag">
                        <span>
                            ${prettyPortfolioTag(category)}
                        </span>

                        <button
                            type="button"
                            class="portfolio-remove-tag"
                            onclick="removeExistingCategory(${index}, '${escapeHtml(category)}')"
                            title="Remove category"
                        >
                            ×
                        </button>
                    </div>
                `;
            })
            .join("")
        : `
            <span class="portfolio-no-tags">
                No categories assigned
            </span>
        `;


    const subcategoryGroups = tags
        .filter(tag =>
            tag &&
            tag.category
        )
        .map(tag => {

            const category =
                normalizePortfolioValue(
                    tag.category
                );

            const subcategories =
                Array.isArray(
                    tag.subcategories
                )
                    ? tag.subcategories
                    : [];

            if (!subcategories.length) {
                return `
                    <div class="portfolio-subcategory-group">
                        <strong>
                            ${prettyPortfolioTag(category)}
                        </strong>

                        <span class="portfolio-no-tags">
                            No subcategories
                        </span>
                    </div>
                `;
            }

            return `
                <div
                    class="portfolio-subcategory-group"
                    data-category="${escapeHtml(category)}"
                >

                    <strong>
                        ${prettyPortfolioTag(category)}
                    </strong>

                    <div class="portfolio-subcategory-tags">

                        ${subcategories
                            .map(subcategory => `
                                <span class="portfolio-subcategory-tag">

                                    ${prettyPortfolioTag(
                                        subcategory
                                    )}

                                    <button
                                        type="button"
                                        class="portfolio-remove-tag"
                                        onclick="removeExistingSubcategory(
                                            ${index},
                                            '${escapeHtml(category)}',
                                            '${escapeHtml(subcategory)}'
                                        )"
                                        title="Remove subcategory"
                                    >
                                        ×
                                    </button>

                                </span>
                            `)
                            .join("")}

                    </div>
                </div>
            `;
        })
        .join("");


    const categoryOptions =
        portfolioCategories
            .map(category => `
                <option value="${escapeHtml(category)}">
                    ${prettyPortfolioTag(category)}
                </option>
            `)
            .join("");


    return `
        <div
            class="existing-image-card"
            data-image-index="${index}"
        >

            <!-- IMAGE -->
            <div class="portfolio-image-preview">

                <img
                    src="${escapeHtml(image.url || "")}"
                    alt="Project image ${index + 1}"
                >

                <div class="portfolio-image-number">
                    Image ${index + 1}
                </div>

            </div>


            <div class="existing-image-info">

                <!-- MAIN IMAGE -->
                <label class="portfolio-main-image-option">

                    <input
                        type="radio"
                        name="projectMainImage"
                        value="${index}"
                        ${mainChecked}
                        onchange="setExistingMainImage(${index})"
                    >

                    <span>
                        Use as Main Project Image
                    </span>

                </label>


                <!-- CATEGORIES -->
                <div class="portfolio-tag-section">

                    <h4>
                        Categories
                    </h4>

                    <div class="portfolio-category-tags">

                        ${categoryTags}

                    </div>


                    <div class="portfolio-add-tag-row">

    <select
    class="existing-category-select"
    id="existingCategory_${index}"
    multiple
>

    <option value="" disabled>
        Select categories
    </option>

    ${categoryOptions}

</select>

<button
    type="button"
    class="portfolio-add-category-btn"
    onclick="addExistingCategory(${index})"
>
    Add Selected
</button>

<button
    type="button"
    class="portfolio-create-tag-btn"
    onclick="createPortfolioCategoryForExisting(${index})"
>
    + New Category
</button>

</div>

                </div>


                <!-- SUBCATEGORIES -->
                <div class="portfolio-tag-section">

                    <h4>
                        Subcategories
                    </h4>

                    ${
                        subcategoryGroups ||
                        `
                        <span class="portfolio-no-tags">
                            Add a category first.
                        </span>
                        `
                    }


                    <div class="portfolio-add-tag-row">

                        <select
                            class="existing-subcategory-category"
                            id="existingSubcategoryCategory_${index}"
                        >

                            <option value="">
                                Select category
                            </option>

                            ${tags
                                .map(tag => normalizePortfolioValue(tag.category))
                                .filter(Boolean)
                                .map(category => `
                                    <option value="${escapeHtml(category)}">
                                        ${prettyPortfolioTag(category)}
                                    </option>
                                `)
                                .join("")}

                        </select>


                        <select
                            class="existing-subcategory-select"
                            id="existingSubcategory_${index}"
                        >

                            <option value="">
                                Select subcategory
                            </option>

                        </select>


                        <button
                            type="button"
                            class="portfolio-create-tag-btn"
                            onclick="addExistingSubcategory(${index})"
                        >
                            Add
                        </button>

                    </div>


                    <button
                        type="button"
                        class="portfolio-create-tag-btn"
                        onclick="createPortfolioSubcategoryForExisting(${index})"
                    >
                        + New Subcategory
                    </button>

                </div>


                <!-- ACTIONS -->
                <div class="image-actions">

                    <button
                        type="button"
                        class="replace-image-btn"
                        onclick="replaceImage('${projectId}', ${index})"
                    >
                        Replace
                    </button>

                    <button
                        type="button"
                        class="delete-image-btn"
                        onclick="deleteImage('${projectId}', ${index})"
                    >
                        Delete
                    </button>

                    <button
                        type="button"
                        class="save-image-meta-btn"
                        onclick="saveImageMeta('${projectId}', ${index})"
                    >
                        Save Tags
                    </button>

                </div>

            </div>

        </div>
    `;
}


/* ---------------------------------------------------------
   Main Image
   --------------------------------------------------------- */

window.setExistingMainImage =
function(index) {

    editingMainImageIndex =
        Number(index);

};


/* ---------------------------------------------------------
   Add Existing Category
   --------------------------------------------------------- */

window.addExistingCategory =
function(index) {

    const image =
        editingProjectImages[index];

    if (!image) return;


    const select =
        document.getElementById(
            `existingCategory_${index}`
        );

    if (!select) {
        return;
    }


    const categories =
        Array.from(
            select.selectedOptions || []
        )
            .map(
                option =>
                    normalizePortfolioValue(
                        option.value
                    )
            )
            .filter(Boolean);


    if (!categories.length) {

        alert(
            "Please select at least one category."
        );

        return;

    }


    if (!Array.isArray(image.tags)) {

        image.tags = [];

    }


    categories.forEach(
        category => {

            const exists =
                image.tags.some(
                    tag =>
                        normalizePortfolioValue(
                            tag.category
                        ) === category
                );


            if (exists) {
                return;
            }


            image.tags.push({

                category,

                subcategories: []

            });

        }
    );


    renderExistingPortfolioImages(
        editingProjectId,
        editingProjectImages,
        editingMainImageIndex
    );

};


/* ---------------------------------------------------------
   Remove Existing Category
   --------------------------------------------------------- */

window.removeExistingCategory =
function(index, category) {

    const image =
        editingProjectImages[index];

    if (!image) return;


    if (!Array.isArray(image.tags)) {
        image.tags = [];
    }


    image.tags =
        image.tags.filter(
            tag =>
                normalizePortfolioValue(
                    tag.category
                ) !== category
        );


    renderExistingPortfolioImages(
        editingProjectId,
        editingProjectImages,
        editingMainImageIndex
    );
};


/* ---------------------------------------------------------
   Add Existing Subcategory
   --------------------------------------------------------- */

window.addExistingSubcategory =
function(index) {

    const image =
        editingProjectImages[index];

    if (!image) return;


    const categorySelect =
        document.getElementById(
            `existingSubcategoryCategory_${index}`
        );

    const subcategorySelect =
        document.getElementById(
            `existingSubcategory_${index}`
        );


    const category =
        normalizePortfolioValue(
            categorySelect?.value
        );

    const subcategory =
        normalizePortfolioValue(
            subcategorySelect?.value
        );


    if (!category) {
        alert(
            "Please select a category."
        );
        return;
    }


    if (!subcategory) {
        alert(
            "Please select a subcategory."
        );
        return;
    }


    if (!Array.isArray(image.tags)) {
        image.tags = [];
    }


    let tag =
        image.tags.find(
            item =>
                normalizePortfolioValue(
                    item.category
                ) === category
        );


    if (!tag) {
        tag = {
            category,
            subcategories: []
        };

        image.tags.push(tag);
    }


    if (!Array.isArray(tag.subcategories)) {
        tag.subcategories = [];
    }


    if (
        tag.subcategories.includes(
            subcategory
        )
    ) {
        alert(
            "This subcategory is already assigned."
        );
        return;
    }


    tag.subcategories.push(
        subcategory
    );


    renderExistingPortfolioImages(
        editingProjectId,
        editingProjectImages,
        editingMainImageIndex
    );
};


/* ---------------------------------------------------------
   Remove Existing Subcategory
   --------------------------------------------------------- */

window.removeExistingSubcategory =
function(
    index,
    category,
    subcategory
) {

    const image =
        editingProjectImages[index];

    if (!image) return;


    const tag =
        (image.tags || []).find(
            item =>
                normalizePortfolioValue(
                    item.category
                ) === category
        );


    if (!tag) return;


    tag.subcategories =
        (tag.subcategories || [])
            .filter(
                value =>
                    normalizePortfolioValue(
                        value
                    ) !== subcategory
            );


    renderExistingPortfolioImages(
        editingProjectId,
        editingProjectImages,
        editingMainImageIndex
    );
};


/* ---------------------------------------------------------
   Create Category For Existing Image
   --------------------------------------------------------- */

window.createPortfolioCategoryForExisting =
async function(index) {

    const name =
        prompt(
            "Enter the new image category name:"
        );


    if (
        name === null
    ) {

        return;

    }


    const category =
        normalizePortfolioValue(
            name
        );


    if (!category) {

        alert(
            "Category name cannot be empty."
        );

        return;

    }


    /*
     * Existing category
     */

    if (
        portfolioCategories.includes(
            category
        )
    ) {

        /*
         * If it already exists,
         * assign it directly to the image.
         */

        addExistingCategoryDirect(
            index,
            category
        );

        return;

    }


    /*
     * Add to local taxonomy immediately.
     */

    portfolioCategories.push(
        category
    );


    /*
     * Initialize its subcategories.
     */

    if (
        !portfolioSubcategories[
            category
        ]
    ) {

        portfolioSubcategories[
            category
        ] = [];

    }


    /*
     * Immediately assign it to
     * the current image.
     */

    addExistingCategoryDirect(
        index,
        category
    );


    /*
     * Persist taxonomy.
     */

    try {

        await savePortfolioTaxonomy();

    } catch (error) {

        console.error(
            "Failed to save new portfolio category:",
            error
        );

        alert(
            `The category "${prettyPortfolioTag(
                category
            )}" was added to this image, but could not be saved to the global category list.`
        );

    }

};


/* ---------------------------------------------------------
   Add Category Directly
   --------------------------------------------------------- */

window.addExistingCategoryDirect =
function(
    index,
    category
) {

    const image =
        editingProjectImages[index];

    if (!image) return;


    if (!Array.isArray(image.tags)) {
        image.tags = [];
    }


    if (
        image.tags.some(
            tag =>
                normalizePortfolioValue(
                    tag.category
                ) === category
        )
    ) {
        return;
    }


    image.tags.push({
        category,
        subcategories: []
    });


    renderExistingPortfolioImages(
        editingProjectId,
        editingProjectImages,
        editingMainImageIndex
    );
}


/* ---------------------------------------------------------
   Create Subcategory For Existing Image
   --------------------------------------------------------- */

/* ---------------------------------------------------------
   Create Subcategory For Existing Image
   --------------------------------------------------------- */

window.createPortfolioSubcategoryForExisting =
async function(index) {

    const image =
        editingProjectImages[index];

    if (!image) {
        return;
    }


    /*
     * -----------------------------------------------------
     * 1. GET THE CURRENTLY SELECTED CATEGORY
     * -----------------------------------------------------
     *
     * If the admin has already selected a category
     * from the dropdown, use it directly.
     *
     * Example:
     *
     *     [Lobby ▼]
     *
     * Clicking "+ New Subcategory" will immediately
     * ask only for the new subcategory name.
     */

    const categorySelect =
        document.getElementById(
            `existingSubcategoryCategory_${index}`
        );


    let category =
        normalizePortfolioValue(
            categorySelect?.value
        );


    /*
     * -----------------------------------------------------
     * 2. NO CATEGORY SELECTED
     * -----------------------------------------------------
     *
     * If the dropdown is still:
     *
     *     Select category
     *
     * then ask which global category the new
     * subcategory belongs to.
     */

    if (!category) {

        if (
            !portfolioCategories.length
        ) {

            alert(
                "Create a category first."
            );

            return;

        }


        const categoryText =
            prompt(

                "Enter the category this subcategory belongs to:\n\n" +

                portfolioCategories
                    .map(
                        item =>
                            prettyPortfolioTag(
                                item
                            )
                    )
                    .join(", ")

            );


        if (
            categoryText === null
        ) {

            return;

        }


        category =
            normalizePortfolioValue(
                categoryText
            );


        /*
         * The entered category must exist
         * in the global category list.
         */

        if (
            !portfolioCategories.includes(
                category
            )
        ) {

            alert(
                "That category does not exist."
            );

            return;

        }

    }


    /*
     * -----------------------------------------------------
     * 3. CATEGORY MUST EXIST GLOBALLY
     * -----------------------------------------------------
     */

    if (
        !portfolioCategories.includes(
            category
        )
    ) {

        alert(
            "That category does not exist."
        );

        return;

    }


    /*
     * -----------------------------------------------------
     * 4. ASK ONLY FOR SUBCATEGORY NAME
     * -----------------------------------------------------
     *
     * If Lobby was already selected:
     *
     *     Enter a new subcategory for Lobby:
     *
     * No second category question.
     */

    const subcategoryName =
        prompt(
            `Enter a new subcategory for ${prettyPortfolioTag(category)}:`
        );


    if (
        subcategoryName === null
    ) {

        return;

    }


    const subcategory =
        normalizePortfolioValue(
            subcategoryName
        );


    if (!subcategory) {

        alert(
            "Subcategory name cannot be empty."
        );

        return;

    }


    /*
     * -----------------------------------------------------
     * 5. INITIALIZE CATEGORY'S GLOBAL
     *    SUBCATEGORY LIST IF NECESSARY
     * -----------------------------------------------------
     */

    if (
        !Array.isArray(
            portfolioSubcategories[
                category
            ]
        )
    ) {

        portfolioSubcategories[
            category
        ] = [];

    }


    /*
     * -----------------------------------------------------
     * 6. CHECK FOR DUPLICATE
     * -----------------------------------------------------
     */

    if (
        portfolioSubcategories[
            category
        ].includes(
            subcategory
        )
    ) {

        alert(
            "This subcategory already exists for this category."
        );

        return;

    }


    /*
     * -----------------------------------------------------
     * 7. ADD TO GLOBAL TAXONOMY
     * -----------------------------------------------------
     *
     * This makes the new subcategory available
     * for future projects/images as well.
     */

    portfolioSubcategories[
        category
    ].push(
        subcategory
    );


    /*
     * -----------------------------------------------------
     * 8. SAVE GLOBAL TAXONOMY
     * -----------------------------------------------------
     */

    try {

        await savePortfolioTaxonomy();

    }

    catch (error) {

        console.error(
            "Failed to save new portfolio subcategory:",
            error
        );


        /*
         * Roll back the local taxonomy change
         * if Firestore save fails.
         */

        portfolioSubcategories[
            category
        ] =
            portfolioSubcategories[
                category
            ].filter(
                value =>
                    value !==
                    subcategory
            );


        alert(
            "The new subcategory could not be saved. Please check your connection or permissions."
        );

        return;

    }


    /*
     * -----------------------------------------------------
     * 9. FIND / CREATE THE IMAGE CATEGORY TAG
     * -----------------------------------------------------
     *
     * The image must have the parent category
     * before the subcategory is attached.
     */

    if (
        !Array.isArray(
            image.tags
        )
    ) {

        image.tags = [];

    }


    let imageCategory =
        image.tags.find(
            tag =>
                normalizePortfolioValue(
                    tag?.category
                ) === category
        );


    /*
     * If the category is not yet assigned
     * to this image, create the image tag.
     */

    if (!imageCategory) {

        imageCategory = {

            category,

            subcategories: []

        };


        image.tags.push(
            imageCategory
        );

    }


    /*
     * Make sure subcategories is an array.
     */

    if (
        !Array.isArray(
            imageCategory.subcategories
        )
    ) {

        imageCategory.subcategories =
            [];

    }


    /*
     * Add the newly-created subcategory
     * to this image.
     */

    if (
        !imageCategory.subcategories.includes(
            subcategory
        )
    ) {

        imageCategory.subcategories.push(
            subcategory
        );

    }


    /*
     * -----------------------------------------------------
     * 10. REFRESH EXISTING PROJECT UI
     * -----------------------------------------------------
     */

    renderExistingPortfolioImages(
        editingProjectId,
        editingProjectImages,
        editingMainImageIndex
    );

};


/* ---------------------------------------------------------
   Dynamic Existing Subcategory Dropdown
   --------------------------------------------------------- */

document.addEventListener(
    "change",
    event => {

        const select =
            event.target.closest(
                ".existing-subcategory-category"
            );

        if (!select) return;


        const index =
            Number(
                select.id.replace(
                    "existingSubcategoryCategory_",
                    ""
                )
            );


        const target =
            document.getElementById(
                `existingSubcategory_${index}`
            );

        if (!target) return;


        const category =
            normalizePortfolioValue(
                select.value
            );


        const options =
            portfolioSubcategories[
                category
            ] || [];


        target.innerHTML = `
            <option value="">
                Select subcategory
            </option>

            ${
                options
                    .map(value => `
                        <option value="${escapeHtml(value)}">
                            ${prettyPortfolioTag(value)}
                        </option>
                    `)
                    .join("")
            }
        `;
    }
);


/* ---------------------------------------------------------
   Save Existing Image Tags
   --------------------------------------------------------- */

window.saveImageMeta =
async function(
    projectId,
    index
) {

    try {

        const projectRef =
            doc(
                db,
                "projects",
                projectId
            );


        const snapshot =
            await getDoc(
                projectRef
            );


        if (!snapshot.exists()) {
            alert(
                "Project no longer exists."
            );
            return;
        }


        const images =
            JSON.parse(
                JSON.stringify(
                    editingProjectImages
                )
            );


        const image =
            images[index];


        if (!image) {
            alert(
                "Image not found."
            );
            return;
        }


        image.tags =
            Array.isArray(image.tags)
                ? image.tags
                : [];


        await updateDoc(
            projectRef,
            {
                images,
                mainImageIndex:
                    editingMainImageIndex
            }
        );


        editingProjectImages =
            images;


        alert(
            "Image tags saved successfully."
        );


    } catch(error) {

        console.error(error);

        alert(
            error.message
        );

    }
};


/* ---------------------------------------------------------
   Edit Project
   --------------------------------------------------------- */

window.editProject =
async function(id) {

    document
        .querySelector(
            "#projectManagement h2"
        )
        .textContent =
            "Editing Project";


    const snapshot =
        await getDoc(
            doc(
                db,
                "projects",
                id
            )
        );


    if (!snapshot.exists()) {
        alert(
            "Project not found."
        );
        return;
    }


    const project =
        snapshot.data();


    editingProjectId =
        id;


    /* PROJECT FIELDS — UNCHANGED */

    document.getElementById(
        "projectTitle"
    ).value =
        project.title || "";


    document.getElementById(
        "projectDescription"
    ).value =
        project.description || "";


    document.getElementById(
        "projectCategory"
    ).value =
        project.category || "";


    document.getElementById(
        "projectSubcategory"
    ).value =
        project.subcategory || "";


    document.getElementById(
        "projectWorkType"
    ).value =
        project.workType || "";


    document.getElementById(
        "projectLocation"
    ).value =
        project.location || "";


    document.getElementById(
        "projectArea"
    ).value =
        project.area || "";


    document.getElementById(
        "projectYear"
    ).value =
        project.year || "";


    document.getElementById(
        "projectStatus"
    ).value =
        project.status || "";


    setFeaturedValue(
        project.featured === true
    );


    /* CLEAR NEWLY SELECTED IMAGES */

    newPortfolioImages = [];


    if (portfolioImageEditor) {
        portfolioImageEditor.innerHTML =
            "";
    }


    if (selectedImageCount) {
        selectedImageCount.textContent =
            "0 / 6 images selected";
    }


    /* LOAD EXISTING IMAGES */

    renderExistingPortfolioImages(
        id,
        project.images || [],
        project.mainImageIndex || 0
    );


    saveProjectBtn.textContent =
        "Update Project";


    document
        .getElementById(
            "projectManagement"
        )
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

};


/* ---------------------------------------------------------
   Delete Existing Image
   --------------------------------------------------------- */

window.deleteImage =
async function(
    projectId,
    imageIndex
) {

    if (
        !confirm(
            "Delete this image permanently?"
        )
    ) {
        return;
    }


    try {

        const projectRef =
            doc(
                db,
                "projects",
                projectId
            );


        const snapshot =
            await getDoc(
                projectRef
            );


        if (!snapshot.exists()) {
            alert(
                "Project not found."
            );
            return;
        }


        const project =
            snapshot.data();


        const images =
            Array.isArray(project.images)
                ? [...project.images]
                : [];


        const image =
            images[imageIndex];


        if (!image) {
            alert(
                "Image not found."
            );
            return;
        }


        /* DELETE STORAGE FILE */

        if (image.path) {

            try {

                await deleteObject(
                    ref(
                        storage,
                        image.path
                    )
                );

            } catch(error) {

                console.log(
                    "Old image not found in Storage."
                );

            }

        }


        if (image.thumbnailPath) {

            try {

                await deleteObject(
                    ref(
                        storage,
                        image.thumbnailPath
                    )
                );

            } catch(error) {

                console.log(
                    "Old thumbnail not found in Storage."
                );

            }

        }


        images.splice(
            imageIndex,
            1
        );


        let newMainIndex =
            Number(
                project.mainImageIndex || 0
            );


        if (!images.length) {

            newMainIndex = 0;

        } else if (
            imageIndex <
            newMainIndex
        ) {

            newMainIndex--;

        } else if (
            imageIndex ===
            newMainIndex
        ) {

            newMainIndex =
                Math.min(
                    newMainIndex,
                    images.length - 1
                );

        }


        await updateDoc(
            projectRef,
            {
                images,
                mainImageIndex:
                    newMainIndex
            }
        );


        editingProjectImages =
            images;


        editingMainImageIndex =
            newMainIndex;


        await editProject(
            projectId
        );


    } catch(error) {

        console.error(error);

        alert(
            error.message
        );

    }
};


/* ---------------------------------------------------------
   Replace Existing Image
   --------------------------------------------------------- */

window.replaceImage =
async function(
    projectId,
    imageIndex
) {

    const picker =
        document.getElementById(
            "replaceImageInput"
        );


    if (!picker) {
        alert(
            "Replacement image picker not found."
        );
        return;
    }


    picker.value = "";


    picker.onchange =
        async event => {

            const file =
                event.target.files[0];


            if (!file) return;


            try {

                const projectRef =
                    doc(
                        db,
                        "projects",
                        projectId
                    );


                const snapshot =
                    await getDoc(
                        projectRef
                    );


                if (!snapshot.exists()) {
                    throw new Error(
                        "Project not found."
                    );
                }


                const project =
                    snapshot.data();


                const images =
                    Array.isArray(
                        project.images
                    )
                        ? [
                            ...project.images
                        ]
                        : [];


                const oldImage =
                    images[imageIndex];


                if (!oldImage) {
                    throw new Error(
                        "Image not found."
                    );
                }


                progressFill.style.width =
                    "0%";

                progressPercent.textContent =
                    "0%";

                progressText.textContent =
                    "Optimizing replacement image...";


                const processedImages =
                    await preparePortfolioImage(
                        file
                    );


                progressText.textContent =
                    "Starting replacement upload...";


                const uploadedFull =
                    await uploadPortfolioVariant(
                        processedImages.full.blob,
                        processedImages.full.fileName,
                        0,
                        75,
                        progressFill,
                        progressPercent,
                        progressText,
                        "Replacing main image..."
                    );


                const uploadedThumbnail =
                    await uploadPortfolioVariant(
                        processedImages.thumbnail.blob,
                        processedImages.thumbnail.fileName,
                        75,
                        100,
                        progressFill,
                        progressPercent,
                        progressText,
                        "Replacing thumbnail..."
                    );


                /* DELETE OLD STORAGE FILE */

                if (oldImage.path) {

                    try {

                        await deleteObject(
                            ref(
                                storage,
                                oldImage.path
                            )
                        );

                    } catch(error) {

                        console.log(
                            "Old image already missing."
                        );

                    }

                }


                if (oldImage.thumbnailPath) {

                    try {

                        await deleteObject(
                            ref(
                                storage,
                                oldImage.thumbnailPath
                            )
                        );

                    } catch(error) {

                        console.log(
                            "Old thumbnail already missing."
                        );

                    }

                }


                /*
                 * IMPORTANT:
                 * Keep the existing tags when
                 * replacing the physical image.
                 */

                images[imageIndex] = {
                    ...oldImage,
                    url:
                        uploadedFull.url,
                    path:
                        uploadedFull.path,
                    thumbnailUrl:
                        uploadedThumbnail.url,
                    thumbnailPath:
                        uploadedThumbnail.path,
                    tags:
                        Array.isArray(
                            oldImage.tags
                        )
                            ? oldImage.tags
                            : []
                };


                await updateDoc(
                    projectRef,
                    {
                        images
                    }
                );


                editingProjectImages =
                    images;


                progressFill.style.width =
                    "100%";

                progressPercent.textContent =
                    "100%";

                progressText.textContent =
                    "Image Replaced Successfully ✓";


                await editProject(
                    projectId
                );


                alert(
                    "Image Replaced Successfully."
                );


            } catch(error) {

                console.error(error);

                progressText.textContent =
                    "Replacement Failed";

                alert(
                    error.message
                );

            }

        };


    picker.click();

};

loadProjects();
async function loadDashboardStats() {

    try {

        const projectsSnapshot =
        await getDocs(

            collection(
                db,
                "projects"
            )

        );
        const leadsSnapshot =
await getDocs(

    collection(
        db,
        "leads"
    )

);

document.getElementById(
    "totalLeads"
).textContent =
leadsSnapshot.size;
        let totalProjects = 0;

        let totalImages = 0;

        let completed = 0;

        let ongoing = 0;

        projectsSnapshot.forEach(
            docItem => {

                totalProjects++;

                const project =
                docItem.data();

                totalImages +=
                project.images?.length || 0;

                if (
                    project.status
                        ?.toLowerCase()
                        .includes(
                            "completed"
                        )
                ) {

                    completed++;

                }
                else {

                    ongoing++;

                }

            }
        );
        
        document.getElementById(
            "totalProjects"
        ).textContent =
        totalProjects;

        document.getElementById(
            "totalImages"
        ).textContent =
        totalImages;

        document.getElementById(
            "completedProjects"
        ).textContent =
        completed;

        document.getElementById(
            "ongoingProjects"
        ).textContent =
        ongoing;

        const offerSnapshot =
        await getDoc(
            offerRef
        );

        if (
            offerSnapshot.exists()
        ) {

            document.getElementById(
                "offerStatus"
            ).textContent =

            offerSnapshot.data()
            .enabled

            ? "ACTIVE"

            : "OFF";

        }

    }

    catch(error) {

        console.error(
            error
        );

    }

}
document
.getElementById(
    "leadSearch"
)
?.addEventListener(
    "keyup",
    function() {

        const value =
        this.value.toLowerCase();

        const rows =
        document.querySelectorAll(
            "#leadsTableBody tr"
        );

        rows.forEach(row => {

            row.style.display =

            row.innerText
                .toLowerCase()
                .includes(value)

            ? ""

            : "none";

        });

    }
);
async function exportLeadsCSV() {

    const snapshot =
    await getDocs(

        collection(
            db,
            "leads"
        )

    );

    let csv =

`Name,Phone,Email,City,Service,Project Brief,Status,Notes,Source,Date\n`;

    snapshot.forEach(docItem => {

        const lead =
        docItem.data();

        const date =

        lead.createdAt

        ? lead.createdAt
            .toDate()
            .toLocaleString()

        : "";

        const clean = (value) =>

String(value || "")

.replace(/\n/g, " ")

.replace(/\r/g, " ")

.replace(/"/g, '""');

csv +=

`"${clean(lead.name)}",` +

`"${clean(lead.phone)}",` +

`"${clean(lead.email)}",` +

`"${clean(lead.city)}",` +

`"${clean(lead.service)}",` +

`"${clean(lead.projectBrief)}",` +

`"${clean(lead.status)}",` +

`"${clean(lead.notes)}",` +

`"${clean(lead.source)}",` +

`"${clean(date)}"\n`;

    });

    const blob =
    new Blob(

        [csv],

        {
            type:
            "text/csv;charset=utf-8;"
        }

    );

    const link =
    document.createElement(
        "a"
    );

    const url =
    URL.createObjectURL(
        blob
    );

    link.href =
    url;

    link.download =

`leads-${new Date()
.toISOString()
.slice(0,10)}.csv`;

    document.body.appendChild(
        link
    );

    link.click();

    document.body.removeChild(
        link
    );

}
document
.getElementById(
    "exportLeadsBtn"
)
?.addEventListener(
    "click",
    exportLeadsCSV
);

async function syncAllLeadsToSheets() {

    const syncButton =
        document.getElementById(
            "syncSheetsBtn"
        );

    try {

        /*
         * Disable button
         */

        if (syncButton) {

            syncButton.disabled = true;

            syncButton.textContent =
                "Syncing...";

        }


        /*
         * Get ALL leads from Firestore
         */

        const snapshot =
            await getDocs(

                collection(
                    db,
                    "leads"
                )

            );


        /*
         * Prepare leads array
         */

        const leads = [];


        snapshot.forEach(
            docItem => {

                const lead =
                    docItem.data();


                /*
                 * Convert Firestore timestamp
                 */

                let createdAt = "";


                if (
                    lead.createdAt &&
                    typeof lead.createdAt.toDate ===
                    "function"
                ) {

                    createdAt =
                        lead.createdAt
                            .toDate()
                            .toLocaleString();

                }

                else if (
                    lead.createdAt
                ) {

                    createdAt =
                        String(
                            lead.createdAt
                        );

                }


                /*
                 * Include Firestore
                 * document ID
                 */

                leads.push({

                    id:
                        docItem.id,

                    name:
                        lead.name || "",

                    phone:
                        lead.phone || "",

                    email:
                        lead.email || "",

                    city:
                        lead.city || "",

                    service:
                        lead.service || "",

                    projectBrief:
                        lead.projectBrief || "",

                    status:
                        lead.status || "",

                    notes:
                        lead.notes || "",

                    source:
                        lead.source || "",

                    createdAt

                });

            }
        );


        /*
         * Send ALL leads in ONE request
         */

        const response =
            await fetch(

                "https://script.google.com/macros/s/AKfycbw-sTFHcpa_iB8srCkNiY01MjvpnwTe1Qzqn126YSSgNVUHbFNNtJGe7cP6ArXA3WAQ/exec",

                {

                    method: "POST",

                    body:
                        JSON.stringify({

                            leads

                        })

                }

            );


        /*
         * Read Apps Script response
         */

        const result =
            await response.text();


        console.log(
            "Google Sheets Sync Result:",
            result
        );


        /*
         * Parse response
         */

        let syncResult;


        try {

            syncResult =
                JSON.parse(result);

        }

        catch {

            syncResult = null;

        }


        if (
            syncResult &&
            syncResult.success
        ) {

           alert(
    "Google Sheets Sync Result:\n\n" +

    "Added: " +
    syncResult.added +

    "\nUpdated: " +
    syncResult.updated +

    "\nUnchanged: " +
    syncResult.unchanged +

    "\nDeleted: " +
    syncResult.deleted
);

        }

        else {

            alert(
                "Google Sheets Sync Completed"
            );

        }

    }


    catch(error) {

        console.error(
            "Google Sheets Sync Error:",
            error
        );

        alert(
            "Google Sheets Sync Failed:\n\n" +
            error.message
        );

    }


    finally {

        /*
         * Enable button again
         */

        if (syncButton) {

            syncButton.disabled =
                false;

            syncButton.textContent =
                "Sync To Google Sheets";

        }

    }

}
document
.getElementById(
    "syncSheetsBtn"
)
?.addEventListener(
    "click",
    syncAllLeadsToSheets
);
// loadLeads();

// loadProjects();

// loadDashboardStats();
// loadLeadAnalytics();

/* =========================================================
   ADMIN SECTION NAVIGATION - ACTIVE TAB
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const sectionNavLinks =
        document.querySelectorAll(".admin-section-nav a");

    const sectionIds = [
        "leadsSection",
        "offerManagement",
        "projectManagement",
        "viewProjects"
    ];

    const sections = sectionIds
        .map(id => document.getElementById(id))
        .filter(section => section);


    if (!sectionNavLinks.length || !sections.length) {
        return;
    }


    /* ---------------------------------------------------------
       SET ACTIVE TAB
    --------------------------------------------------------- */

    function setActiveSection(id) {

        sectionNavLinks.forEach(link => {

            const targetId =
                link.getAttribute("href").replace("#", "");

            link.classList.toggle(
                "active",
                targetId === id
            );

        });

    }


    /* ---------------------------------------------------------
       OBSERVE SECTIONS WHILE SCROLLING
    --------------------------------------------------------- */

    const sectionObserver =
        new IntersectionObserver(
            (entries) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        setActiveSection(
                            entry.target.id
                        );

                    }

                });

            },
            {
                root: null,

                /*
                 * The sticky account bar + navigation
                 * occupy the top part of the screen.
                 */
                rootMargin:
                    "-150px 0px -55% 0px",

                threshold: 0
            }
        );


    /* ---------------------------------------------------------
       START OBSERVING
    --------------------------------------------------------- */

    sections.forEach(section => {

        sectionObserver.observe(section);

    });


    /* ---------------------------------------------------------
       DEFAULT ACTIVE TAB
    --------------------------------------------------------- */

    setActiveSection("leadsSection");

});

/* =========================================================
   PORTFOLIO TAXONOMY INITIALIZATION
========================================================= */

loadPortfolioTaxonomy()
    .then(() => {

        /*
         * Create the manager and attach the
         * Manage Categories button listener.
         */
        setupPortfolioTaxonomyManager();

        console.log(
            "Portfolio taxonomy manager initialized successfully."
        );

    })
    .catch(error => {

        console.error(
            "Portfolio taxonomy initialization failed:",
            error
        );

    });