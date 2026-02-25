// Main JavaScript for Sport IQ

document.addEventListener("DOMContentLoaded", function () {
  // Filter functionality
  const filterButtons = document.querySelectorAll(".filter-btn");
  const predictionCards = document.querySelectorAll(".prediction-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      // Add active class to clicked button
      this.classList.add("active");

      const filter = this.textContent.toLowerCase();

      predictionCards.forEach((card) => {
        if (filter === "all matches") {
          card.style.display = "block";
        } else if (filter === "premium tips") {
          if (card.classList.contains("premium")) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        } else {
          // Add more filter logic as needed
          card.style.display = "block";
        }
      });
    });
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  // Subscription button functionality
  const subscribeButtons = document.querySelectorAll(".btn-subscribe");

  subscribeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const plan =
        this.closest(".pricing-card").querySelector("h3").textContent;
      alert(`Redirecting to ${plan} subscription page...`);
      // In a real app, this would redirect to payment processing
    });
  });

  // View Analysis button functionality
  const viewAnalysisButtons = document.querySelectorAll(".btn-view-analysis");

  viewAnalysisButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const match =
        this.closest(".prediction-card").querySelector(".teams").textContent;
      alert(`Showing detailed analysis for: ${match}`);
      // In a real app, this would show a modal or redirect to analysis page
    });
  });

  // Login/Signup button functionality
  document.querySelector(".btn-login").addEventListener("click", function () {
    alert("Redirecting to login page...");
  });

  document.querySelector(".btn-signup").addEventListener("click", function () {
    alert("Redirecting to registration page...");
  });

  // Navbar scroll effect
  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
      navbar.style.backdropFilter = "blur(10px)";
    } else {
      navbar.style.background = "#fff";
      navbar.style.backdropFilter = "none";
    }
  });

  // Sample data for dynamic content (in a real app, this would come from an API)
  const sampleMatches = [
    {
      league: "Champions League",
      team1: "Real Madrid",
      team2: "Bayern Munich",
      time: "Today • 20:00 GMT",
      predictions: [
        { market: "1X2", prediction: "1", confidence: "high", value: "82%" },
        {
          market: "OVER/UNDER",
          prediction: "OVER 2.5",
          confidence: "medium",
          value: "75%",
        },
        { market: "GG/NG", prediction: "GG", confidence: "high", value: "80%" },
      ],
    },
  ];

  // Function to dynamically add matches (for demonstration)
  function addSampleMatch(matchData) {
    const grid = document.querySelector(".predictions-grid");
    const newCard = document.createElement("div");
    newCard.className = "prediction-card premium";
    newCard.innerHTML = `
            <div class="match-header">
                <span class="league">${matchData.league}</span>
                <span class="premium-badge">Premium</span>
            </div>
            <div class="teams">
                <div class="team">
                    <img src="https://via.placeholder.com/40" alt="${matchData.team1}">
                    <span>${matchData.team1}</span>
                </div>
                <div class="vs">VS</div>
                <div class="team">
                    <img src="https://via.placeholder.com/40" alt="${matchData.team2}">
                    <span>${matchData.team2}</span>
                </div>
            </div>
            <div class="match-time">${matchData.time}</div>
            <div class="predictions-list">
                ${matchData.predictions
                  .map(
                    (pred) => `
                    <div class="prediction-item">
                        <span class="market">${pred.market}</span>
                        <span class="prediction">${pred.prediction}</span>
                        <span class="confidence ${pred.confidence}">${pred.value}</span>
                    </div>
                `,
                  )
                  .join("")}
            </div>
            <div class="analysis-preview">
                <h4>Expert Analysis</h4>
                <p>Comprehensive analysis available for premium subscribers.</p>
                <button class="btn-view-analysis">View Full Analysis</button>
            </div>
        `;
    grid.appendChild(newCard);
  }

  // Add event listener for the new analysis buttons
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("btn-view-analysis")) {
      const card = e.target.closest(".prediction-card");
      const teams = card.querySelector(".teams").textContent;
      alert(`Showing premium analysis for: ${teams}`);
    }
  });
});
