document.addEventListener('DOMContentLoaded', () => {

    // --- UI ELEMENTS & STATE---
    const body = document.body;
    const portfolioGrid = document.getElementById('portfolio-grid');
    const articlesGrid = document.getElementById('articles-grid');
    const modal = document.getElementById('project-modal');
    const mobileMenu = document.getElementById('mobile-menu');
    const workSearchInput = document.getElementById('work-search');
    const insightsSearchInput = document.getElementById('insights-search');
    let lastActiveElement; // For modal focus management

    // --- DATA ---
    const projects = [
        {
            id: 1,
            title: "Sri Lanka Government Budget Analysis",
            category: "strategic",
            description: "A fiscal data visualisation initiative to improve public understanding and government transparency.",
            challenge: "National budgets are typically published as dense, inaccessible documents. This makes it difficult for the public and policymakers to understand fiscal priorities. The challenge was to simplify this complexity without losing important details.",
            role: "As lead Information Designer, I was responsible for the visual strategy. This involved analysing raw budget data, creating a clear visual language, and developing a series of straightforward infographics and charts.",
            outcome: "The visualisations were shared widely on social media and used by researchers and journalists. This made complex fiscal information accessible, leading to a more informed public debate on national spending.",
            tags: ["Public Policy", "Fiscal Data", "Transparency"],
            casestudy_url: "projects/sri-lanka-budget-analysis.html" // Updated Path
        },
        {
            id: 2,
            title: "UN Annual Results & SDG Fund Reports",
            category: "reports",
            description: "Designed and produced flagship annual reports for the United Nations in Sri Lanka.",
            challenge: "To combine a year's worth of data from multiple agencies into a single, compelling report that met strict UN branding and accessibility standards.",
            role: "I led the design and production, coordinating with over six UN agencies. My role covered information architecture, data visualisation, layout design, and final production.",
            outcome: "Delivered high-impact reports shared at national levels, including with the Prime Minister's office. The reports effectively communicated the UN's work and strengthened stakeholder relations.",
            tags: ["UN", "SDGs", "Annual Reporting"],
            casestudy_url: "#"
        },
        {
            id: 3,
            title: "Analysis of Drug-Related Arrests",
            category: "strategic",
            description: "A data story showing policy imbalances in national drug control strategies.",
            challenge: "Raw data on drug-related arrests fails to show the human story or policy implications. The goal was to visualise this data to uncover patterns and question the effectiveness of current strategies.",
            role: "I designed and executed the data visualisation, turning raw statistics into a clear visual narrative. This involved data cleaning, choosing an effective chart type, and designing the final graphic.",
            outcome: "The visualisation was featured in national media, starting a conversation about the imbalance between arrests for consumption versus trafficking. This helped influence public discussion on drug policy reform.",
            tags: ["Social Justice", "Policy Analysis", "Data Narrative"],
            casestudy_url: "#"
        },
        {
            id: 4,
            title: "Broken Lotus: Harassment Data Art",
            category: "personal",
            description: "A symbolic data art piece representing 2,252 reported cases of sexual harassment, created to raise awareness.",
            challenge: "Statistics about sexual harassment can feel abstract. The challenge was to create a piece that communicates the scale of the problem while evoking an emotional response, respecting the sensitivity of the subject.",
            role: "As the sole creator, I handled all research, data gathering, concept development, and design. I used the lotus as a cultural symbol, showing it broken to represent the trauma behind each data point.",
            outcome: "The piece became a powerful conversation starter on social media, showing how data art can communicate sensitive social issues in a way that is both informative and human.",
            tags: ["Data Art", "Social Commentary", "Advocacy"],
            casestudy_url: "#"
        },
        {
            id: 5,
            title: "Verité Research Communications",
            category: "reports",
            description: "Produced a portfolio of over 150 research communication outputs for a leading think tank.",
            challenge: "To consistently translate dense academic research into accessible formats like infographics and policy briefs for a non-expert audience, while maintaining accuracy and credibility.",
            role: "As Senior Communications Designer, I managed the production workflow, designed key outputs, and mentored junior designers. I acted as the bridge between research teams and the public.",
            outcome: "Produced over 150 distinct outputs that were frequently featured in national newspapers and on TV, significantly increasing the visibility and influence of the organisation's research.",
            tags: ["Think Tank", "Research", "Infographics"],
            casestudy_url: "#"
        },
        {
            id: 6,
            title: "338 Acts of Change: A Civic Timeline",
            category: "personal",
            description: "An interactive spiral chart mapping significant civic and political acts over time.",
            challenge: "To visualise a historical timeline in a non-linear, engaging way that allows users to explore the connections between different civic actions.",
            role: "I designed and developed this personal project, which involved historical research, data compilation, and learning new tools to create the unique spiral chart visualisation.",
            outcome: "The project successfully mapped 338 distinct acts, offering a new perspective on civic history and showcasing my skills in creating unconventional and interactive data narratives.",
            tags: ["Interactive Viz", "History", "Civic Tech"],
            casestudy_url: "#"
        }
    ];

    const articles = [
        { title: "The Ethics of Data Visualisation", excerpt: "Balancing accuracy, impact, and the responsibilities of a designer.", date: "Oct 2025", category: "Ethics", href: "insights/ethics-of-data-viz.html", tags: ["Responsibility", "Design Principles"] }, // Updated Path
        { title: "The Future of Visualisation", excerpt: "Exploring AI-driven tools without losing the essential human element of insight.", date: "Sep 2025", category: "Technology", href: "#", tags: ["AI", "Automation", "Human-in-the-loop"] },
        { title: "From Design to Policy Influence", excerpt: "A reflection on the journey from graphic design to shaping public discourse.", date: "Aug 2025", category: "Career", href: "#", tags: ["Career Path", "Public Service", "Strategy"] }
    ];

    // --- RENDER FUNCTIONS ---
    function renderTags(tags) {
        if (!tags || tags.length === 0) return '';
        return tags.map(tag => `<span class="card-tag">${tag}</span>`).join('');
    }

    function displayPortfolioItems(filter = 'all', searchTerm = '') {
        if (!portfolioGrid) return;
        const lowercasedSearchTerm = searchTerm.toLowerCase();

        const filteredProjects = projects.filter(project => {
            const matchesCategory = (filter === 'all' || project.category === filter);
            const matchesSearch = searchTerm === '' ||
                                  project.title.toLowerCase().includes(lowercasedSearchTerm) ||
                                  project.description.toLowerCase().includes(lowercasedSearchTerm) ||
                                  project.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm));
            return matchesCategory && matchesSearch;
        });
        
        portfolioGrid.innerHTML = '';
        if (filteredProjects.length === 0) {
            portfolioGrid.innerHTML = `<p>No projects found matching your criteria.</p>`;
            return;
        }

        filteredProjects.forEach(project => {
            const item = document.createElement('button'); // Use button for accessibility
            item.className = 'content-card';
            item.setAttribute('aria-label', `View details for ${project.title}`);
            item.innerHTML = `
                <div class="card-image"></div>
                <div class="card-content">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    <div class="card-tags">${renderTags(project.tags)}</div>
                </div>`;
            item.addEventListener('click', () => openModal(project));
            portfolioGrid.appendChild(item);
        });
    }

    function displayArticleItems(searchTerm = '') {
        if (!articlesGrid) return;
        const lowercasedSearchTerm = searchTerm.toLowerCase();

        const filteredArticles = articles.filter(article => {
            return searchTerm === '' ||
                   article.title.toLowerCase().includes(lowercasedSearchTerm) ||
                   article.excerpt.toLowerCase().includes(lowercasedSearchTerm) ||
                   article.tags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm));
        });
        
        articlesGrid.innerHTML = '';
        if (filteredArticles.length === 0) {
            articlesGrid.innerHTML = `<p>No articles found matching your criteria.</p>`;
            return;
        }
        
        filteredArticles.forEach(article => {
            const item = document.createElement('a');
            item.href = article.href;
            item.className = 'content-card';
            item.innerHTML = `
                <div class="card-image"></div>
                <div class="card-content">
                    <div class="card-meta">${article.category} &middot; ${article.date}</div>
                    <h4>${article.title}</h4>
                    <p>${article.excerpt}</p>
                     <div class="card-tags">${renderTags(article.tags)}</div>
                </div>`;
            articlesGrid.appendChild(item);
        });
    }

    function openModal(project) {
        if (!modal) return;
        lastActiveElement = document.activeElement; // Save focused element
        const modalBody = document.getElementById('modal-body');
        const closeModalBtn = document.getElementById('close-modal');

        const caseStudyLink = project.casestudy_url !== '#'
            ? `<a href="${project.casestudy_url}" class="link-arrow" aria-label="View Full Case Study for ${project.title}">View Full Case Study →</a>`
            : '';

        modalBody.innerHTML = `
            <h2 id="modal-title">${project.title}</h2>
            <div class="modal-section">
                <h3>The Challenge</h3>
                <p>${project.challenge}</p>
            </div>
            <div class="modal-section">
                <h3>My Role</h3>
                <p>${project.role}</p>
            </div>
            <div class="modal-section">
                <h3>The Outcome</h3>
                <p>${project.outcome}</p>
            </div>
            <div class="modal-tags">${renderTags(project.tags)}</div>
            <div style="margin-top: 2.5rem;">
                ${caseStudyLink}
            </div>`;
        modal.classList.add('visible');
        modal.setAttribute('aria-hidden', 'false');
        body.style.overflow = 'hidden';
        closeModalBtn.focus(); // Set focus to the close button
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove('visible');
        modal.setAttribute('aria-hidden', 'true');
        body.style.overflow = '';
        if (lastActiveElement) {
            lastActiveElement.focus(); // Return focus to the element that opened the modal
        }
    }

    // --- EVENT LISTENERS ---
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            button.classList.add('active');
            if(workSearchInput) workSearchInput.value = '';
            displayPortfolioItems(button.dataset.filter);
        });
    });

    workSearchInput?.addEventListener('input', (e) => {
        const currentFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        displayPortfolioItems(currentFilter, e.target.value);
    });

    insightsSearchInput?.addEventListener('input', (e) => {
        displayArticleItems(e.target.value);
    });

    document.getElementById('close-modal')?.addEventListener('click', closeModal);
    modal?.addEventListener('click', e => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && modal?.classList.contains('visible')) {
            closeModal();
        }
        // Focus trapping inside modal
        if (e.key === 'Tab' && modal?.classList.contains('visible')) {
            const focusableElements = modal.querySelectorAll('button, [href]');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });

    document.getElementById('menu-toggle')?.addEventListener('click', () => {
        if (mobileMenu) {
            mobileMenu.classList.add('active');
            mobileMenu.setAttribute('aria-hidden', 'false');
        }
    });
    
    document.getElementById('close-mobile-menu')?.addEventListener('click', () => {
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            mobileMenu.setAttribute('aria-hidden', 'true');
        }
    });
    
    // --- INITIALIZATION ---
    displayPortfolioItems();
    displayArticleItems();
    const yearEl = document.getElementById('copyright-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});