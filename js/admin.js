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

    deleteDoc

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
let currentLeadId = null;
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