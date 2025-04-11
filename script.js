document.addEventListener('DOMContentLoaded', () => {
    // --- NAVBAR ---
    const nav = document.getElementById('main-nav');
    const heroSectionHeight = document.getElementById('home')?.offsetHeight || 0; // Get hero height

    function handleScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        // Optional: Make navbar more opaque when scrolling past hero
        // if (window.scrollY > heroSectionHeight - nav.offsetHeight) {
        //     nav.style.setProperty('background', 'rgba(255, 255, 255, 1)');
        // } else if (window.scrollY > 50) {
        //     nav.style.setProperty('background', 'rgba(255, 255, 255, 0.95)');
        // } else {
        //      nav.style.setProperty('background', 'rgba(255, 255, 255, 0.8)');
        // }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // --- SMOOTH SCROLL FOR NAV LINKS ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            // Ensure it's a local link and the target exists
            if (targetId.length > 1 && document.querySelector(targetId)) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth',
                    block: 'start' // Aligns top of target with top of viewport
                });

                // Optional: Close mobile navbar if open
                const navbarCollapse = document.getElementById('navbarNav');
                if (navbarCollapse.classList.contains('show')) {
                    new bootstrap.Collapse(navbarCollapse).hide();
                }
            }
        });
    });


    // --- BUDGET RANGE SLIDER ---
    const budgetRange = document.getElementById('budget-range');
    const budgetValue = document.getElementById('budget-value');
    if (budgetRange && budgetValue) {
        const updateBudgetValue = () => {
            const value = parseInt(budgetRange.value);
            budgetValue.textContent = `₹ ${value.toLocaleString('en-IN')}`;
        };
        budgetRange.addEventListener('input', updateBudgetValue);
        updateBudgetValue(); // Initial display
    }

    // --- DESIGN FORM & BEFORE/AFTER PREVIEW ---
    const designForm = document.getElementById('design-form');
    const imageUploadInput = document.getElementById('room-image-upload');
    const beforePreviewImg = document.getElementById('before-preview');
    const afterPreviewImg = document.getElementById('after-preview');
    const previewLoading = document.getElementById('preview-loading');
    const staticAfterImageSrc = 'images/after-example.jpg'; // Your static "after" image path

    if (imageUploadInput && beforePreviewImg && afterPreviewImg) {
        imageUploadInput.addEventListener('change', (event) => {
            const file = event.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // Display the uploaded "before" image
                    beforePreviewImg.src = e.target.result;
                }
                reader.readAsDataURL(file);
            } else {
                // Reset if no file is selected
                beforePreviewImg.src = 'images/placeholder-before.jpg';
            }
        });
    }

    if (designForm) {
        designForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // --- Simulate AI Processing ---
            if (previewLoading) previewLoading.style.display = 'flex'; // Show loader
            if (afterPreviewImg) afterPreviewImg.src = 'images/transparent-pixel.png'; // Clear previous after image briefly

            // Simulate network delay & AI processing
            setTimeout(() => {
                // Set the static "after" image
                if (afterPreviewImg) {
                    afterPreviewImg.src = staticAfterImageSrc;
                }

                // Hide loader
                if (previewLoading) previewLoading.style.display = 'none';

                // Optionally scroll to the preview section
                 document.getElementById('upload-design')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // You might show a success message here instead of alert
                // alert('Design generated! Check the preview.');

            }, 1500); // Simulate 1.5 seconds processing time
        });
    }

    // --- TESTIMONIAL CAROUSEL (Ensure Bootstrap JS handles this) ---
    const testimonialCarousel = document.getElementById('testimonial-carousel');
    if (testimonialCarousel) {
        // Bootstrap's JS should initialize this automatically via data-bs-ride attribute
        // If needed, you can initialize manually: new bootstrap.Carousel(testimonialCarousel);
    }

    // --- FOOTER YEAR ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- CHAT BUBBLE & MODAL ---
    const chatBubble = document.getElementById('chat-bubble');
    const chatModal = document.getElementById('chat-modal');
    const chatCloseBtn = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');

    if (chatBubble && chatModal && chatCloseBtn) {
        chatBubble.addEventListener('click', () => {
            chatModal.classList.add('open');
        });

        chatCloseBtn.addEventListener('click', () => {
            chatModal.classList.remove('open');
        });

        // Close chat if clicking outside
        // document.addEventListener('click', (event) => {
        //     if (!chatModal.contains(event.target) && !chatBubble.contains(event.target) && chatModal.classList.contains('open')) {
        //          chatModal.classList.remove('open');
        //     }
        // });
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = chatForm.querySelector('.chat-input');
            const message = input.value.trim();
            if (message) {
                // TODO: Implement actual chat logic (send message, display response)
                console.log('Chat message:', message);

                 // Example: Add user message to chat body
                 const chatBody = chatModal.querySelector('.chat-body');
                 const userMsgDiv = document.createElement('div');
                 userMsgDiv.textContent = message;
                 userMsgDiv.style.textAlign = 'right'; // Basic styling for user message
                 userMsgDiv.style.marginBottom = '10px';
                 // chatBody.appendChild(userMsgDiv); // Append message

                 // Simulate AI response
                 // const aiMsgDiv = document.createElement('div');
                 // aiMsgDiv.textContent = "Thanks for your message! How can I assist further?";
                 // aiMsgDiv.classList.add('ai-message');
                 // chatBody.appendChild(aiMsgDiv);

                 // Scroll to bottom
                 // chatBody.scrollTop = chatBody.scrollHeight;


                input.value = ''; // Clear input
                 // Keep modal open or close based on desired flow
                 // chatModal.classList.remove('open');
            }
        });
    }


    // --- SCROLL REVEAL ANIMATIONS ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                 // Add delay if specified
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);

                // Optional: Stop observing once visible
                observer.unobserve(entry.target);
            }
            // Optional: Reset animation if element scrolls out of view
            // else {
            //     entry.target.classList.remove('is-visible');
            // }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
        // rootMargin: "-50px 0px -50px 0px" // Adjust trigger margins if needed
    });

    animatedElements.forEach(el => {
        // Set initial animation class based on data attribute
        const animationType = el.dataset.animation || 'fadeInUp'; // Default to fadeInUp
        el.classList.add(animationType);
        observer.observe(el);
    });

});