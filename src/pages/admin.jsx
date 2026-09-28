import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import Joyride from 'react-joyride';
import './admin.css';
//import {getUserProfile,updateUserMembership} from '../firebase';
import { useAdmin } from "../hooks/useAdmin";
import { deleteUserAccount } from "../firebase"; // for real delete

function Admin({ showNotification, showModal }) {
  const navigate = useNavigate();
  const { user, userProfile } = useFirebase();
  const [runTour, setRunTour] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalPredictions: 89,
    totalRevenue: 456000,
    recentUsers: [],
    recentPredictions: []
  });


  // Check if user is admin
  useEffect(() => {
    // In real app, check if user has admin role
    const isAdmin = user?.email === 'admin@sportiq.com' || userProfile?.role === 'admin';

    if (!user) {
      showModal({
        type: 'warning',
        title: 'Access Denied',
        message: 'Please login to access admin panel',
        confirmText: 'Login',
        onConfirm: () => navigate('/get-started'),
        onCancel: () => navigate('/')
      });
    } else if (!isAdmin) {
      showModal({
        type: 'error',
        title: 'Unauthorized',
        message: 'You do not have permission to access the admin panel',
        confirmText: 'Go Home',
        onConfirm: () => navigate('/'),
        onCancel: () => window.history.back()
      });
    }

    // Simulate loading data
    /*setTimeout(() => {
      setLoading(false);
    }, 1000);*/
  }, [/*user, userProfile, navigate, showModal*/]);

  const {
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

    predictions,
    fetchByDate,
    fetchPosts,
  } = useAdmin();

  // Initial load on mount
  useEffect(() => {
    fetchUsers(true);
    fetchSubscriptions(true);
  }, [fetchUsers, fetchSubscriptions]);


  // 1. Generate the exact filtered array used in your UI
  const filteredMatches = predictions ? predictions.flatMap((p) => {

    if (!p.matches) return [];
    return p.matches.filter((match) => {
      if (!match.predictions) return false;
      return match//Object.values(match.predictions).some((pred) => pred && pred.value > 50);
    }).map((match) => ({
      ...match,
      // Inject the parent league info directly into the match object
      leagueName: p.name,
      leagueCountry: p.country,
      leagueSlug: p.slug // Holds the {country, slug} object
    }));
  }) : [];

  // --- Handlers ---
  const handleToggleUserStatus = async (userId) => {
    const result = await toggleUserStatus(userId);
    if (result.success) {
      showNotification('User status updated', 'info');
    } else {
      showNotification(result.error || 'Failed to update user status', 'error');
    }
  };

  const handleDeleteUser = (userId) => {
    showModal({
      type: 'warning',
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        // Replace with your actual delete API call
        // const result = await deleteUserAccount(userId);
        // if (result.success) removeUserFromList(userId);
        removeUserFromList(userId); // optimistic
        showNotification('User deleted successfully', 'success');
      },
      showCancel: true
    });
  };

  /*const handleDeleteUser = (userId) => {
    showModal({
      type: 'warning',
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        setSampleUsersUsers(users.filter(u => u.id !== userId));
        showNotification('User deleted successfully', 'success');
      },
      showCancel: true
    });
  };*/


  const handleDeletePrediction = (predictionId) => {
    showModal({
      type: 'warning',
      title: 'Delete Prediction',
      message: 'Are you sure you want to delete this prediction?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        setPredictions(predictions.filter(p => p.id !== predictionId));
        showNotification('Prediction deleted successfully', 'success');
      },
      showCancel: true
    });
  };


  const handleCancelSubscription = (subscriptionId) => {
    showModal({
      type: 'warning',
      title: 'Cancel Subscription',
      message: 'Are you sure you want to cancel this subscription?',
      confirmText: 'Cancel Subscription',
      cancelText: 'No',
      onConfirm: async () => {
        const result = await cancelSubscription(subscriptionId);
        if (result.success) {
          showNotification('Subscription cancelled', 'info');
        } else {
          showNotification(result.error || 'Failed to cancel subscription', 'error');
        }
      },
      showCancel: true
    });
  };

  const handleToggleSubscription = (subscriptionId, status, plan) => {
    showModal({
      type: 'warning',
      title: `${status === 'inactive' ? 'Deactivate' : 'Activate'} Subscription`,
      message: 'Are you sure you want to cancel this subscription?',
      confirmText: `${status === 'inactive' ? 'Deactivate' : 'Activate'} Subscription`,
      cancelText: 'No',
      onConfirm: async () => {
        const result = await toggleSubscription(subscriptionId, status, plan);
        if (result.success) {
          showNotification('Subscription cancelled', 'info');
        } else {
          showNotification(result.error || 'Failed to cancel subscription', 'error');
        }
      },
      showCancel: true
    });
  }

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return isoString; // Fallback if string is corrupt
    }
  };



  const steps = [
    {
      target: '.admin-tabs',
      content: 'Navigate between different admin sections',
      title: 'Admin Navigation',
      placement: 'bottom',
    },
    {
      target: '.stats-grid',
      content: 'View key metrics and performance indicators',
      title: 'Dashboard Stats',
      placement: 'top',
    },
    {
      target: '.recent-activity',
      content: 'Monitor recent user activity and system events',
      title: 'Recent Activity',
      placement: 'top',
    }
  ];


  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (loading && users.length === 0 && subscriptions.length === 0) {
    return (
      <div className="admin-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/*<Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        styles={{
          options: { primaryColor: '#2c5aa0' }
        }}
      />*/}

      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.email}</p>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div className="admin-tabs-wrapper">
        <div className="admin-tabs">
          {[
            { name: "dashboard", icon: "fa-chart-pie" },
            { name: "users", icon: "fa-users" },
            { name: "subscriptions", icon: "fa-crown" },
            { name: "predictions", icon: "fa-futbol" },
          ].map((tab) => (
            <button
              key={tab.name}
              className={`tab-btn ${activeTab === tab.name ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="admin-content">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <i className="fas fa-users"></i>
                <div className="stat-info">
                  <h3>{users.length}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-crown"></i>
                <div className="stat-info">
                  <h3>{subscriptions.filter(sub => sub.status === "active").length}</h3>
                  <p>Active Subscriptions</p>
                </div>
              </div>
              {/*<div className="stat-card">
                <i className="fas fa-futbol"></i>
                <div className="stat-info">
                  <h3>{stats.totalPredictions}</h3>
                  <p>Total Predictions</p>
                </div>
              </div>*/}
              <div className="stat-card">
                <i className="fas fa-money-bill-wave"></i>
                <div className="stat-info">
                  <h3>KSh {subscriptions.reduce((sum, item) => sum + parseFloat(item.price), 0).toLocaleString()}</h3>
                  <p>Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="recent-activity">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <i className="fas fa-user-plus"></i>
                  <div className="activity-details">
                    <p>New user registered: John Doe</p>
                    <span>2 minutes ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-crown"></i>
                  <div className="activity-details">
                    <p>New subscription: Monthly plan</p>
                    <span>15 minutes ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-futbol"></i>
                  <div className="activity-details">
                    <p>New prediction added: Man City vs Liverpool</p>
                    <span>1 hour ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <i className="fas fa-money-bill"></i>
                  <div className="activity-details">
                    <p>Payment received: KSh 2,000</p>
                    <span>2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="table-header">
              <h2>User Management</h2>
              <button className="btn-add">
                <i className="fas fa-plus"></i> Add User
              </button>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Membership</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users && users.map((u, index) => (
                    <tr key={u.id}>
                      <td>#{index + 1}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.membership}`}>
                          {u.membership}
                        </span>
                      </td>
                      <td>{formatTime(u.joinDate)}</td>
                      <td>
                        <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                          {u.isActive ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            className="btn-icon"
                            title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleUserStatus(u.id)}
                          >
                            <i className={`fas ${u.status === 'active' ? 'fa-ban' : 'fa-check'}`}></i>
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Delete"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && hasMoreUsers && (
                <button onClick={() => fetchUsers(false)}>Load More Users</button>
              )}
              {!hasMoreUsers && users.length > 0 && <p>No more users.</p>}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="subscriptions-tab">
            <h2>Subscription Management</h2>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions && subscriptions.map((sub, index) => (
                    <tr key={sub.id}>
                      <td>#{index + 1}</td>
                      <td>{users.find(user => user.id === sub.userId)?.name || 'Unknown User'}</td>
                      <td>
                        <span className={`badge ${sub.plan}`}>
                          {sub.plan}
                        </span>
                      </td>
                      <td>KSh {sub.price}</td>
                      <td>{formatTime(sub.startDate)}</td>
                      <td>{formatTime(sub.endDate)}</td>
                      <td>
                        <span className={`status-badge ${sub.status}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="View">
                            <i className="fas fa-eye"></i>
                          </button>
                          {sub.status !== 'cancelled' && (
                            <button
                              className="btn-icon warning"
                              title="Cancel"
                              onClick={() => handleCancelSubscription(sub.id)}
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          )},
                          {/*sub.status === 'active' && */(
                            <button
                              className="btn-icon warning"
                              title={sub.status === 'inactive' ? 'Activate' : 'Deactivate'}
                              onClick={() => handleToggleSubscription(sub.id, sub.status === 'inactive' ? 'active' : 'inactive', sub.plan)}
                            >
                              <i className={`fas ${sub.status === 'inactive' ? 'fa-toggle-off' : 'fa-toggle-on'}`}></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && hasMoreSubscriptions && (
                <button onClick={() => fetchSubscriptions(false)}>Load More Subscriptions</button>
              )}
              {!hasMoreSubscriptions && subscriptions.length > 0 && <p>No more subscriptions.</p>}
            </div>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="predictions-tab">
            <div className="table-header">
              <h2>Prediction Management</h2>
              <button className="btn-add">
                <i className="fas fa-plus"></i> Add Prediction
              </button>
            </div>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Match</th>
                    <th>League</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Views</th>
                    <th>Accuracy</th>
                    {/*<th>Actions</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.map((pred, index) => (

                    <tr key={pred.id}>
                      <td>#{index + 1}</td>
                      <td><>{pred.home}</> <br />vs<br /><>{pred.away}</></td>
                      <td>{pred.leagueName}</td>
                      <td>{formatTime(pred.start_time)}</td>
                      <td>
                        <span className={`status-badge ${pred.status.status_text === "Prematch" ? 'active' : 'inactive'}`}>
                          {pred.status.status_text}
                        </span>
                      </td>
                      <td>{Object.entries(pred.predictions).map(([key, details], idx) => (<>{details.label}<br /></>))}</td>
                      <td>{Object.entries(pred.predictions).map(([key, details], idx) => (<>{details.value}%<br /></>))}</td>
                      {/*<td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="btn-icon" title="View">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="btn-icon delete"
                            title="Delete"
                            onClick={() => handleDeletePrediction(pred.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>*/}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;