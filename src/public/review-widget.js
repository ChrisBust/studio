
class ReviewWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.widgetId = this.getAttribute('widgetId');
    this.activeTab = 'all';
    this.reviews = [];
    this.widgetData = {};
    this.reviewsBySource = {};
    this.sources = [];
    
    // Bind methods
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.render = this.render.bind(this);
    this.fetchReviews = this.fetchReviews.bind(this);
  }

  connectedCallback() {
    this.fetchReviews();
  }

  fetchReviews() {
    const apiUrl = \`https://app-hosting-project-108784849315.uc.r.appspot.com/api/widgets/\${this.widgetId}\`;
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          this.widgetData = data.data;
          this.reviews = data.data.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          this.processReviews();
          this.render();
        } else {
          throw new Error(data.error || 'Failed to load widget data');
        }
      })
      .catch(error => {
        console.error('Error fetching widget data:', error);
        this.shadowRoot.innerHTML = \`<div class="error-message">Failed to load reviews. Please try again later.</div>\`;
      });
  }
  
  processReviews() {
    const sourceCounts = {};
    for (const review of this.reviews) {
      if (!sourceCounts[review.source]) {
        sourceCounts[review.source] = { reviews: [] };
      }
      sourceCounts[review.source].reviews.push(review);
    }
    this.reviewsBySource = sourceCounts;
    this.sources = Object.keys(sourceCounts).sort();
  }

  handleTabClick(tabName) {
    this.activeTab = tabName;
    this.render();
  }

  openModal() {
    const modal = this.shadowRoot.getElementById('review-modal');
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.querySelector('.modal-content').classList.add('visible');
      }, 10);
    }
  }

  closeModal() {
    const modal = this.shadowRoot.getElementById('review-modal');
    if (modal) {
      modal.querySelector('.modal-content').classList.remove('visible');
      setTimeout(() => {
        modal.style.display = 'none';
      }, 300);
    }
  }
  
  handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Manual validation
    if (!data.name || data.name.length < 2) {
      alert('Name must be at least 2 characters.');
      return;
    }
    if (!data.stars || data.stars < 1) {
      alert('Please select a star rating.');
      return;
    }
    if (!data.text || data.text.length < 10) {
      alert('Review must be at least 10 characters.');
      return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    fetch(\`https://app-hosting-project-108784849315.uc.r.appspot.com/api/widgets/\${this.widgetId}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        this.closeModal();
        this.fetchReviews(); // Re-fetch reviews to show the new one
      } else {
        alert('Error: ' + (result.message || 'Failed to submit review.'));
      }
    })
    .catch(error => {
      console.error('Error submitting review:', error);
      alert('An unexpected error occurred. Please try again.');
    })
    .finally(() => {
       if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Review';
      }
    });
  }

  render() {
    const { overallRating, totalReviews, ratingDistribution } = this.calculateMetrics();
    const currentReviews = this.activeTab === 'all' ? this.reviews : this.reviewsBySource[this.activeTab]?.reviews || [];

    this.shadowRoot.innerHTML = \`
      <style>
        :host {
          --background: 220 20% 98%;
          --foreground: 280 10% 15%;
          --card: 220 20% 100%;
          --card-foreground: 280 10% 15%;
          --primary: 283 60% 30%;
          --primary-foreground: 0 0% 98%;
          --muted: 220 20% 95%;
          --muted-foreground: 280 10% 40%;
          --accent: 308 100% 43%;
          --border: 220 20% 90%;
          --input: 220 20% 90%;
          --radius: 0.8rem;
          
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
          color: hsl(var(--foreground));
          box-sizing: border-box;
        }
        *, *::before, *::after { box-sizing: border-box; }

        .widget-container {
          background-color: hsl(var(--background));
          padding: 1rem 1.5rem;
          min-height: 100vh;
        }
        .max-w-4xl { max-width: 80rem; margin: 0 auto; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-12 { margin-top: 3rem; }

        .text-3xl { font-size: 1.875rem; }
        .font-bold { font-weight: 700; }
        .text-primary { color: hsl(var(--primary)); }
        .hover\\:underline:hover { text-decoration: underline; }
        a { text-decoration: none; color: inherit; }

        .grid { display: grid; gap: 1.5rem; }
        @media (min-width: 768px) { .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (min-width: 768px) { .md\\:col-span-1 { grid-column: span 1 / span 1; } }
        @media (min-width: 768px) { .md\\:col-span-2 { grid-column: span 2 / span 2; } }

        .card {
          background-color: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: var(--radius);
          border: 1px solid hsl(var(--border));
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
        }
        .p-6 { padding: 1.5rem; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .text-center { text-align: center; }
        .text-5xl { font-size: 3rem; }
        .mt-2 { margin-top: 0.5rem; }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .font-semibold { font-weight: 600; }
        .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
        .gap-2 { gap: 0.5rem; }
        .text-sm { font-size: 0.875rem; }
        .w-6 { width: 1.5rem; }
        .text-right { text-align: right; }
        .h-2 { height: 0.5rem; }
        .w-full { width: 100%; }
        .w-8 { width: 2rem; }
        .progress-bar { 
            background-color: hsl(var(--muted)); 
            border-radius: 9999px;
            overflow: hidden;
            height: 0.5rem;
        }
        .progress-bar-inner {
            background-color: hsl(var(--accent));
            height: 100%;
            transition: width 0.3s ease-in-out;
        }
        .justify-between { justify-content: space-between; }
        .text-xl { font-size: 1.25rem; }
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: calc(var(--radius) - 2px);
          border: 1px solid transparent;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
        }
        .button:hover {
          background-color: hsl(var(--primary) / 0.9);
        }
        .star-icon {
          width: 1rem;
          height: 1rem;
          fill: hsl(var(--accent));
          color: hsl(var(--accent));
        }
        .empty-star-icon {
          width: 1rem;
          height: 1rem;
          color: hsl(var(--muted-foreground) / 0.3);
        }
        .star-rating-container { display: flex; gap: 0.125rem; }

        .tabs-list {
          display: inline-flex;
          height: 2.5rem;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius);
          background-color: hsl(var(--muted));
          padding: 0.25rem;
        }
        .tabs-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          border-radius: calc(var(--radius) - 4px);
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          background-color: transparent;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
          transition: all 0.2s;
        }
        .tabs-trigger.active, .tabs-trigger:hover {
            color: hsl(var(--foreground));
        }
        .tabs-trigger.active {
            background-color: hsl(var(--background));
            box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
        }

        .tabs-content { margin-top: 1rem; }
        .review-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        @media (min-width: 640px) {
            .review-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
            .review-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }

        .review-card {
            background-color: hsl(var(--card));
            border-radius: var(--radius);
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            height: 100%;
        }
        .review-card-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .avatar {
            height: 2.5rem;
            width: 2.5rem;
            border-radius: 9999px;
            overflow: hidden;
            background-color: hsl(var(--muted));
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 500;
        }
        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .text-xs { font-size: 0.75rem; }
        .pt-2 { padding-top: 0.5rem; }
        .text-foreground\\/80 { color: hsl(var(--foreground) / 0.8); }

        .empty-state {
            text-align: center;
            padding: 5rem 0;
            border: 2px dashed hsl(var(--border));
            border-radius: var(--radius);
            background-color: hsl(var(--card));
        }
        .empty-state-icon {
            width: 3rem;
            height: 3rem;
            margin: 0 auto;
            color: hsl(var(--muted-foreground));
        }
        .mt-4 { margin-top: 1rem; }
        
        /* Modal Styles */
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0,0,0,0.6);
          align-items: center;
          justify-content: center;
        }
        .modal-content {
          background-color: hsl(var(--card));
          color: hsl(var(--card-foreground));
          margin: auto;
          padding: 2rem;
          border: 1px solid hsl(var(--border));
          width: 90%;
          max-width: 500px;
          border-radius: var(--radius);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
          position: relative;
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .modal-content.visible {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
        .modal-header {
          margin-bottom: 1.5rem;
        }
        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .modal-description {
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          margin-top: 0.25rem;
        }
        .modal-close-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
        }
        .modal-close-btn:hover {
            color: hsl(var(--foreground));
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .form-input, .form-textarea {
          width: 100%;
          background-color: hsl(var(--background));
          border: 1px solid hsl(var(--input));
          border-radius: calc(var(--radius) - 4px);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
        }
        .form-input:focus, .form-textarea:focus {
            outline: 2px solid hsl(var(--primary));
            outline-offset: 2px;
        }
        .form-textarea {
          min-height: 100px;
        }
        .star-rating-input {
            display: flex;
            gap: 0.25rem;
        }
        .star-rating-input .star-icon {
            cursor: pointer;
            width: 1.5rem;
            height: 1.5rem;
        }
        .star-rating-input .star-icon.filled {
            fill: hsl(var(--accent));
            color: hsl(var(--accent));
        }
        .modal-footer {
          margin-top: 1.5rem;
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        .button.outline {
            background-color: transparent;
            border-color: hsl(var(--border));
            color: hsl(var(--foreground));
        }
        .button.outline:hover {
            background-color: hsl(var(--muted));
        }

      </style>
      <div class="widget-container">
        <div class="max-w-4xl">
          <header class="mb-6">
            <h1 class="text-3xl font-bold">${this.widgetData?.businessName || 'Loading...'}</h1>
            <a href="${this.widgetData?.website || '#'}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
              ${this.widgetData?.website || ''}
            </a>
          </header>

          ${totalReviews > 0 ? `
            <div class="grid md:grid-cols-3 gap-6 mb-8">
              <div class="card md:col-span-1 flex flex-col items-center justify-center text-center p-6">
                <p class="text-5xl font-bold">${overallRating.toFixed(1)}</p>
                <div class="star-rating-container flex gap-2">
                  ${this.renderStars(overallRating)}
                </div>
                <p class="text-muted-foreground mt-2">Based on ${totalReviews} reviews</p>
              </div>
              <div class="card md:col-span-2 p-6">
                <h2 class="font-semibold mb-3">Rating distribution</h2>
                <div class="space-y-2">
                  ${ratingDistribution.map((count, i) => `
                    <div class="flex items-center gap-2 text-sm">
                      <span class="text-muted-foreground w-6 text-right">${5 - i}</span>
                      <svg class="star-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
                      <div class="progress-bar w-full h-2">
                        <div class="progress-bar-inner" style="width: ${(count / totalReviews) * 100}%"></div>
                      </div>
                      <span class="text-muted-foreground w-8 text-right">${count}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          <div>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold">${totalReviews > 0 ? "What people are saying" : "Be the first to leave a review"}</h2>
              <button id="write-review-btn" class="button">Write a Review</button>
            </div>
            
            ${totalReviews > 0 ? `
              <div class="tabs">
                <div class="tabs-list">
                  <button class="tabs-trigger ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all">All</button>
                  ${this.sources.map(source => `
                    <button class="tabs-trigger ${this.activeTab === source ? 'active' : ''}" data-tab="${source}">${source}</button>
                  `).join('')}
                </div>
                <div class="tabs-content">
                    <div class="review-grid">
                        ${currentReviews.map(review => this.renderReviewCard(review)).join('')}
                    </div>
                </div>
              </div>
            ` : `
              <div class="empty-state">
                  <svg class="empty-state-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                  <h3 class="font-semibold mt-2">No reviews yet</h3>
                  <p class="text-muted-foreground">Your widget is ready to collect feedback.</p>
              </div>
            `}
          </div>
          
          <footer class="text-center mt-12">
            <p class="text-sm text-muted-foreground">Powered by Widget Wizard</p>
          </footer>
        </div>
      </div>
      ${this.renderModal()}
    \`;

    // Add event listeners
    this.shadowRoot.getElementById('write-review-btn').addEventListener('click', () => this.openModal());
    this.shadowRoot.querySelectorAll('.tabs-trigger').forEach(button => {
        button.addEventListener('click', (e) => this.handleTabClick(e.currentTarget.dataset.tab));
    });
    
    // Modal listeners
    const modal = this.shadowRoot.getElementById('review-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        this.shadowRoot.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        this.shadowRoot.getElementById('modal-cancel').addEventListener('click', () => this.closeModal());
        this.shadowRoot.getElementById('review-form').addEventListener('submit', this.handleFormSubmit);

        // Star rating input logic
        const stars = this.shadowRoot.querySelectorAll('.star-rating-input .star-icon');
        const ratingInput = this.shadowRoot.querySelector('input[name="stars"]');
        let currentRating = 0;

        const setRating = (rating) => {
            currentRating = rating;
            ratingInput.value = rating;
            stars.forEach((star, index) => {
                star.classList.toggle('filled', index < rating);
            });
        };

        stars.forEach((star, index) => {
            star.addEventListener('click', () => setRating(index + 1));
            star.addEventListener('mouseover', () => {
                stars.forEach((s, i) => s.classList.toggle('filled', i <= index));
            });
            star.addEventListener('mouseout', () => {
                stars.forEach((s, i) => s.classList.toggle('filled', i < currentRating));
            });
        });
    }
  }

  calculateMetrics() {
    if (!this.reviews || this.reviews.length === 0) {
      return {
        overallRating: 0,
        totalReviews: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
      };
    }

    const total = this.reviews.reduce((acc, review) => acc + review.stars, 0);
    const overall = total / this.reviews.length;
    const distribution = Array(5).fill(0);
    this.reviews.forEach(review => {
      distribution[5 - review.stars]++;
    });

    return {
      overallRating: overall,
      totalReviews: this.reviews.length,
      ratingDistribution: distribution,
    };
  }
  
  renderReviewCard(review) {
    return \`
        <div class="review-card">
            <div class="review-card-header">
                <div class="avatar">
                    <img src="https://placehold.co/40x40.png?text=\${review.name.charAt(0)}" alt="\${review.name}" data-ai-hint="person avatar" />
                </div>
                <div>
                    <p class="font-semibold">\${review.name}</p>
                    <p class="text-xs text-muted-foreground">\${review.source} review</p>
                </div>
            </div>
            <div class="star-rating-container">${this.renderStars(review.stars)}</div>
            <p class="text-sm text-foreground/80 pt-2">\${review.text}</p>
        </div>
    \`;
  }
  
  renderStars(rating, totalStars = 5) {
      let starsHtml = '';
      for (let i = 0; i < totalStars; i++) {
          starsHtml += \`
            <svg class="\${i < Math.round(rating) ? 'star-icon' : 'empty-star-icon'}" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>
          \`;
      }
      return starsHtml;
  }

  renderModal() {
    return \`
        <div id="review-modal" class="modal">
            <div class="modal-content">
                <button id="modal-close" class="modal-close-btn">&times;</button>
                <div class="modal-header">
                    <h3 class="modal-title">Write a review</h3>
                    <p class="modal-description">Share your experience with \${this.widgetData?.businessName}.</p>
                </div>
                <form id="review-form">
                    <input type="hidden" name="source" value="Direct" />
                    <div class="form-group">
                        <label for="name" class="form-label">Your Name</label>
                        <input type="text" id="name" name="name" class="form-input" required minlength="2" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Rating</label>
                        <div class="star-rating-input">
                            \${[1,2,3,4,5].map(() => \`<svg class="star-icon empty-star-icon" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/></svg>\`).join('')}
                        </div>
                        <input type="hidden" name="stars" value="0" required min="1" />
                    </div>
                    <div class="form-group">
                        <label for="text" class="form-label">Review</label>
                        <textarea id="text" name="text" class="form-textarea" required minlength="10"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" id="modal-cancel" class="button outline">Cancel</button>
                        <button type="submit" class="button">Submit Review</button>
                    </div>
                </form>
            </div>
        </div>
    \`;
  }
}

customElements.define('review-widget', ReviewWidget);
