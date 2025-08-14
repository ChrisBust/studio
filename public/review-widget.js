
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const widgetContainer = document.querySelector('review-widget');
        if (!widgetContainer) {
            console.error('Widget container <review-widget> not found.');
            return;
        }

        const widgetId = widgetContainer.getAttribute('widgetId');
        
        // This is now hardcoded for simplicity and reliability.
        const apiBaseUrl = 'https://widget-wizard-chris.netlify.app';

        if (!widgetId) {
            widgetContainer.innerHTML = '<p style="color: red; font-family: sans-serif;">Error: Widget ID is missing.</p>';
            return;
        }

        async function fetchWidgetData() {
            try {
                const response = await fetch(`${apiBaseUrl}/api/widgets/${widgetId}`);
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    renderWidget(result.data);
                } else {
                    throw new Error(result.error || 'Failed to load widget data.');
                }
            } catch (error) {
                console.error('Error fetching widget data:', error);
                widgetContainer.innerHTML = `<p style="color: red; font-family: sans-serif;">Error: Could not load widget. ${error.message}</p>`;
            }
        }

        function renderWidget(widget) {
            const overallRating = widget.reviews.length > 0
                ? widget.reviews.reduce((acc, review) => acc + review.stars, 0) / widget.reviews.length
                : 0;
            const totalReviews = widget.reviews.length;
            
            const ratingDistribution = Array(5).fill(0);
            if (totalReviews > 0) {
                 widget.reviews.forEach(review => {
                    ratingDistribution[5 - review.stars]++;
                });
            }

            const sortedReviews = widget.reviews ? [...widget.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];
            
            const style = `
                :host {
                    --w-primary: #3F51B5;
                    --w-accent: #FFB300;
                    --w-background: #FFFFFF;
                    --w-card-background: #FFFFFF;
                    --w-text-primary: #212529;
                    --w-text-secondary: #6c757d;
                    --w-border-color: #e9ecef;
                    --w-star-inactive: #ced4da;
                }
                .widget-wrapper { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; color: var(--w-text-primary); background-color: var(--w-background); padding: 2rem; border-radius: 0.5rem; max-width: 1200px; margin: auto; }
                .widget-header { text-align: center; margin-bottom: 2rem; }
                .widget-header h1 { font-size: 2rem; font-weight: bold; margin: 0; }
                .summary-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-bottom: 2rem; }
                @media (min-width: 768px) { .summary-grid { grid-template-columns: 1fr 2fr; } }
                .summary-card { background-color: var(--w-card-background); border: 1px solid var(--w-border-color); border-radius: 0.5rem; padding: 1.5rem; }
                .overall-rating { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
                .overall-rating .score { font-size: 3.5rem; font-weight: bold; }
                .overall-rating .stars-container { display: flex; gap: 0.25rem; color: var(--w-accent); }
                .overall-rating .review-count { color: var(--w-text-secondary); margin-top: 0.5rem; }
                .distribution-list { list-style: none; padding: 0; margin: 0; space-y: 0.5rem; }
                .distribution-item { display: flex; align-items: center; gap: 0.5rem; color: var(--w-text-secondary); }
                .distribution-item .star-icon { color: var(--w-accent); }
                .reviews-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
                .reviews-header h2 { font-size: 1.5rem; font-weight: bold; margin: 0; }
                .write-review-btn { background-color: var(--w-primary); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1rem; font-weight: 500; cursor: pointer; transition: background-color 0.2s; }
                .write-review-btn:hover { background-color: #334195; }
                .reviews-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
                @media (min-width: 640px) { .reviews-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; } }
                @media (min-width: 1024px) { .reviews-grid { grid-template-columns: repeat(3, 1fr); } }
                .review-card { background-color: var(--w-card-background); border: 1px solid var(--w-border-color); border-radius: 0.5rem; padding: 1.5rem; }
                .review-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
                .review-avatar { width: 40px; height: 40px; border-radius: 50%; background-color: #e9ecef; color: var(--w-text-secondary); display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .review-name { font-weight: 600; }
                .review-source { font-size: 0.875rem; color: var(--w-text-secondary); }
                .review-stars { display: flex; gap: 0.25rem; color: var(--w-accent); margin-bottom: 0.75rem; }
                .review-text { color: var(--w-text-primary); line-height: 1.5; font-size: 0.95rem; width: 100%; height: auto}
                .no-reviews { text-align: center; padding: 3rem 1rem; border: 2px dashed var(--w-border-color); border-radius: 0.5rem; color: var(--w-text-secondary); }
                .no-reviews h3 { font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem; }
                .modal-overlay { position: fixed; inset: 0; background-color: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
                .modal-content { background: white; padding: 2rem; border-radius: 0.5rem; width: 100%; max-width: 500px; position: relative; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
                .modal-close-btn { position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d; }
                .modal-content h2 { font-size: 1.75rem; margin-top: 0; margin-bottom: 1rem; }
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
                .form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 0.25rem; font-size: 1rem; box-sizing: border-box; }
                .star-rating-input { display: flex; gap: 0.5rem; flex-direction: row; }
                .star-rating-input .star { cursor: pointer; color: var(--w-star-inactive); }
                .star-rating-input .star.selected, .star-rating-input .star.hovered { color: var(--w-accent); }
            `;
            const html = `
                <div class="widget-wrapper">
                    <header class="widget-header">
                        <h1>${widget.businessName}</h1>
                    </header>
                    
                    ${totalReviews > 0 ? `
                    <div class="summary-grid">
                        <div class="summary-card overall-rating">
                            <div class="score">${overallRating.toFixed(1)}</div>
                            <div class="stars-container">${generateStars(overallRating)}</div>
                            <div class="review-count">Based on ${totalReviews} reviews</div>
                        </div>
                        <div class="summary-card">
                            <ul class="distribution-list">
                                ${ratingDistribution.map((count, i) => `
                                    <li class="distribution-item">
                                        <span>${5-i}</span>
                                        <span class="star-icon">${generateStars(1, '1em')}</span>
                                        <div style="width: 100%; background: #e9ecef; border-radius: 2px;"><div style="width: ${(count/totalReviews)*100}%; height: 6px; background: var(--w-accent); border-radius: 2px;"></div></div>
                                        <span style="width: 30px; text-align: right;">${count}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>` : ''
                    }

                    <div class="reviews-section">
                        <div class="reviews-header">
                            <h2>What People Are Saying</h2>
                            <button class="write-review-btn">Write a Review</button>
                        </div>
                        <div class="reviews-grid">
                            ${sortedReviews.length > 0 ? sortedReviews.map(review => `
                                <div class="review-card">
                                    <div class="review-card-header">
                                        <div class="review-avatar">${review.name.charAt(0)}</div>
                                        <div>
                                            <p class="review-name">${review.name}</p>
                                            <p class="review-source">${review.source} review</p>
                                        </div>
                                    </div>
                                    <div class="review-stars">${generateStars(review.stars)}</div>
                                    <p class="review-text">${review.text}</p>
                                </div>
                            `).join('') : `
                                <div class="no-reviews">
                                    <div style="font-size: 3rem;">
                                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2zm0 14H6.667L4 18V4h16v12z"></path></svg>
                                    </div>
                                    <h3>No reviews yet</h3>
                                    <p>Your widget is ready to collect feedback.</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;

            const shadowRoot = widgetContainer.attachShadow({ mode: 'open' });
            const styleElement = document.createElement('style');
            styleElement.textContent = style;
            const contentElement = document.createElement('div');
            contentElement.innerHTML = html;
            shadowRoot.appendChild(styleElement);
            shadowRoot.appendChild(contentElement);

            shadowRoot.querySelector('.write-review-btn').addEventListener('click', () => {
                showReviewModal(widget.businessName, shadowRoot);
            });
        }
        
        function generateStars(rating, size = '1.25em') {
            let starsHtml = '';
            for (let i = 0; i < 5; i++) {
                const isFilled = i < Math.round(rating);
                starsHtml += `<svg stroke="currentColor" fill="${isFilled ? 'currentColor' : 'none'}" stroke-width="0" viewBox="0 0 24 24" height="${size}" width="${size}" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>`;
            }
            return starsHtml;
        }

        function showReviewModal(businessName, shadowRoot) {
            const modalHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <button class="modal-close-btn">&times;</button>
                        <h2>Write a review for ${businessName}</h2>
                        <form id="review-form">
                            <div class="form-group">
                                <label for="name">Your Name</label>
                                <input type="text" id="name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label>Rating</label>
                                <div class="star-rating-input" data-rating="0">
                                    ${[1,2,3,4,5].map(i => `<div class="star" data-value="${i}">${generateStars(1, '2em')}</div>`).join('')}
                                </div>
                                <input type="hidden" name="stars" id="stars" value="0">
                            </div>
                            <div class="form-group">
                                <label for="text">Review</label>
                                <textarea id="text" name="text" rows="5" required></textarea>
                            </div>
                            <button type="submit" class="write-review-btn">Submit Review</button>
                        </form>
                    </div>
                </div>
            `;
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            shadowRoot.appendChild(modalContainer);

            const overlay = shadowRoot.querySelector('.modal-overlay');
            const form = shadowRoot.querySelector('#review-form');

            const closeModal = () => shadowRoot.removeChild(modalContainer);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay || e.target.classList.contains('modal-close-btn')) {
                    closeModal();
                }
            });
            
            const starsContainer = shadowRoot.querySelector('.star-rating-input');
            const stars = starsContainer.querySelectorAll('.star');
            const ratingInput = shadowRoot.querySelector('#stars');

            stars.forEach(star => {
                star.addEventListener('mouseenter', () => {
                    const rating = star.dataset.value;
                    stars.forEach(s => s.classList.toggle('hovered', s.dataset.value <= rating));
                });
                star.addEventListener('mouseleave', () => {
                     stars.forEach(s => s.classList.remove('hovered'));
                });
                star.addEventListener('click', () => {
                    const rating = star.dataset.value;
                    ratingInput.value = rating;
                    starsContainer.dataset.rating = rating;
                    stars.forEach(s => s.classList.toggle('selected', s.dataset.value <= rating));
                });
            });


            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitButton = form.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = 'Submitting...';

                const formData = new FormData(form);
                const data = {
                    name: formData.get('name'),
                    stars: parseInt(formData.get('stars'), 10),
                    text: formData.get('text'),
                    source: 'Direct',
                };
                
                if (data.stars === 0) {
                    alert('Please select a star rating.');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Review';
                    return;
                }

                try {
                    const response = await fetch(`${apiBaseUrl}/api/widgets/${widgetId}/reviews`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.error || 'Failed to submit review.');
                    }
                    closeModal();
                    // Re-fetch and render the widget to show the new review
                    widgetContainer.shadowRoot.innerHTML = ''; // Clear old content
                    fetchWidgetData();
                } catch (error) {
                    alert(`Error: ${error.message}`);
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Review';
                }
            });
        }
        
        fetchWidgetData();
    });
})();
