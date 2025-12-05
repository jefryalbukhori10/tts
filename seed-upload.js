// seed-upload.js
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, collection } from "firebase/firestore";

// ----------------------------
// 1. MASUKKAN CONFIG FIREBASE
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCt2uGmuPTrrPlhfKFyp9pPnkyVYfj6GbA",
  authDomain: "ttsss-50788.firebaseapp.com",
  projectId: "ttsss-50788",
  storageBucket: "ttsss-50788.firebasestorage.app",
  messagingSenderId: "594651044868",
  appId: "1:594651044868:web:ae3122de7554ec39232951",
  measurementId: "G-3X5Y8PZPWF",
};

// ----------------------------
// 2. INIT FIREBASE + FIRESTORE
// ----------------------------
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------------------------
// 3. LOAD FILE SEED JSON
// ----------------------------
const seed = JSON.parse(fs.readFileSync("./seed-data.json", "utf8"));

async function seedFirestore() {
  console.log("🔥 Memulai upload seed ke Firestore...");

  // ============================
  // USERS
  // ============================
  for (const user of seed.users) {
    await setDoc(doc(db, "users", user.uid), user);
    console.log(`✔ User ditambahkan: ${user.uid}`);
  }

  // ============================
  // CATEGORIES + LEVELS + QUESTIONS
  // ============================
  for (const category of seed.categories) {
    await setDoc(doc(db, "categories", category.id), {
      name: category.name,
      adminUid: category.adminUid,
      createdAt: Date.now(),
    });

    console.log(`📁 Kategori ditambahkan: ${category.id}`);

    // LEVELS DI DALAM KATEGORI
    const levels = seed.levels[category.id] || [];
    for (const level of levels) {
      const levelRef = doc(db, "categories", category.id, "levels", level.id);

      await setDoc(levelRef, {
        levelNumber: level.levelNumber,
        createdAt: Date.now(),
      });

      console.log(`   📌 Level ditambahkan: ${category.id}/${level.id}`);

      // QUESTIONS
      for (const q of level.questions) {
        const qRef = doc(
          db,
          "categories",
          category.id,
          "levels",
          level.id,
          "questions",
          q.id
        );

        await setDoc(qRef, {
          question: q.question,
          answer: q.answer,
          imageUrl: q.imageUrl,
          hintIndex: Math.floor(Math.random() * q.answer.length),
          createdAt: Date.now(),
        });

        console.log(`      📝 Soal ditambahkan: ${q.id}`);
      }
    }
  }

  console.log("🎉 SEED FIRESTORE SELESAI!");
}

seedFirestore();
