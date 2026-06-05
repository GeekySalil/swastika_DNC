import { db }
from "./firebase.js";

import {

    collection,

    getDocs

}
from
"https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const portfolioGrid =
document.getElementById(
    "portfolioGrid"
);

let allProjects = [];
let currentProject = null;

let currentImageIndex = 0;
function showPortfolioSkeleton() {

    portfolioGrid.innerHTML = "";

    for (
        let i = 0;
        i < 6;
        i++
    ) {

        portfolioGrid.innerHTML += `

        <div
            class="portfolio-skeleton">

            <div
                class="skeleton-image">

            </div>

            <div
                class="skeleton-content">

                <div
                    class="skeleton-line">

                </div>

                <div
                    class="skeleton-line short">

                </div>

            </div>

        </div>

        `;

    }

}
async function loadPortfolio() {
    showPortfolioSkeleton();

    const snapshot =
    await getDocs(

        collection(
            db,
            "projects"
        )

    );

    allProjects = [];

    snapshot.forEach(doc => {

        allProjects.push({

            id: doc.id,

            ...doc.data()

        });

    });

    renderProjects(
        "all"
    );

}

function renderProjects(
    filter
) {

    portfolioGrid.innerHTML =
    "";

    if (
        filter === "all"
    ) {

        allProjects.forEach(
            project => {

                const thumbnail =
                project.images?.[0]?.url ||
                "";

                portfolioGrid.innerHTML += `

                <div class="portfolio-card">

                    <img
                        src="${thumbnail}"
                        alt="${project.title}">

                    <div class="portfolio-overlay">

                        <span>

                            ${project.status}

                        </span>

                        <h3>

                            ${project.title}

                        </h3>

                        <p>

                            ${project.location}

                        </p>

                        <button
                            class="view-project-btn"
                            onclick="openProjectModal('${project.id}')">

                            View Project

                        </button>

                    </div>

                </div>

                `;

            }
        );

        return;

    }

    allProjects.forEach(
        project => {

            project.images?.forEach(
                image => {

                    if (
                        image.category === filter
                    ) {

                        portfolioGrid.innerHTML += `

                        <div class="portfolio-card">

                            <img
                                src="${image.url}"
                                alt="">

                            <div class="portfolio-overlay">

                                <span>

                                    ${image.category}

                                </span>

                                <h3>

                                    ${project.title}

                                </h3>

                            </div>

                        </div>

                        `;

                    }

                }
            );

        }
    );

}

document
.querySelectorAll(
    ".portfolio-filters button"
)
.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                document
                .querySelector(
                    ".portfolio-filters .active"
                )
                ?.classList.remove(
                    "active"
                );

                button.classList.add(
                    "active"
                );

                renderProjects(

                    button.dataset.filter

                );

            }
        );

    }
);

loadPortfolio();

window.openProjectModal =
function(projectId) {

    const project =
    allProjects.find(

        p =>
        p.id ===
        projectId

    );

    if (!project)
        return;

    document.getElementById(
        "modalTitle"
    ).textContent =
    project.title;

    document.getElementById(
        "modalLocation"
    ).textContent =
    project.location;

    document.getElementById(
        "modalArea"
    ).textContent =
    project.area;

    document.getElementById(
        "modalYear"
    ).textContent =
    project.year;

    document.getElementById(
        "modalStatus"
    ).textContent =
    project.status;

    currentProject =
project;

currentImageIndex =
0;

document.getElementById(
    "modalMainImage"
).src =
project.images[0].url;

    const thumbs =
    document.getElementById(
        "modalThumbnails"
    );

    thumbs.innerHTML =
    "";

    project.images.forEach(
    (image,index) => {

        thumbs.innerHTML += `

        <img

            class="${
                index === 0
                ? 'active'
                : ''
            }"

            src="${image.url}"

            onclick="changeModalImage(this,'${image.url}')">

        `;

    }
);
window.changeModalImage =
function(
    element,
    imageUrl
) {

    document.getElementById(
        "modalMainImage"
    ).src =
    imageUrl;

    document
    .querySelectorAll(
        ".modal-thumbnails img"
    )
    .forEach(img => {

        img.classList.remove(
            "active"
        );

    });

    element.classList.add(
        "active"
    );

};

    document.getElementById(
        "projectModal"
    ).classList.add(
        "show"
    );

};
document
.getElementById(
    "closeModal"
)
.addEventListener(
    "click",
    () => {

        document
        .getElementById(
            "projectModal"
        )
        .classList.remove(
            "show"
        );

    }
);

function updateModalImage() {

    const image =
    currentProject.images[
        currentImageIndex
    ];

    document.getElementById(
        "modalMainImage"
    ).src =
    image.url;

    const thumbs =
    document.querySelectorAll(
        ".modal-thumbnails img"
    );

    thumbs.forEach(
        thumb =>
        thumb.classList.remove(
            "active"
        )
    );

    if (
        thumbs[
            currentImageIndex
        ]
    ) {

        thumbs[
            currentImageIndex
        ].classList.add(
            "active"
        );

    }

}
document
.getElementById(
    "prevImageBtn"
)
.addEventListener(
    "click",
    () => {

        if (
            !currentProject
        ) return;

        currentImageIndex--;

        if (
            currentImageIndex < 0
        ) {

            currentImageIndex =
            currentProject.images.length - 1;

        }

        updateModalImage();

    }
);

document
.getElementById(
    "nextImageBtn"
)
.addEventListener(
    "click",
    () => {

        if (
            !currentProject
        ) return;

        currentImageIndex++;

        if (
            currentImageIndex >=
            currentProject.images.length
        ) {

            currentImageIndex = 0;

        }

        updateModalImage();

    }
);

document
.getElementById(
    "projectModal"
)
.addEventListener(
    "click",
    (e) => {

        if (

            e.target.id ===
            "projectModal"

        ) {

            document
            .getElementById(
                "projectModal"
            )
            .classList.remove(
                "show"
            );

        }

    }
);

document
.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key === "Escape"
        ) {

            document
            .getElementById(
                "projectModal"
            )
            .classList.remove(
                "show"
            );

        }

    }
);