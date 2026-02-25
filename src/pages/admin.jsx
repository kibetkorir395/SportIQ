import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import Joyride from 'react-joyride';
import './admin.css';

function Admin({ showNotification, showModal }) {
  const navigate = useNavigate();
  const { user, userProfile } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [runTour, setRunTour] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeSubscriptions: 342,
    totalPredictions: 89,
    totalRevenue: 456000,
    recentUsers: [],
    recentPredictions: []
  });

  // Mock data for demonstration
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", membership: "premium", joinDate: "2024-02-01", status: "active" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", membership: "free", joinDate: "2024-02-15", status: "active" },
    { id: 3, name: "Mike Johnson", email: "mike@example.com", membership: "premium", joinDate: "2024-01-28", status: "active" },
    { id: 4, name: "Sarah Williams", email: "sarah@example.com", membership: "free", joinDate: "2024-02-10", status: "inactive" },
    { id: 5, name: "David Brown", email: "david@example.com", membership: "premium", joinDate: "2024-01-15", status: "active" },
    { id: 6, name: "Emily Davis", email: "emily@example.com", membership: "free", joinDate: "2024-02-20", status: "active" },
    { id: 7, name: "Chris Wilson", email: "chris@example.com", membership: "premium", joinDate: "2024-01-05", status: "active" },
    { id: 8, name: "Lisa Anderson", email: "lisa@example.com", membership: "free", joinDate: "2024-02-18", status: "inactive" },
  ]);

  const [predictions, setPredictions] = useState([
    { id: 1, match: "Manchester City vs Liverpool", league: "Premier League", date: "2024-02-23", status: "active", views: 234, accuracy: "85%" },
    { id: 2, match: "Real Madrid vs Barcelona", league: "La Liga", date: "2024-02-22", status: "active", views: 567, accuracy: "78%" },
    { id: 3, match: "Bayern vs Dortmund", league: "Bundesliga", date: "2024-02-21", status: "archived", views: 189, accuracy: "92%" },
    { id: 4, match: "Inter vs AC Milan", league: "Serie A", date: "2024-02-20", status: "active", views: 145, accuracy: "71%" },
    { id: 5, match: "PSG vs Marseille", league: "Ligue 1", date: "2024-02-19", status: "active", views: 98, accuracy: "88%" },
    { id: 6, match: "Ajax vs Feyenoord", league: "Eredivisie", date: "2024-02-18", status: "archived", views: 76, accuracy: "83%" },
  ]);

  const [subscriptions, setSubscriptions] = useState([
    { id: 1, user: "John Doe", plan: "monthly", amount: 2000, startDate: "2024-02-01", endDate: "2024-03-01", status: "active" },
    { id: 2, user: "Jane Smith", plan: "weekly", amount: 600, startDate: "2024-02-15", endDate: "2024-02-22", status: "active" },
    { id: 3, user: "Mike Johnson", plan: "monthly", amount: 2000, startDate: "2024-01-28", endDate: "2024-02-28", status: "active" },
    { id: 4, user: "Sarah Williams", plan: "quarterly", amount: 5000, startDate: "2024-01-01", endDate: "2024-04-01", status: "expired" },
    { id: 5, user: "David Brown", plan: "monthly", amount: 2000, startDate: "2024-01-15", endDate: "2024-02-15", status: "active" },
  ]);

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
        onConfirm: () => navigate('/get-started')
      });
    } else if (!isAdmin) {
      showModal({
        type: 'error',
        title: 'Unauthorized',
        message: 'You do not have permission to access the admin panel',
        confirmText: 'Go Home',
        onConfirm: () => navigate('/')
      });
    }
    
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [user, userProfile, navigate, showModal]);

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

  const handleDeleteUser = (userId) => {
    showModal({
      type: 'warning',
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => {
        setUsers(users.filter(u => u.id !== userId));
        showNotification('User deleted successfully', 'success');
      },
      showCancel: true
    });
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } 
        : u
    ));
    showNotification('User status updated', 'info');
  };

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
      onConfirm: () => {
        setSubscriptions(subscriptions.map(s => 
          s.id === subscriptionId ? { ...s, status: 'cancelled' } : s
        ));
        showNotification('Subscription cancelled', 'info');
      },
      showCancel: true
    });
  };

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (loading) {
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
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        styles={{
          options: { primaryColor: '#22c55e' }
        }}
      />

      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user?.email}</p>
      </div>

      {/* Horizontal Scrollable Tabs */}
      <div className="admin-tabs-wrapper">
        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-chart-pie"></i>
            <span>Dashboard</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i>
            <span>Users</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'predictions' ? 'active' : ''}`}
            onClick={() => setActiveTab('predictions')}
          >
            <i className="fas fa-futbol"></i>
            <span>Predictions</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <i className="fas fa-crown"></i>
            <span>Subscriptions</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <i className="fas fa-chart-line"></i>
            <span>Analytics</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <i className="fas fa-file-alt"></i>
            <span>Reports</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveTab('support')}
          >
            <i className="fas fa-headset"></i>
            <span>Support</span>
          </button>
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
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-crown"></i>
                <div className="stat-info">
                  <h3>{stats.activeSubscriptions}</h3>
                  <p>Active Subscriptions</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-futbol"></i>
                <div className="stat-info">
                  <h3>{stats.totalPredictions}</h3>
                  <p>Total Predictions</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-money-bill-wave"></i>
                <div className="stat-info">
                  <h3>KSh {stats.totalRevenue.toLocaleString()}</h3>
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
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.membership}`}>
                          {user.membership}
                        </span>
                      </td>
                      <td>{user.joinDate}</td>
                      <td>
                        <span className={`status-badge ${user.status}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-icon" 
                            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleUserStatus(user.id)}
                          >
                            <i className={`fas ${user.status === 'active' ? 'fa-ban' : 'fa-check'}`}></i>
                          </button>
                          <button 
                            className="btn-icon delete" 
                            title="Delete"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map(pred => (
                    <tr key={pred.id}>
                      <td>#{pred.id}</td>
                      <td>{pred.match}</td>
                      <td>{pred.league}</td>
                      <td>{pred.date}</td>
                      <td>
                        <span className={`status-badge ${pred.status}`}>
                          {pred.status}
                        </span>
                      </td>
                      <td>{pred.views}</td>
                      <td>{pred.accuracy}</td>
                      <td>
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  {subscriptions.map(sub => (
                    <tr key={sub.id}>
                      <td>#{sub.id}</td>
                      <td>{sub.user}</td>
                      <td>
                        <span className={`badge ${sub.plan}`}>
                          {sub.plan}
                        </span>
                      </td>
                      <td>KSh {sub.amount}</td>
                      <td>{sub.startDate}</td>
                      <td>{sub.endDate}</td>
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
                          {sub.status === 'active' && (
                            <button 
                              className="btn-icon warning" 
                              title="Cancel"
                              onClick={() => handleCancelSubscription(sub.id)}
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Placeholder for other tabs */}
        {(activeTab === 'analytics' || activeTab === 'settings' || activeTab === 'reports' || activeTab === 'support') && (
          <div className="placeholder-tab">
            <i className="fas fa-tools"></i>
            <h3>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section</h3>
            <p>This section is under construction</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;