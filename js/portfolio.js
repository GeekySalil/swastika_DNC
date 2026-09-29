import { db } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const PAGE_SIZE = 20;


/* =========================================================
   IMAGE TAG TAXONOMY
   ========================================================= */

const IMAGE_CATEGORIES = [
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
    "reception"
];

const INDIVIDUAL_DECOR_EXCLUDED_CATEGORIES = [
    "3d-render",
    "site-photos"
];

let activeDesignBuildFilter = "3d-render";

let activeIndividualCategory = "ceiling";

let activeIndividualSubcategory = "all";

let allProjects = [];
let currentProject = null;
let currentImageIndex = 0;
let currentViewerImages = [];
let currentViewerContext = 0;
let currentPage = 1;
let currentViewerMode = "project";

/* =========================================================
   PORTFOLIO PERFORMANCE CACHE
   ========================================================= */

const PORTFOLIO_CACHE_KEY =
    "sdnc_portfolio_cache_v1";

const PORTFOLIO_CACHE_TTL =
    10 * 60 * 1000; // 10 minutes
/* =========================================================
   PORTFOLIO DATA CHANGE DETECTION
   ========================================================= */

const PORTFOLIO_DATA_VERSION_KEY =
    "sdnc_portfolio_data_version";

let portfolioDataVersion =
    localStorage.getItem(
        PORTFOLIO_DATA_VERSION_KEY
    ) || "";


window.addEventListener(
    "storage",
    event => {

        if (
            event.key !==
            PORTFOLIO_DATA_VERSION_KEY
        ) {
            return;
        }

        if (
            !event.newValue ||
            event.newValue ===
            portfolioDataVersion
        ) {
            return;
        }

        portfolioDataVersion =
            event.newValue;

        sessionStorage.removeItem(
            PORTFOLIO_CACHE_KEY
        );

        loadPortfolio();
    }
);

function readPortfolioCache() {

    try {

        const raw =
            sessionStorage.getItem(
                PORTFOLIO_CACHE_KEY
            );

        if (!raw) {
            return null;
        }

        const cached =
            JSON.parse(raw);

        if (
            !cached ||
            !Array.isArray(
                cached.projects
            )
        ) {
            return null;
        }

        const savedAt =
            Number(
                cached.savedAt
            );

        if (
            !savedAt ||
            Date.now() - savedAt >
                PORTFOLIO_CACHE_TTL
        ) {
            sessionStorage.removeItem(
                PORTFOLIO_CACHE_KEY
            );

            return null;
        }

        return cached.projects;

    } catch (error) {

        console.warn(
            "Portfolio cache read failed:",
            error
        );

        return null;
    }
}


function writePortfolioCache(
    projects
) {

    try {

        sessionStorage.setItem(
            PORTFOLIO_CACHE_KEY,
            JSON.stringify({
                savedAt: Date.now(),
                projects
            })
        );

    } catch (error) {

        /*
         * Storage quota errors must never
         * break the portfolio.
         */

        console.warn(
            "Portfolio cache write failed:",
            error
        );

    }
}


function renderLoadedPortfolio() {

    /* Update project/category counters */
    updatePortfolioCategoryCounters();


    if (isPortfolioPage()) {

        renderPortfolioMain();

    } else {

        renderFeatured();

    }
}


function getSharedProjectId() {

    return new URLSearchParams(
        window.location.search
    ).get("project");

}


function tryOpenSharedProject() {

    const projectId =
        getSharedProjectId();

    if (!projectId) {
        return false;
    }

    const projectExists =
        allProjects.some(
            project =>
                project.id ===
                projectId
        );

    if (!projectExists) {
        return false;
    }

    setTimeout(() => {

        openProjectModal(
            projectId,
            0
        );

    }, 0);

    return true;
}
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

/* =========================================================
   IMAGE TAG HELPERS
   ========================================================= */

function normalizeImageTag(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
}


function prettyImageTag(value) {

    return String(value ?? "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, char =>
            char.toUpperCase()
        );
}


function getImageTags(image) {

    if (
        !image ||
        !Array.isArray(image.tags)
    ) {
        return [];
    }

    return image.tags
        .map(tag => {

            if (
                !tag ||
                !tag.category
            ) {
                return null;
            }

            return {
                category:
                    normalizeImageTag(
                        tag.category
                    ),

                subcategories:
                    Array.isArray(
                        tag.subcategories
                    )
                        ? tag.subcategories
                            .map(
                                normalizeImageTag
                            )
                            .filter(Boolean)
                        : []
            };

        })
        .filter(Boolean);
}


function imageHasCategory(
    image,
    category
) {

    if (
        category === "all"
    ) {
        return true;
    }

    return getImageTags(image)
        .some(
            tag =>
                tag.category ===
                category
        );
}


