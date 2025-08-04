import { db } from "../config/firebaseAdmin";
class UsersService {
  async getUsers() {
    try {
      const snapshot = await db.collection("users").select(
        "name", "mail", "role", "createdAt", "updatedAt", 
        "student", "teacher", "admin", "visitor", "employee").get();
      const users = snapshot.docs.map((doc) => doc.data());
      return users;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw new Error("Erro ao buscar usuários.");
    }
  }

  async getById(userId: string) {
    const docRef = db.collection("users").doc(userId);
    const snap = await docRef.get();
    if (!snap.exists) return null;

    const data = snap.data()!;
    return {
      userId: snap.id,
      name: data.name,
      mail: data.mail,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async deleteById(userId: string): Promise<void> {
    try {
      const docRef = db.collection("users").doc(userId);
      const snap = await docRef.get();
      if (!snap.exists) {
        throw new Error("Usuário não encontrado.");
      }
      await docRef.delete();
    } catch (error: any) {
      console.error(`Erro ao deletar usuário ${userId}:`, error);
      throw new Error(error.message || "Erro ao deletar usuário.");
    }
  }

  async updateById( userId: string, updates: { name: string; mail: string }){
    const docRef = db.collection("users").doc(userId);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new Error("Usuário não encontrado.");
    }
    const updatedAt = new Date().toISOString();
    await docRef.update({
      name: updates.name,
      mail: updates.mail,
      updatedAt,
    });

    const updatedSnap = await docRef.get();
    const data = updatedSnap.data()!;
    return {
      userId: updatedSnap.id,
      name: data.name,
      mail: data.mail,
      role: data.role,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

}

export default new UsersService();
