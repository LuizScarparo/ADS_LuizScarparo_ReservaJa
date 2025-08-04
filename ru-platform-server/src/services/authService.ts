import bcrypt from "bcryptjs";
import { DateTime } from "luxon";
import { db } from "../config/firebaseAdmin";
import { IUser, IVisitor, IStudent, ITeacher, IEmployee, IAdmin, User } from "../interfaces/IUser";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

class AuthService {
  async register(userData: IUser & { adminKey?: string }) {
    try {

      if (userData.role !== "visitor") {
        userData.password = await bcrypt.hash(userData.password, 10);
      }

      const userExists = await db.collection("users").where("mail", "==", userData.mail).get();
      if (!userExists.empty) {
        return { error: "Invalid email or password!" };
      }

      const userId = uuidv4();
      const createdAt = DateTime.now().setZone("America/Sao_Paulo").toISO();

      const allowedUserFields = ["name", "mail", "password", "role", "phone"];
      const filteredUserData: any = {};
      for (const key of allowedUserFields) {
        if (key in userData) {
          filteredUserData[key] = (userData as any)[key];
        }
      }

      filteredUserData.createdAt = createdAt;
      filteredUserData.updatedAt = createdAt;

      let newUser: User;
      let token: string | undefined;

      switch (userData.role) {
        case "student": {
          const studentData = (userData as IStudent).student;
          if (!studentData || !studentData.enrollmentNumber) {
            return { error: "Dados do estudante estão incorretos ou não fornecidos!" };
          }

          newUser = {
            ...filteredUserData,
            student: {
              enrollmentNumber: studentData.enrollmentNumber,
              studentId: uuidv4(),
            },
          } as IStudent;
          break;
        }

        case "teacher": {
          const teacherData = (userData as ITeacher).teacher;
          if (!teacherData || !teacherData.enrollmentNumber) {
            return { error: "Dados do professor estão incorretos ou não fornecidos!" };
          }

          newUser = {
            ...filteredUserData,
            teacher: {
              enrollmentNumber: teacherData.enrollmentNumber,
              teacherId: uuidv4(),
            },
          } as ITeacher;
          break;
        }

        case "employee": {
          const employeeData = (userData as IEmployee).employee;
          if (!employeeData || !employeeData.enrollmentNumber) {
            return { error: "Dados do funcionário estão incorretos ou não fornecidos!" };
          }

          newUser = {
            ...filteredUserData,
            employee: {
              enrollmentNumber: employeeData.enrollmentNumber,
              employeeId: uuidv4(),
            },
          } as IEmployee;
          break;
        }

        case "admin": {
          if (!userData.adminKey) {
            return { error: "É necessário fornecer uma adminKey para criar um administrador!" };
          }

          const adminKeyRef = db.collection("adminKeys").doc(userData.adminKey);
          const adminKeyDoc = await adminKeyRef.get();

          if (!adminKeyDoc.exists || adminKeyDoc.data()?.used) {
            return { error: "Chave de admin inválida ou já utilizada!" };
          }

          await adminKeyRef.update({ used: true });

          const adminData = (userData as IAdmin).admin;
          if (!adminData || !adminData.enrollmentNumber) {
            return { error: "Dados do administrador estão incorretos ou não fornecidos!" };
          }

          newUser = {
            ...filteredUserData,
            admin: {
              adminId: uuidv4(),
              enrollmentNumber: adminData.enrollmentNumber,
            },
          } as IAdmin;
          break;
        }

        case "visitor": {
          newUser = {
            ...filteredUserData,
            visitorId: uuidv4(),
          } as IVisitor;
          token = jwt.sign(
            {
              userId,
              role: "visitor",
              name: userData.name,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "3d" }
          )
          break;
        }

        default:
          return { error: "Tipo de usuário inválido!" };
      }

      await db.collection("users").doc(userId).set(newUser);

      return { message: "Usuário cadastrado com sucesso!", userId, ...(token && { token }) };
    } catch (error: any) {
      console.log(error);
      throw new Error(error.message);
    }
  }
  async login(mail: string, password: string) {
    try {
      const snapshot = await db.collection("users").where("mail", "==", mail).get();
      if (snapshot.empty) {
        return { error: "E-mail ou senha inválidos" };
      }

      const userDoc = snapshot.docs[0];
      const user = userDoc.data() as IUser;

      const matchPassword = await bcrypt.compare(password, user.password);
      if (!matchPassword) {
        return { error: "E-mail ou senha inválidos!" };
      }

      const userType = user.role === "student" ? "student" : user.role === "teacher" ? "teacher" : user.role === "employee" ? "employee" : user.role === "admin" ? "admin" : user.role === "visitor" ? "visitor" : null;
      
      return {
        userId: userDoc.id,
        name: user.name,
        mail: user.mail,
        role: user.role,
        enrollmentNumber: userType === "student" ? (user as IStudent).student.enrollmentNumber : userType === "teacher" ? (user as ITeacher).teacher.enrollmentNumber : userType === "employee" ? (user as IEmployee).employee.enrollmentNumber : userType === "admin" ? (user as IAdmin).admin.enrollmentNumber : null,
      };
    } catch (error: any) {
      console.error("Erro no login:", error);
      throw new Error("Erro ao fazer login");
    }
  }

