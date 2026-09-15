import { db } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const PAGE_SIZE = 20;

const INDIVIDUAL_SUBCATEGORIES = [
    "All Rooms",
    "Bedroom TV Unit",
    "Bedroom",
    "Ceiling",
    "Corridor",
    "Lounge",
    "Reception",
    "DP Shop",
    "Drawing",
    "Wardrobe",
    "Kitchen",
    "Living",
    "Living-Dining",
    "Living-Pooja",
    "Living-TV Unit",
    "Living-Vanity",
    "Living Room",
    "Main Door",
    "Office",
    "Office Ceiling",
    "Office Chair",
    "Office Toilet",
    "Porch Ceiling",
    "Temple",
    "Bathroom",
    "TV Unit",
    "Lift Lobby",
    "PG Room",
    "Double Height Living",
    "Living Ceiling",
    "Reception Pooja",
    "Staircase"
];

let allProjects = [];
let currentProject = null;
let currentImageIndex = 0;
let currentViewerImages = [];
let currentViewerContext = 0;
let currentPage = 1;


/* =========================================================
   HELPERS
   ========================================================= */

function $(selector) {
    return document.querySelector(selector);
}

function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
}

function esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[char]));
}

function getPortfolioGrid() {
    return (
        document.getElementById("portfolioMainGrid") ||
        document.getElementById("portfolioGrid")
    );
}

function isPortfolioPage() {
    return !!document.getElementById("portfolioMainGrid");
}


/* =========================================================
   CATEGORY DISPLAY
   ========================================================= */

function displayCategory(project) {

    const category = project?.category || "";

    const map = {
        "Interiors": "Interior Design",
        "Design + Build": "Design + Build",
        "Elevation": "Elevation",
        "Individual": "Individual Decor"
    };

    return map[category] || category;
}


/* =========================================================
   PROJECT CARD
   ========================================================= */

function projectCard(project, image = null) {

    const images = Array.isArray(project?.images)
        ? project.images
        : [];

    const selectedImage = image || images[0];

    if (!selectedImage?.url) {
        return "";
    }

    const imageIndex = image
        ? images.indexOf(image)
        : 0;

    const categoryLine = [
        displayCategory(project),
        project.subcategory
    ]
        .filter(Boolean)
        .map(esc)
        .join(' <span class="project-dot">·</span> ');

    const title = esc(
        project.title || "Untitled Project"
    );

    const location = project.location
        ? esc(project.location)
        : "";

    return `
        <article
            class="portfolio-card"
            tabindex="0"
            role="button"
            data-project-id="${esc(project.id)}"
            data-image-index="${imageIndex >= 0 ? imageIndex : 0}"
        >

            <div class="portfolio-image-wrap">

                <img
                    src="${esc(selectedImage.url)}"
                    alt="${title}"
                    loading="lazy"
                    decoding="async"
                >

            </div>

            <div class="portfolio-card-info">

                <h3>
                    ${title}
                </h3>

                ${
                    categoryLine
                        ? `
                            <p class="project-card-category">
                                ${categoryLine}
                            </p>
                        `
                        : ""
                }

                ${
                    location
                        ? `
                            <p class="project-card-location">
                                ${location}
                            </p>
                        `
                        : ""
                }

            </div>

        </article>
    `;
}


/* =========================================================
   SKELETON
   ========================================================= */

function showSkeleton() {

    const grid = getPortfolioGrid();

    if (!grid) {
        return;
    }

    grid.innerHTML = Array.from(
        {
            length: isPortfolioPage() ? 8 : 6
        },
        () => `
            <div class="portfolio-skeleton"></div>
        `
    ).join("");
}


/* =========================================================
   FILTER PROJECTS
   ========================================================= */

