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
const previewGrid = document.getElementById("previewGrid");
const saveProjectBtn = document.getElementById("saveProject");
let editingProjectId = null;

const INDIVIDUAL_SUBCATEGORIES = [
    "All Rooms", "Bedroom TV Unit", "Bedroom", "Ceiling", "Corridor", "Lounge", "Reception", "DP Shop", "Drawing", "Wardrobe", "Kitchen", "Living", "Living-Dining", "Living-Pooja", "Living-TV Unit", "Living-Vanity", "Living Room", "Main Door", "Office", "Office Ceiling", "Office Chair", "Office Toilet", "Porch Ceiling", "Temple", "Bathroom", "TV Unit", "Lift Lobby", "PG Room", "Double Height Living", "Living Ceiling", "Reception Pooja", "Staircase"
];
const IMAGE_CATEGORIES = ["Design + Build", "Interiors", "Elevation"];

function resetProjectForm() {
    ["projectTitle","projectDescription","projectLocation","projectArea","projectYear"].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = "";
    });
    ["projectCategory","projectSubcategory","projectWorkType","projectStatus"].forEach(id => {
        const el = document.getElementById(id); if (el) el.selectedIndex = 0;
    });
    const falseRadio = document.querySelector('input[name="projectFeatured"][value="false"]');
    if (falseRadio) falseRadio.checked = true;
    document.getElementById("existingImages").innerHTML = "";
    if (previewGrid) previewGrid.innerHTML = "";
    for (let i=1;i<=6;i++) {
        const file=document.getElementById(`view${i}`); if(file) file.value="";
        const cat=document.getElementById(`category${i}`); if(cat) cat.selectedIndex=0;
        const sub=document.getElementById(`subcategory${i}`); if(sub) sub.selectedIndex=0;
    }
}

function setFeaturedValue(value) {
    const radio=document.querySelector(`input[name="projectFeatured"][value="${value ? "true" : "false"}"]`);
    if(radio) radio.checked=true;
}

async function getFeaturedCount(excludeId=null) {
    const snapshot = await getDocs(query(collection(db,"projects"), where("featured","==",true)));
    return snapshot.docs.filter(item => item.id !== excludeId).length;
}

async function validateFeatured(featured, excludeId=null) {
    if (!featured) return true;
    const count = await getFeaturedCount(excludeId);
    if (count >= 6) {
        alert("Already 6 projects exist as featured, remove one to add this.");
        return false;
    }
    return true;
}