  async requestResetPassword(mail: String) {
    try {
      const snapshot = await db.collection("users").where("mail", "==", mail).get();
      if (snapshot.empty) {
        throw new Error("E-mail não encontrado!");
      }

      const userData = snapshot.docs[0].data() as IUser;
      const userId = snapshot.docs[0].id;
      const secret = process.env.JWT_SECRET || "chave-secreta" + userData.password;
      const token = jwt.sign(
        { mail: userData.mail, id: userId },
        secret,
        { expiresIn: "1h" }
      )

      const linkToReset = `http://localhost:3000/reset-password?id=${userId}&token=${token}`;

      const transporter = process.env.EMAIL_SERVICE === 'sendgrid'
        ? nodemailer.createTransport({
          host: "smtp.sendgrid.net",
          port: 587,
          auth: {
            user: "apikey",
            pass: process.env.SENDGRID_API_KEY,
          }
        })
        : nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          }
        });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: mail as string,
        subject: "Recuperação de senha - R.U Platform",
        text: `Olá! Recebemos uma solicitação de recuperação de senha. Acesse o link para redefinir: ${linkToReset}. Caso não tenha solicitado, ignore este e-mail.`,
        html:
          `<html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2>Recuperação de Senha</h2>
              <p>Olá! Recebemos uma solicitação para redefinir sua senha.</p>
              <p>Clique no botão abaixo para continuar:</p>
              <a href="${linkToReset}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Redefinir Senha</a>
              <p>Se você não solicitou a recuperação, ignore este e-mail.</p>
              <p>Atenciosamente,<br>Equipe R.U Platform</p>
            </body>
          </html>`,
      })
      return { message: "E-mail enviado com sucesso!" };
    }
    catch (error: any) {
      console.error("Erro ao recuperar senha:", error);
      throw error;
    }
  }

  async resetPassword(id: string, token: string, newPassword: string) {
    try {
      const snapshot = await db.collection("users").doc(id).get();
      if (!snapshot.exists) {
        throw new Error("Usuário não encontrado!");
      }

      const userData = snapshot.data() as IUser;

      const secret = process.env.JWT_SECRET || "chave-secreta" + userData.password;
      let payload;
      try {
        payload = jwt.verify(token, secret) as { mail: string; id: string };
      } catch (error) {
        throw error;
      }

      if (payload.id !== id) {
        throw new Error("Token inválido!");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await db.collection("users").doc(id).update({ password: hashedPassword });
      return { message: "Senha redefinida com sucesso!" };
    }
    catch (error) {
      console.error("Erro ao redefinir senha:", error);
      throw error;
    }
  }
}

export default new AuthService();