function imageHasSubcategory(
    image,
    category,
    subcategory
) {

    if (
        subcategory === "all"
    ) {
        return true;
    }

    return getImageTags(image)
        .some(tag => {

            if (
                tag.category !==
                category
            ) {
                return false;
            }

            return tag.subcategories
                .includes(
                    subcategory
                );

        });
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

/* =========================================================
   PROJECT / IMAGE CARD
   ========================================================= */

function projectCard(
    project,
    image = null,
    imageIndex = 0,
    isPriorityImage = false
) {

    const images =
        Array.isArray(project?.images)
            ? project.images
            : [];

    let selectedImage;
    let selectedImageIndex = 0;

    /*
     * -----------------------------------------------------
     * INDIVIDUAL DECOR
     * -----------------------------------------------------
     *
     * When a specific image is passed, this is an
     * Individual Decor card.
     *
     * Individual Decor cards show ONLY the image.
     * No category, subcategory, project title,
     * location, year or tag text is displayed.
     */

    if (image) {

        selectedImage = image;
        selectedImageIndex = imageIndex;

    } else {

        /*
         * -------------------------------------------------
         * NORMAL PROJECT CARD
         * -------------------------------------------------
         *
         * Normal project cards use the project's
         * saved Main Image.
         */

        const mainIndex =
            Number.isInteger(
                Number(project?.mainImageIndex)
            )
                ? Number(project.mainImageIndex)
                : 0;

        if (images[mainIndex]?.url) {

            selectedImage =
                images[mainIndex];

            selectedImageIndex =
                mainIndex;

        } else {

            selectedImage =
                images[0];

            selectedImageIndex = 0;

        }

    }

    if (!selectedImage?.url) {
        return "";
    }

    const title =
        esc(
            project.title ||
            "Untitled Project"
        );

    const location =
        project.location
            ? esc(project.location)
            : "";

    const year =
        project.year
            ? esc(project.year)
            : "";

    /*
     * -----------------------------------------------------
     * NORMAL PROJECT INFORMATION
     * -----------------------------------------------------
     *
     * This information is ONLY used for normal
     * project cards.
     *
     * Individual Decor cards intentionally have
     * no text information below the image.
     */

    const categoryLine = [

        displayCategory(
            project
        ),

        project.subcategory

    ]
        .filter(Boolean)
        .map(esc)
        .join(
            ' <span class="project-dot">·</span> '
        );

    return `
        <article
            class="portfolio-card"
            tabindex="0"
            role="button"
            data-project-id="${esc(project.id)}"
            data-image-index="${selectedImageIndex}"
        >

            <div class="portfolio-image-wrap">

                <img
                    src="${esc(
                        selectedImage.url
                    )}"
                    alt="${title}"
                    loading="${
                        isPriorityImage
                            ? "eager"
                            : "lazy"
                    }"
                    decoding="async"
                    ${
                        isPriorityImage
                            ? 'fetchpriority="high"'
                            : ""
                    }
                >

            </div>

            ${
                /*
                 * Individual Decor:
                 * DO NOT render any card information.
                 */
                image
                    ? ""
                    : `
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
                                location || year
                                    ? `
                                        <p class="project-card-location">

                                            ${
                                                location
                                                    ? `
                                                        <span class="project-card-location-text">
                                                            ${location}
                                                        </span>
                                                    `
                                                    : ""
                                            }

                                            ${
                                                location && year
                                                    ? `
                                                        <span class="project-card-info-dot project-card-year-dot">
                                                            ·
                                                        </span>
                                                    `
                                                    : ""
                                            }

                                            ${
                                                year
                                                    ? `
                                                        <span class="project-card-year">
                                                            ${year}
                                                        </span>
                                                    `
                                                    : ""
                                            }

                                        </p>
                                    `
                                    : ""
                            }

                        </div>
                    `
            }

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

/* =========================================================
   FILTER IMAGES USING NEW IMAGE TAG SYSTEM
   ========================================================= */
/* =========================================================
   PORTFOLIO CATEGORY COUNTERS
   ========================================================= */

function updatePortfolioCategoryCounters() {

    const mainTabs =
        document.querySelector(
            ".portfolio-main-tabs"
        );

    if (!mainTabs) {
        return;
    }


    /*
     * Count actual projects by project-level category.
     *
     * Individual Decor is different:
     * it displays individual image cards,
     * so its counter counts matching images.
     */

    const counts = {

        all:
            allProjects.filter(
                project =>
                    [
                        "Design + Build",
                        "Interiors",
                        "Elevation"
                    ].includes(
                        project?.category
                    )
            ).length,

        "Design + Build":
            allProjects.filter(
                project =>
                    project?.category ===
                    "Design + Build"
            ).length,

        "Interiors":
            allProjects.filter(
                project =>
                    project?.category ===
                    "Interiors"
            ).length,

        "Elevation":
            allProjects.filter(
                project =>
                    project?.category ===
                    "Elevation"
            ).length,

        individual:
            getIndividualDecorImageCount()

    };


    /*
     * Update the visible text of every
     * main portfolio tab.
     */

    mainTabs
        .querySelectorAll(
            "button[data-tab]"
        )
        .forEach(button => {

            const tab =
                button.dataset.tab;

            const count =
                counts[tab];

            if (
                typeof count !==
                "number"
            ) {
                return;
            }


            const labels = {

                all:
                    "ALL PROJECTS",

                "Design + Build":
                    "DESIGN + BUILD",

                "Interiors":
                    "INTERIORS",

                "Elevation":
                    "ELEVATION",

                individual:
                    "INDIVIDUAL DECOR"

            };


            button.textContent =
                `${labels[tab]} (${count})`;

        });

}


/* =========================================================
   INDIVIDUAL DECOR IMAGE COUNT
   ========================================================= */

function getIndividualDecorImageCount() {

    let count = 0;


    allProjects.forEach(project => {

        const images =
            Array.isArray(
                project?.images
            )
                ? project.images
                : [];


        images.forEach(image => {

            const validTags =
                getImageTags(
                    image
                ).filter(tag => {

                    /*
                     * 3D Render and Site Photos
                     * never belong to Individual Decor.
                     */

                    return (
                        tag?.category !==
                            "3d-render" &&
                        tag?.category !==
                            "site-photos"
                    );

                });


            if (validTags.length) {
                count++;
            }

        });

    });


    return count;
}
/* =========================================================
   MAIN PORTFOLIO FILTERING
   ========================================================= */

function getProjectsForMainTab() {

    const activeTab =
        $(".portfolio-main-tabs .active")
            ?.dataset.tab || "all";


    /* =====================================================
       INDIVIDUAL DECOR
       ===================================================== */

    if (activeTab === "individual") {

        const items = [];


        allProjects.forEach(project => {

            const images =
                Array.isArray(project.images)
                    ? project.images
                    : [];


            images.forEach(
                (image, imageIndex) => {

                    if (!image?.url) {
                        return;
                    }


                    const tags =
                        getImageTags(image);


                    /*
                     * Individual Decor accepts
                     * only actual decor categories.
                     *
                     * 3D Render and Site Photos
                     * are intentionally excluded.
                     */

                    const validTags =
                        tags.filter(tag =>
                            !INDIVIDUAL_DECOR_EXCLUDED_CATEGORIES
                                .includes(
                                    tag.category
                                )
                        );


                    if (!validTags.length) {
                        return;
                    }


                    /*
                     * CATEGORY
                     */

                    const categoryMatch =
                        validTags.some(
                            tag =>
                                tag.category ===
                                activeIndividualCategory
                        );


                    if (!categoryMatch) {
                        return;
                    }


                    /*
                     * SUBCATEGORY
                     */

                    if (
                        activeIndividualSubcategory !==
                        "all"
                    ) {

                        const subcategoryMatch =
                            validTags.some(tag => {

                                if (
                                    tag.category !==
                                    activeIndividualCategory
                                ) {
                                    return false;
                                }


                                return (
                                    tag.subcategories ||
                                    []
                                ).includes(
                                    activeIndividualSubcategory
                                );

                            });


                        if (!subcategoryMatch) {
                            return;
                        }

                    }


                    /*
                     * IMPORTANT:
                     *
                     * Add ONLY the matching image.
                     * Never add the complete project.
                     */

                    items.push({
                        project,
                        image,
                        imageIndex
                    });

                }
            );

        });


        return items;
    }


    /* =====================================================
       ALL PROJECTS
       ===================================================== */

    if (activeTab === "all") {

        return allProjects.filter(
            project =>
                [
                    "Design + Build",
                    "Interiors",
                    "Elevation"
                ].includes(
                    project.category
                )
        );

    }


    /* =====================================================
       DESIGN + BUILD
       ===================================================== */

    if (
        activeTab === "Design + Build"
    ) {

        return allProjects.filter(
            project =>
                project.category ===
                "Design + Build"
        );

    }


    /* =====================================================
       INTERIORS
       ===================================================== */

    if (
        activeTab === "Interiors"
    ) {

        return allProjects.filter(
            project =>
                project.category ===
                "Interiors"
        );

    }


    /* =====================================================
       ELEVATION
       ===================================================== */

    if (
        activeTab === "Elevation"
    ) {

        return allProjects.filter(
            project =>
                project.category ===
                "Elevation"
        );

    }


    return [];
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
        .map(
            (project, index) =>
                projectCard(
                    project,
                    null,
                    0,
                    index === 0
                )
        )
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

/* =========================================================
   PORTFOLIO MAIN GRID
   ========================================================= */

function renderPortfolioMain() {

    const grid =
        getPortfolioGrid();


    if (!grid) {
        return;
    }


    const items =
        getProjectsForMainTab();


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                items.length /
                PAGE_SIZE
            )
        );


    currentPage =
        Math.min(
            Math.max(
                1,
                currentPage
            ),
            totalPages
        );


    const start =
        (
            currentPage - 1
        ) * PAGE_SIZE;


    const visibleItems =
        items.slice(
            start,
            start + PAGE_SIZE
        );
const activeTab =
    $(".portfolio-main-tabs .active")
        ?.dataset.tab || "all";

const emptyMessage =
    activeTab === "individual"
        ? "No images found for this filter."
        : "No projects found for this filter.";

    grid.innerHTML =
    visibleItems
        .map(
            (item, index) => {

                const activeTab =
                    $(".portfolio-main-tabs .active")
                        ?.dataset.tab || "all";

                if (
                    activeTab ===
                    "individual"
                ) {

                    return projectCard(
                        item.project,
                        item.image,
                        item.imageIndex,
                        index === 0
                    );

                }

                return projectCard(
                    item,
                    null,
                    0,
                    index === 0
                );

            }
        )
        .join("")
    ||
    `
        <p class="portfolio-empty">
            ${emptyMessage}
        </p>
    `;


    renderPagination(
        totalPages
    );
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

/* =========================================================
   PORTFOLIO IMAGE CATEGORY TABS
   ========================================================= */

/* =========================================================
   PORTFOLIO TAB SYSTEM
   ========================================================= */

function setupTabs() {

    const mainTabs =
        document.querySelector(
            ".portfolio-main-tabs"
        );


    if (!mainTabs) {
        return;
    }


    /* =====================================================
       MAIN CATEGORY TABS
       ===================================================== */

    mainTabs
        .querySelectorAll(
            "button[data-tab]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        mainTabs
                            .querySelectorAll(
                                "button[data-tab]"
                            )
                            .forEach(
                                item => {

                                    item.classList.remove(
                                        "active"
                                    );

                                }
                            );


                        button.classList.add(
                            "active"
                        );


                        const tab =
                            button.dataset.tab;


                       /* Reset Individual Decor filters */

activeIndividualCategory =
    "ceiling";

activeIndividualSubcategory =
    "all";


                        /* -------------------------
                           DESIGN + BUILD
                           ------------------------- */

                        const designBuildWrap =
                            document.getElementById(
                                "designBuildTabsWrap"
                            );


                        if (
                            designBuildWrap
                        ) {

                            designBuildWrap.hidden =
                                tab !==
                                "Design + Build";

                        }


                        /* -------------------------
                           INDIVIDUAL DECOR
                           ------------------------- */

                        const individualWrap =
                            document.getElementById(
                                "individualSubtabsWrap"
                            );


                        if (
                            individualWrap
                        ) {

                            individualWrap.hidden =
                                tab !==
                                "individual";

                        }


                        currentPage =
                            1;


                        if (
                            tab ===
                            "individual"
                        ) {

                            renderIndividualCategoryTabs();

                        }


                        renderPortfolioMain();

                    }
                );

            }
        );


    /* =====================================================
       DESIGN + BUILD TABS
       ===================================================== */

    const designBuildTabs =
        document.getElementById(
            "designBuildTabs"
        );


    designBuildTabs
        ?.querySelectorAll(
            "button[data-design-build-filter]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        designBuildTabs
                            .querySelectorAll(
                                "button"
                            )
                            .forEach(
                                item =>
                                    item.classList.remove(
                                        "active"
                                    )
                            );


                        button.classList.add(
                            "active"
                        );


                       activeDesignBuildFilter =
    normalizeImageTag(
        button.dataset
            .designBuildFilter
    );

                    }
                );

            }
        );
}

/* =========================================================
   INDIVIDUAL DECOR CATEGORY TABS
   ========================================================= */

function renderIndividualCategoryTabs() {

    const container =
        document.getElementById(
            "individualSubtabs"
        );


    if (!container) {
        return;
    }


    const availableCategories =
        new Set();


    allProjects.forEach(project => {

        const images =
            Array.isArray(project.images)
                ? project.images
                : [];


        images.forEach(image => {

            getImageTags(image)
    .forEach(tag => {

        if (
            INDIVIDUAL_DECOR_EXCLUDED_CATEGORIES.includes(
                tag.category
            )
        ) {
            return;
        }

        availableCategories.add(
            tag.category
        );

    });

        });

    });


    /*
     * Ceiling is the default category.
     * Other categories follow alphabetically.
     */

    const categories =
        Array.from(
            availableCategories
        ).sort((a, b) => {

            if (a === "ceiling") return -1;
            if (b === "ceiling") return 1;

            return prettyImageTag(a)
                .localeCompare(
                    prettyImageTag(b)
                );

        });


    container.innerHTML =
        categories
            .map(category => `
                <button
                    type="button"
                    class="${
                        activeIndividualCategory ===
                        category
                            ? "active"
                            : ""
                    }"
                    data-individual-category="${esc(
                        category
                    )}"
                >
                    ${prettyImageTag(
                        category
                    )}
                </button>
            `)
            .join("");


    container
        .querySelectorAll(
            "[data-individual-category]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    activeIndividualCategory =
                        normalizeImageTag(
                            button.dataset
                                .individualCategory
                        );


                    activeIndividualSubcategory =
                        "all";


                    container
                        .querySelectorAll(
                            "[data-individual-category]"
                        )
                        .forEach(item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );

                        });


                    renderIndividualSubcategoryTabs();


                    currentPage = 1;

                    renderPortfolioMain();

                }
            );

        });


    renderIndividualSubcategoryTabs();
}

/* =========================================================
   INDIVIDUAL DECOR SUBCATEGORIES
   ========================================================= */

function renderIndividualSubcategoryTabs() {

    const category =
        activeIndividualCategory;


    let existingWrap =
        document.getElementById(
            "individualImageSubcategoryWrap"
        );


    /*
     * "All Rooms" does not need another
     * subcategory row.
     */

    if (
        category === "all"
    ) {

        if (existingWrap) {
            existingWrap.remove();
        }

        return;
    }


    const subcategories =
        new Set();


    allProjects.forEach(
        project => {

            const images =
                Array.isArray(
                    project.images
                )
                    ? project.images
                    : [];


            images.forEach(
                image => {

                    getImageTags(
                        image
                    ).forEach(
                        tag => {

                            if (
                                tag.category !==
                                category
                            ) {
                                return;
                            }


                            (
                                tag.subcategories ||
                                []
                            ).forEach(
                                subcategory => {

                                    subcategories.add(
                                        subcategory
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );


    const values =
        Array.from(
            subcategories
        ).sort(
            (a, b) =>
                prettyImageTag(a)
                    .localeCompare(
                        prettyImageTag(b)
                    )
        );


   


    /*
     * Create subcategory container
     * immediately below Individual
     * Decor category tabs.
     */

    if (!existingWrap) {

        existingWrap =
            document.createElement(
                "div"
            );

        existingWrap.id =
            "individualImageSubcategoryWrap";

        existingWrap.className =
            "individual-subtabs";

        const categoryWrap =
            document.getElementById(
                "individualSubtabsWrap"
            );


        categoryWrap?.appendChild(
            existingWrap
        );

    }


    existingWrap.innerHTML = `

        <button
            type="button"
            class="${
                activeIndividualSubcategory ===
                "all"
                    ? "active"
                    : ""
            }"
            data-individual-subcategory="all"
        >
            All ${prettyImageTag(
                category
            )}
        </button>

        ${
            values
                .map(
                    value => `
                        <button
                            type="button"
                            class="${
                                activeIndividualSubcategory ===
                                value
                                    ? "active"
                                    : ""
                            }"
                            data-individual-subcategory="${esc(
                                value
                            )}"
                        >
                            ${prettyImageTag(
                                value
                            )}
                        </button>
                    `
                )
                .join("")
        }

    `;


    existingWrap
        .querySelectorAll(
            "[data-individual-subcategory]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        activeIndividualSubcategory =
                            normalizeImageTag(
                                button.dataset
                                    .individualSubcategory
                            );


                        existingWrap
                            .querySelectorAll(
                                "[data-individual-subcategory]"
                            )
                            .forEach(
                                item =>
                                    item.classList.toggle(
                                        "active",
                                        item === button
                                    )
                            );


                        currentPage =
                            1;


                        renderPortfolioMain();

                    }
                );

            }
        );
}
/* =========================================================
   BUILD SUBCATEGORY TABS
   ========================================================= */




/* =========================================================
   VIEWER IMAGE SETS
   ========================================================= */

/* =========================================================
   PROJECT VIEWER IMAGE SETS
   ========================================================= */

function viewerSets(project) {

    const images =
        Array.isArray(
            project?.images
        )
            ? project.images
            : [];


    /* =====================================================
       DESIGN + BUILD
       ===================================================== */

    if (
        project?.category ===
        "Design + Build"
    ) {

        const renderImages =
            images.filter(
                image =>
                    getImageTags(
                        image
                    ).some(
                        tag =>
                            tag.category ===
                            "3d-render"
                    )
            );


        const siteImages =
            images.filter(
                image =>
                    getImageTags(
                        image
                    ).some(
                        tag =>
                            tag.category ===
                            "site-photos"
                    )
            );


        return {

            tabs: [
                "3D Render",
                "Site Photos"
            ],

            sets: [
                renderImages,
                siteImages
            ]

        };
    }


    /* =====================================================
       INTERIORS
       ===================================================== */

    if (
        project?.category ===
        "Interiors"
    ) {

        return {

            tabs: [
                "All Photos"
            ],

            sets: [
                images
            ]

        };

    }


    /* =====================================================
       ELEVATION
       ===================================================== */

    if (
        project?.category ===
        "Elevation"
    ) {

        return {

            tabs: [
                "All Photos"
            ],

            sets: [
                images
            ]

        };

    }


    /* =====================================================
       OTHER PROJECTS
       ===================================================== */

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

   /* =========================================================
   FULLSCREEN IMAGE VIEWER
   ========================================================= */

let fullscreenViewer = null;
let fullscreenImage = null;


/* -----------------------------------------
   CREATE FULLSCREEN VIEWER
   ----------------------------------------- */

function createFullscreenViewer() {

    if (fullscreenViewer) {
        return;
    }

    fullscreenViewer =
        document.createElement("div");

    fullscreenViewer.className =
        "project-fullscreen-viewer";

    fullscreenViewer.setAttribute(
        "aria-hidden",
        "true"
    );


    fullscreenViewer.innerHTML = `

    <button
        type="button"
        class="project-fullscreen-close"
        id="projectFullscreenClose"
        aria-label="Zoom out"
        title="Zoom out"
    >
        ×
    </button>

    <button
        type="button"
        class="project-fullscreen-nav project-fullscreen-prev"
        id="projectFullscreenPrev"
        aria-label="Previous image"
        title="Previous image"
    >
        <i class="fas fa-chevron-left"></i>
    </button>

    <img
        class="project-fullscreen-image"
        id="projectFullscreenImage"
        alt=""
    >

    <button
        type="button"
        class="project-fullscreen-nav project-fullscreen-next"
        id="projectFullscreenNext"
        aria-label="Next image"
        title="Next image"
    >
        <i class="fas fa-chevron-right"></i>
    </button>

