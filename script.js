document.addEventListener('DOMContentLoaded', () => {
    // Sticky Navbar
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Hero Particles
    const canvas = document.getElementById('hero-particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = [];
    for (let i = 0; i < 50; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: Math.random() * 0.5 - 0.25,
            speedY: Math.random() * 0.5 - 0.25
        });
    }
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(232, 200, 114, 0.5)';
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            p.x += p.speedX;
            p.y += p.speedY;
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
        });
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Budget Range
    const budgetRange = document.getElementById('budget-range');
    const budgetValue = document.getElementById('budget-value');
    budgetRange.addEventListener('input', () => {
        budgetValue.textContent = `₹ ${parseInt(budgetRange.value).toLocaleString('en-IN')}`;
    });

    // Design Form
    const designForm = document.getElementById('design-form');
    const styleSelect = document.getElementById('style-select');
    const themeInput = document.getElementById('theme-input');
    const designPreview = document.getElementById('design-preview');
    const regenerateBtn = document.getElementById('regenerate');
    designForm.addEventListener('submit', (e) => {
        e.preventDefault();
        updatePreview();
        alert('Design generated! Check the preview.');
    });
    regenerateBtn.addEventListener('click', () => {
        designPreview.classList.add('spin');
        setTimeout(() => {
            designPreview.classList.remove('spin');
            updatePreview();
        }, 500);
    });
    function updatePreview() {
        designPreview.src = `https://via.placeholder.com/400x300?text=${styleSelect.value}+${themeInput.value}`;
    }

    // Booking Form
    const bookingForm = document.getElementById('booking-form');
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Site visit scheduled successfully!');
        bookingForm.reset();
    });

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Message sent! We’ll get back to you soon.');
        contactForm.reset();
    });

    // Chatbot (Placeholder)
    const chatbotSend = document.querySelector('.chatbot-send');
    chatbotSend.addEventListener('click', () => {
        const input = document.querySelector('.chatbot-input');
        if (input.value.trim()) {
            alert('Chat message sent: ' + input.value);
            input.value = '';
        }
    });
});