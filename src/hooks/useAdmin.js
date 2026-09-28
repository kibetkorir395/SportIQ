import { useState, useCallback, useRef } from 'react';
import {
    getAllUsers,
    getAllSubscriptions,
    cancelSubscription as cancelSubscriptionAPI,
    toggleSubscription as toggleSubscriptionAPI,
    updateUserProfile,
} from '../firebase';
import { useMatchPredictions } from "../hooks/useMatchPredictions";

const USERS_PAGE_SIZE = 20;
const SUBSCRIPTIONS_PAGE_SIZE = 20;

export const useAdmin = () => {
    // --- Shared State ---
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const today = new Date().toISOString().slice(0, 10); // "2026-09-25"
    const { predictions, /*loading, error,*/ fetchByDate, fetchPosts } = useMatchPredictions({
        autoFetch: true,
        date: today,
    });

    // Use a ref to prevent concurrent fetches without triggering re-renders
    const isFetching = useRef(false);

    // --- Users State ---
    const [users, setUsers] = useState([]);
    const [lastUserDoc, setLastUserDoc] = useState(null);
    const [hasMoreUsers, setHasMoreUsers] = useState(true);

    // --- Subscriptions State ---
    const [subscriptions, setSubscriptions] = useState([]);
    const [lastSubscriptionDoc, setLastSubscriptionDoc] = useState(null);
    const [hasMoreSubscriptions, setHasMoreSubscriptions] = useState(true);

    // ============================================
    // USERS
    // ============================================

    /**
     * Fetch a page of users.
     * @param {boolean} isFirstLoad - If true, resets pagination and replaces the list.
     */
    const fetchUsers = useCallback(
        async (isFirstLoad = false) => {
            if (isFetching.current) return;
            isFetching.current = true;
            setLoading(true);
            setError(null);

            try {
                const currentLastDoc = isFirstLoad ? null : lastUserDoc;
                const result = await getAllUsers(USERS_PAGE_SIZE, currentLastDoc);

                if (result.success) {
                    if (isFirstLoad) {
                        setUsers(result.users);
                        setHasMoreUsers(true);
                    } else {
                        setUsers((prev) => [...prev, ...result.users]);
                    }

                    setLastUserDoc(result.lastVisible);

                    if (
                        result.users.length < USERS_PAGE_SIZE ||
                        !result.lastVisible
                    ) {
                        setHasMoreUsers(false);
                    }
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                isFetching.current = false;
            }
        },
        [lastUserDoc]
    );

    /**
     * Toggle a user's active status.
     * @param {string} userId
     * @returns {{ success: boolean, error?: string }}
     */
    const toggleUserStatus = useCallback(async (userId) => {
        const targetUser = users.find((u) => u.id === userId);
        if (!targetUser) {
            return { success: false, error: 'User not found' };
        }

        const updatedStatus = !targetUser.isActive;

        setLoading(true);
        try {
            const result = await updateUserProfile({
                isActive: updatedStatus,
                isAdmin: true,
                id: userId,
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            // Optimistically update local state
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? result.user/*{ ...u, isActive: updatedStatus }*/ : u
                )
            );

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [users]);

    /**
     * Remove a user from local state (call after successful API delete).
     * @param {string} userId
     */
    const removeUserFromList = useCallback((userId) => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
    }, []);

    // ============================================
    // SUBSCRIPTIONS
    // ============================================

    /**
     * Fetch a page of subscriptions.
     * @param {boolean} isFirstLoad - If true, resets pagination and replaces the list.
     */
    const fetchSubscriptions = useCallback(
        async (isFirstLoad = false) => {
            //if (isFetching.current) return;
            isFetching.current = true;
            setLoading(true);
            setError(null);

            try {
                const currentLastDoc = isFirstLoad ? null : lastSubscriptionDoc;
                const result = await getAllSubscriptions(
                    SUBSCRIPTIONS_PAGE_SIZE,
                    currentLastDoc
                );

                if (result.success) {
                    if (isFirstLoad) {
                        setSubscriptions(result.subscriptions);
                        setHasMoreSubscriptions(true);
                    } else {
                        setSubscriptions((prev) => [...prev, ...result.subscriptions]);
                    }

                    setLastSubscriptionDoc(result.lastVisible);

                    if (
                        result.subscriptions.length < SUBSCRIPTIONS_PAGE_SIZE ||
                        !result.lastVisible
                    ) {
                        setHasMoreSubscriptions(false);
                    }
                } else {
                    setError(result.error);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                isFetching.current = false;
            }
        },
        [lastSubscriptionDoc]
    );

    /**
     * Cancel a subscription by ID.
     * @param {string} subscriptionId
     * @returns {{ success: boolean, error?: string }}
     */
    const cancelSubscription = useCallback(async (subscriptionId) => {
        setLoading(true);
        try {
            const result = await cancelSubscriptionAPI(subscriptionId);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Optimistically update local state
            setSubscriptions((prev) =>
                prev.map((s) =>
                    s.id === subscriptionId ? { ...s, status: 'cancelled' } : s
                )
            );

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);


    /**
       * Cancel a subscription by ID.
       * @param {string} subscriptionId
       * @returns {{ success: boolean, error?: string }}
    */
    const toggleSubscription = useCallback(async (subscriptionId, status = "inactive", membership = 'free') => {
        setLoading(true);
        try {
            const result = await toggleSubscriptionAPI(subscriptionId, status, membership);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Optimistically update local state
            setSubscriptions((prev) =>
                prev.map((s) =>
                    s.id === subscriptionId ? { ...s, status: status } : s
                )
            );

            return { success: true };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Remove a subscription from local state.
     * @param {string} subscriptionId
     */
    const removeSubscriptionFromList = useCallback((subscriptionId) => {
        setSubscriptions((prev) => prev.filter((s) => s.id !== subscriptionId));
    }, []);

    // ============================================
    // HELPERS
    // ============================================

    /**
     * Reset all state (e.g. on logout).
     */
    const resetAdminState = useCallback(() => {
        setUsers([]);
        setLastUserDoc(null);
        setHasMoreUsers(true);
        setSubscriptions([]);
        setLastSubscriptionDoc(null);
        setHasMoreSubscriptions(true);
        setError(null);
        setLoading(false);
    }, []);

    // ============================================
    // RETURN
    // ============================================

    return {
        // Shared
        loading,
        error,

        // Users
        users,
        hasMoreUsers,
        fetchUsers,
        toggleUserStatus,
        removeUserFromList,

        // Subscriptions
        subscriptions,
        hasMoreSubscriptions,
        fetchSubscriptions,
        cancelSubscription,
        toggleSubscription,
        removeSubscriptionFromList,

        predictions,
        fetchByDate,
        fetchPosts,

        // Helpers
        resetAdminState,
    };
};