import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";


/* =========================
   FORM ELEMENTS
========================= */

const form = document.getElementById("contactForm");
const whatsappBtn = document.getElementById("whatsappBtn");
const emailBtn = document.getElementById("emailBtn");
const formStatus = document.getElementById("formStatus");


/* =========================
   GET FORM DATA
========================= */

function getFormData() {

    return {
        name: document.getElementById("leadName").value.trim(),

        phone: document.getElementById("leadPhone").value.trim(),

        email: document.getElementById("leadEmail").value.trim(),

        city: document.getElementById("leadCity").value.trim(),

        service: document.getElementById("leadService").value.trim(),

        projectBrief: document
            .getElementById("leadMessage")
            .value
            .trim()
    };
}


/* =========================
   CLEAR ERRORS
========================= */

function clearErrors() {

    const errorIds = [
        "nameError",
        "phoneError",
        "emailError",
        "cityError",
        "serviceError",
        "messageError"
    ];

    errorIds.forEach(id => {

        const element = document.getElementById(id);

        if (element) {
            element.textContent = "";
        }

    });

}


/* =========================
   VALIDATE FORM
========================= */

function validateForm(data) {

    clearErrors();

    let valid = true;


    /* NAME */

    if (!data.name) {

        document.getElementById("nameError").textContent =
            "Please enter your full name.";

        valid = false;

    } else if (
        data.name.length < 2 ||
        data.name.length > 60 ||
        !/^[A-Za-zÀ-ÿ.' -]+$/.test(data.name)
    ) {

        document.getElementById("nameError").textContent =
            "Please enter a valid name.";

        valid = false;

    }


    /* PHONE */

    if (!data.phone) {

        document.getElementById("phoneError").textContent =
            "Please enter your phone number.";

        valid = false;

    } else if (
        !/^(?:\+91|91|0)?[6-9]\d{9}$/.test(
            data.phone.replace(/[\s-]/g, "")
        )
    ) {

        document.getElementById("phoneError").textContent =
            "Please enter a valid Indian mobile number.";

        valid = false;

    }


    /* EMAIL - OPTIONAL */

    if (
        data.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)
    ) {

        document.getElementById("emailError").textContent =
            "Please enter a valid email address.";

        valid = false;

    }


    /* CITY */

    if (!data.city) {

        document.getElementById("cityError").textContent =
            "Please enter your city.";

        valid = false;

    } else if (
        data.city.length < 2 ||
        data.city.length > 60 ||
        !/^[A-Za-zÀ-ÿ.' -]+$/.test(data.city)
    ) {

        document.getElementById("cityError").textContent =
            "Please enter a valid city.";

        valid = false;

    }


    /* SERVICE */

    if (!data.service) {

        document.getElementById("serviceError").textContent =
            "Please select a service.";

        valid = false;

    }


    /* PROJECT BRIEF - OPTIONAL */

    if (data.projectBrief.length > 1000) {

        document.getElementById("messageError").textContent =
            "Project brief must be 1000 characters or less.";

        valid = false;

    }


    return valid;
}


/* =========================
   STATUS MESSAGE
========================= */

function showStatus(message, type = "") {

    if (!formStatus) return;

    formStatus.textContent = message;

    formStatus.className = "form-status";

    if (type) {
        formStatus.classList.add(type);
    }
}


/* =========================
   SAVE LEAD TO FIRESTORE
========================= */

async function saveLead(source, data) {

    const leadData = {

        name: data.name,

        phone: data.phone,

        email: data.email,

        city: data.city,

        service: data.service,

        projectBrief: data.projectBrief,

        source: source,

        status: "New",

        notes: "",

        createdAt: serverTimestamp()

    };


    const docRef = await addDoc(
        collection(db, "leads"),
        leadData
    );


    console.log(
        `${source} lead saved to Firestore:`,
        docRef.id
    );


    return docRef;
}


/* =========================
   SET BUTTON LOADING STATE
========================= */

function setLoading(button, loading, text) {

    if (!button) return;

    button.disabled = loading;

    if (loading) {

        button.dataset.originalText =
            button.textContent;

        button.textContent = text;

    } else {

        button.textContent =
            button.dataset.originalText || text;

    }

}


/* =========================
   WHATSAPP BUTTON
========================= */

if (whatsappBtn) {

    whatsappBtn.addEventListener("click", async () => {

        const data = getFormData();


        /* VALIDATE */

        if (!validateForm(data)) {

            showStatus(
                "Please correct the highlighted fields.",
                "error"
            );

            return;

        }


        try {

            setLoading(
                whatsappBtn,
                true,
                "Saving..."
            );


            /*
             * SAVE TO FIRESTORE FIRST
             */

            await saveLead(
                "WhatsApp",
                data
            );


            /*
             * BUILD WHATSAPP MESSAGE
             */

            const text = encodeURIComponent(
`*New Enquiry — swastikadnc.com*

*Name:* ${data.name}
*Phone:* ${data.phone}
*Email:* ${data.email || "Not provided"}
*City:* ${data.city}
*Service:* ${data.service}
*Brief:* ${data.projectBrief || "Not provided"}`
            );


            /*
             * OPEN WHATSAPP
             */

            window.open(
                `https://wa.me/917007070068?text=${text}`,
                "_blank"
            );


            showStatus(
                "Your enquiry has been saved. Opening WhatsApp...",
                "success"
            );


        } catch (error) {

            console.error(
                "WhatsApp lead submission error:",
                error
            );


            showStatus(
                "Unable to save your enquiry. Please try again.",
                "error"
            );


        } finally {

            setLoading(
                whatsappBtn,
                false,
                "Ask on WhatsApp"
            );

        }

    });

}


/* =========================
   EMAIL BUTTON
========================= */

/*
 * Capture the submit event before other submit
 * handlers such as main.js can process it.
 */


/* =========================
   EMAIL BUTTON
========================= */

if (form) {

    form.addEventListener("submit", async (event) => {

        event.preventDefault();
        event.stopImmediatePropagation();

        const data = getFormData();

        /* VALIDATE */
        if (!validateForm(data)) {

            showStatus(
                "Please correct the highlighted fields.",
                "error"
            );

            return;
        }

        try {

            /* SHOW LOADING */
            setLoading(
                emailBtn,
                true,
                "Sending..."
            );

            /*
             * STEP 1
             * SAVE EMAIL ENQUIRY TO FIRESTORE
             */
            await saveLead(
                "Email",
                data
            );

            /*
             * STEP 2
             * SUBMIT TO FORMSUBMIT
             *
             * We create a separate temporary form so that
             * Firebase and FormSubmit remain completely independent.
             */

            const emailForm = document.createElement("form");

            emailForm.method = "POST";
            emailForm.action = form.action;
            emailForm.target = "_blank";
            emailForm.style.display = "none";

            /*
             * FormSubmit settings
             */
            const fields = {

                "_subject":
                    "New Project Enquiry - Swastika Design & Constructions",

                "_template":
                    "table",

                "_captcha":
                    "true",

                "Full Name":
                    data.name,

                "Phone Number":
                    data.phone,

                "Email Address":
                    data.email,

                "City":
                    data.city,

                "Service Required":
                    data.service,

                "Project Brief":
                    data.projectBrief
            };

            /*
             * Add fields to temporary form
             */
            Object.entries(fields).forEach(
                ([name, value]) => {

                    const input =
                        document.createElement("input");

                    input.type = "hidden";
                    input.name = name;
                    input.value = value || "";

                    emailForm.appendChild(input);
                }
            );

            /*
             * Submit to FormSubmit
             */
            document.body.appendChild(emailForm);

            emailForm.submit();

            /*
             * Remove temporary form
             */
            setTimeout(() => {
                emailForm.remove();
            }, 1000);

            /*
             * SUCCESS MESSAGE
             */
            showStatus(
                "Your enquiry has been sent successfully.",
                "success"
            );

            /*
             * CLEAR FORM
             */
            form.reset();

        } catch (error) {

            console.error(
                "Email lead submission error:",
                error
            );

            showStatus(
                "Unable to send your enquiry. Please try again.",
                "error"
            );

        } finally {

            setLoading(
                emailBtn,
                false,
                "Email Us"
            );

        }

    }, true);

}




/* =========================
   LIVE ERROR CLEANUP
========================= */

const fields = [
    "leadName",
    "leadPhone",
    "leadEmail",
    "leadCity",
    "leadService",
    "leadMessage"
];


fields.forEach(id => {

    const field = document.getElementById(id);

    if (!field) return;


    field.addEventListener("input", () => {

        const errorMap = {

            leadName: "nameError",

            leadPhone: "phoneError",

            leadEmail: "emailError",

            leadCity: "cityError",

            leadService: "serviceError",

            leadMessage: "messageError"

        };


        const errorElement =
            document.getElementById(
                errorMap[id]
            );


        if (errorElement) {
            errorElement.textContent = "";
        }


        if (formStatus) {

            formStatus.textContent = "";

            formStatus.className =
                "form-status";

        }

    });

});


/* =========================
   PREVENT DOUBLE CLICK
========================= */

let submissionInProgress = false;

function preventDoubleSubmission(button) {

    if (!button) return;


    button.addEventListener("click", () => {

        if (submissionInProgress) {

            return;

        }

        submissionInProgress = true;


        setTimeout(() => {

            submissionInProgress = false;

        }, 3000);

    });

}


preventDoubleSubmission(whatsappBtn);
preventDoubleSubmission(emailBtn);