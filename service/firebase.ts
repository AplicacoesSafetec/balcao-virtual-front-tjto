// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAJWmffGQ6XweAzE7Ty_9f7oZr2IXzsKPw',
  authDomain: 'balcao-virtual-004.firebaseapp.com',
  projectId: 'balcao-virtual-004',
  storageBucket: 'balcao-virtual-004.appspot.com',
  messagingSenderId: '670474632224',
  appId: '1:670474632224:web:2f2c10a2f9dc053478d045',
  measurementId: 'G-81FB9FL3RW',
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
