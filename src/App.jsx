import "./App.css";
import { Route, BrowserRouter as Router, Routes, useLocation } from "react-router-dom";
import Header from "./components/header";
import Footer from "./components/footer";
import Payment from "./pages/payment";
import Auth from "./pages/auth";
import ErrorPage from "./pages/error-page";
import Home from "./pages/home";
import Pricing from "./pages/pricing";
import Predictions from "./pages/predictions";
import Joyride from "react-joyride";
import { useState, useEffect } from "react";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { NotificationContainer, useNotification } from "./components/notification";
import { useModal } from "./components/Modal";
import Profile from "./pages/profile";
import Tips from "./pages/tips";
import Admin from "./pages/admin";

// ScrollToTop component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      //behavior: 'instant' // Use 'smooth' for animated scrolling
      behavior: 'smooth' // This gives a smooth scrolling animation
    });
  }, [pathname]);

  return null;
}

function AppContent() {
  const [runTour, setRunTour] = useState(true);
  const { notifications, removeNotification, showNotification } = useNotification();
  const { Modal, showModal } = useModal();

  //Even Simpler: Scroll to top when route changes
  /*useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);*/

  const steps = [
    {
      target: '.nav-menu',
      content: 'Navigate through our main sections here',
      title: 'Navigation Menu',
      placement: 'bottom',
    },
    {
      target: '.btn-signup',
      content: 'Click here to get started with Sport IQ',
      title: 'Get Started',
      placement: 'bottom',
    },
    {
      target: '.hero-buttons',
      content: 'Check out today\'s predictions or upgrade to VIP',
      title: 'Main Actions',
      placement: 'bottom',
    },
    {
      target: '.features-grid',
      content: 'Learn about the key features that make us stand out',
      title: 'Features',
      placement: 'top',
    }
  ];

  const handleJoyrideCallback = (data) => {
    const { status, type } = data;
    
    if (status === 'finished') {
      showNotification('🎉 Tour completed! You\'re ready to start winning!', 'success');
    } else if (status === 'skipped') {
      showNotification('Tour skipped. You can restart it anytime!', 'info');
    }
  };

  return (
    <Router>
      <ScrollToTop />
      <Header />
      <Joyride
        steps={steps}
        run={runTour}
        continuous={true}
        showSkipButton={true}
        showProgress={true}
        callback={handleJoyrideCallback}
        locale={{
          back: '← Back',
          close: '✕ Close',
          last: '✨ Got it!',
          next: 'Next →',
          skip: 'Skip tour',
        }}
        styles={{
          options: {
            primaryColor: '#22c55e',
            textColor: '#333',
            backgroundColor: '#fff',
            arrowColor: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home showNotification={showNotification} showModal={showModal} />}/>
        <Route path="/predictions" element={<Predictions showNotification={showNotification} showModal={showModal} />}/>
        <Route path="/premium" element={<Pricing showNotification={showNotification} showModal={showModal} />}/>
        <Route path="/payment" element={<Payment showNotification={showNotification} showModal={showModal} />} />
        <Route path="/get-started" element={<Auth showNotification={showNotification} showModal={showModal} />} />
        <Route path="/profile" element={<Profile showNotification={showNotification} showModal={showModal} />} />
        <Route path="/admin" element={<Admin showNotification={showNotification} showModal={showModal} />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
      <Footer />
      <NotificationContainer 
        notifications={notifications} 
        removeNotification={removeNotification} 
      />
      <Modal />
    </Router>
  );
}

function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}

export default App;
