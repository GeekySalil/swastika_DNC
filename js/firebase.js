// Firebase App
import { initializeApp }
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";

// Firestore
import {
    getFirestore
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Authentication
import {
    getAuth
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Storage
import {
    getStorage
}
from "https://www.gstatic.com/firebasejs/11.9.1/firebase-storage.js";

const firebaseConfig = {

    apiKey:
    "AIzaSyCLGaNQnl3zO2dQHjLWRHw6DVdulh6OZ4E",

    authDomain:
    "swastika-5791d.firebaseapp.com",

    projectId:
    "swastika-5791d",

    storageBucket:
    "swastika-5791d.firebasestorage.app",

    messagingSenderId:
    "893345384045",

    appId:
    "1:893345384045:web:b9ca6ce8b5891f432d6164"

};

const app =
initializeApp(firebaseConfig);

const db =
getFirestore(app);

const auth =
getAuth(app);

const storage =
getStorage(app);

export {
    db,
    auth,
    storage
};