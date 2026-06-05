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

    deleteDoc

}
from
"https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


import { db }
from "./firebase.js";



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
const previewGrid =
document.getElementById(
    "previewGrid"
);

for (
    let i = 1;
    i <= 6;
    i++
) {

    const input =
    document.getElementById(
        `view${i}`
    );

    input.addEventListener(
        "change",
        e => {

            const file =
            e.target.files[0];

            if (!file)
                return;

            const reader =
            new FileReader();

            reader.onload =
            function() {

                const img =
                document.createElement(
                    "img"
                );

                img.src =
                reader.result;

                previewGrid.appendChild(
                    img
                );

            };

            reader.readAsDataURL(
                file
            );

        }
    );

}

const saveProjectBtn =
document.getElementById(
    "saveProject"
);


saveProjectBtn?.addEventListener(
    "click",
    saveProject
);
let editingProjectId = null;
async function saveProject() {

    try {

        saveProjectBtn.disabled = true;

        saveProjectBtn.textContent =
        "Uploading...";

        progressFill.style.width =
        "0%";

        progressPercent.textContent =
        "0%";

        progressText.textContent =
        "Preparing Upload...";

        const title =
        document.getElementById(
            "projectTitle"
        ).value;

        const description =
        document.getElementById(
            "projectDescription"
        ).value;

        const location =
        document.getElementById(
            "projectLocation"
        ).value;

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

        let images = [];

        let totalFiles = 0;

        for (
            let i = 1;
            i <= 6;
            i++
        ) {

            const file =
            document.getElementById(
                `view${i}`
            ).files[0];

            if (file)
                totalFiles++;

        }

       if (
    totalFiles === 0 &&
    !editingProjectId
) {

    alert(
        "Please upload at least one image."
    );

    saveProjectBtn.disabled =
    false;

    saveProjectBtn.textContent =
    "Save Project";

    return;

}

        let uploaded = 0;

        for (
            let i = 1;
            i <= 6;
            i++
        ) {

            const file =
            document.getElementById(
                `view${i}`
            ).files[0];

            if (!file)
                continue;

            const category =
            document.getElementById(
                `category${i}`
            ).value;
            if (!category) {

    alert(
        `Please select category for View ${i}`
    );

    saveProjectBtn.disabled =
    false;

    saveProjectBtn.textContent =
    "Save Project";

    return;

}
            progressText.textContent =
            `Uploading image ${uploaded + 1} of ${totalFiles}`;

            const storageRef =
            ref(
                storage,
                `projects/${Date.now()}-${file.name}`
            );

            await uploadBytes(
                storageRef,
                file
            );

            const url =
            await getDownloadURL(
                storageRef
            );

            uploaded++;

            const percent =
            Math.round(
                (
                    uploaded /
                    totalFiles
                ) * 100
            );

            progressFill.style.width =
            percent + "%";

            progressPercent.textContent =
            percent + "%";

            images.push({

    url,

    path:
    storageRef.fullPath,

    category

});
console.log(
    "Current Images Array:",
    images
);
        }

        progressText.textContent =
        "Saving Project Details...";
        console.log(
    "Final Images Array:",
    images
);
if (
    editingProjectId
) {

    const existingProject =
    await getDoc(

        doc(
            db,
            "projects",
            editingProjectId
        )

    );

    const existingImages =
    existingProject.data()
    .images || [];

    if (
        images.length > 0
    ) {

        images.unshift(
            ...existingImages
        );

    }
    else {

        images.push(
            ...existingImages
        );

    }

}

        const projectData = {

    title,

    description,

    location,

    area,

    year,

    status,

    images

};

if (
    editingProjectId
) {

    await updateDoc(

        doc(
            db,
            "projects",
            editingProjectId
        ),

        projectData

    );

}
else {
    console.log(
    "Project Data Being Saved:",
    projectData
);
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

}
        loadProjects();
        progressFill.style.width =
        "100%";

        progressPercent.textContent =
        "100%";

        progressText.textContent =
        "Project Saved Successfully ✓";

         editingProjectId =
null;
/* Reset Form */

document.getElementById(
    "projectTitle"
).value = "";

document.getElementById(
    "projectDescription"
).value = "";

document.getElementById(
    "projectLocation"
).value = "";

document.getElementById(
    "projectArea"
).value = "";

document.getElementById(
    "projectYear"
).value = "";

document.getElementById(
    "projectStatus"
).value = "";






    document.getElementById(
    "existingImages"
).innerHTML = "";

if (previewGrid) {

    previewGrid.innerHTML = "";

}for (
    let i = 1;
    i <= 6;
    i++
) {

    const fileInput =
    document.getElementById(
        `view${i}`
    );

    if (fileInput) {

        fileInput.value = "";

    }

}

for (
    let i = 1;
    i <= 6;
    i++
) {

    const category =
    document.getElementById(
        `category${i}`
    );

    if (category) {

        category.selectedIndex = 0;

    }

}

        document.querySelector(
    "#projectManagement h2"
).textContent =
"Project Management";

        saveProjectBtn.disabled =
        false;

        saveProjectBtn.textContent =
        "Save Project";

        setTimeout(() => {

            progressFill.style.width =
            "0%";

            progressPercent.textContent =
            "0%";

            progressText.textContent =
            "Ready";

        }, 3000);

    }

    catch (error) {

        console.error(
            error
        );

        progressText.textContent =
        "Upload Failed";

        saveProjectBtn.disabled =
        false;

       

saveProjectBtn.textContent =
"Save Project";

        alert(
            error.message
        );

    }

}

