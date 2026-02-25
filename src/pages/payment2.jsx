import React, { useEffect, useState } from 'react';
import './payment.css';
import { pricings } from '../data';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import Joyride from 'react-joyride';
import Swal from 'sweetalert2';

//with sweetalert2
export default function Payment({ showNotification, showModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile, createSubscription } = useFirebase();
  const [loading, setLoading] = useState(false);
  const [runTour, setRunTour] = useState(true);
  const [paymentDetail, setPaymentDetail] = useState('');

  // Get selected package from location state
  const [selectedPackage, setSelectedPackage] = useState(
    location.state?.pricing?.period || pricings[0].period
  );
  const [selectedPricing, setSelectedPricing] = useState(
    location.state?.pricing || pricings[0]
  );

  // Update selectedPricing when package changes
  useEffect(() => {
    const pricing = pricings.find(p => p.period === selectedPackage);
    if (pricing) {
      setSelectedPricing(pricing);
    }
  }, [selectedPackage]);

  const methods = [ 
    {
      type: "MPesa",
      detail: "Phone Number"
    },
    {
      type: "PayPal",
      detail: "Email"
    },
    {
      type: "Crypto",
      detail: "Wallet"
    },
    {
      type: "Card Payment",
      detail: "Card Number"
    } 
  ];

  const [selectedMethod, setSelectedMethod] = useState(methods[0].type);

  const steps = [
    {
      target: '.form-group select',
      content: 'Select your preferred subscription plan',
      title: 'Choose Plan',
      placement: 'bottom',
    },
    {
      target: '#method',
      content: 'Choose your payment method',
      title: 'Payment Method',
      placement: 'bottom',
    },
    {
      target: '#number',
      content: 'Enter your payment details',
      title: 'Payment Details',
      placement: 'top',
    },
    {
      target: '.btn',
      content: 'Complete your payment to activate subscription',
      title: 'Pay Now',
      placement: 'top',
    }
  ];

  useEffect(() => {
    if (!user) {
      showModal({
        type: 'warning',
        title: 'Login Required',
        message: 'Please login to complete your payment',
        confirmText: 'Login Now',
        onConfirm: () => navigate('/get-started')
      });
    }
  }, [user, navigate, showModal]);

  // Format phone number for M-Pesa
  const formatPhoneNumber = (phone) => {
    if (!phone) return '254712345678';
    
    let p = phone.toString().replace(/\D/g, '');
    if (p.startsWith('0')) {
      return '254' + p.substring(1);
    }
    if (p.startsWith('7') || p.startsWith('1')) {
      return '254' + p;
    }
    if (p.startsWith('254')) {
      return p;
    }
    return p;
  };

  // Generate random email
  const generateRandomEmail = () => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];
    
    let username = '';
    const usernameLength = Math.floor(Math.random() * 5) + 8;
    
    for (let i = 0; i < usernameLength; i++) {
      if (i < 6) {
        username += letters.charAt(Math.floor(Math.random() * letters.length));
      } else {
        if (Math.random() < 0.6) {
          username += letters.charAt(Math.floor(Math.random() * letters.length));
        } else {
          username += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
      }
    }
    
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${username}@${domain}`;
  };

  // Payment polling
  const startPaymentPolling = (reference, amount) => {
    let attempts = 0;
    const maxAttempts = 30;
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        Swal.fire({
          title: 'Payment Timeout',
          html: '⏰ Payment monitoring timeout. Please check your transaction history.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        setLoading(false);
        return;
      }
      
      attempts++;
      
      try {
        const response = await fetch(`https://genuine-flow-production-b0ae.up.railway.app/api/status/${reference}`);
        const data = await response.json();
        
        if (data.success) {
          if (data.paid) {
            // Payment successful - create subscription
            await handleSuccessfulPayment(amount, reference);
            return;
          }
          
          if (data.can_retry) {
            Swal.fire({
              title: 'Payment Not Completed',
              html: '⚠️ Payment not completed. You can try again.',
              icon: 'warning',
              confirmButtonText: 'OK'
            });
            setLoading(false);
            return;
          }
          
          // Continue polling
          setTimeout(checkStatus, 6000);
        }
      } catch (error) {
        console.error('Status check error:', error);
        setTimeout(checkStatus, 6000);
      }
    };
    
    setTimeout(checkStatus, 6000);
  };

  // Handle successful payment
  const handleSuccessfulPayment = async (amount, reference) => {
    if (!user || !selectedPricing) return;

    try {
      // Calculate end date based on package period
      const getEndDate = () => {
        const now = new Date();
        switch(selectedPricing.period) {
          case 'day':
            return new Date(now.setDate(now.getDate() + 1)).toISOString();
          case 'week':
            return new Date(now.setDate(now.getDate() + 7)).toISOString();
          case 'month':
            return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
          case 'quarter':
            return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
          default:
            return new Date(now.setDate(now.getDate() + 30)).toISOString();
        }
      };

      // Create subscription
      const subscriptionData = {
        plan: selectedPricing.period,
        price: parseInt(selectedPricing.price),
        paymentMethod: selectedMethod,
        paymentReference: reference,
        startDate: new Date().toISOString(),
        endDate: getEndDate(),
        status: 'active'
      };

      const result = await createSubscription(subscriptionData);

      if (result.success) {
        showNotification(`🎉 Payment successful! Your ${selectedPricing.period}ly subscription is active.`, 'success');
        
        Swal.fire({
          title: 'Payment Complete! ✅',
          html: `
            <div style="text-align: center;">
              <i class="fas fa-check-circle" style="font-size: 48px; color: #10b981;"></i>
              <h3 style="margin: 15px 0;">KSh ${selectedPricing.price} Paid</h3>
              <p>Your ${selectedPricing.period}ly subscription has been activated.</p>
              <p style="font-size: 12px; color: var(--gray);">Reference: ${reference}</p>
            </div>
          `,
          icon: 'success',
          confirmButtonText: 'View Predictions'
        }).then(() => {
          navigate('/predictions');
        });
      } else {
        throw new Error(result.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      showNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!user) {
      showNotification('Please login first', 'warning');
      navigate('/get-started');
      return;
    }

    if (!paymentDetail) {
      showNotification('Please enter payment details', 'warning');
      return;
    }

    // Validate phone number for M-Pesa
    if (selectedMethod === 'MPesa') {
      const phoneRegex = /^(07|01|\+254|254)[0-9]{8,9}$/;
      const cleanedPhone = paymentDetail.replace(/\D/g, '');
      if (cleanedPhone.length < 9 || cleanedPhone.length > 12) {
        showNotification('Please enter a valid phone number', 'warning');
        return;
      }
    }

    setLoading(true);

    try {
      // Process M-Pesa payment
      if (selectedMethod === 'MPesa') {
        const formattedPhone = formatPhoneNumber(paymentDetail);
        const email = generateRandomEmail();
        const amount = parseInt(selectedPricing.price);

        const response = await fetch('https://genuine-flow-production-b0ae.up.railway.app/api/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            amount: amount,
            phone: formattedPhone
          })
        });

        const result = await response.json();

        if (result.success && result.requires_authorization) {
          // Show M-Pesa STK Push prompt
          Swal.fire({
            title: 'Check Your Phone',
            html: `
              <div style="text-align: center;">
                <i class="fas fa-mobile-alt" style="font-size: 48px; color: #065f46;"></i>
                <h3 style="margin: 15px 0;">Enter M-Pesa PIN</h3>
                <p>Check your phone to authorize payment of <strong>KSh ${amount}</strong></p>
                <p style="font-size: 12px; color: var(--gray);">Phone: ${formattedPhone}</p>
              </div>
            `,
            icon: 'info',
            confirmButtonText: 'OK'
          }).then(() => {
            // Start polling for payment status
            startPaymentPolling(result.reference, amount);
          });
        } else {
          throw new Error(result.message || 'Payment initialization failed');
        }
      } else {
        // Handle other payment methods (PayPal, Card, Crypto)
        showNotification(`${selectedMethod} payment coming soon!`, 'info');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      showNotification(error.message || 'Payment failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  const getMethodDetail = () => {
    const method = methods.find(m => m.type === selectedMethod);
    return method ? method.detail : 'Details';
  };

  const getMethodPlaceholder = () => {
    switch(selectedMethod) {
      case 'MPesa':
        return 'e.g., 0712345678 or 254712345678';
      case 'PayPal':
        return 'Enter your PayPal email';
      case 'Crypto':
        return 'Enter your wallet address';
      case 'Card Payment':
        return 'Enter card number';
      default:
        return `Enter your ${getMethodDetail().toLowerCase()}`;
    }
  };

  return (
    <div className="payment-container" style={{marginTop: "70px"}}>
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

      <h2>Checkout</h2>
      
      {/* Selected Package Summary */}
      {selectedPricing && (
        <div className="package-summary" style={{
          background: '#f0fdf4',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '2px solid #22c55e'
        }}>
          <h3 style={{ color: '#166534', marginBottom: '5px' }}>
            {selectedPricing.period.charAt(0).toUpperCase() + selectedPricing.period.slice(1)}ly Plan
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#166534' }}>
              KSh {selectedPricing.price}
            </span>
            <span style={{ color: '#166534' }}>
              {selectedPricing.features.length} Features Included
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handlePayment}>
        <div className="form-group">
          <label htmlFor="plan">Select Plan</label>
          <select 
            id="plan" 
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            disabled={loading}
          >
            {pricings.map((pricing, index) => (
              <option value={pricing.period} key={index}>
                {(pricing.period + "ly").toUpperCase()} - Ksh {pricing.price}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="method">Payment Method</label>
          <select 
            id="method" 
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            disabled={loading}
          >
            {methods.map((method, index) => (
              <option 
                value={method.type} 
                key={index} 
                disabled={method.type !== "MPesa"}
              >
                {method.type} {method.type !== "MPesa" ? '(Coming Soon)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="number">{getMethodDetail()}</label>
          <input 
            type="text" 
            id="number" 
            placeholder={getMethodPlaceholder()}
            value={paymentDetail}
            onChange={(e) => setPaymentDetail(e.target.value)}
            disabled={loading}
            required
          />
          {selectedMethod === 'MPesa' && (
            <small style={{ color: 'var(--gray)', marginTop: '5px', display: 'block' }}>
              Enter your M-Pesa phone number (e.g., 0712345678)
            </small>
          )}
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
              Processing...
            </>
          ) : (
            `Pay KSh ${selectedPricing?.price || '0'} Now`
          )}
        </button>
      </form>

      {/* Payment Info */}
      <div className="payment-info" style={{
        marginTop: '20px',
        padding: '15px',
        background: '#e8f5e9',
        borderRadius: '10px',
        fontSize: '0.9rem'
      }}>
        <h4 style={{ color: '#166534', marginBottom: '10px' }}>
          <i className="fas fa-info-circle"></i> Payment Information
        </h4>
        <ul style={{ paddingLeft: '20px', color: '#166534' }}>
          <li>You'll receive an M-Pesa prompt on your phone</li>
          <li>Enter your PIN to authorize the payment</li>
          <li>Subscription activates immediately after payment</li>
          <li>All payments are secure and encrypted</li>
        </ul>
      </div>
    </div>
  );
}