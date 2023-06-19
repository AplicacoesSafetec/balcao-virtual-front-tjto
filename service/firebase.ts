// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
 const firebaseConfig = {
    apiKey: "AIzaSyA1Y7QNe6AWz3n5Hjl6B4IX0xWbf66V-ww",
    authDomain: "balcao-virtual-tjto.firebaseapp.com",
    databaseURL: "https://balcao-virtual-tjto-default-rtdb.firebaseio.com",
    projectId: "balcao-virtual-tjto",
    storageBucket: "balcao-virtual-tjto.appspot.com",
    messagingSenderId: "621571335925",
    appId: "1:621571335925:web:b1ba69a6a46f5bda6487bc"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
