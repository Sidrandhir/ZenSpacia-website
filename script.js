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

    // Waitlist Form Submission
    const waitlistForm = document.getElementById('waitlist-form');
    if (waitlistForm) {
        waitlistForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            alert(`Thank you, ${name}! You've joined the ZenSpacia waitlist.`);
            waitlistForm.reset();
        });
    }

    // Design Questionnaire Submission
    const designForm = document.getElementById('design-questionnaire');
    if (designForm) {
        designForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Design request submitted! Our AI will generate your design soon.');
            designForm.reset();
        });
    }
});