import { db }
from "./firebase.js";

import {
    collection,
    addDoc,
    serverTimestamp
}
from
"https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

async function syncToGoogleSheets(
    leadData
) {

    try {

        await fetch(

            "https://script.google.com/macros/s/AKfycbw-sTFHcpa_iB8srCkNiY01MjvpnwTe1Qzqn126YSSgNVUHbFNNtJGe7cP6ArXA3WAQ/exec",

            {

                method: "POST",

                body:
                JSON.stringify(
                    leadData
                )

            }

        );

    }

    catch(error) {

        console.error(
            "Sheets Sync Failed",
            error
        );

    }

}

async function saveLead(source) {

    const name =
        document.getElementById(
            "leadName"
        ).value;

    const phone =
        document.getElementById(
            "leadPhone"
        ).value;

    const email =
        document.getElementById(
            "leadEmail"
        ).value;

    const city =
        document.getElementById(
            "leadCity"
        ).value;

    const service =
        document.getElementById(
            "leadService"
        ).value;

    const projectBrief =
        document.getElementById(
            "leadMessage"
        ).value;

    const leadData = {

    name,
    phone,
    email,
    city,
    service,
    projectBrief,
    source,

    status: "New",

    notes: "",

    createdAt: new Date().toISOString()

};

await addDoc(
    collection(db, "leads"),
    {
        ...leadData,

        createdAt:
        serverTimestamp()
    }
);

await syncToGoogleSheets(
    leadData
);


}

document
.getElementById("whatsappBtn")
.addEventListener(
    "click",
    async () => {

        try {

            await saveLead(
                "WhatsApp"
            );

            const name =
                document.getElementById(
                    "leadName"
                ).value;

            const phone =
                document.getElementById(
                    "leadPhone"
                ).value;

            const city =
                document.getElementById(
                    "leadCity"
                ).value;

            const service =
                document.getElementById(
                    "leadService"
                ).value;

            const brief =
                document.getElementById(
                    "leadMessage"
                ).value;

            const text =
                encodeURIComponent(

`Hello SDNC, New Lead Found:

Name: ${name}
Phone: ${phone}
City: ${city}
Service Required: ${service}

Project Brief:
${brief}`

                );

            window.open(

                `https://wa.me/917007070068?text=${text}`,

                "_blank"

            );

        }

        catch(error) {

            console.error(
                error
            );

        }

    }
);