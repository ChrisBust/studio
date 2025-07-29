
class ReviewWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.widgetId = this.getAttribute('widgetId');
    this.baseUrl = this.getAttribute('baseUrl') || this.getBaseUrl();
    this.reviews = [];
    this.activeTab = 'all';
    this.isLoading = true;
  }
  
  getBaseUrl() {
    // This provides a default but can be overridden by the `baseUrl` attribute
    // for more robust deployments.
    if (document.currentScript) {
        const scriptUrl = new URL(document.currentScript.src);
        // Assuming the script is served from the same domain as the app.
        // This might need adjustment based on actual deployment.
        return scriptUrl.origin;
    }
    // Fallback for when currentScript is not available
    return window.location.origin;
  }

  connectedCallback() {
    this.render();
    this.fetchReviews();
  }

  fetchReviews() {
    this.isLoading = true;
    this.render();
    fetch(`${this.baseUrl}/api/widgets/${this.widgetId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          this.reviews = data.data.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          this.widgetData = data.data;
        } else {
          throw new Error(data.error || 'Failed to load widget data.');
        }
        this.isLoading = false;
        this.render();
      })
      .catch(error => {
        console.error('Error fetching reviews:', error);
        this.isLoading = false;
        this.renderError(error.message);
      });
  }

  getReviewsBySource() {
    const sources = { 'all': this.reviews };
    this.reviews.forEach(review => {
      if (!sources[review.source]) {
        sources[review.source] = [];
      }
      sources[review.source].push(review);
    });
    return sources;
  }
  
  handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    if (!data.stars || data.stars === '0') {
      alert('Please select a star rating.');
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';
    
    // Use the dynamically determined absolute URL
    const apiUrl = new URL(`/api/widgets/${this.widgetId}`, this.baseUrl).href;

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(err => { throw new Error(err.error || 'Something went wrong') });
        }
        return res.json();
    })
    .then(result => {
      if (result.success) {
        alert('Review submitted successfully!');
        form.reset();
        this.shadowRoot.getElementById('add-review-dialog').style.display = 'none';
        this.fetchReviews(); // Refresh reviews
      } else {
        const errorMsg = result.error ? (typeof result.error === 'object' ? Object.values(result.error).flat().join(', ') : result.error) : 'An unknown error occurred.';
        alert(`Error: ${errorMsg}`);
      }
    })
    .catch(error => {
      alert(`Failed to submit review: ${error.message}`);
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Review';
    });
  }


  render() {
    const reviewsBySource = this.getReviewsBySource();
    const currentReviews = reviewsBySource[this.activeTab] || [];
    const sources = Object.keys(reviewsBySource);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
            --background: 220 20% 98%;
            --foreground: 280 10% 15%;
            --card: 220 20% 100%;
            --card-foreground: 280 10% 15%;
            --popover: 220 20% 100%;
            --popover-foreground: 280 10% 15%;
            --primary: 283 60% 30%;
            --primary-foreground: 0 0% 98%;
            --secondary: 293 45% 25%;
            --secondary-foreground: 0 0% 98%;
            --muted: 220 20% 95%;
            --muted-foreground: 280 10% 40%;
            --accent: 308 100% 43%;
            --accent-foreground: 0 0% 98%;
            --destructive: 341 100% 64%;
            --destructive-foreground: 0 0% 98%;
            --border: 220 20% 90%;
            --input: 220 20% 90%;
            --ring: 203 91% 55%;
            --radius: 0.8rem;
            font-family: 'Inter', sans-serif;
        }
        
        .widget-container {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
          padding: 1.5rem;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .max-w-4xl { max-width: 80rem; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .mb-6 { margin-bottom: 1.5rem; }
        .text-3xl { font-size: 1.875rem; }
        .font-bold { font-weight: 700; }
        .text-primary { color: hsl(var(--primary)); }
        .hover\\:underline:hover { text-decoration: underline; }
        a { text-decoration: none; color: inherit; }
        .flex { display: flex; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .mb-4 { margin-bottom: 1rem; }
        .text-xl { font-size: 1.25rem; }
        
        .tabs-list {
            display: inline-flex;
            height: 2.5rem;
            align-items: center;
            justify-content: center;
            border-radius: 0.375rem;
            background-color: hsl(var(--muted));
            padding: 0.25rem;
            color: hsl(var(--muted-foreground));
        }
        .tab-trigger {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
            border-radius: 0.25rem;
            padding: 0 1rem;
            height: 2rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            background-color: transparent;
            color: hsl(var(--muted-foreground));
            transition: all 0.2s ease-in-out;
        }
        .tab-trigger[data-state="active"] {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        .tab-trigger:focus-visible {
            outline: 2px solid hsl(var(--ring));
            outline-offset: 2px;
        }

        .review-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(1, 1fr);
        }
        @media (min-width: 768px) {
          .review-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .review-grid { grid-template-columns: repeat(3, 1fr); }
        }
        .card {
          background-color: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border: 1px solid hsl(var(--border));
          border-radius: var(--radius);
          box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .card-content {
          padding: 1.5rem;
          flex: 1;
        }
        .gap-3 { gap: 0.75rem; }
        .avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          overflow: hidden;
          border: 1px solid hsl(var(--border));
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .avatar-fallback { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background-color: hsl(var(--muted));}
        .font-semibold { font-weight: 600; }
        .text-xs { font-size: 0.75rem; }
        .text-muted-foreground { color: hsl(var(--muted-foreground)); }
        .star-rating { display: flex; align-items: center; gap: 0.125rem; }
        .star-rating svg { width: 1.25rem; height: 1.25rem; }
        .star-filled { color: hsl(var(--accent)); fill: hsl(var(--accent)); }
        .star-empty { color: hsl(var(--muted-foreground)); opacity: 0.3; }
        .pt-2 { padding-top: 0.5rem; }
        .text-sm { font-size: 0.875rem; }
        .text-foreground\\/80 { color: hsla(var(--foreground), 0.8); }

        .write-review-btn {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .write-review-btn:hover {
          background-color: hsl(var(--primary), 0.9);
        }

        .dialog-overlay {
            position: fixed;
            inset: 0;
            background-color: rgba(0, 0, 0, 0.8);
            z-index: 50;
        }
        .dialog-content {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 50;
            background-color: hsl(var(--card));
            padding: 1.5rem;
            border-radius: var(--radius);
            width: 90%;
            max-width: 425px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
        }
        .dialog-header { margin-bottom: 1rem; }
        .dialog-title { font-size: 1.25rem; font-weight: 600; }
        .dialog-description { font-size: 0.875rem; color: hsl(var(--muted-foreground)); margin-top: 0.5rem; }

        .form-field { margin-bottom: 1rem; }
        .form-label { display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem; }
        .form-input, .form-textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid hsl(var(--input));
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
            border-radius: 0.375rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
        }
        .form-textarea { min-height: 80px; }
        .form-footer { display: flex; justify-content: flex-end; margin-top: 1.5rem; }
        .star-input-group { display: flex; gap: 0.25rem; }
        .star-input-group svg { cursor: pointer; }
      </style>
      
      <div id="add-review-dialog" style="display: none;">
        <div class="dialog-overlay"></div>
        <div class="dialog-content">
            <div class="dialog-header">
                <h3 class="dialog-title">Write a review</h3>
                <p class="dialog-description">Share your experience with ${this.widgetData?.businessName || ''}.</p>
            </div>
            <form id="add-review-form">
                <input type="hidden" name="source" value="Direct" />
                <div class="form-field">
                    <label for="name" class="form-label">Your Name</label>
                    <input type="text" id="name" name="name" class="form-input" required />
                </div>
                <div class="form-field">
                    <label for="stars" class="form-label">Rating</label>
                    <div class="star-input-group">
                       ${[1, 2, 3, 4, 5].map(star => `
                          <svg data-rating-value="${star}" class="star-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                       `).join('')}
                    </div>
                    <input type="hidden" id="stars" name="stars" value="0" />
                </div>
                <div class="form-field">
                    <label for="text" class="form-label">Review</label>
                    <textarea id="text" name="text" class="form-textarea" required></textarea>
                </div>
                <div class="form-footer">
                    <button type="submit" class="write-review-btn">Submit Review</button>
                    <button type="button" id="close-dialog-btn" class="write-review-btn" style="background-color: hsl(var(--muted)); color: hsl(var(--muted-foreground)); margin-left: 0.5rem;">Cancel</button>
                </div>
            </form>
        </div>
      </div>

      <div class="widget-container">
        <div class="max-w-4xl mx-auto">
          <header class="mb-6">
            <h1 class="text-3xl font-bold">${this.widgetData?.businessName || 'Loading...'}</h1>
            <a href="${this.widgetData?.website || '#'}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">
              ${this.widgetData?.website || ''}
            </a>
          </header>

          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">${this.reviews.length > 0 ? "What people are saying" : "Be the first to leave a review"}</h2>
            <button class="write-review-btn" id="write-review-btn">Write a Review</button>
          </div>
          
          ${this.reviews.length > 0 ? `
            <div class="tabs-list">
                ${sources.map(source => `
                    <button 
                        class="tab-trigger" 
                        data-state="${this.activeTab === source ? 'active' : 'inactive'}"
                        data-tab-value="${source}">
                        ${source.charAt(0).toUpperCase() + source.slice(1)}
                    </button>
                `).join('')}
            </div>

            <div id="reviews-content" class="review-grid" style="margin-top: 1rem;">
              ${currentReviews.map(review => this.renderReviewCard(review)).join('')}
            </div>
          ` : `
            <div style="text-align: center; padding: 4rem 0; border: 2px dashed hsl(var(--border)); border-radius: var(--radius); background-color: hsl(var(--card)); color: hsl(var(--muted-foreground));">
              <p>No reviews yet.</p>
            </div>
          `}
        </div>
      </div>
    `;
    this.addEventListeners();
  }
  
  renderReviewCard(review) {
    return `
      <div class="card">
        <div class="card-content">
          <div class="flex items-center gap-3">
            <div class="avatar">
                <div class="avatar-fallback">${review.name.charAt(0)}</div>
            </div>
            <div>
              <p class="font-semibold">${review.name}</p>
              <p class="text-xs text-muted-foreground">${review.source} review</p>
            </div>
          </div>
          <div class="star-rating" style="margin-top: 0.5rem;">
            ${Array.from({ length: 5 }, (_, i) => `
              <svg class="${i < review.stars ? 'star-filled' : 'star-empty'}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            `).join('')}
          </div>
          <p class="text-sm text-foreground/80 pt-2">${review.text}</p>
        </div>
      </div>
    `;
  }

  renderError(message) {
      this.shadowRoot.innerHTML = `<div style="padding: 2rem; text-align: center; color: hsl(var(--destructive));">Error: ${message}</div>`;
  }

  addEventListeners() {
    this.shadowRoot.querySelectorAll('.tab-trigger').forEach(button => {
      button.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.dataset.tabValue;
        this.render();
      });
    });

    const dialog = this.shadowRoot.getElementById('add-review-dialog');
    const openBtn = this.shadowRoot.getElementById('write-review-btn');
    const closeBtn = this.shadowRoot.getElementById('close-dialog-btn');
    const form = this.shadowRoot.getElementById('add-review-form');

    if(openBtn) {
        openBtn.addEventListener('click', () => {
            dialog.style.display = 'block';
        });
    }

    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            dialog.style.display = 'none';
        });
    }

    if(dialog) {
        const overlay = dialog.querySelector('.dialog-overlay');
        overlay.addEventListener('click', () => {
             dialog.style.display = 'none';
        });
    }

    if (form) {
      // Bind the `this` context for handleFormSubmit
      form.addEventListener('submit', this.handleFormSubmit.bind(this));

      // Star rating interaction
      const starRatingContainer = form.querySelector('.star-input-group');
      const stars = starRatingContainer.querySelectorAll('svg');
      const ratingInput = form.querySelector('input[name="stars"]');
      
      const setRating = (rating) => {
        ratingInput.value = rating;
        stars.forEach(star => {
          const starValue = parseInt(star.dataset.ratingValue, 10);
          if (starValue <= rating) {
            star.classList.remove('star-empty');
            star.classList.add('star-filled');
          } else {
            star.classList.remove('star-filled');
            star.classList.add('star-empty');
          }
        });
      };

      stars.forEach(star => {
        star.addEventListener('click', () => {
          const rating = parseInt(star.dataset.ratingValue, 10);
          setRating(rating);
        });
      });
    }
  }
}

customElements.define('review-widget', ReviewWidget);

    