async function loadProjects() {

    const projectsList =
    document.getElementById(
        "projectsList"
    );

    projectsList.innerHTML =
    "Loading...";

    const snapshot =
    await getDocs(

        collection(
            db,
            "projects"
        )

    );

    let html = "";

    snapshot.forEach(docItem => {

        const project =
        docItem.data();

        html += `

        <div class="project-row">

            <div class="project-info">

                <h4>
                    ${project.title}
                </h4>

                <p>
                    ${project.location}
                </p>

            </div>

            <div class="project-actions">

                <button
    class="edit-btn"
    onclick="editProject('${docItem.id}')">

    Edit

</button>

                <button
                    class="delete-btn"
                    onclick="deleteProject('${docItem.id}')">

                    Delete

                </button>

            </div>

        </div>

        `;

    });

    if (!html) {

        html =
        "<p>No Projects Found</p>";

    }

    projectsList.innerHTML =
    html;

}
window.deleteProject =
async function(id) {

    const confirmDelete =
    confirm(
        "Delete this project?"
    );

    if (
        !confirmDelete
    ) return;

    try {

        const projectRef =
        doc(
            db,
            "projects",
            id
        );

        const snapshot =
        await getDoc(
            projectRef
        );

        if (
            snapshot.exists()
        ) {

            const project =
            snapshot.data();

            if (
                project.images &&
                project.images.length
            ) {

                for (
                    const image
                    of project.images
                ) {

                    if (
                        image.path
                    ) {

                        try {

                            await deleteObject(

                                ref(
                                    storage,
                                    image.path
                                )

                            );

                        }
                        catch(error) {

                            console.log(
                                "Image already missing:",
                                image.path
                            );

                        }

                    }

                }

            }

        }

        await deleteDoc(
            projectRef
        );

        alert(
            "Project Deleted Successfully"
        );

        loadProjects();
        loadDashboardStats();
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
window.editProject =
async function(id) {
    document.querySelector(
    "#projectManagement h2"
).textContent =
"Editing Project";
    const projectRef =
    doc(
        db,
        "projects",
        id
    );

    const snapshot =
    await getDoc(
        projectRef
    );

    if (
        !snapshot.exists()
    ) return;

    const project =
    snapshot.data();
    const existingImages =
document.getElementById(
    "existingImages"
);

existingImages.innerHTML = "";

if (
    project.images &&
    project.images.length
) {

    project.images.forEach(

        (image,index) => {

            existingImages.innerHTML += `

<div class="existing-image-card">

    <img
        src="${image.url}"
        alt="">

    <div
        class="existing-image-info">

        <h4>

            View ${index + 1}

        </h4>

        <p>

            ${image.category}

        </p>

        <div
            class="image-actions">

            <button
                class="replace-image-btn"
                onclick="replaceImage(
                    '${id}',
                    ${index}
                )">

                Replace

            </button>

            <button
                class="delete-image-btn"
                onclick="deleteImage(
                    '${id}',
                    ${index}
                )">

                Delete

            </button>

        </div>

    </div>

</div>
`;

        }

    );

}
    editingProjectId =
    id;

    document.getElementById(
        "projectTitle"
    ).value =
    project.title || "";

    document.getElementById(
        "projectDescription"
    ).value =
    project.description || "";

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


};window.deleteImage =
async function(
    projectId,
    imageIndex
) {

    const confirmDelete =
    confirm(
        "Delete this image?"
    );

    if (
        !confirmDelete
    ) return;

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

    const project =
    snapshot.data();

    const image =
    project.images[
        imageIndex
    ];

    if (
        image.path
    ) {

        try {

            const storageImageRef =
            ref(
                storage,
                image.path
            );

            await deleteObject(
                storageImageRef
            );

        }
        catch(error) {

            console.log(
                "Old image not found"
            );

        }

    }

    project.images.splice(
        imageIndex,
        1
    );

    await updateDoc(

        projectRef,

        {

            images:
            project.images

        }

    );

    editProject(
        projectId
    );

};
window.replaceImage =
async function(
    projectId,
    imageIndex
) {

    const picker =
    document.getElementById(
        "replaceImageInput"
    );

    picker.value = "";

    picker.onchange =
    async function(e) {

        const file =
        e.target.files[0];

        if (!file)
            return;

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

            const project =
            snapshot.data();

            const oldImage =
            project.images[
                imageIndex
            ];

            /* Delete old storage image */

            if (
                oldImage.path
            ) {

                try {

                    await deleteObject(

                        ref(
                            storage,
                            oldImage.path
                        )

                    );

                }
                catch(error) {

                    console.log(
                        "Old image already missing"
                    );

                }

            }

            /* Upload new image */

            const storageRef =
            ref(

                storage,

                `projects/${Date.now()}-${file.name}`

            );
            progressFill.style.width =
"0%";

progressPercent.textContent =
"0%";

progressText.textContent =
"Starting Upload...";

           await new Promise(

    (resolve,reject) => {

        const uploadTask =
        uploadBytesResumable(

            storageRef,

            file

        );

        uploadTask.on(

            "state_changed",

            snapshot => {

                const percent =
                Math.round(

                    (
                        snapshot.bytesTransferred /

                        snapshot.totalBytes

                    ) * 100

                );

                progressFill.style.width =
                percent + "%";

                progressPercent.textContent =
                percent + "%";

                progressText.textContent =
                `Replacing Image... ${percent}%`;

            },

            error => {

                reject(error);

            },

            () => {

                resolve();

            }

        );

    }

);

            const url =
            await getDownloadURL(

                storageRef

            );

            project.images[
                imageIndex
            ] = {

                url,

                path:
                storageRef.fullPath,

                category:
                oldImage.category

            };

            await updateDoc(

                projectRef,

                {

                    images:
                    project.images

                }

            );

            progressFill.style.width =
"100%";

progressPercent.textContent =
"100%";

progressText.textContent =
"Image Replaced Successfully ✓";

            editProject(
                projectId
            );

            progressFill.style.width =
"100%";

progressPercent.textContent =
"100%";

progressText.textContent =
"Image Replaced Successfully ✓";

alert(
    "Image Replaced Successfully"
);

setTimeout(() => {

    progressFill.style.width =
    "0%";

    progressPercent.textContent =
    "0%";

    progressText.textContent =
    "Ready";

}, 2500);

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

loadProjects();

loadDashboardStats();