import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGVImfGqmugh211yMdFaMIbejA3rtWZcg",
  authDomain: "sporticos-4a8ff.firebaseapp.com",
  projectId: "sporticos-4a8ff",
  storageBucket: "sporticos-4a8ff.firebasestorage.app",
  messagingSenderId: "335805804016",
  appId: "1:335805804016:web:24e7edaa64f355816b0135",
  measurementId: "G-4F14MZ9ZC9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// **************************
// AUTHENTICATION OPERATIONS
// **************************

// Sign up with email and password
export const signUpWithEmail = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: userData.name || "",
      phoneNumber: userData.phone || "",
      membership: "free",
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      ...userData,
    });

    // Update profile if name provided
    if (userData.name) {
      await updateProfile(user, {
        displayName: userData.name,
      });
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update last login timestamp
    await updateDoc(doc(db, "users", user.uid), {
      lastLogin: new Date().toISOString(),
    });

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        membership: "free",
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
    } else {
      // Update last login timestamp
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date().toISOString(),
      });
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign in with Facebook
export const signInWithFacebook = async () => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        membership: "free",
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
    } else {
      // Update last login timestamp
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: new Date().toISOString(),
      });
    }

    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { success: false, error: "No user logged in" };
    }

    // Update auth profile
    if (updates.displayName || updates.photoURL) {
      await updateProfile(user, {
        displayName: updates.displayName,
        photoURL: updates.photoURL,
      });
    }

    // Update Firestore user document
    await updateDoc(doc(db, "users", user.uid), updates);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user email
export const updateUserEmail = async (newEmail) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { success: false, error: "No user logged in" };
    }

    await updateEmail(user, newEmail);

    // Update Firestore user document
    await updateDoc(doc(db, "users", user.uid), {
      email: newEmail,
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user password
export const updateUserPassword = async (newPassword) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { success: false, error: "No user logged in" };
    }

    await updatePassword(user, newPassword);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete user account
export const deleteUserAccount = async () => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { success: false, error: "No user logged in" };
    }

    // Delete user document from Firestore
    await deleteDoc(doc(db, "users", user.uid));

    // Delete user predictions
    const predictionsQuery = query(
      collection(db, "predictions"),
      where("userId", "==", user.uid),
    );
    const predictionsSnapshot = await getDocs(predictionsQuery);

    const deletePromises = predictionsSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref),
    );
    await Promise.all(deletePromises);

    // Delete auth user
    await deleteUser(user);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Auth state observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// **************************
// PREDICTIONS OPERATIONS
// **************************

