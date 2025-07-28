class ReviewWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.widgetId = this.getAttribute('widgetId');
      this.baseUrl = this.getAttribute('baseUrl') || 'https://review-widget-app.web.app';
      this.reviews = [];
      this.activeTab = 'all';
    }
  
    connectedCallback() {
      if (!this.widgetId) {
        this.shadowRoot.innerHTML = `<p style="color: red; font-family: sans-serif;">Error: Widget ID is missing.</p>`;
        return;
      }
      this.render();
      this.fetchReviews();
    }
  
    fetchReviews() {
      fetch(`${this.baseUrl}/api/widgets/${this.widgetId}`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.reviews = data.data.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.businessName = data.data.businessName;
            this.website = data.data.website;
            this.render();
          } else {
            throw new Error(data.error || 'Failed to fetch reviews.');
          }
        })
        .catch(error => {
          console.error('Error fetching reviews:', error);
          this.shadowRoot.innerHTML = `<p style="color: red; font-family: sans-serif;">${error.message}</p>`;
        });
    }

    handleFormSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const formData = new FormData(form);
      const reviewData = Object.fromEntries(formData.entries());
      
      // Basic validation
      if (!reviewData.name || !reviewData.stars || !reviewData.text) {
        alert('Please fill out all fields.');
        return;
      }

      fetch(`${this.baseUrl}/api/widgets/${this.widgetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: reviewData.name,
            stars: parseInt(reviewData.stars, 10),
            text: reviewData.text,
            source: 'Direct'
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          form.reset();
          this.shadowRoot.querySelector('#review-dialog').close();
          this.fetchReviews();
        } else {
          throw new Error(data.error || 'Failed to submit review.');
        }
      })
      .catch(error => {
        alert(`Error: ${error.message}`);
      });
    }

    renderStars(rating) {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${i <= rating ? '#db00be' : 'none'}" stroke="${i <= rating ? '#db00be' : '#a1a1aa'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
        }
        return `<div style="display: flex; gap: 2px;">${starsHtml}</div>`;
    }

    render() {
        const { overallRating, totalReviews, ratingDistribution, reviewsBySource, sources } = this.getStats();
        
        const filteredReviews = this.activeTab === 'all' 
            ? this.reviews 
            : reviewsBySource[this.activeTab]?.reviews || [];

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    all: initial;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                    color: #09090b;
                }
                .widget-container { 
                    background-color: #fdfcfe; 
                    padding: 1.5rem; 
                    border-radius: 0.8rem;
                    max-width: 1200px;
                    margin: auto;
                }
                .grid {
                    display: grid;
                    gap: 1.5rem;
                }
                .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
                @media (min-width: 768px) { .md-grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
                @media (min-width: 1024px) { .lg-grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
                
                .card { 
                    border: 1px solid #e2e1e7;
                    border-radius: 0.8rem; 
                    background-color: #ffffff;
                    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .card-content { padding: 1.5rem; flex-grow: 1; }
                .flex { display: flex; }
                .items-center { align-items: center; }
                .gap-3 { gap: 0.75rem; }
                .font-semibold { font-weight: 600; }
                .text-xs { font-size: 0.75rem; }
                .text-muted { color: #71717a; }
                .text-sm { font-size: 0.875rem; }
                .pt-2 { padding-top: 0.5rem; }
                
                .avatar {
                    width: 40px; height: 40px;
                    border-radius: 9999px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f4f4f5;
                    font-weight: 500;
                    color: #09090b;
                }

                .header { margin-bottom: 1.5rem; }
                .header h1 { font-size: 1.875rem; font-weight: 700; margin: 0; }
                .header a { color: #611e79; text-decoration: none; }
                .header a:hover { text-decoration: underline; }

                .stats-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                @media (min-width: 768px) { .stats-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
                .stats-card-main { grid-column: span 1 / span 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1.5rem; }
                .stats-card-dist { grid-column: span 1 / span 1; }
                @media (min-width: 768px) { .stats-card-dist { grid-column: span 2 / span 2; } }
                .rating-dist-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
                .progress-bar { flex-grow: 1; height: 0.5rem; background-color: #f4f4f5; border-radius: 9999px; overflow: hidden; }
                .progress-fill { height: 100%; background-color: #611e79; }
                
                .tabs-list {
                    display: inline-flex;
                    height: 2.5rem;
                    align-items: center;
                    justify-content: center;
                    border-radius: 0.5rem;
                    background-color: #f4f4f5;
                    padding: 0.25rem;
                    color: #71717a;
                    margin-bottom: 1rem;
                }
                .tab-trigger {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    white-space: nowrap;
                    border-radius: 0.375rem;
                    padding: 0.375rem 0.75rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    border: none;
                    background-color: transparent;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                }
                .tab-trigger[data-active="true"] {
                    background-color: #ffffff;
                    color: #09090b;
                    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
                }
                
                .review-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .review-header h2 { font-size: 1.25rem; font-weight: 700; margin: 0; }
                .write-review-btn {
                    padding: 0.5rem 1rem;
                    background-color: #611e79;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                .write-review-btn:hover { background-color: #53235a; }

                .no-reviews-placeholder {
                    text-align: center;
                    padding: 4rem 2rem;
                    border: 2px dashed #e2e1e7;
                    border-radius: 0.8rem;
                    color: #71717a;
                }
                .no-reviews-placeholder svg { margin: 0 auto; width: 3rem; height: 3rem; }
                .no-reviews-placeholder h3 { font-size: 1.125rem; font-weight: 600; margin: 0.5rem 0 0; }
                .no-reviews-placeholder p { margin: 0.25rem 0 0; }
                
                dialog {
                    border: 1px solid #e2e1e7;
                    border-radius: 0.8rem;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1);
                    padding: 1.5rem;
                    width: 100%;
                    max-width: 425px;
                }
                dialog::backdrop {
                    background-color: rgba(0, 0, 0, 0.5);
                }
                dialog h3 { margin: 0 0 0.5rem; font-size: 1.125rem; font-weight: 600; }
                dialog p { margin: 0 0 1rem; font-size: 0.875rem; color: #71717a; }
                dialog form { display: flex; flex-direction: column; gap: 1rem; }
                dialog label { font-size: 0.875rem; font-weight: 500; }
                dialog input, dialog textarea {
                    width: 100%;
                    box-sizing: border-box;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #d4d4d8;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                }
                dialog .rating-input { display: flex; gap: 4px; }
                dialog .rating-input svg { cursor: pointer; }
                dialog .form-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding-top: 1rem; }
                dialog button[type="submit"] {
                    padding: 0.5rem 1rem;
                    background-color: #611e79;
                    color: #ffffff;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: 500;
                    cursor: pointer;
                }
            </style>
            <div class="widget-container">
                <header class="header">
                    <h1>${this.businessName || 'Loading...'}</h1>
                    ${this.website ? `<a href="${this.website}" target="_blank" rel="noopener noreferrer">${this.website}</a>` : ''}
                </header>

                ${totalReviews > 0 ? `
                    <div class="stats-grid">
                        <div class="card stats-card-main">
                            <p style="font-size: 3rem; font-weight: 700; margin: 0;">${overallRating.toFixed(1)}</p>
                            ${this.renderStars(overallRating)}
                            <p class="text-muted" style="margin-top: 0.5rem;">Based on ${totalReviews} reviews</p>
                        </div>
                        <div class="card stats-card-dist" style="padding: 1.5rem;">
                            <h2 style="font-weight: 600; margin: 0 0 0.75rem;">Rating distribution</h2>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                ${ratingDistribution.map((count, i) => `
                                    <div class="rating-dist-row">
                                        <span class="text-muted" style="width: 1.5rem; text-align: right;">${5 - i}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#db00be" stroke="#db00be"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                        <div class="progress-bar"><div class="progress-fill" style="width: ${(count / totalReviews) * 100}%;"></div></div>
                                        <span class="text-muted" style="width: 2rem; text-align: right;">${count}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                <div class="review-header">
                    <h2>${totalReviews > 0 ? 'What people are saying' : 'Be the first to leave a review'}</h2>
                    <button class="write-review-btn">Write a Review</button>
                </div>
                
                ${totalReviews > 0 ? `
                    <div class="tabs-list">
                        <button class="tab-trigger" data-tab="all" data-active="${this.activeTab === 'all'}">All</button>
                        ${sources.map(source => `<button class="tab-trigger" data-tab="${source}" data-active="${this.activeTab === source}">${source}</button>`).join('')}
                    </div>
                    <div class="grid md-grid-cols-2 lg-grid-cols-3">
                        ${filteredReviews.map(review => `
                            <div class="card">
                                <div class="card-content">
                                    <div class="flex items-center gap-3">
                                        <div class="avatar">${review.name.charAt(0)}</div>
                                        <div>
                                            <p class="font-semibold">${review.name}</p>
                                            <p class="text-xs text-muted">${review.source} review</p>
                                        </div>
                                    </div>
                                    <div style="margin-top: 1rem;">${this.renderStars(review.stars)}</div>
                                    <p class="text-sm pt-2">${review.text}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div class="no-reviews-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                        <h3>No reviews yet</h3>
                        <p>Your widget is ready to collect feedback.</p>
                    </div>
                `}
            </div>

            <dialog id="review-dialog">
                <h3>Write a review</h3>
                <p>Share your experience with ${this.businessName}.</p>
                <form>
                    <div>
                        <label for="name">Your Name</label>
                        <input type="text" id="name" name="name" required />
                    </div>
                    <div>
                        <label>Rating</label>
                        <div class="rating-input">
                            ${[1, 2, 3, 4, 5].map(i => `
                                <svg data-star="${i}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            `).join('')}
                        </div>
                        <input type="hidden" id="stars" name="stars" value="0" />
                    </div>
                    <div>
                        <label for="text">Review</label>
                        <textarea id="text" name="text" rows="4" required></textarea>
                    </div>
                    <div class="form-footer">
                        <button type="button" id="close-dialog-btn">Cancel</button>
                        <button type="submit">Submit Review</button>
                    </div>
                </form>
            </dialog>
        `;

        this.shadowRoot.querySelectorAll('.tab-trigger').forEach(button => {
            button.addEventListener('click', (e) => {
                this.activeTab = e.target.dataset.tab;
                this.render();
            });
        });

        const dialog = this.shadowRoot.querySelector('#review-dialog');
        this.shadowRoot.querySelector('.write-review-btn').addEventListener('click', () => dialog.showModal());
        this.shadowRoot.querySelector('#close-dialog-btn').addEventListener('click', () => dialog.close());
        
        // Bind form submission
        this.shadowRoot.querySelector('form').addEventListener('submit', this.handleFormSubmit.bind(this));

        // Star rating interaction
        const ratingContainer = this.shadowRoot.querySelector('.rating-input');
        const starsInput = this.shadowRoot.querySelector('#stars');
        const stars = ratingContainer.querySelectorAll('svg');
        
        let currentRating = 0;

        const setRating = (rating) => {
            currentRating = rating;
            starsInput.value = rating;
            updateStars(rating);
        };

        const updateStars = (hoverRating) => {
            stars.forEach(star => {
                const starValue = parseInt(star.dataset.star, 10);
                if (starValue <= hoverRating) {
                    star.setAttribute('fill', '#db00be');
                    star.setAttribute('stroke', '#db00be');
                } else {
                    star.setAttribute('fill', 'none');
                    star.setAttribute('stroke', '#a1a1aa');
                }
            });
        };

        ratingContainer.addEventListener('mouseover', e => {
            if(e.target.tagName === 'svg' || e.target.parentElement.tagName === 'svg') {
                const starValue = parseInt(e.target.closest('svg').dataset.star, 10);
                updateStars(starValue);
            }
        });

        ratingContainer.addEventListener('mouseout', () => {
            updateStars(currentRating);
        });

        ratingContainer.addEventListener('click', e => {
            if(e.target.tagName === 'svg' || e.target.parentElement.tagName === 'svg') {
                const starValue = parseInt(e.target.closest('svg').dataset.star, 10);
                setRating(starValue);
            }
        });
    }

    getStats() {
        if (!this.reviews || this.reviews.length === 0) {
            return {
                overallRating: 0,
                totalReviews: 0,
                ratingDistribution: [0, 0, 0, 0, 0],
                reviewsBySource: {},
                sources: [],
            };
        }

        const total = this.reviews.reduce((acc, review) => acc + review.stars, 0);
        const overall = total / this.reviews.length;
        
        const distribution = Array(5).fill(0);
        const sourceCounts = {};
        
        for (const review of this.reviews) {
            distribution[5 - review.stars]++;
            if (!sourceCounts[review.source]) {
                sourceCounts[review.source] = { count: 0, totalStars: 0, reviews: [] };
            }
            sourceCounts[review.source].count++;
            sourceCounts[review.source].totalStars += review.stars;
            sourceCounts[review.source].reviews.push(review);
        }

        return {
            overallRating: overall,
            totalReviews: this.reviews.length,
            ratingDistribution: distribution,
            reviewsBySource: sourceCounts,
            sources: Object.keys(sourceCounts).sort(),
        };
    }
}

customElements.define('review-widget', ReviewWidget);
