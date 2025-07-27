import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import bcrypt from "bcryptjs";

// Hash password with bcryptjs and return hash string
async function bcryptHash(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err || typeof salt !== "string") return reject(err || new Error("Salt is undefined"));
      bcrypt.hash(password, salt as string, (err, hash) => {
        if (err || typeof hash !== "string") return reject(err || new Error("Hash is undefined"));
        resolve(hash);
      });
    });
  });
}

// Verify password with bcryptjs
async function bcryptVerify(hash: string, password: string): Promise<boolean> {
  return new Promise((resolve) => {
    bcrypt.compare(password, hash, (err, res) => {
      resolve(res === true);
    });
  });
}

// Save credentials with bcryptjs hashed password and role
export async function saveCredentials(
  username: string,
  password: string,
  role: string
) {
  const hashedPassword = await bcryptHash(password);
  await addDoc(collection(db, "users"), {
    username,
    password: hashedPassword,
    role,
  });
}

// Check credentials by verifying bcryptjs hashed password
export async function checkCredentials(username: string, password: string) {
  const q = query(collection(db, "users"), where("username", "==", username));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return false;

  let valid = false;
  let userRole = "";
  for (const docSnap of querySnapshot.docs) {
    const data = docSnap.data();
    if (await bcryptVerify(data.password, password)) {
      valid = true;
      userRole = data.role;
      break;
    }
  }
  return valid ? userRole : false;
}

export async function getUserByUsername(username: string) {
  const db = getFirestore();
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  // Return both the data and the document ID
  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

export async function createUserWithProfile(user: {
  username: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
  status?: string; // <-- allow status
}) {
  const db = getFirestore();
  const usersRef = collection(db, "users");
  // Always hash password with bcryptjs before storing
  const hashedPassword = await bcryptHash(user.password);
  await addDoc(usersRef, {
    ...user,
    password: hashedPassword,
    status: user.status || "pending" // <-- default to pending if not provided
  });
}