for (let i=1;i<=6;i++) {
    const input=document.getElementById(`view${i}`);
    input?.addEventListener("change", e => {
        const file=e.target.files[0]; if(!file) return;
        const reader=new FileReader();
        reader.onload=()=>{
            const img=document.createElement("img"); img.src=reader.result; img.alt=`View ${i}`;
            previewGrid.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

saveProjectBtn?.addEventListener("click", saveProject);

async function saveProject() {
    try {
        saveProjectBtn.disabled=true; saveProjectBtn.textContent="Uploading...";
        progressFill.style.width="0%"; progressPercent.textContent="0%"; progressText.textContent="Preparing Upload...";

        const title=document.getElementById("projectTitle").value.trim();
        const description=document.getElementById("projectDescription").value.trim();
        const category=document.getElementById("projectCategory").value;
        const subcategory=document.getElementById("projectSubcategory").value;
        const workType=document.getElementById("projectWorkType").value;
        const location=document.getElementById("projectLocation").value.trim();
        const area=document.getElementById("projectArea").value;
        const year=document.getElementById("projectYear").value;
        const status=document.getElementById("projectStatus").value;
        const featured=document.querySelector('input[name="projectFeatured"]:checked')?.value === "true";

        if(!title || !category || !subcategory || !workType || !location || !year || !status){
            alert("Please fill all required project fields.");
            saveProjectBtn.disabled=false; saveProjectBtn.textContent=editingProjectId?"Update Project":"Save Project"; return;
        }
        if(!(await validateFeatured(featured, editingProjectId))) {
            saveProjectBtn.disabled=false; saveProjectBtn.textContent=editingProjectId?"Update Project":"Save Project"; return;
        }

        let newImages=[]; let totalFiles=0;
        for(let i=1;i<=6;i++){ if(document.getElementById(`view${i}`).files[0]) totalFiles++; }
        if(totalFiles===0 && !editingProjectId){
            alert("Please upload at least one image.");
            saveProjectBtn.disabled=false; saveProjectBtn.textContent="Save Project"; return;
        }
        let uploaded=0;
        for(let i=1;i<=6;i++){
            const file=document.getElementById(`view${i}`).files[0]; if(!file) continue;
            const imageCategory=document.getElementById(`category${i}`).value;
            const imageSubcategory=document.getElementById(`subcategory${i}`).value;
            if(!imageCategory || !imageSubcategory){
                alert(`Please select category and subcategory for View ${i}`);
                saveProjectBtn.disabled=false; saveProjectBtn.textContent=editingProjectId?"Update Project":"Save Project"; return;
            }
            progressText.textContent=`Uploading image ${uploaded+1} of ${totalFiles}`;
            const storageRef=ref(storage,`projects/${Date.now()}-${i}-${file.name}`);
            await uploadBytes(storageRef,file);
            const url=await getDownloadURL(storageRef);
            uploaded++;
            const percent=Math.round((uploaded/totalFiles)*100);
            progressFill.style.width=percent+"%"; progressPercent.textContent=percent+"%";
            newImages.push({url,path:storageRef.fullPath,category:imageCategory,subcategory:imageSubcategory});
        }

      let images = newImages;
let createdAt = null;

if (editingProjectId) {

    const snap = await getDoc(
        doc(db, "projects", editingProjectId)
    );

    if (!snap.exists()) {
        throw new Error("Project no longer exists.");
    }

    const existing = snap.data();

    /*
     * IMPORTANT:
     * Keep the existing images FIRST.
     *
     * This preserves the original first image
     * as the project's permanent thumbnail.
     *
     * Newly uploaded images are added AFTER
     * all existing images.
     */
    images = [
        ...(existing.images || []),
        ...newImages
    ];

    createdAt = existing.createdAt || null;
}
        const projectData={title,description,category,subcategory,workType,location,area,year,status,featured,images};
        if(editingProjectId){
            await updateDoc(doc(db,"projects",editingProjectId),projectData);
        } else {
            await addDoc(collection(db,"projects"),{...projectData,createdAt:Timestamp.now()});
        }
        await loadProjects(); await loadDashboardStats();
        progressFill.style.width="100%"; progressPercent.textContent="100%"; progressText.textContent="Project Saved Successfully ✓";
        editingProjectId=null; resetProjectForm();
        document.querySelector("#projectManagement h2").textContent="Project Management";
        saveProjectBtn.disabled=false; saveProjectBtn.textContent="Save Project";
        setTimeout(()=>{progressFill.style.width="0%";progressPercent.textContent="0%";progressText.textContent="Ready";},2500);
    } catch(error){
        console.error(error); progressText.textContent="Upload Failed"; saveProjectBtn.disabled=false; saveProjectBtn.textContent=editingProjectId?"Update Project":"Save Project"; alert(error.message);
    }
}

async function loadProjects(){
    const projectsList=document.getElementById("projectsList"); projectsList.innerHTML="Loading...";
    const snapshot=await getDocs(collection(db,"projects")); let html="";
    snapshot.forEach(docItem=>{
        const p=docItem.data();
        html+=`<div class="project-row"><div class="project-info"><h4>${p.title||"Untitled"}</h4><p>${p.location||""} · ${p.category||""} · ${p.subcategory||""}${p.featured===true?" · Featured":""}</p></div><div class="project-actions"><button class="edit-btn" onclick="editProject('${docItem.id}')">Edit</button><button class="delete-btn" onclick="deleteProject('${docItem.id}')">Delete</button></div></div>`;
    });
    projectsList.innerHTML=html||"<p>No Projects Found</p>";
}

window.deleteProject=async function(id){
    if(!confirm("Delete this project?")) return;
    try{
        const projectRef=doc(db,"projects",id); const snapshot=await getDoc(projectRef);
        if(snapshot.exists()){
            const project=snapshot.data();
            for(const image of (project.images||[])) if(image.path){ try{await deleteObject(ref(storage,image.path));}catch(e){console.log("Image already missing:",image.path);} }
        }
        await deleteDoc(projectRef); alert("Project Deleted Successfully"); await loadProjects(); await loadDashboardStats();
    }catch(error){console.error(error);alert(error.message);}
};

function existingImageCard(projectId,image,index){
    const catOptions=IMAGE_CATEGORIES.map(v=>`<option value="${v}" ${image.category===v?"selected":""}>${v}</option>`).join("");
    const subOptions=INDIVIDUAL_SUBCATEGORIES.concat(["3D Render","Site Photos"]).filter((v,i,a)=>a.indexOf(v)===i).map(v=>`<option value="${v}" ${image.subcategory===v?"selected":""}>${v}</option>`).join("");
    return `<div class="existing-image-card"><img src="${image.url}" alt=""><div class="existing-image-info"><h4>View ${index+1}</h4><label>Category</label><select class="existing-image-category" data-index="${index}">${catOptions}</select><label>Subcategory</label><select class="existing-image-subcategory" data-index="${index}">${subOptions}</select><div class="image-actions"><button class="replace-image-btn" onclick="replaceImage('${projectId}',${index})">Replace</button><button class="delete-image-btn" onclick="deleteImage('${projectId}',${index})">Delete</button><button class="save-image-meta-btn" onclick="saveImageMeta('${projectId}',${index})">Save</button></div></div></div>`;
}

window.editProject=async function(id){
    document.querySelector("#projectManagement h2").textContent="Editing Project";
    const snapshot=await getDoc(doc(db,"projects",id)); if(!snapshot.exists()) return;
    const project=snapshot.data(); editingProjectId=id;
    document.getElementById("projectTitle").value=project.title||"";
    document.getElementById("projectDescription").value=project.description||"";
    document.getElementById("projectCategory").value=project.category||"";
    document.getElementById("projectSubcategory").value=project.subcategory||"";
    document.getElementById("projectWorkType").value=project.workType||"";
    document.getElementById("projectLocation").value=project.location||"";
    document.getElementById("projectArea").value=project.area||"";
    document.getElementById("projectYear").value=project.year||"";
    document.getElementById("projectStatus").value=project.status||"";
    setFeaturedValue(project.featured===true);
    const existing=document.getElementById("existingImages"); existing.innerHTML="";
    (project.images||[]).forEach((image,index)=> existing.insertAdjacentHTML("beforeend",existingImageCard(id,image,index)));
    saveProjectBtn.textContent="Update Project";
    document.getElementById("projectManagement").scrollIntoView({behavior:"smooth",block:"start"});
};

window.saveImageMeta=async function(projectId,index){
    try{
        const projectRef=doc(db,"projects",projectId); const snap=await getDoc(projectRef); if(!snap.exists()) return;
        const project=snap.data(); const card=document.querySelector(`.existing-image-card:nth-child(${index+1})`);
        if(!card) return;
        const category=card.querySelector(".existing-image-category").value;
        const subcategory=card.querySelector(".existing-image-subcategory").value;
        if(!category||!subcategory){alert("Please select both category and subcategory.");return;}
        project.images[index]={...project.images[index],category,subcategory};
        await updateDoc(projectRef,{images:project.images});
        alert("Image details saved successfully.");
        await editProject(projectId);
    }catch(error){console.error(error);alert(error.message);}
};

window.deleteImage=async function(projectId,imageIndex){
    if(!confirm("Delete this image?")) return;
    try{
        const projectRef=doc(db,"projects",projectId); const snapshot=await getDoc(projectRef); const project=snapshot.data(); const image=project.images[imageIndex];
        if(image?.path){try{await deleteObject(ref(storage,image.path));}catch(e){console.log("Old image not found");}}
        project.images.splice(imageIndex,1); await updateDoc(projectRef,{images:project.images}); await editProject(projectId);
    }catch(error){console.error(error);alert(error.message);}
};

window.replaceImage=async function(projectId,imageIndex){
    const picker=document.getElementById("replaceImageInput"); picker.value="";
    picker.onchange=async e=>{
        const file=e.target.files[0]; if(!file)return;
        try{
            const projectRef=doc(db,"projects",projectId); const snapshot=await getDoc(projectRef); const project=snapshot.data(); const oldImage=project.images[imageIndex];
            const storageRef=ref(storage,`projects/${Date.now()}-replace-${file.name}`);
            progressFill.style.width="0%";progressPercent.textContent="0%";progressText.textContent="Starting Upload...";
            const uploadTask=uploadBytesResumable(storageRef,file);
            await new Promise((resolve,reject)=>uploadTask.on("state_changed",snap=>{const p=Math.round((snap.bytesTransferred/snap.totalBytes)*100);progressFill.style.width=p+"%";progressPercent.textContent=p+"%";progressText.textContent=`Replacing Image... ${p}%`;},reject,resolve));
            const url=await getDownloadURL(storageRef);
            if(oldImage?.path){try{await deleteObject(ref(storage,oldImage.path));}catch(e){console.log("Old image already missing");}}
            project.images[imageIndex]={url,path:storageRef.fullPath,category:oldImage.category||"",subcategory:oldImage.subcategory||""};
            await updateDoc(projectRef,{images:project.images}); progressFill.style.width="100%";progressPercent.textContent="100%";progressText.textContent="Image Replaced Successfully ✓"; await editProject(projectId); alert("Image Replaced Successfully");
        }catch(error){console.error(error);alert(error.message);}
    }; picker.click();
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