function getProjectsForMainTab() {

    const activeTab =
        $(".portfolio-main-tabs .active")?.dataset.tab ||
        "all";


    /* -----------------------------------------
       INDIVIDUAL DECOR
       ----------------------------------------- */

    if (activeTab === "individual") {

        const activeSubcategory =
            $(".individual-subtabs .active")
                ?.dataset.subcategory ||
            "all";

        const items = [];

        allProjects.forEach(project => {

            const images = Array.isArray(project.images)
                ? project.images
                : [];

            images.forEach(image => {

                if (
                    !INDIVIDUAL_SUBCATEGORIES.includes(
                        image?.subcategory
                    )
                ) {
                    return;
                }

                if (
                    activeSubcategory !== "all" &&
                    image.subcategory !== activeSubcategory
                ) {
                    return;
                }

                items.push({
                    project,
                    image
                });

            });

        });

        return items;
    }


    /* -----------------------------------------
       ALL PROJECTS
       ----------------------------------------- */

    if (activeTab === "all") {
        return allProjects;
    }


    /* -----------------------------------------
       CATEGORY
       ----------------------------------------- */

    return allProjects.filter(project => {

        return String(project.category || "")
            .toLowerCase() ===
            String(activeTab || "")
                .toLowerCase();

    });
}


/* =========================================================
   FEATURED PROJECTS
   ========================================================= */

function renderFeatured() {

    const grid = getPortfolioGrid();

    if (!grid) {
        return;
    }

    const featured = allProjects
        .filter(project => project.featured === true)
        .slice(0, 6);

    grid.innerHTML = featured.length

        ? featured
            .map(project => projectCard(project))
            .join("")

        : `
            <p class="portfolio-empty">
                No featured projects available.
            </p>
        `;
}


/* =========================================================
   PORTFOLIO MAIN GRID
   ========================================================= */

function renderPortfolioMain() {

    const grid = getPortfolioGrid();

    if (!grid) {
        return;
    }

    const projects = getProjectsForMainTab();

    const totalPages = Math.max(
        1,
        Math.ceil(projects.length / PAGE_SIZE)
    );

    currentPage = Math.min(
        Math.max(1, currentPage),
        totalPages
    );

    const start =
        (currentPage - 1) * PAGE_SIZE;

    const visibleItems =
        projects.slice(
            start,
            start + PAGE_SIZE
        );

    grid.innerHTML = visibleItems
        .map(item => {

            if (item.image) {
                return projectCard(
                    item.project,
                    item.image
                );
            }

            return projectCard(item);

        })
        .join("")

        || `
            <p class="portfolio-empty">
                No projects available.
            </p>
        `;

    renderPagination(totalPages);
}


/* =========================================================
   PAGINATION
   ========================================================= */

function renderPagination(totalPages) {

    const pagination =
        document.getElementById(
            "portfolioPagination"
        );

    if (!pagination) {
        return;
    }

    if (totalPages <= 1) {

        pagination.innerHTML = "";

        return;
    }

    let html = `
        <button
            type="button"
            data-page="prev"
            ${currentPage === 1 ? "disabled" : ""}
            aria-label="Previous page"
        >
            ‹
        </button>
    `;


    for (
        let page = 1;
        page <= totalPages;
        page++
    ) {

        html += `
            <button
                type="button"
                class="${
                    page === currentPage
                        ? "active"
                        : ""
                }"
                data-page="${page}"
            >
                ${page}
            </button>
        `;

    }


    html += `
        <button
            type="button"
            data-page="next"
            ${
                currentPage === totalPages
                    ? "disabled"
                    : ""
            }
            aria-label="Next page"
        >
            ›
        </button>
    `;

    pagination.innerHTML = html;


    pagination
        .querySelectorAll(
            "button:not(:disabled)"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const value =
                        button.dataset.page;

                    if (value === "prev") {

                        currentPage--;

                    } else if (
                        value === "next"
                    ) {

                        currentPage++;

                    } else {

                        currentPage =
                            Number(value);

                    }

                    renderPortfolioMain();


                    const section =
                        getPortfolioGrid()
                            ?.closest("section");

                    if (section) {

                        window.scrollTo({
                            top:
                                section.offsetTop,
                            behavior:
                                "smooth"
                        });

                    }

                }
            );

        });
}


