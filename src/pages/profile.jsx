import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebase } from "../contexts/FirebaseContext";
import { useUserSubscriptions } from "../hooks/useUserSubscriptions";
import Joyride from 'react-joyride';
import './profile.css';

function Profile({ showNotification, showModal }) {
  const navigate = useNavigate();
  const { 
    user, 
    userProfile, 
    updateUserProfile, 
    updateUserEmail, 
    updateUserPassword,
    signOutUser,
    deleteUserAccount 
  } = useFirebase();
  const { subscriptions, loading: subsLoading, hasActiveSubscription, activeSubscription } = useUserSubscriptions();
  
  const [loading, setLoading] = useState(false);
  const [runTour, setRunTour] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [predictions, setPredictions] = useState([]);
  const [predictionsLoading, setPredictionsLoading] = useState(true);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    phoneNumber: '',
    photoURL: ''
  });

  // Email form state
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    confirmEmail: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data into forms
  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        displayName: userProfile.displayName || '',
        phoneNumber: userProfile.phoneNumber || '',
        photoURL: userProfile.photoURL || ''
      });
    }
  }, [userProfile]);

  // Fetch user's prediction history
  useEffect(() => {
    const fetchUserPredictions = async () => {
      if (user) {
        setPredictionsLoading(true);
        try {
          // In real app, fetch from Firebase
          // const result = await getUserPredictions(user.uid);
          // if (result.success) setPredictions(result.predictions);
          
          // Sample data
          setTimeout(() => {
            setPredictions([
              {
                id: 1,
                match: "Manchester City vs Liverpool",
                date: "2024-02-23",
                prediction: "1X2: 1",
                result: "won",
                profit: "+2.5 units"
              },
              {
                id: 2,
                match: "Real Madrid vs Barcelona",
                date: "2024-02-22",
                prediction: "OVER 2.5",
                result: "lost",
                profit: "-1 unit"
              },
              {
                id: 3,
                match: "Bayern vs Dortmund",
                date: "2024-02-21",
                prediction: "GG",
                result: "won",
                profit: "+1.8 units"
              }
            ]);
            setPredictionsLoading(false);
          }, 1000);
        } catch (error) {
          console.error('Error fetching predictions:', error);
          setPredictionsLoading(false);
        }
      }
    };

    fetchUserPredictions();
  }, [user]);

  const steps = [
    {
      target: '.profile-header',
      content: 'View and manage your profile information',
      title: 'Your Profile',
      placement: 'bottom',
    },
    {
      target: '.profile-tabs',
      content: 'Switch between profile settings, subscription details, and prediction history',
      title: 'Navigation Tabs',
      placement: 'bottom',
    },
    {
      target: '.subscription-card',
      content: hasActiveSubscription 
        ? 'View your current subscription details' 
        : 'Upgrade to premium for access to all predictions',
      title: hasActiveSubscription ? 'Active Subscription' : 'No Active Subscription',
      placement: 'top',
    }
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUserProfile(profileForm);
      
      if (result.success) {
        showNotification('✅ Profile updated successfully!', 'success');
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Error updating profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    
    if (emailForm.newEmail !== emailForm.confirmEmail) {
      showNotification('Emails do not match', 'warning');
      return;
    }

    setLoading(true);

    try {
      const result = await updateUserEmail(emailForm.newEmail);
      
      if (result.success) {
        showNotification('✅ Email updated successfully!', 'success');
        setEmailForm({ newEmail: '', confirmEmail: '' });
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Error updating email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('Passwords do not match', 'warning');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showNotification('Password must be at least 6 characters', 'warning');
      return;
    }

    setLoading(true);

    try {
      const result = await updateUserPassword(passwordForm.newPassword);
      
      if (result.success) {
        showNotification('✅ Password updated successfully!', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      showNotification('Error updating password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    showModal({
      type: 'warning',
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      confirmText: 'Yes, Sign Out',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const result = await signOutUser();
        if (result.success) {
          showNotification('👋 Signed out successfully', 'info');
          navigate('/');
        } else {
          showNotification(result.error, 'error');
        }
      },
      showCancel: true
    });
  };

  const handleDeleteAccount = async () => {
    showModal({
      type: 'error',
      title: 'Delete Account',
      message: 'This action is irreversible. All your data will be permanently deleted. Are you sure?',
      confirmText: 'Delete My Account',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const result = await deleteUserAccount();
        if (result.success) {
          showNotification('Account deleted successfully', 'info');
          navigate('/');
        } else {
          showNotification(result.error, 'error');
        }
      },
      showCancel: true
    });
  };

  const handleInputChange = (e, formType) => {
    const { name, value } = e.target;
    
    switch(formType) {
      case 'profile':
        setProfileForm(prev => ({ ...prev, [name]: value }));
        break;
      case 'email':
        setEmailForm(prev => ({ ...prev, [name]: value }));
        break;
      case 'password':
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        break;
      default:
        break;
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="profile-container" style={{ marginTop: "80px", textAlign: "center", padding: "50px" }}>
        <h2>Please log in to view your profile</h2>
        <button className="btn" onClick={() => navigate('/get-started')} style={{ width: "auto", padding: "12px 30px" }}>
          Go to Login
        </button>
      </div>
    );
  }

  const isPageLoading = subsLoading || predictionsLoading;

  return (
    <div className="profile-container">
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

      <div className="profile-header">
        <div className="profile-avatar">
          {userProfile?.photoURL ? (
            <img src={userProfile.photoURL} alt={userProfile.displayName} />
          ) : (
            <div className="avatar-placeholder">
              {getInitials(userProfile?.displayName || user?.email)}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{userProfile?.displayName || 'User'}</h1>
          <p className="profile-email">{user?.email}</p>
          <p className="profile-member-since">
            Member since {userProfile?.joinDate ? formatDate(userProfile.joinDate) : 'N/A'}
          </p>
        </div>
        <button className="btn-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>

      <div className="profile-tabs">
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Settings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          Subscription
        </button>
        {/*<button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Prediction History
        </button>*/}
        <button 
          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className="profile-content">
        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label htmlFor="displayName">Display Name</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={profileForm.displayName}
                  onChange={(e) => handleInputChange(e, 'profile')}
                  placeholder="Your name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profileForm.phoneNumber}
                  onChange={(e) => handleInputChange(e, 'profile')}
                  placeholder="Your phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="photoURL">Profile Photo URL</label>
                <input
                  type="url"
                  id="photoURL"
                  name="photoURL"
                  value={profileForm.photoURL}
                  onChange={(e) => handleInputChange(e, 'profile')}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="profile-section">
            <h2>Subscription Details</h2>
            
            {isPageLoading ? (
              <div className="loading-spinner small">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <div className={`subscription-card ${hasActiveSubscription ? 'active' : 'inactive'}`}>
                  <div className="subscription-status">
                    {hasActiveSubscription ? '🟢 Active' : '🔴 Inactive'}
                  </div>
                  
                  {hasActiveSubscription ? (
                    <>
                      <h3>{activeSubscription?.plan?.toUpperCase() + "LY"} Plan</h3>
                      <p className="subscription-price">
                        KSH {activeSubscription?.price} / {activeSubscription?.plan}
                      </p>
                      <div className="subscription-dates">
                        <p>Started: {formatDate(activeSubscription?.startDate)}</p>
                        <p>Ends: {formatDate(activeSubscription?.endDate)}</p>
                      </div>
                      <button 
                        className="btn-cancel"
                        onClick={() => {
                          showModal({
                            type: 'warning',
                            title: 'Cancel Subscription',
                            message: 'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
                            confirmText: 'Yes, Cancel',
                            cancelText: 'No, Keep It',
                            onConfirm: () => {
                              // Handle cancellation
                              showNotification('Subscription cancelled successfully', 'info');
                            },
                            showCancel: true
                          });
                        }}
                      >
                        Cancel Subscription
                      </button>
                    </>
                  ) : (
                    <>
                      <h3>No Active Subscription</h3>
                      <p>Upgrade to premium to access all predictions and features</p>
                      <button 
                        className="btn-upgrade"
                        onClick={() => navigate('/premium')}
                      >
                        View Packages
                      </button>
                    </>
                  )}
                </div>

                <div className="subscription-history">
                  <h3>Subscription History</h3>
                  {subscriptions && subscriptions.length > 0 ? (
                    <div className="history-list">
                      {subscriptions.map((sub, index) => (
                        <div key={index} className="history-item">
                          <span className={`status-badge ${sub.status}`}>{sub.status}</span>
                          <span className="plan">{sub.plan}</span>
                          <span className="date">{formatDate(sub.startDate)}</span>
                          <span className="price">KSH {sub.price}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No subscription history</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Prediction History Tab */}
        {activeTab === 'history' && (
          <div className="profile-section">
            <h2>Your Prediction History</h2>
            
            {predictionsLoading ? (
              <div className="loading-spinner small">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                <div className="stats-cards">
                  <div className="stat-card">
                    <span className="stat-value">
                      {predictions.filter(p => p.result === 'won').length}
                    </span>
                    <span className="stat-label">Won</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">
                      {predictions.filter(p => p.result === 'lost').length}
                    </span>
                    <span className="stat-label">Lost</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value">
                      {predictions.length}
                    </span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-value profit">
                      +{predictions
                        .filter(p => p.result === 'won')
                        .reduce((acc, p) => acc + parseFloat(p.profit), 0)
                        .toFixed(2)} units
                    </span>
                    <span className="stat-label">Total Profit</span>
                  </div>
                </div>

                <div className="predictions-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Match</th>
                        <th>Prediction</th>
                        <th>Result</th>
                        <th>Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {predictions.map(pred => (
                        <tr key={pred.id}>
                          <td>{pred.date}</td>
                          <td>{pred.match}</td>
                          <td>{pred.prediction}</td>
                          <td>
                            <span className={`result-badge ${pred.result}`}>
                              {pred.result}
                            </span>
                          </td>
                          <td className={pred.result === 'won' ? 'profit' : 'loss'}>
                            {pred.profit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="profile-section">
            <h2>Security Settings</h2>
            
            <div className="security-section">
              <h3>Update Email</h3>
              <form onSubmit={handleEmailUpdate}>
                <div className="form-group">
                  <label htmlFor="newEmail">New Email</label>
                  <input
                    type="email"
                    id="newEmail"
                    name="newEmail"
                    value={emailForm.newEmail}
                    onChange={(e) => handleInputChange(e, 'email')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmEmail">Confirm Email</label>
                  <input
                    type="email"
                    id="confirmEmail"
                    name="confirmEmail"
                    value={emailForm.confirmEmail}
                    onChange={(e) => handleInputChange(e, 'email')}
                    required
                  />
                </div>
                <button type="submit" className="btn-save" disabled={loading}>
                  Update Email
                </button>
              </form>
            </div>

            <div className="security-section">
              <h3>Update Password</h3>
              <form onSubmit={handlePasswordUpdate}>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={(e) => handleInputChange(e, 'password')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handleInputChange(e, 'password')}
                    required
                  />
                </div>
                <button type="submit" className="btn-save" disabled={loading}>
                  Update Password
                </button>
              </form>
            </div>

            <div className="security-section danger">
              <h3>Danger Zone</h3>
              <p>Once you delete your account, there is no going back. Please be certain.</p>
              <button 
                className="btn-delete"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;