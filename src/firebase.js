import { getFirestore, collection } from "firebase/firestore";

// User-based project path export const getProjectPath = (userId) => { if (!userId) return null; return collection(getFirestore(), users/${userId}/projects); };
