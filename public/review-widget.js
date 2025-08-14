
(function() {
    const API_BASE_URL = 'https://widget-wizard-chris.netlify.app';

    function getStarSVG(isFilled = false) {
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isFilled ? '#FACC15' : 'none'}" stroke="${isFilled ? '#FACC15' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${isFilled ? '#FACC15' : '#D1D5DB'};">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
        `;
    }

    function createModal(widgetId, businessName) {
        const modalOverlay = document.createElement('div');
        modalOverlay.style.position = 'fixed';
        modalOverlay.style.top = '0';
        modalOverlay.style.left = '0';
        modalOverlay.style.width = '100%';
        modalOverlay.style.height = '100%';
        modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalOverlay.style.display = 'flex';
        modalOverlay.style.justifyContent = 'center';
        modalOverlay.style.alignItems = 'center';
        modalOverlay.style.zIndex = '10000';
        modalOverlay.style.fontFamily = 'sans-serif';

        const modalContent = document.createElement('div');
        modalContent.style.backgroundColor = '#ffffff';
        modalContent.style.padding = '24px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.maxWidth = '90%';
        modalContent.style.width = '400px';
        modalContent.style.boxSizing = 'border-box';
        modalContent.style.position = 'relative';

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.background = 'transparent';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => document.body.removeChild(modalOverlay);

        const title = document.createElement('h2');
        title.textContent = `Write a review for ${businessName}`;
        title.style.marginTop = '0';
        title.style.marginBottom = '8px';
        title.style.fontSize = '20px';

        const description = document.createElement('p');
        description.textContent = 'Share your experience with us.';
        description.style.color = '#6B7280';
        description.style.marginTop = '0';
        description.style.marginBottom = '20px';

        const form = document.createElement('form');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '16px';

        const nameLabel = document.createElement('label');
        nameLabel.textContent = 'Your Name';
        nameLabel.style.fontWeight = '500';
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.name = 'name';
        nameInput.required = true;
        nameInput.style.width = '100%';
        nameInput.style.padding = '8px';
        nameInput.style.borderRadius = '4px';
        nameInput.style.border = '1px solid #D1D5DB';
        nameInput.style.boxSizing = 'border-box';
        form.appendChild(nameLabel);
        form.appendChild(nameInput);
        
        const ratingLabel = document.createElement('label');
        ratingLabel.textContent = 'Rating';
        ratingLabel.style.fontWeight = '500';
        form.appendChild(ratingLabel);

        const starContainer = document.createElement('div');
        starContainer.style.display = 'flex';
        starContainer.style.flexDirection = 'row';
        starContainer.style.gap = '4px';
        
        let currentRating = 0;
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            const starWrapper = document.createElement('div');
            starWrapper.innerHTML = getStarSVG(false);
            starWrapper.style.cursor = 'pointer';
            starWrapper.dataset.rating = i;
            stars.push(starWrapper);

            const updateStars = (hoverRating) => {
                stars.forEach(s => {
                    s.innerHTML = getStarSVG(parseInt(s.dataset.rating) <= hoverRating);
                });
            };

            starWrapper.addEventListener('mouseover', () => updateStars(i));
            starWrapper.addEventListener('mouseout', () => updateStars(currentRating));
            starWrapper.addEventListener('click', () => {
                currentRating = i;
                updateStars(currentRating);
            });
            starContainer.appendChild(starWrapper);
        }
        form.appendChild(starContainer);

        const reviewLabel = document.createElement('label');
        reviewLabel.textContent = 'Review';
        reviewLabel.style.fontWeight = '500';
        const reviewTextarea = document.createElement('textarea');
        reviewTextarea.name = 'text';
        reviewTextarea.rows = 4;
        reviewTextarea.required = true;
        reviewTextarea.style.width = '100%';
        reviewTextarea.style.padding = '8px';
        reviewTextarea.style.borderRadius = '4px';
        reviewTextarea.style.border = '1px solid #D1D5DB';
        reviewTextarea.style.boxSizing = 'border-box';
        reviewTextarea.style.resize = 'vertical';
        form.appendChild(reviewLabel);
        form.appendChild(reviewTextarea);

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.textContent = 'Submit Review';
        submitButton.style.padding = '10px 16px';
        submitButton.style.backgroundColor = '#4F46E5';
        submitButton.style.color = 'white';
        submitButton.style.border = 'none';
        submitButton.style.borderRadius = '4px';
        submitButton.style.cursor = 'pointer';
        submitButton.style.alignSelf = 'flex-end';
        form.appendChild(submitButton);

        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                name: formData.get('name'),
                stars: currentRating,
                text: formData.get('text'),
                source: 'Direct'
            };
            
            if (data.stars === 0) {
                alert('Please select a star rating.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/widgets/${widgetId}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (response.ok) {
                    alert('Thank you for your review!');
                    document.body.removeChild(modalOverlay);
                    renderWidget(widgetId); // Re-render widget to show new review
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.error || 'Could not submit review.'}`);
                }
            } catch (err) {
                alert('An error occurred. Please try again.');
            }
        };

        modalContent.appendChild(closeButton);
        modalContent.appendChild(title);
        modalContent.appendChild(description);
        modalContent.appendChild(form);
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);
    }
    
    function createStarRating(rating) {
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.gap = '2px';
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            const isFilled = i < Math.round(rating);
            star.innerHTML = getStarSVG(isFilled);
            container.appendChild(star);
        }
        return container;
    }

    async function renderWidget(widgetId) {
        const targetElement = document.querySelector(`review-widget[widgetId='${widgetId}']`);
        if (!targetElement) {
            console.error(`Widget target with ID ${widgetId} not found.`);
            targetElement.innerHTML = `<p style="color: red; font-family: sans-serif;">Error: Widget container not found.</p>`;
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/widgets/${widgetId}`);
            if (!response.ok) throw new Error('Failed to fetch widget data.');
            const { data: widget } = await response.json();

            // Clear previous content
            targetElement.innerHTML = '';
            
            const overallRating = widget.reviews.length > 0 ? widget.reviews.reduce((acc, r) => acc + r.stars, 0) / widget.reviews.length : 0;
            const totalReviews = widget.reviews.length;
            const ratingDistribution = Array(5).fill(0);
            widget.reviews.forEach(r => ratingDistribution[5 - r.stars]++);

            const style = document.createElement('style');
            style.textContent = `
                .widget-container { font-family: sans-serif; background-color: #F9FAFB; padding: 24px; max-width: 1200px; margin: auto; }
                .widget-header { text-align: center; margin-bottom: 24px; }
                .widget-header h1 { font-size: 28px; font-weight: bold; margin: 0 0 4px 0; }
                .widget-summary { display: grid; grid-template-columns: 1fr; gap: 24px; margin-bottom: 32px; }
                @media (min-width: 768px) { .widget-summary { grid-template-columns: 1fr 2fr; } }
                .summary-card { background-color: white; border-radius: 8px; padding: 24px; border: 1px solid #E5E7EB; }
                .overall-rating { display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .overall-rating .rating-value { font-size: 56px; font-weight: bold; }
                .overall-rating .rating-text { color: #6B7280; }
                .distribution-bar { display: flex; align-items: center; gap: 8px; }
                .distribution-bar .bar { background-color: #E5E7EB; height: 8px; border-radius: 4px; flex-grow: 1; }
                .distribution-bar .bar-inner { background-color: #FBBF24; height: 100%; border-radius: 4px; }
                .reviews-header { display: flex; flex-direction: column; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; }
                @media (min-width: 640px) { .reviews-header { flex-direction: row; } }
                .reviews-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
                @media (min-width: 640px) { .reviews-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (min-width: 1024px) { .reviews-grid { grid-template-columns: repeat(3, 1fr); } }
                .review-card { background-color: white; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; }
                .review-card-header { display: flex; align-items: center; gap: 12px; }
                .review-card-avatar { width: 40px; height: 40px; border-radius: 50%; background-color: #D1D5DB; display: flex; justify-content: center; align-items: center; font-weight: bold; }
                .review-card-author .name { font-weight: 600; }
                .review-card-author .source { font-size: 12px; color: #6B7280; }
                .review-card .rating { margin: 12px 0; }
                .review-card .text { color: #374151; font-size: 14px; }
            `;
            targetElement.appendChild(style);

            const container = document.createElement('div');
            container.className = 'widget-container';

            // Header
            const header = document.createElement('div');
            header.className = 'widget-header';
            header.innerHTML = `<h1>${widget.businessName}</h1>`;
            container.appendChild(header);

            if (totalReviews > 0) {
                 const summary = document.createElement('div');
                summary.className = 'widget-summary';
                summary.innerHTML = `
                    <div class="summary-card overall-rating">
                        <div class="rating-value">${overallRating.toFixed(1)}</div>
                        ${createStarRating(overallRating).outerHTML}
                        <div class="rating-text">Based on ${totalReviews} reviews</div>
                    </div>
                    <div class="summary-card">
                        <h2 style="font-weight: 600; margin-bottom: 12px;">Rating distribution</h2>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            ${ratingDistribution.map((count, i) => `
                                <div class="distribution-bar">
                                    <span style="color: #6B7280;">${5 - i}</span>
                                    <div style="color: #FACC15;">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                    </div>
                                    <div class="bar"><div class="bar-inner" style="width: ${(count / totalReviews) * 100}%;"></div></div>
                                    <span style="color: #6B7280; width: 20px; text-align: right;">${count}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
                container.appendChild(summary);
            }
            
            const reviewsSection = document.createElement('div');
            const reviewsHeader = document.createElement('div');
            reviewsHeader.className = 'reviews-header';
            reviewsHeader.innerHTML = `<h2 style="font-size: 20px; font-weight: bold;">${totalReviews > 0 ? "What people are saying" : "Be the first to leave a review"}</h2>`;
            const writeReviewButton = document.createElement('button');
            writeReviewButton.textContent = 'Write a Review';
            writeReviewButton.style.padding = '8px 16px';
            writeReviewButton.style.backgroundColor = '#4F46E5';
            writeReviewButton.style.color = 'white';
            writeReviewButton.style.border = 'none';
            writeReviewButton.style.borderRadius = '4px';
            writeReviewButton.style.cursor = 'pointer';
            writeReviewButton.onclick = () => createModal(widgetId, widget.businessName);
            reviewsHeader.appendChild(writeReviewButton);
            reviewsSection.appendChild(reviewsHeader);

            const reviewsGrid = document.createElement('div');
            reviewsGrid.className = 'reviews-grid';
            if (totalReviews > 0) {
                 widget.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(review => {
                    reviewsGrid.innerHTML += `
                        <div class="review-card">
                            <div class="review-card-header">
                                <div class="review-card-avatar">${review.name.charAt(0)}</div>
                                <div class="review-card-author">
                                    <div class="name">${review.name}</div>
                                    <div class="source">${review.source} review</div>
                                </div>
                            </div>
                            <div class="rating">${createStarRating(review.stars).outerHTML}</div>
                            <p class="text">${review.text}</p>
                        </div>
                    `;
                });
            } else {
                 reviewsGrid.innerHTML = `
                    <div style="text-align: center; padding: 48px; border: 2px dashed #D1D5DB; border-radius: 8px; grid-column: 1 / -1;">
                        <h3 style="font-size: 18px; font-weight: 600;">No reviews yet</h3>
                        <p style="color: #6B7280;">Your widget is ready to collect feedback.</p>
                    </div>
                 `;
            }
            reviewsSection.appendChild(reviewsGrid);
            container.appendChild(reviewsSection);

            targetElement.appendChild(container);

        } catch (error) {
            console.error('Failed to render widget:', error);
            targetElement.innerHTML = `<p style="color: red; font-family: sans-serif;">Error: Could not load widget data.</p>`;
        }
    }
    
    function initializeWidgets() {
        const widgetElements = document.querySelectorAll('review-widget');
        if (widgetElements.length === 0) {
            console.warn('No review-widget elements found on this page.');
            return;
        }
        widgetElements.forEach(el => {
            const widgetId = el.getAttribute('widgetId');
            if (widgetId) {
                renderWidget(widgetId);
            } else {
                console.error('Review-widget tag is missing widgetId attribute.');
                el.innerHTML = `<p style="color: red; font-family: sans-serif;">Error: Widget configuration is missing (widgetId).</p>`;
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidgets);
    } else {
        initializeWidgets();
    }
})();

    