/* =========================================================
   PORTFOLIO TABS
   ========================================================= */

function setupTabs() {

    $all(
        ".portfolio-main-tabs button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                $all(
                    ".portfolio-main-tabs button"
                ).forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });

                button.classList.add(
                    "active"
                );


                const subcategoryWrap =
                    document.getElementById(
                        "individualSubtabsWrap"
                    );

                if (subcategoryWrap) {

                    subcategoryWrap.hidden =
                        button.dataset.tab !==
                        "individual";

                }


                currentPage = 1;

                renderPortfolioMain();

            }
        );

    });


    $all(
        ".individual-subtabs button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                $all(
                    ".individual-subtabs button"
                ).forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });

                button.classList.add(
                    "active"
                );

                currentPage = 1;

                renderPortfolioMain();

            }
        );

    });
}


/* =========================================================
   VIEWER IMAGE SETS
   ========================================================= */

function viewerSets(project) {

    const images = Array.isArray(project?.images)
        ? project.images
        : [];

    const category =
        project?.category || "";


    /* -----------------------------------------
       DESIGN + BUILD
       ----------------------------------------- */

    if (category === "Design + Build") {

        return {

            tabs: [
                "3D Render",
                "Site Photos"
            ],

            sets: [

                images.filter(
                    image =>
                        image?.category ===
                            "Design + Build" &&
                        image?.subcategory ===
                            "3D Render"
                ),

                images.filter(
                    image =>
                        image?.category ===
                            "Design + Build" &&
                        image?.subcategory ===
                            "Site Photos"
                )

            ]

        };
    }


    /* -----------------------------------------
       INTERIORS
       ----------------------------------------- */

    if (category === "Interiors") {

        return {

            tabs: [
                "All Photos"
            ],

            sets: [

                images.filter(
                    image =>
                        image?.category ===
                        "Interiors"
                )

            ]

        };
    }


    /* -----------------------------------------
       ELEVATION
       ----------------------------------------- */

    if (category === "Elevation") {

        return {

            tabs: [
                "All Photos"
            ],

            sets: [

                images.filter(
                    image =>
                        image?.category ===
                        "Elevation"
                )

            ]

        };
    }


    /* -----------------------------------------
       INDIVIDUAL
       ----------------------------------------- */

    return {

        tabs: [
            "All Photos"
        ],

        sets: [
            images
        ]

    };
}


/* =========================================================
   VIEWER
   ========================================================= */

function renderViewer() {

    if (!currentProject) {
        return;
    }

    const mainImage =
        document.getElementById(
            "modalMainImage"
        );

    const thumbnails =
        document.getElementById(
            "modalThumbnails"
        );

    const galleryTabs =
        document.getElementById(
            "modalGalleryTabs"
        );


    if (!mainImage || !thumbnails) {
        return;
    }


    const data =
        viewerSets(currentProject);

    const contextIndex =
        Number(currentViewerContext) || 0;

    const activeSet =
        data.sets[contextIndex] ||
        data.sets[0] ||
        [];


    currentViewerImages =
        activeSet;


    if (
        currentImageIndex >=
        activeSet.length
    ) {

        currentImageIndex = 0;

    }

    if (currentImageIndex < 0) {
        currentImageIndex = 0;
    }


    /* -----------------------------------------
       GALLERY TABS
       ----------------------------------------- */

    if (galleryTabs) {

        galleryTabs.innerHTML =
            data.tabs
                .map(
                    (title, index) => `
                        <button
                            type="button"
                            class="${
                                index ===
                                contextIndex
                                    ? "active"
                                    : ""
                            }"
                            data-index="${index}"
                        >
                            ${esc(title)}
                        </button>
                    `
                )
                .join("");


        galleryTabs
            .querySelectorAll("button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        currentViewerContext =
                            Number(
                                button.dataset.index
                            ) || 0;

                        currentImageIndex = 0;

                        renderViewer();

                    }
                );

            });

    }


    /* -----------------------------------------
       NO IMAGES
       ----------------------------------------- */

    if (!activeSet.length) {

        mainImage.removeAttribute(
            "src"
        );

        mainImage.alt =
            "No images available";

        thumbnails.innerHTML = `
            <p class="modal-no-images">
                No images available in this section.
            </p>
        `;

        return;
    }


    /* -----------------------------------------
       MAIN IMAGE
       ----------------------------------------- */

    const activeImage =
        activeSet[currentImageIndex];


    mainImage.src =
        activeImage.url;

    mainImage.alt =
        `${
            currentProject.title ||
            "Project"
        } image ${
            currentImageIndex + 1
        }`;


    /* -----------------------------------------
       THUMBNAILS
       ----------------------------------------- */

    thumbnails.innerHTML =
        activeSet
            .map(
                (image, index) => `
                    <button
                        type="button"
                        class="
                            modal-thumb
                            ${
                                index ===
                                currentImageIndex
                                    ? "active"
                                    : ""
                            }
                        "
                        data-index="${index}"
                        aria-label="
                            View image
                            ${index + 1}
                        "
                    >

                        <img
                            src="${esc(image.url)}"
                            alt=""
                        >

                    </button>
                `
            )
            .join("");


    thumbnails
        .querySelectorAll("button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    currentImageIndex =
                        Number(
                            button.dataset.index
                        ) || 0;

                    renderViewer();

                }
            );

        });
}


