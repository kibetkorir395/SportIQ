import { useState, useEffect } from "react";
import { useFirebase } from "../contexts/FirebaseContext";

export const useUserSubscriptions = () => {
  const { user, getUserSubscriptions } = useFirebase();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user) {
        setSubscriptions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getUserSubscriptions(user.uid);
        if (result.success) {
          setSubscriptions(result.subscriptions);
        } else {
          setError(result.error);
          setSubscriptions([]);
        }
      } catch (err) {
        setError(err.message);
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [user, getUserSubscriptions]);

  const hasActiveSubscription = subscriptions?.some(
    (sub) => sub.status === "active",
  );
  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === "active",
  );

  return {
    subscriptions,
    loading,
    error,
    hasActiveSubscription,
    activeSubscription,
    refetch: () => {
      if (user) {
        setLoading(true);
        getUserSubscriptions(user.uid).then((result) => {
          if (result.success) {
            setSubscriptions(result.subscriptions);
          }
          setLoading(false);
        });
      }
    },
  };
};