// Add new prediction
export const addPrediction = async (predictionData) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to add predictions",
      };
    }

    const predictionWithMetadata = {
      ...predictionData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "pending", // pending, won, lost, void
    };

    const docRef = await addDoc(
      collection(db, "predictions"),
      predictionWithMetadata,
    );

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get predictions with filtering and pagination
export const getPredictions = async (
  filters = {},
  pageSize = 10,
  lastDoc = null,
) => {
  try {
    let predictionsQuery = collection(db, "predictions");

    // Build query based on filters
    const queryConstraints = [];

    if (filters.userId) {
      queryConstraints.push(where("userId", "==", filters.userId));
    }

    if (filters.status) {
      queryConstraints.push(where("status", "==", filters.status));
    }

    if (filters.league) {
      queryConstraints.push(where("league", "==", filters.league));
    }

    if (filters.type) {
      queryConstraints.push(where("type", "==", filters.type));
    }

    if (filters.isPremium !== undefined) {
      queryConstraints.push(where("isPremium", "==", filters.isPremium));
    }

    // Always order by date
    queryConstraints.push(orderBy("matchDate", "desc"));

    // Add pagination
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }

    queryConstraints.push(limit(pageSize));

    const q = query(predictionsQuery, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const predictions = [];
    querySnapshot.forEach((doc) => {
      predictions.push({ id: doc.id, ...doc.data() });
    });

    // Get the last document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { success: true, predictions, lastVisible };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get single prediction
export const getPrediction = async (predictionId) => {
  try {
    const docRef = doc(db, "predictions", predictionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        success: true,
        prediction: { id: docSnap.id, ...docSnap.data() },
      };
    } else {
      return { success: false, error: "Prediction not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update prediction
export const updatePrediction = async (predictionId, updates) => {
  try {
    const docRef = doc(db, "predictions", predictionId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete prediction
export const deletePrediction = async (predictionId) => {
  try {
    await deleteDoc(doc(db, "predictions", predictionId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Subscribe to predictions real-time updates
export const subscribeToPredictions = (filters, callback) => {
  let predictionsQuery = collection(db, "predictions");

  const queryConstraints = [orderBy("matchDate", "desc")];

  if (filters.userId) {
    queryConstraints.push(where("userId", "==", filters.userId));
  }

  if (filters.status) {
    queryConstraints.push(where("status", "==", filters.status));
  }

  if (filters.isPremium !== undefined) {
    queryConstraints.push(where("isPremium", "==", filters.isPremium));
  }

  const q = query(predictionsQuery, ...queryConstraints);

  return onSnapshot(q, (snapshot) => {
    const predictions = [];
    snapshot.forEach((doc) => {
      predictions.push({ id: doc.id, ...doc.data() });
    });
    callback(predictions);
  });
};

// **************************
// BLOG POSTS OPERATIONS
// **************************

// Add new blog post
export const addBlogPost = async (postData) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to add blog posts",
      };
    }

    const postWithMetadata = {
      ...postData,
      authorId: user.uid,
      authorName: user.displayName || "Anonymous",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      likes: 0,
    };

    const docRef = await addDoc(collection(db, "blogPosts"), postWithMetadata);

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get blog posts with filtering and pagination
export const getBlogPosts = async (
  filters = {},
  pageSize = 10,
  lastDoc = null,
) => {
  try {
    let postsQuery = collection(db, "blogPosts");

    // Build query based on filters
    const queryConstraints = [orderBy("createdAt", "desc")];

    if (filters.category) {
      queryConstraints.push(where("category", "==", filters.category));
    }

    if (filters.status) {
      queryConstraints.push(where("status", "==", filters.status));
    }

    if (filters.authorId) {
      queryConstraints.push(where("authorId", "==", filters.authorId));
    }

    // Add pagination
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }

    queryConstraints.push(limit(pageSize));

    const q = query(postsQuery, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });

    // Get the last document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { success: true, posts, lastVisible };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get single blog post
export const getBlogPost = async (postId) => {
  try {
    const docRef = doc(db, "blogPosts", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Increment view count
      await updateDoc(docRef, {
        views: (docSnap.data().views || 0) + 1,
      });

      return { success: true, post: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Blog post not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update blog post
export const updateBlogPost = async (postId, updates) => {
  try {
    const docRef = doc(db, "blogPosts", postId);

    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete blog post
export const deleteBlogPost = async (postId) => {
  try {
    await deleteDoc(doc(db, "blogPosts", postId));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Like a blog post
export const likeBlogPost = async (postId) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return { success: false, error: "User must be logged in to like posts" };
    }

    const docRef = doc(db, "blogPosts", postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentLikes = docSnap.data().likes || 0;

      await updateDoc(docRef, {
        likes: currentLikes + 1,
      });

      return { success: true };
    } else {
      return { success: false, error: "Blog post not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// **************************
// USER MANAGEMENT OPERATIONS
// **************************

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { success: true, user: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update user membership
export const updateUserMembership = async (userId, membershipData) => {
  try {
    const docRef = doc(db, "users", userId);

    await updateDoc(docRef, {
      ...membershipData,
      membershipUpdatedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get all users (admin only)
export const getAllUsers = async (pageSize = 20, lastDoc = null) => {
  try {
    let usersQuery = collection(db, "users");
    const queryConstraints = [orderBy("joinDate", "desc")];

    // Add pagination
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }

    queryConstraints.push(limit(pageSize));

    const q = query(usersQuery, ...queryConstraints);
    const querySnapshot = await getDocs(q);

    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    // Get the last document for pagination
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { success: true, users, lastVisible };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// **************************
// SUBSCRIPTION OPERATIONS
// **************************

// Create subscription
export const createSubscription = async (subscriptionData) => {
  try {
    const user = auth.currentUser;

    if (!user) {
      return {
        success: false,
        error: "User must be logged in to create subscriptions",
      };
    }

    const subscriptionWithMetadata = {
      ...subscriptionData,
      userId: user.uid,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    const docRef = await addDoc(
      collection(db, "subscriptions"),
      subscriptionWithMetadata,
    );

    // Update user membership
    await updateUserMembership(user.uid, {
      membership: subscriptionData.plan,
      subscriptionId: docRef.id,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user subscriptions
export const getUserSubscriptions = async (userId) => {
  try {
    const subscriptionsQuery = query(
      collection(db, "subscriptions"),
      //where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(subscriptionsQuery);

    const subscriptions = [];
    querySnapshot.forEach((doc) => {
      subscriptions.push({ id: doc.id, ...doc.data() });
    });

    return { success: true, subscriptions };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Cancel subscription
export const cancelSubscription = async (subscriptionId) => {
  try {
    const docRef = doc(db, "subscriptions", subscriptionId);

    await updateDoc(docRef, {
      status: "cancelled",
      cancelledAt: new Date().toISOString(),
    });

    // Get subscription to update user membership
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const subscription = docSnap.data();
      await updateUserMembership(subscription.userId, {
        membership: "free",
        subscriptionId: null,
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// **************************
// FILE STORAGE OPERATIONS
// **************************

// Upload file
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return { success: true, url: downloadURL };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete file
export const deleteFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// **************************
// EXPORT ALL SERVICES
// **************************

export { auth, db, storage };
export default app;