/* =========================================================
   CREATE DESCRIPTION + WORK TYPE FIELDS
   ========================================================= */

function ensureProjectInfoFields() {

    const info =
        document.querySelector(
            ".modal-project-info"
        );

    if (!info) {
        return;
    }


    let description =
        document.getElementById(
            "modalDescription"
        );

    let workType =
        document.getElementById(
            "modalWorkType"
        );


    /* -----------------------------------------
       DESCRIPTION
       ----------------------------------------- */

    if (!description) {

        const row =
            document.createElement("p");

        row.innerHTML = `
            <strong>
                Description:
            </strong>

            <span
                id="modalDescription"
            ></span>
        `;


        const title =
            document.getElementById(
                "modalTitle"
            );


        if (title) {

            title.insertAdjacentElement(
                "afterend",
                row
            );

        } else {

            info.prepend(row);

        }


        description =
            document.getElementById(
                "modalDescription"
            );
    }


    /* -----------------------------------------
       WORK TYPE
       ----------------------------------------- */

    if (!workType) {

        const row =
            document.createElement("p");

        row.innerHTML = `
            <strong>
                Work Type:
            </strong>

            <span
                id="modalWorkType"
            ></span>
        `;


        const location =
            document.getElementById(
                "modalLocation"
            );

        const locationRow =
            location?.closest("p");


        if (locationRow) {

            locationRow.insertAdjacentElement(
                "beforebegin",
                row
            );

        } else {

            info.appendChild(row);

        }


        workType =
            document.getElementById(
                "modalWorkType"
            );
    }
}


/* =========================================================
   OPEN PROJECT MODAL
   ========================================================= */

function openProjectModal(
    projectId,
    imageIndex = 0
) {

    const project =
        allProjects.find(
            item =>
                String(item.id) ===
                String(projectId)
        );


    const modal =
        document.getElementById(
            "projectModal"
        );


    if (!project || !modal) {

        console.warn(
            "Project modal could not open:",
            {
                projectId,
                projectFound:
                    !!project,
                modalFound:
                    !!modal
            }
        );

        return;
    }


    currentProject =
        project;

    currentViewerContext =
        0;


    ensureProjectInfoFields();


    /* -----------------------------------------
       SET TEXT
       ----------------------------------------- */

    const setText =
        (id, value) => {

            const element =
                document.getElementById(id);

            if (element) {

                element.textContent =
                    value ??
                    "";

            }

        };


    setText(
        "modalTitle",
        project.title
    );

    setText(
        "modalDescription",
        project.description
    );

    setText(
        "modalWorkType",
        project.workType
    );

    setText(
        "modalLocation",
        project.location
    );

    setText(
        "modalArea",
        project.area
    );

    setText(
        "modalYear",
        project.year
    );

    setText(
        "modalStatus",
        project.status
    );


    /* -----------------------------------------
       INITIAL IMAGE
       ----------------------------------------- */

    const images =
        Array.isArray(project.images)
            ? project.images
            : [];


    const requestedImage =
        images[
            Number(imageIndex) || 0
        ];


    const requestedUrl =
        requestedImage?.url ||
        null;


    const firstSet =
        viewerSets(project)
            .sets[0] || [];


    const matchingIndex =
        requestedUrl

            ? firstSet.findIndex(
                image =>
                    image?.url ===
                    requestedUrl
            )

            : -1;


    currentImageIndex =
        matchingIndex >= 0
            ? matchingIndex
            : 0;


    renderViewer();


    /* -----------------------------------------
       SHOW MODAL
       ----------------------------------------- */

    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "project-modal-open"
    );
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal() {

    const modal =
        document.getElementById(
            "projectModal"
        );

    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "project-modal-open"
    );
}


