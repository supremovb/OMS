import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import bcrypt from "bcryptjs";

// Get all users
export async function getUsers() {
  const usersCol = collection(db, "users");
  const snapshot = await getDocs(usersCol);
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as any[];
}

// Add a new user (status: pending)
export async function addUser(user: {
  username: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
}) {
  const hashedPassword = await new Promise<string>((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err || typeof salt !== "string") return reject(err || new Error("Salt is undefined"));
      bcrypt.hash(user.password, salt as string, (err, hash) => {
        if (err || typeof hash !== "string") return reject(err || new Error("Hash is undefined"));
        resolve(hash);
      });
    });
  });
  await addDoc(collection(db, "users"), {
    ...user,
    password: hashedPassword,
    status: "pending"
  });
}

// Accept a pending user (set status to active)
export async function acceptUser(userId: string) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { status: "active" });
}

// Update user (except password)
export async function updateUser(user: {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
}) {
  const userRef = doc(db, "users", user.id);
  await updateDoc(userRef, {
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role
  });
}

// Delete user
export async function deleteUser(userId: string) {
  const userRef = doc(db, "users", userId);
  await deleteDoc(userRef);
}
