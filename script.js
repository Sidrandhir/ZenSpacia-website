document.addEventListener('DOMContentLoaded', () => {

    // --- Sticky Header ---
    const header = document.getElementById('main-header');
    const scrollThreshold = 50;

    if (header) {
        const checkScroll = () => {
            if (window.scrollY > scrollThreshold) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        window.addEventListener('scroll', checkScroll);
        checkScroll(); // Initial check
    }

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isActive = mobileMenu.classList.toggle('active');
            menuToggle.classList.toggle('active', isActive);
            // Optional: Lock body scroll when menu is open
            // document.body.style.overflow = isActive ? 'hidden' : '';
        });

        // Close mobile menu when a link is clicked
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                // document.body.style.overflow = ''; // Unlock scroll
            });
        });
    }


    // --- Smooth Scrolling ---
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]');
    const getHeaderHeight = () => document.getElementById('main-header')?.offsetHeight || 75; // Update fallback height

    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const targetPosition = targetElement.offsetTop - getHeaderHeight();
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }
        });
    });

    // --- Scroll Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, observerInstance) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animation = element.dataset.animation || 'fadeInUp';
                    const delay = element.dataset.delay || '0';
                    element.style.animationDelay = `${delay}ms`;
                    element.classList.add('animated', animation);
                    observerInstance.unobserve(element);
                }
            });
        }, { threshold: 0.1 }); // Trigger sooner
        animatedElements.forEach(el => observer.observe(el));
    } else {
        animatedElements.forEach(el => el.style.opacity = 1); // Fallback
    }

    // --- Before/After Slider ---
    document.querySelectorAll('.before-after-slider').forEach(slider => {
        const resizeElement = slider.querySelector('.resize');
        const handleElement = slider.querySelector('.handle');
        if (!resizeElement || !handleElement) return;

        let isDragging = false;

        const moveHandler = (clientX) => {
            const sliderRect = slider.getBoundingClientRect();
            let newWidth = ((clientX - sliderRect.left) / sliderRect.width) * 100;
            newWidth = Math.max(0, Math.min(100, newWidth)); // Clamp
            resizeElement.style.width = `${newWidth}%`;
            handleElement.style.left = `${newWidth}%`;
        };

        const startDrag = (e) => {
            isDragging = true;
            slider.classList.add('dragging');
            moveHandler(e.clientX || (e.touches && e.touches[0].clientX));
             e.preventDefault();
        };
        const stopDrag = () => { if (isDragging) { isDragging = false; slider.classList.remove('dragging'); } };
        const drag = (e) => { if (!isDragging) return; moveHandler(e.clientX || (e.touches && e.touches[0].clientX)); };

        handleElement.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        handleElement.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', stopDrag);
        document.addEventListener('touchcancel', stopDrag);
         slider.addEventListener('click', (e) => { if (!isDragging && e.target !== handleElement && !handleElement.contains(e.target)) { moveHandler(e.clientX); }}); // Allow click on image area only
    });

    // --- Form Submission Placeholder ---
    const previewForm = document.getElementById('preview-form-final');
    const formStatus = document.getElementById('final-form-status');

    if (previewForm && formStatus) {
        previewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!previewForm.checkValidity()) { previewForm.reportValidity(); return; }

            formStatus.textContent = 'Generating your preview... Please wait.';
            formStatus.className = 'form-status-message';
            formStatus.style.color = 'var(--primary-color)';
            const submitButton = previewForm.querySelector('button[type="submit"]');
            if(submitButton) { submitButton.disabled = true; submitButton.style.opacity = '0.7';}

            // ** TODO: Replace with actual API call **
            console.log("Form Submitted (Placeholder)");
            setTimeout(() => {
                const isSuccess = Math.random() > 0.1;
                if (isSuccess) {
                    formStatus.textContent = 'Success! Your design preview is being generated. We\'ll notify you.';
                    formStatus.style.color = 'var(--success-color)';
                    // previewForm.reset(); // Consider resetting form
                } else {
                    formStatus.textContent = 'Oops! Something went wrong. Please check details or try again later.';
                    formStatus.style.color = 'var(--error-color)';
                }
                 if(submitButton) { submitButton.disabled = false; submitButton.style.opacity = '1';}
            }, 3500);
        });
    }

    // --- Footer Current Year ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }

    // --- Simple Counter Animation (for Hero and Trust section) ---
    const counters = document.querySelectorAll('#preview-counter-hero, #preview-counter'); // Select both counters if needed
     if (counters.length > 0) {
        const runCounter = (counterElement) => {
            const targetCount = parseInt(counterElement.getAttribute('data-target') || counterElement.textContent || '100', 10);
            counterElement.textContent = '0'; // Start from 0
            let start = null;

            const updateCounter = (timestamp) => {
                if (!start) start = timestamp;
                const progress = timestamp - start;
                const duration = 1500; // Animation duration

                const current = Math.min(Math.ceil(targetCount * (progress / duration)), targetCount);
                counterElement.textContent = current;

                if (progress < duration) {
                    requestAnimationFrame(updateCounter);
                } else {
                     // Only add '+' to the main counter, not the hero one potentially
                    if (counterElement.id === 'preview-counter') {
                         counterElement.textContent = targetCount + '+';
                    } else {
                         counterElement.textContent = targetCount;
                    }
                }
            };

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    start = null; // Reset start time each time it becomes visible
                    requestAnimationFrame(updateCounter);
                    observer.unobserve(counterElement);
                }
            }, { threshold: 0.5 });
            observer.observe(counterElement);
        };

        counters.forEach(runCounter); // Run for each counter found
     }

}); // End DOMContentLoaded