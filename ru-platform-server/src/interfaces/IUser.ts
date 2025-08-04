export interface IUser {
  userId: string; 
  name: string;
  mail: string;
  password: string;
  phone?: string;
  readonly role: "visitor" | "student" | "teacher" | "employee" | "admin"; 
  readonly createdAt: string;
  updatedAt?: string;
}

export interface IVisitor {
  visitorId: string; 
  name: string;
  mail: string;
  role: "visitor"; 
  readonly createdAt: string;
}

export interface IStudent extends IUser {
  role: "student";
  readonly student: {
    enrollmentNumber: string; 
    readonly studentId: string; 
  };
}

export interface ITeacher extends IUser {
  role: "teacher";
  readonly teacher: {
    enrollmentNumber: string; 
    readonly teacherId: string; 
  };
}

export interface IEmployee extends IUser {
  role: "employee";
  readonly employee: {
    enrollmentNumber: string; 
    readonly employeeId: string;
  };
}

export interface IAdmin extends IUser {
  role: "admin";
  readonly admin: {
    adminKey: string;
    enrollmentNumber: string;
    readonly adminId: string;
  };
}

export type User = IVisitor | IStudent | ITeacher | IEmployee | IAdmin;