/* =========================================================
   NEXT / PREVIOUS IMAGE
   ========================================================= */

function moveImage(direction) {

    if (
        !currentViewerImages.length
    ) {
        return;
    }


    currentImageIndex =
        (
            currentImageIndex +
            direction +
            currentViewerImages.length
        ) %
        currentViewerImages.length;


    renderViewer();
}


/* =========================================================
   SHARE PROJECT
   ========================================================= */

async function shareProject() {

    if (!currentProject) {
        return;
    }


    const url =
        new URL(
            "portfolio.html",
            window.location.href
        );


    url.searchParams.set(
        "project",
        currentProject.id
    );


    const shareData = {

        title:
            currentProject.title ||
            "Project",

        text:
            `${
                currentProject.title ||
                "Project"
            } — Swastika Design & Constructions`,

        url:
            url.href

    };


    try {

        if (navigator.share) {

            await navigator.share(
                shareData
            );

            return;
        }


        if (
            navigator.clipboard?.writeText
        ) {

            await navigator.clipboard.writeText(
                url.href
            );

            alert(
                "Project link copied. You can now share it."
            );

            return;
        }


        throw new Error(
            "Clipboard unavailable"
        );


    } catch (error) {

        if (
            error?.name ===
            "AbortError"
        ) {
            return;
        }


        try {

            const textarea =
                document.createElement(
                    "textarea"
                );

            textarea.value =
                url.href;

            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";


            document.body.appendChild(
                textarea
            );

            textarea.select();

            document.execCommand(
                "copy"
            );

            textarea.remove();


            alert(
                "Project link copied. You can now share it."
            );


        } catch {

            window.prompt(
                "Copy this project link:",
                url.href
            );

        }

    }
}


/* =========================================================
   CARD CLICK FIX
   ========================================================= */

/*
   IMPORTANT:

   Cards are created dynamically after Firebase loads.

   Therefore we use EVENT DELEGATION on document.

   This means card clicks continue to work after:
   - Firebase loading
   - pagination
   - category filtering
   - Individual Decor filtering
   - homepage rendering
*/

document.addEventListener(
    "click",
    event => {

        const target =
            event.target instanceof Element
                ? event.target
                : null;


        if (!target) {
            return;
        }


        const card =
            target.closest(
                ".portfolio-card"
            );


        if (!card) {
            return;
        }


        /*
           If a button or link exists inside
           a card, don't treat that as a
           card click.
        */

        if (
            target.closest(
                "a, button"
            )
        ) {
            return;
        }


        const projectId =
            card.getAttribute(
                "data-project-id"
            );


        if (!projectId) {
            return;
        }


        event.preventDefault();


        openProjectModal(
            projectId,
            Number(
                card.getAttribute(
                    "data-image-index"
                )
            ) || 0
        );

    }
);


