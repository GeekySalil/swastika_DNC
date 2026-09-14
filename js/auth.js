import {
    auth
} from "./firebase.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";


/* =========================================================
   ELEMENTS
========================================================= */

const loginForm =
    document.getElementById("adminLoginForm");

const emailInput =
    document.getElementById("adminLoginEmail");

const passwordInput =
    document.getElementById("adminLoginPassword");

const rememberMe =
    document.getElementById("rememberAdmin");

const loginBtn =
    document.getElementById("adminLoginSubmit");

const loginBtnText =
    document.getElementById("adminLoginBtnText");

const loginSpinner =
    document.getElementById("adminLoginSpinner");

const loginError =
    document.getElementById("adminLoginError");

const forgotPasswordBtn =
    document.getElementById("forgotAdminPassword");

const passwordToggle =
    document.getElementById("toggleAdminPassword");


/* =========================================================
   HELPER — SHOW ERROR
========================================================= */

function showLoginError(message) {

    if (!loginError) {
        return;
    }

    loginError.textContent = message;
    loginError.classList.add("show");
}


/* =========================================================
   HELPER — CLEAR ERROR
========================================================= */

function clearLoginError() {

    if (!loginError) {
        return;
    }

    loginError.textContent = "";
    loginError.classList.remove("show");
}


/* =========================================================
   HELPER — LOGIN LOADING STATE
========================================================= */

function setLoginLoading(loading) {

    if (!loginBtn) {
        return;
    }

    loginBtn.disabled = loading;

    if (loading) {

        if (loginBtnText) {
            loginBtnText.textContent =
                "Signing in...";
        }

        if (loginSpinner) {
            loginSpinner.style.display =
                "inline-block";
        }

    } else {

        if (loginBtnText) {
            loginBtnText.textContent =
                "Sign In";
        }

        if (loginSpinner) {
            loginSpinner.style.display =
                "none";
        }
    }
}


/* =========================================================
   FIREBASE ERROR → USER FRIENDLY MESSAGE
========================================================= */

function getAuthErrorMessage(error) {

    switch (error.code) {

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/missing-password":
            return "Please enter your password.";

        case "auth/invalid-credential":
            return "Incorrect email or password.";

        case "auth/user-not-found":
            return "No administrator account was found with this email.";

        case "auth/wrong-password":
            return "Incorrect email or password.";

        case "auth/user-disabled":
            return "This administrator account has been disabled.";

        case "auth/too-many-requests":
            return "Too many unsuccessful attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";

        default:
            return "Unable to sign in. Please try again.";
    }
}


/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

if (passwordToggle) {

    passwordToggle.addEventListener(
        "click",
        () => {

            const isPassword =
                passwordInput.type === "password";

            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";

            const icon =
                passwordToggle.querySelector("i");

            if (icon) {

                icon.className =
                    isPassword
                        ? "fa-solid fa-eye-slash"
                        : "fa-solid fa-eye";
            }
        }
    );
}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            clearLoginError();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            if (!email) {

                showLoginError(
                    "Please enter your email address."
                );

                emailInput.focus();

                return;
            }

            if (!password) {

                showLoginError(
                    "Please enter your password."
                );

                passwordInput.focus();

                return;
            }


            try {

                setLoginLoading(true);


                /* -----------------------------------------
                   REMEMBER ME
                ----------------------------------------- */

                if (rememberMe?.checked) {

                    await setPersistence(
                        auth,
                        browserLocalPersistence
                    );

                } else {

                    await setPersistence(
                        auth,
                        browserSessionPersistence
                    );
                }


                /* -----------------------------------------
                   FIREBASE LOGIN
                ----------------------------------------- */

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                );


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                if (loginBtnText) {

                    loginBtnText.textContent =
                        "Login Successful";
                }


                /*
                   Give Firebase a moment to finish
                   updating the authentication state.
                */

                setTimeout(
                    () => {

                        window.location.href =
                            "admin.html";

                    },
                    300
                );

            }

            catch (error) {

                console.error(
                    "Admin login error:",
                    error
                );

                showLoginError(
                    getAuthErrorMessage(error)
                );

                setLoginLoading(false);
            }
        }
    );
}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

if (forgotPasswordBtn) {

    forgotPasswordBtn.addEventListener(
        "click",
        async () => {

            clearLoginError();

            const email =
                emailInput.value.trim();


            if (!email) {

                showLoginError(
                    "Enter your admin email first, then click Forgot Password."
                );

                emailInput.focus();

                return;
            }


            try {

                forgotPasswordBtn.disabled =
                    true;

                forgotPasswordBtn.textContent =
                    "Sending...";


                await sendPasswordResetEmail(
                    auth,
                    email
                );


                showLoginError(
                    "If an account exists for this email, a password reset link has been sent."
                );


            }

            catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                switch (error.code) {

                    case "auth/invalid-email":

                        showLoginError(
                            "Please enter a valid email address."
                        );

                        break;


                    case "auth/user-not-found":

                        showLoginError(
                            "No administrator account was found with this email."
                        );

                        break;


                    case "auth/too-many-requests":

                        showLoginError(
                            "Too many requests. Please try again later."
                        );

                        break;


                    default:

                        showLoginError(
                            "Unable to send the password reset email."
                        );
                }

            }

            finally {

                forgotPasswordBtn.disabled =
                    false;

                forgotPasswordBtn.textContent =
                    "Forgot password?";
            }
        }
    );
}