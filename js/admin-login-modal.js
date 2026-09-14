/* =========================================================
   ADMIN LOGIN MODAL
========================================================= */

const adminLoginModal =
    document.getElementById("adminLoginModal");

const adminLoginBtn =
    document.getElementById("adminLoginBtn");

const closeAdminLogin =
    document.getElementById("closeAdminLogin");

const adminLoginOverlay =
    document.getElementById("adminLoginOverlay");

const backFromAdminLogin =
    document.getElementById("backFromAdminLogin");


/* =========================================================
   OPEN
========================================================= */

function openAdminLogin() {

    if (!adminLoginModal) {
        return;
    }

    adminLoginModal.classList.add("active");

    adminLoginModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

    setTimeout(
        () => {

            document
                .getElementById(
                    "adminLoginEmail"
                )
                ?.focus();

        },
        250
    );
}


/* =========================================================
   CLOSE
========================================================= */

function closeAdminLoginModal() {

    if (!adminLoginModal) {
        return;
    }

    adminLoginModal.classList.remove(
        "active"
    );

    adminLoginModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";
}


/* =========================================================
   ADMIN LOGIN BUTTON
========================================================= */

adminLoginBtn?.addEventListener(
    "click",
    (event) => {

        event.preventDefault();

        openAdminLogin();
    }
);


/* =========================================================
   CLOSE BUTTON
========================================================= */

closeAdminLogin?.addEventListener(
    "click",
    closeAdminLoginModal
);


/* =========================================================
   CLICK OVERLAY
========================================================= */

adminLoginOverlay?.addEventListener(
    "click",
    closeAdminLoginModal
);


/* =========================================================
   BACK TO WEBSITE
========================================================= */

backFromAdminLogin?.addEventListener(
    "click",
    closeAdminLoginModal
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            adminLoginModal?.classList.contains(
                "active"
            )
        ) {

            closeAdminLoginModal();
        }
    }
);