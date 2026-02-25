import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithFacebook,
  signOutUser,
  onAuthStateChange,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  resetPassword,
  addPrediction,
  getPredictions,
  updatePrediction,
  deletePrediction,
  createSubscription,
  getUserSubscriptions,
  cancelSubscription
} from '../firebase';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile
        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.user);
        }

        // Fetch user subscriptions
        const subsResult = await getUserSubscriptions(user.uid);
        if (subsResult.success) {
          setSubscriptions(subsResult.subscriptions);
        }
      } else {
        setUserProfile(null);
        setSubscriptions([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    userProfile,
    subscriptions,
    loading,
    // Auth methods
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signOutUser,
    resetPassword,
    updateUserProfile,
    getCurrentUser,
    // Prediction methods
    addPrediction,
    getPredictions,
    updatePrediction,
    deletePrediction,
    // Subscription methods
    createSubscription,
    getUserSubscriptions,
    cancelSubscription,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};