`;


    document.body.appendChild(
        fullscreenViewer
    );


    fullscreenImage =
        document.getElementById(
            "projectFullscreenImage"
        );


    document
        .getElementById(
            "projectFullscreenClose"
        )
        ?.addEventListener(
            "click",
            closeFullscreenImage
        );

document
    .getElementById(
        "projectFullscreenPrev"
    )
    ?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            moveFullscreenImage(-1);

        }
    );


document
    .getElementById(
        "projectFullscreenNext"
    )
    ?.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            moveFullscreenImage(1);

        }
    );
    /* Clicking the black background also closes it */

    fullscreenViewer.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                fullscreenViewer
            ) {

                closeFullscreenImage();

            }

        }
    );

}

/* =========================================================
   FULLSCREEN IMAGE NAVIGATION
   ========================================================= */

function moveFullscreenImage(direction) {

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


    const image =
        currentViewerImages[
            currentImageIndex
        ];


    if (
        !image?.url ||
        !fullscreenImage
    ) {
        return;
    }


    fullscreenImage.src =
        image.url;

    fullscreenImage.alt =
        `${
            currentProject?.title ||
            "Project"
        } image ${
            currentImageIndex + 1
        }`;

}
/* -----------------------------------------
   OPEN FULLSCREEN IMAGE
   ----------------------------------------- */

function openFullscreenImage() {

    if (
        !currentViewerImages.length
    ) {
        return;
    }


    const image =
        currentViewerImages[
            currentImageIndex
        ];


    if (!image?.url) {
        return;
    }


    createFullscreenViewer();


    fullscreenImage.src =
        image.url;

    fullscreenImage.alt =
        `${
            currentProject?.title ||
            "Project"
        } image ${
            currentImageIndex + 1
        }`;


    fullscreenViewer.classList.add(
        "show"
    );

    fullscreenViewer.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "project-fullscreen-open"
    );

}


/* -----------------------------------------
   CLOSE FULLSCREEN IMAGE
   ----------------------------------------- */

function closeFullscreenImage() {

    if (!fullscreenViewer) {
        return;
    }


    fullscreenViewer.classList.remove(
        "show"
    );

    fullscreenViewer.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "project-fullscreen-open"
    );


    if (fullscreenImage) {

        fullscreenImage.removeAttribute(
            "src"
        );

    }

}
function renderViewer() {

    if (!currentProject) {
        return;
    }

    const mainImage =
        document.getElementById(
            "modalMainImage"
        );
createImageMagnifier();
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

/* =========================================================
   IMAGE MAGNIFIER BUTTON
   ========================================================= */

function createImageMagnifier() {

    const wrapper =
        document.querySelector(
            "#projectModal .modal-image-wrapper"
        );


    if (!wrapper) {
        return;
    }


    /* Don't create it twice */

    if (
        wrapper.querySelector(
            ".project-image-magnifier"
        )
    ) {
        return;
    }


    /*
     * Make sure the wrapper can contain
     * the absolutely positioned button.
     */

    const computed =
        window.getComputedStyle(
            wrapper
        );


    if (
        computed.position ===
            "static"
    ) {

        wrapper.style.position =
            "relative";

    }


    const button =
        document.createElement(
            "button"
        );


    button.type =
        "button";

    button.className =
        "project-image-magnifier";

    button.setAttribute(
        "aria-label",
        "View image fullscreen"
    );

    button.setAttribute(
        "title",
        "View fullscreen"
    );


    button.innerHTML = `
        <i class="fas fa-search-plus"></i>
    `;


    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            openFullscreenImage();

        }
    );


    wrapper.appendChild(
        button
    );

}
    const data =
    viewerSets(currentProject);

const contextIndex =
    Number(currentViewerContext) || 0;

let activeSet;

if (
    currentViewerMode ===
    "individual"
) {

    activeSet =
        currentViewerImages;

} else {

    activeSet =
        data.sets[contextIndex] ||
        data.sets[0] ||
        [];

    currentViewerImages =
        activeSet;

}


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

    /* -----------------------------------------
   GALLERY TABS
   ----------------------------------------- */

if (galleryTabs) {

    if (
        currentViewerMode ===
        "individual"
    ) {

        galleryTabs.innerHTML = "";
        galleryTabs.hidden = true;

    } else {

        galleryTabs.hidden = false;

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

}
createImageMagnifier();

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
   SINGLE IMAGE VIEWER CONTROLS
   ----------------------------------------- */

const prevImageBtn =
    document.getElementById(
        "prevImageBtn"
    );

const nextImageBtn =
    document.getElementById(
        "nextImageBtn"
    );


const hasMultipleImages =
    activeSet.length > 1;


if (prevImageBtn) {

    prevImageBtn.style.display =
        hasMultipleImages
            ? ""
            : "none";

}


if (nextImageBtn) {

    nextImageBtn.style.display =
        hasMultipleImages
            ? ""
            : "none";

}
if (thumbnails) {

    thumbnails.style.display =
        hasMultipleImages
            ? ""
            : "none";

}
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
    src="${esc(image.thumbnailUrl || image.url)}"
    alt=""
    loading="lazy"
    decoding="async"
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


/* -----------------------------------------
   DETERMINE VIEWER MODE
   ----------------------------------------- */

const activeTab =
    $(".portfolio-main-tabs .active")
        ?.dataset.tab || "all";


if (
    activeTab === "individual"
) {

    currentViewerMode =
        "individual";

} else {

    currentViewerMode =
        "project";

}


/* -----------------------------------------
   INITIAL VIEWER TAB
   ----------------------------------------- */

if (
    project.category ===
    "Design + Build"
) {

    currentViewerContext =
        activeDesignBuildFilter ===
        "site-photos"
            ? 1
            : 0;

} else {

    currentViewerContext =
        0;

}

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

/* -----------------------------------------
   INDIVIDUAL DECOR — SINGLE IMAGE
   ----------------------------------------- */

/* -----------------------------------------
   INDIVIDUAL DECOR — SINGLE IMAGE
   ----------------------------------------- */

if (
    currentViewerMode ===
    "individual"
) {

    /* -----------------------------------------
       SINGLE IMAGE ONLY
       ----------------------------------------- */

    currentViewerImages =
        requestedImage?.url
            ? [requestedImage]
            : [];

    currentViewerContext = 0;
    currentImageIndex = 0;


    /* -----------------------------------------
       SHOW IMAGE TAGS INSTEAD OF PROJECT INFO
       ----------------------------------------- */

    const imageTags =
        getImageTags(
            requestedImage
        );

    const tagLabels = [];

    imageTags.forEach(tag => {

        if (
            !tag?.category ||
            INDIVIDUAL_DECOR_EXCLUDED_CATEGORIES.includes(
                tag.category
            )
        ) {
            return;
        }


        /* Image category */

        tagLabels.push(
            prettyImageTag(
                tag.category
            )
        );


        /* All subcategories */

        (
            tag.subcategories || []
        ).forEach(subcategory => {

            tagLabels.push(
                prettyImageTag(
                    subcategory
                )
            );

        });

    });


    const tagsText =
        tagLabels
            .filter(Boolean)
            .join(" · ");


    /*
     * Replace project title with
     * the image's complete tag list.
     */

    setText(
        "modalTitle",
        tagsText || "Individual Decor"
    );


    /*
     * Clear project-specific values.
     */

    setText(
        "modalDescription",
        ""
    );

    setText(
        "modalWorkType",
        ""
    );

    setText(
        "modalLocation",
        ""
    );

    setText(
        "modalArea",
        ""
    );

    setText(
        "modalYear",
        ""
    );

    setText(
        "modalStatus",
        ""
    );


    /*
     * Hide project-detail rows.
     */

    const detailIds = [
        "modalDescription",
        "modalWorkType",
        "modalLocation",
        "modalArea",
        "modalYear",
        "modalStatus"
    ];


    detailIds.forEach(id => {

        const element =
            document.getElementById(id);

        const row =
            element?.closest("p");

        if (row) {

            row.style.display =
                "none";

        }

    });

} else {

    /* -----------------------------------------
       NORMAL PROJECT VIEWER
       ----------------------------------------- */
/* -----------------------------------------
   RESTORE PROJECT DETAIL ROWS
   ----------------------------------------- */

const detailIds = [
    "modalDescription",
    "modalWorkType",
    "modalLocation",
    "modalArea",
    "modalYear",
    "modalStatus"
];


detailIds.forEach(id => {

    const element =
        document.getElementById(id);

    const row =
        element?.closest("p");

    if (row) {
        row.style.display = "";
    }

});
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

}
   if (
    currentViewerMode !==
    "individual"
) {

    const firstSet =
        viewerSets(project)
            .sets[
                currentViewerContext
            ] || [];


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

}


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

/* =========================================================
   KEYBOARD NAVIGATION
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /* -----------------------------------------
           FULLSCREEN IMAGE VIEWER
           ----------------------------------------- */

        if (
            fullscreenViewer?.classList.contains(
                "show"
            )
        ) {

            if (
                event.key === "ArrowLeft"
            ) {

                event.preventDefault();
                event.stopPropagation();

                moveFullscreenImage(-1);

                return;
            }


            if (
                event.key === "ArrowRight"
            ) {

                event.preventDefault();
                event.stopPropagation();

                moveFullscreenImage(1);

                return;
            }


            if (
                event.key === "Escape"
            ) {

                event.preventDefault();
                event.stopPropagation();

                closeFullscreenImage();

                return;
            }


            return;
        }


        /* -----------------------------------------
           NORMAL PROJECT VIEWER
           ----------------------------------------- */

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
            event.key === "ArrowLeft"
        ) {

            event.preventDefault();

            moveImage(-1);

            return;
        }


        if (
            event.key === "ArrowRight"
        ) {

            event.preventDefault();

            moveImage(1);

            return;
        }


        if (
            event.key === "Escape"
        ) {

            event.preventDefault();

            closeModal();

            return;
        }

    }
);


/* =========================================================
   LOAD PROJECTS FROM FIRESTORE
   ========================================================= */

async function loadPortfolio() {

    /*
     * -----------------------------------------------------
     * 1. TRY CACHE FIRST
     * -----------------------------------------------------
     */

    const cachedProjects =
        readPortfolioCache();

    let sharedProjectOpened =
        false;


    /*
     * -----------------------------------------------------
     * 2. SHOW CACHED CONTENT IMMEDIATELY
     * -----------------------------------------------------
     */

    if (
        Array.isArray(
            cachedProjects
        ) &&
        cachedProjects.length
    ) {

        allProjects =
            cachedProjects;

        renderLoadedPortfolio();

        sharedProjectOpened =
            tryOpenSharedProject();

    } else {

        /*
         * No cache:
         * show the normal skeleton while
         * Firebase loads for the first time.
         */

        showSkeleton();

    }


    /*
     * -----------------------------------------------------
     * 3. REFRESH FROM FIREBASE
     * -----------------------------------------------------
     *
     * This runs even when cached data was
     * displayed, so the site does not stay stale.
     */

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "projects"
                )
            );


        const freshProjects =
            snapshot.docs.map(
                documentSnapshot => ({
                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()
                })
            );


        /*
         * -------------------------------------------------
         * 4. UPDATE MEMORY + CACHE
         * -------------------------------------------------
         */

        allProjects =
            freshProjects;

        writePortfolioCache(
            freshProjects
        );


        /*
         * -------------------------------------------------
         * 5. REFRESH THE GRID
         * -------------------------------------------------
         */

        renderLoadedPortfolio();


        /*
         * -------------------------------------------------
         * 6. OPEN SHARED PROJECT URL
         * -------------------------------------------------
         */

        if (
            !sharedProjectOpened
        ) {

            tryOpenSharedProject();

        }

    } catch (error) {

        console.error(
            "Error loading portfolio:",
            error
        );


        /*
         * If cached data already exists,
         * keep showing it instead of replacing
         * the page with an error.
         */

        if (
            Array.isArray(
                cachedProjects
            ) &&
            cachedProjects.length
        ) {

            console.warn(
                "Using cached portfolio because Firebase refresh failed."
            );

            return;
        }


        const grid =
            getPortfolioGrid();

        if (grid) {

            grid.innerHTML = `
                <p class="portfolio-empty">
                    Unable to load portfolio.
                    Please try again.
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

//     document.addEventListener(
//         "keydown",
//         event => {

//            if (
//     event.key ===
//     "Escape"
// ) {

//     /*
//      * If fullscreen image is open,
//      * ESC first returns to the normal
//      * project image container.
//      */

//     if (
//         fullscreenViewer?.classList.contains(
//             "show"
//         )
//     ) {

//         closeFullscreenImage();

//         return;

//     }


//     closeModal();

//     return;
// }


//             const modal =
//                 document.getElementById(
//                     "projectModal"
//                 );


//             if (
//                 !modal?.classList.contains(
//                     "show"
//                 )
//             ) {
//                 return;
//             }


//             if (
//                 event.key ===
//                 "ArrowLeft"
//             ) {

//                 moveImage(-1);

//             }


//             if (
//                 event.key ===
//                 "ArrowRight"
//             ) {

//                 moveImage(1);

//             }

//         }
//     );


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