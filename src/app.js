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
            renderPosts(); // Re-render if we have a filter
        }
    } catch (e) {
        console.error("Data pull failed (likely local offline). Static content preserved.");
    }
}

function renderPosts() {
    const cards = blogGrid.querySelectorAll('.v-card');
    const feedAds = blogGrid.querySelectorAll('.ad-feed');
    
    let visibleCount = 0;

    cards.forEach(card => {
        const cat = card.getAttribute('data-category').toLowerCase();
        const active = activeCategory.toLowerCase();
        const title = card.querySelector('h2').innerText.toLowerCase();
        const desc = card.querySelector('p').innerText.toLowerCase();
        const query = searchQuery.toLowerCase();

        const matchesCategory = active === 'all' || cat === active;
        const matchesSearch = title.includes(query) || desc.includes(query);

        if (matchesCategory && matchesSearch) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Hide in-feed ads if search/filter is active to keep layout clean
    feedAds.forEach(ad => {
        if (activeCategory !== 'All' || searchQuery !== '') {
            ad.classList.add('hidden');
        } else {
            ad.classList.remove('hidden');
        }
    });

    if (visibleCount === 0) {
        if (!document.getElementById('noResults')) {
            const msg = document.createElement('p');
            msg.id = 'noResults';
            msg.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);';
            msg.innerText = 'No articles found in this section.';
            blogGrid.appendChild(msg);
        }
    } else {
        const msg = document.getElementById('noResults');
        if (msg) msg.remove();
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

window.addEventListener('DOMContentLoaded', fetchPosts);
