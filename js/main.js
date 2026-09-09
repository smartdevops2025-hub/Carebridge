// ===== MAIN JAVASCRIPT =====

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const closeMobileMenuBtn = document.getElementById('closeMobileMenu');
const mobileMenu = document.getElementById('mobileMenu');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (closeMobileMenuBtn) {
    closeMobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
}

// Close menu on link click
document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== NAVBAR SHADOW ON SCROLL =====
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.top-nav');
    if (window.scrollY > 50) {
        nav.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
    } else {
        nav.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)';
    }
});

// ===== ANIMATE STATS ON SCROLL =====
const stats = document.querySelectorAll('.stat-number');
let animated = false;

const animateStats = () => {
    if (animated) return;
    const statsSection = document.querySelector('.hero-stats');
    if (!statsSection) return;
    
    const rect = statsSection.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
        stats.forEach(stat => {
            const text = stat.textContent;
            const num = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (!isNaN(num)) {
                let current = 0;
                const increment = num / 30;
                const interval = setInterval(() => {
                    current += increment;
                    if (current >= num) {
                        stat.textContent = text;
                        clearInterval(interval);
                    } else {
                        stat.textContent = Math.floor(current) + (text.includes('★') ? '★' : '') + (text.includes('%') ? '%' : '+');
                    }
                }, 30);
            }
        });
        animated = true;
    }
};

window.addEventListener('scroll', animateStats);
window.addEventListener('load', () => {
    setTimeout(animateStats, 500);
});

console.log('🏥 Carebridge - Connecting families with care');
