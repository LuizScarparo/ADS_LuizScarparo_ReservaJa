// import { db } from "./config/firebaseAdmin";
// import { v4 as uuidv4 } from "uuid";

// async function gerarAdminKeys(qtd: number = 10) {
//   const batch = db.batch();
//   const now = new Date().toISOString();

//   for (let i = 0; i < qtd; i++) {
//     const key = uuidv4(); // chave única
//     const docRef = db.collection("adminKeys").doc(key); // mesmo valor como ID e campo "key"

//     batch.set(docRef, {
//       key,
//       createdAt: now,
//       used: false
//     });
//   }

//   await batch.commit();
//   console.log(`${qtd} chaves de administrador geradas com sucesso!`);
// }

// gerarAdminKeys(10).catch(console.error);
