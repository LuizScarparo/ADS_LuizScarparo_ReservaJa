import { firestore } from "firebase-admin";
import { storage } from "../config/firebaseAdmin";

class MenuService {
    async uploadFile(day: string, file: any) {
        try {
            const bucket = storage.bucket();
            const doc = await firestore().collection("menus").doc(day).get();
            let oldUrl = '';
            if (doc.exists) {
                oldUrl = doc.data()?.url;
            }

            if (oldUrl) {
                const url = new URL(oldUrl);
                const oldFileName = decodeURIComponent(url.pathname.split("/").pop() || "");

                if (oldFileName) {
                    const oldFileRef = bucket.file(oldFileName);

                    try {
                        await oldFileRef.delete();
                        console.log("Arquivo antigo excluído com sucesso:", oldFileName);
                    } catch (deleteError) {
                        console.error("Erro ao tentar excluir o arquivo antigo:", deleteError);
                    }
                }
            }

            const fileName = `${day}-${Date.now()}-${file.originalname}`;
            const fileRef = bucket.file(fileName);

            await fileRef.save(file.buffer, {
                contentType: file.mimetype
            });

            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileRef.name)}?alt=media`;


            await firestore().collection("menus").doc(day).set({
                url: publicUrl,
                updatedAt: firestore.FieldValue.serverTimestamp(),
            }, { merge: true });

            return publicUrl;
        } catch (error: any) {
            console.error("Error uploading file:", error);
            throw new Error("Error uploading file.");
        }
    }

    async getMenus() {
        try {
            const snapshot = await firestore().collection("menus").get();

            if (snapshot.empty) {
                return [];
            }

            const menus: any[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                menus.push({
                    day: doc.id,
                    url: data.url,
                    updatedAt: data.updatedAt?.toDate().toISOString(),
                });
            });

            return menus;
        } catch (error: any) {
            console.error("Error fetching menus:", error);
            throw new Error("Error fetching menus.");
        }
    }
}

export default new MenuService();
