
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const widgetContainer = document.querySelector('review-widget');
        if (!widgetContainer) {
            console.error('Widget container <review-widget> not found.');
            return;
        }

        const widgetId = widgetContainer.getAttribute('widgetId');
        if (!widgetId) {
            console.error('Widget configuration is missing: widgetId attribute is required.');
            return;
        }

        const API_BASE_URL = 'https://widget-wizard-chris.netlify.app';

        async function fetchWidgetData() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/widgets/${widgetId}`);
                if (!response.ok) {
                    throw new Error(`Network response was not ok, status: ${response.status}`);
                }
                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.error || 'Failed to fetch widget data.');
                }
                renderWidget(result.data);
            } catch (error) {
                console.error('Error fetching widget data:', error);
                widgetContainer.innerHTML = `<p style="color: red; text-align: center;">Failed to load reviews.</p>`;
            }
        }

        function renderWidget(widget) {
            const overallRating = widget.reviews && widget.reviews.length > 0 ?
                widget.reviews.reduce((acc, review) => acc + review.stars, 0) / widget.reviews.length :
                0;

            const totalReviews = widget.reviews ? widget.reviews.length : 0;

            const ratingDistribution = Array(5).fill(0);
            if (totalReviews > 0) {
                for (const review of widget.reviews) {
                    ratingDistribution[5 - review.stars]++;
                }
            }
            
            const sortedReviews = widget.reviews ? [...widget.reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];

            const styles = `
                :host {
                    display: block;
                }
                .ww-container {
                    font-family: 'Inter', sans-serif;
                    background-color: #ffffff;
                    color: #1a202c;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    max-width: 1200px;
                    margin: auto;
                    box-sizing: border-box;
                }
                .ww-container * {
                    box-sizing: border-box;
                }
                .ww-container .dark {
                    background-color: #1a202c;
                    color: #ffffff;
                }
                .ww-container .dark .card {
                    background-color: #2d3748;
                    border-color: #4a5568;
                }
                .ww-container .dark .muted-foreground {
                     color: #a0aec0;
                }
                .ww-container .dark .text-foreground-80 {
                    color: rgba(255, 255, 255, 0.8);
                }

                .ww-container .header {
                    margin-bottom: 1.5rem;
                    text-align: center;
                }
                @media (min-width: 640px) {
                    .ww-container .header {
                        text-align: left;
                    }
                }
                .ww-container .header h1 {
                    font-size: 1.875rem;
                    font-weight: bold;
                    margin: 0;
                }

                .ww-container .summary-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                @media (min-width: 768px) {
                    .ww-container .summary-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .ww-container .card {
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    background-color: #f7fafc;
                }
                
                .ww-container .overall-rating-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                }
                .ww-container .overall-rating-card p:first-child {
                    font-size: 3rem;
                    font-weight: bold;
                    margin:0;
                }
                .ww-container .muted-foreground {
                    color: #718096;
                    margin-top: 0.5rem;
                }

                .ww-container .star-rating {
                    display: flex;
                    align-items: center;
                    gap: 0.125rem;
                }
                .ww-container .star-rating svg {
                    width: 1.25rem;
                    height: 1.25rem;
                    color: #f59e0b;
                    fill: #f59e0b;
                }
                
                .ww-container .distribution-card {
                     grid-column: span 1 / span 1;
                }
                 @media (min-width: 768px) {
                    .ww-container .distribution-card {
                        grid-column: span 2 / span 2;
                    }
                }

                .ww-container .distribution-card h2 {
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                    margin-top:0;
                }

                .ww-container .distribution-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    margin-bottom: 0.5rem;
                }
                .ww-container .distribution-row .star-rating svg {
                    width: 1rem;
                    height: 1rem;
                }
                 .ww-container .distribution-row .rating-text {
                    color: #718096;
                    width: 1.5rem;
                    text-align: right;
                }
                .ww-container .progress-bar-container {
                    flex-grow: 1;
                    height: 0.5rem;
                    background-color: #e2e8f0;
                    border-radius: 9999px;
                    overflow: hidden;
                }
                .ww-container .progress-bar {
                    height: 100%;
                    background-color: #4c51bf;
                    border-radius: 9999px;
                }
                .ww-container .rating-count {
                    color: #718096;
                    width: 2rem;
                    text-align: right;
                }

                .ww-container .reviews-header {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                    gap: 1rem;
                }
                @media (min-width: 640px) {
                    .ww-container .reviews-header {
                        flex-direction: row;
                    }
                }
                .ww-container .reviews-header h2 {
                    font-size: 1.25rem;
                    font-weight: bold;
                     margin: 0;
                }

                .ww-container .reviews-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 2rem; /* Aumentado el gap para más separación */
                }

                @media (min-width: 640px) {
                    .ww-container .reviews-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (min-width: 1024px) {
                    .ww-container .reviews-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                .ww-container .review-card {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                 .ww-container .review-card-content {
                    flex: 1;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                 }
                .ww-container .review-card-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .ww-container .avatar {
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 9999px;
                    background-color: #cbd5e0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: #1a202c;
                }
                .ww-container .review-author p:first-child {
                    font-weight: 600;
                    margin:0;
                }
                 .ww-container .review-author p:last-child {
                    font-size: 0.75rem;
                    color: #718096;
                    margin:0;
                }
                 .ww-container .review-text {
                    font-size: 0.875rem;
                    color: #4a5568;
                    padding-top: 0.5rem;
                    word-wrap: break-word;
                    margin:0;
                }

                .ww-container .no-reviews {
                    text-align: center;
                    padding: 5rem 0;
                    border: 2px dashed #e2e8f0;
                    border-radius: 0.5rem;
                    background-color: #f7fafc;
                    color: #718096;
                }
                .ww-container .no-reviews svg {
                    margin: 0 auto 0.5rem;
                    width: 3rem;
                    height: 3rem;
                }

                /* Modal Styles */
                .ww-container .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background-color: rgba(0, 0, 0, 0.75);
                    z-index: 50;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .ww-container .modal-content {
                    background-color: #ffffff;
                    color: #1a202c;
                    padding: 1.5rem;
                    border-radius: 0.5rem;
                    max-width: 425px;
                    width: 90%;
                    position: relative;
                }
                .ww-container .dark .modal-content {
                    background-color: #2d3748;
                    color: #ffffff;
                }
                .ww-container .modal-header h2 {
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin: 0 0 0.5rem 0;
                }
                .ww-container .modal-header p {
                    color: #718096;
                    margin: 0;
                }
                 .ww-container .modal-close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    color: #718096;
                }
                .ww-container .modal-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    padding: 1rem 0;
                }
                .ww-container .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .ww-container .form-group label {
                    font-weight: 500;
                }
                .ww-container .form-group input,
                .ww-container .form-group textarea {
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border-radius: 0.375rem;
                    border: 1px solid #cbd5e0;
                    background-color: #ffffff;
                    color: #1a202c;
                    font-size: 0.875rem;
                    box-sizing: border-box;
                }
                .ww-container .dark .form-group input,
                .ww-container .dark .form-group textarea {
                     background-color: #4a5568;
                     border-color: #718096;
                     color: #ffffff;
                }
                .ww-container .modal-star-rating {
                    display: flex;
                    gap: 0.25rem;
                    flex-direction: row; /* Asegura que sea una fila */
                }
                 .ww-container .modal-star-rating svg {
                    width: 1.5rem;
                    height: 1.5rem;
                    cursor: pointer;
                    transition: color 0.2s;
                    color: #cbd5e0; /* Silueta/borde */
                 }
                .ww-container .modal-star-rating svg.filled {
                    color: #f59e0b; /* Relleno amarillo */
                }
                 .ww-container .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 1rem;
                 }
                 
                /* Base Button Styles */
                .ww-container .btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    white-space: nowrap;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    border: 1px solid transparent;
                }

                .ww-container .btn-primary {
                    background-color: #4c51bf;
                    color: white;
                }
                .ww-container .btn-primary:hover {
                    background-color: #434190;
                }
                .ww-container .btn-primary:disabled {
                    background-color: #a0aec0;
                    cursor: not-allowed;
                }
            `;
            
            const starSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`;
            const messageSquareSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
            
            const renderStarRating = (rating) => {
                let stars = '';
                for (let i = 0; i < 5; i++) {
                    stars += `<div class="star-rating-icon">${starSVG}</div>`;
                }
                const filledWidth = (rating / 5) * 100;
                return `
                    <div class="star-rating" style="position: relative; display: inline-flex;">
                        <div class="star-background" style="display: flex; color: #e2e8f0;">${stars}</div>
                        <div class="star-foreground" style="position: absolute; top: 0; left: 0; white-space: nowrap; overflow: hidden; display: flex; color: #f59e0b; width: ${filledWidth}%;">${stars}</div>
                    </div>`;
            };

            const html = `
                <div class="ww-container">
                    <style>${styles}</style>
                    <div class="header">
                        <h1>${widget.businessName}</h1>
                    </div>

                    ${totalReviews > 0 ? `
                    <div class="summary-grid">
                        <div class="card overall-rating-card">
                            <p>${overallRating.toFixed(1)}</p>
                            ${renderStarRating(overallRating)}
                            <p class="muted-foreground">Based on ${totalReviews} reviews</p>
                        </div>
                        <div class="card distribution-card">
                            <h2>Rating distribution</h2>
                            <div class="distribution-rows">
                                ${ratingDistribution.map((count, i) => `
                                    <div class="distribution-row">
                                        <span class="rating-text">${5 - i}</span>
                                        <div class="star-rating" style="width: 1rem; height: 1rem;">${starSVG}</div>
                                        <div class="progress-bar-container">
                                            <div class="progress-bar" style="width: ${(count / totalReviews) * 100}%;"></div>
                                        </div>
                                        <span class="rating-count">${count}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    ` : ''}

                    <div>
                        <div class="reviews-header">
                            <h2>${totalReviews > 0 ? "What people are saying" : "Be the first to leave a review"}</h2>
                            <button class="btn btn-primary" id="write-review-btn">Write a Review</button>
                        </div>
                        ${totalReviews > 0 ? `
                        <div class="reviews-grid">
                            ${sortedReviews.map(review => `
                                <div class="card review-card">
                                    <div class="review-card-content">
                                        <div class="review-card-header">
                                            <div class="avatar">${review.name.charAt(0)}</div>
                                            <div class="review-author">
                                                <p>${review.name}</p>
                                                <p>${review.source} review</p>
                                            </div>
                                        </div>
                                        ${renderStarRating(review.stars)}
                                        <p class="review-text">${review.text}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        ` : `
                        <div class="no-reviews">
                             ${messageSquareSVG}
                            <h3>No reviews yet</h3>
                            <p>Your widget is ready to collect feedback.</p>
                        </div>
                        `}
                    </div>
                </div>

                <div class="modal-overlay" id="review-modal" style="display: none;">
                    <div class="modal-content">
                         <button class="modal-close-btn" id="close-modal-btn">&times;</button>
                        <div class="modal-header">
                            <h2>Write a review</h2>
                            <p>Share your experience with ${widget.businessName}.</p>
                        </div>
                        <form class="modal-form" id="review-form">
                            <div class="form-group">
                                <label for="name">Your Name</label>
                                <input type="text" id="name" name="name" required />
                            </div>
                            <div class="form-group">
                                <label>Rating</label>
                                <div class="modal-star-rating" id="modal-stars">
                                    ${[1, 2, 3, 4, 5].map(i => `<svg data-value="${i}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`).join('')}
                                </div>
                                <input type="hidden" id="stars" name="stars" value="0" />
                            </div>
                             <div class="form-group">
                                <label for="text">Review</label>
                                <textarea id="text" name="text" required rows="4"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="submit" class="btn btn-primary" id="submit-review-btn">Submit Review</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            widgetContainer.innerHTML = html;
            setupEventListeners();
        }

        function setupEventListeners() {
            const writeReviewBtn = document.getElementById('write-review-btn');
            const reviewModal = document.getElementById('review-modal');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const reviewForm = document.getElementById('review-form');
            const modalStarsContainer = document.getElementById('modal-stars');
            const starsInput = document.getElementById('stars');
            let currentRating = 0;

            if (writeReviewBtn) {
                writeReviewBtn.onclick = () => reviewModal.style.display = 'flex';
            }
            if(closeModalBtn) {
                closeModalBtn.onclick = () => reviewModal.style.display = 'none';
            }
            window.onclick = (event) => {
                if (event.target == reviewModal) {
                    reviewModal.style.display = 'none';
                }
            };
            
            // Star rating logic
            if (modalStarsContainer) {
                const starIcons = modalStarsContainer.querySelectorAll('svg');
                starIcons.forEach(star => {
                    star.addEventListener('mouseenter', () => {
                        const rating = parseInt(star.dataset.value);
                        starIcons.forEach(s => {
                            s.classList.toggle('filled', parseInt(s.dataset.value) <= rating);
                        });
                    });

                    star.addEventListener('mouseleave', () => {
                        starIcons.forEach(s => {
                            s.classList.toggle('filled', parseInt(s.dataset.value) <= currentRating);
                        });
                    });

                    star.addEventListener('click', () => {
                        currentRating = parseInt(star.dataset.value);
                        starsInput.value = currentRating;
                         starIcons.forEach(s => {
                            s.classList.toggle('filled', parseInt(s.dataset.value) <= currentRating);
                        });
                    });
                });
            }


            if (reviewForm) {
                reviewForm.onsubmit = async (event) => {
                    event.preventDefault();
                    const submitBtn = document.getElementById('submit-review-btn');
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Submitting...';

                    const formData = new FormData(reviewForm);
                    const data = {
                        name: formData.get('name'),
                        stars: parseInt(formData.get('stars')),
                        text: formData.get('text'),
                        source: 'Direct',
                    };
                    
                    if (data.stars === 0) {
                        alert('Please select a star rating.');
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Submit Review';
                        return;
                    }

                    try {
                        const response = await fetch(`${API_BASE_URL}/api/widgets/${widgetId}/reviews`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data),
                        });
                        const result = await response.json();
                        if (!response.ok) {
                            throw new Error(result.error || 'Failed to submit review.');
                        }
                        alert('Thank you for your review!');
                        reviewModal.style.display = 'none';
                        reviewForm.reset();
                        currentRating = 0;
                        starsInput.value = 0;
                        const starIcons = modalStarsContainer.querySelectorAll('svg');
                        starIcons.forEach(s => s.classList.remove('filled'));
                        fetchWidgetData(); // Refresh reviews
                    } catch (error) {
                        console.error('Error submitting review:', error);
                        alert(`Error: ${error.message}`);
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Submit Review';
                    }
                };
            }
        }

        fetchWidgetData();
    });
})();
