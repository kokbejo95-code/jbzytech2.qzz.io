// FinEdge - Vanilla JS Logic
let allPosts = [];
let activeCategory = 'All';
let searchQuery = '';

const blogGrid = document.getElementById('blogGrid');
const searchInput = document.getElementById('searchInput');
const navFilters = document.querySelectorAll('.filter-nav, .logo');

async function fetchPosts() {
    try {
        const response = await fetch('/data/posts.json');
        allPosts = await response.json();
        
        // Handle URL parameters for categories
        const urlParams = new URLSearchParams(window.location.search);
        const catParam = urlParams.get('category');
        if (catParam) {
            activeCategory = catParam;
        }

        renderPosts();
    } catch (e) {
        console.error(e);
        blogGrid.innerHTML = '<p>Error loading articles.</p>';
    }
}

function renderPosts() {
    const filtered = allPosts.filter(post => {
        const cat = post.category.toLowerCase();
        const active = activeCategory.toLowerCase();
        const matchesCategory = active === 'all' || cat === active;
        const query = searchQuery.toLowerCase();
        const matchesSearch = post.title.toLowerCase().includes(query) || 
                             post.description.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    blogGrid.innerHTML = filtered.map(post => `
        <article class="v-card">
            <img src="${post.image}" alt="${post.title}" loading="lazy" referrerPolicy="no-referrer">
            <div class="card-body">
                <span class="badge">${post.category}</span>
                <h2>${post.title}</h2>
                <p>${post.description}</p>
                <a href="/posts/${post.slug}.html" class="read-more">Read Insight →</a>
            </div>
        </article>
    `).join('');

    if (filtered.length === 0) {
        blogGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">No articles found in this section.</p>`;
    }
}

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderPosts();
});

navFilters.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetCat = link.getAttribute('data-category') || 'All';
        
        // Only prevent default if we are on the homepage
        // If we are on an article page, a normal link is fine
        if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html') || window.location.pathname === '') {
            e.preventDefault();
            activeCategory = targetCat;
            if (activeCategory === 'All') {
                searchQuery = '';
                searchInput.value = '';
            }
            renderPosts();
            // Update URL without reload to reflect filter
            const newUrl = activeCategory === 'All' ? '/' : `/?category=${activeCategory}`;
            window.history.pushState({ category: activeCategory }, '', newUrl);
        }
    });
});

window.onload = fetchPosts;