/* =========================================================
   KEYBOARD CARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        const target =
            event.target instanceof Element
                ? event.target
                : null;


        if (!target) {
            return;
        }


        const card =
            target.closest(
                ".portfolio-card"
            );


        if (!card) {
            return;
        }


        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }


        event.preventDefault();


        const projectId =
            card.getAttribute(
                "data-project-id"
            );


        if (projectId) {

            openProjectModal(
                projectId,
                Number(
                    card.getAttribute(
                        "data-image-index"
                    )
                ) || 0
            );

        }

    }
);


/* =========================================================
   LOAD PROJECTS FROM FIRESTORE
   ========================================================= */

async function loadPortfolio() {

    showSkeleton();


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "projects"
                )
            );


        allProjects =
            snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


        /* -----------------------------------------
           RENDER
           ----------------------------------------- */

        if (
            isPortfolioPage()
        ) {

            renderPortfolioMain();

        } else {

            renderFeatured();

        }


        /* -----------------------------------------
           OPEN PROJECT FROM SHARED URL
           ----------------------------------------- */

        const projectId =
            new URLSearchParams(
                window.location.search
            ).get("project");


        if (projectId) {

            setTimeout(
                () => {

                    openProjectModal(
                        projectId,
                        0
                    );

                },
                0
            );

        }


    } catch (error) {

        console.error(
            "Portfolio loading error:",
            error
        );


        const grid =
            getPortfolioGrid();


        if (grid) {

            grid.innerHTML = `
                <p class="portfolio-error">
                    Unable to load projects right now.
                </p>
            `;

        }

    }
}


/* =========================================================
   INITIALISE
   ========================================================= */

function initialise() {

    setupTabs();


    /* -----------------------------------------
       MODAL CONTROLS
       ----------------------------------------- */

    document
        .getElementById(
            "closeModal"
        )
        ?.addEventListener(
            "click",
            closeModal
        );


    document
        .getElementById(
            "prevImageBtn"
        )
        ?.addEventListener(
            "click",
            () =>
                moveImage(-1)
        );


    document
        .getElementById(
            "nextImageBtn"
        )
        ?.addEventListener(
            "click",
            () =>
                moveImage(1)
        );


    document
        .getElementById(
            "shareProjectBtn"
        )
        ?.addEventListener(
            "click",
            shareProject
        );


    /* -----------------------------------------
       CLICK OUTSIDE MODAL
       ----------------------------------------- */

    document
        .getElementById(
            "projectModal"
        )
        ?.addEventListener(
            "click",
            event => {

                if (
                    event.target?.id ===
                    "projectModal"
                ) {

                    closeModal();

                }

            }
        );


    /* -----------------------------------------
       KEYBOARD NAVIGATION
       ----------------------------------------- */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeModal();

                return;
            }


            const modal =
                document.getElementById(
                    "projectModal"
                );


            if (
                !modal?.classList.contains(
                    "show"
                )
            ) {
                return;
            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                moveImage(-1);

            }


            if (
                event.key ===
                "ArrowRight"
            ) {

                moveImage(1);

            }

        }
    );


    /* -----------------------------------------
       MOBILE SWIPE
       ----------------------------------------- */

    const wrapper =
        document.querySelector(
            ".modal-image-wrapper"
        );


    let startX = 0;
    let startY = 0;


    wrapper?.addEventListener(
        "touchstart",
        event => {

            const touch =
                event.changedTouches[0];

            startX =
                touch.screenX;

            startY =
                touch.screenY;

        },
        {
            passive: true
        }
    );


    wrapper?.addEventListener(
        "touchend",
        event => {

            const touch =
                event.changedTouches[0];

            const deltaX =
                touch.screenX -
                startX;

            const deltaY =
                touch.screenY -
                startY;


            if (
                Math.abs(deltaX) > 50 &&
                Math.abs(deltaX) >
                    Math.abs(deltaY)
            ) {

                moveImage(
                    deltaX < 0
                        ? 1
                        : -1
                );

            }

        },
        {
            passive: true
        }
    );


    /* -----------------------------------------
       LOAD
       ----------------------------------------- */

    loadPortfolio();
}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initialise,
        {
            once: true
        }
    );

} else {

    initialise();

}