(function () {
    "use strict";

    // Helper functions for vanilla JS
    function fadeIn(element, duration = 400) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        const start = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = progress;
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = 1;
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    function fadeOut(element, duration = 400) {
        const start = performance.now();
        const startOpacity = parseFloat(getComputedStyle(element).opacity);
        
        function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                element.style.opacity = startOpacity * (1 - progress);
                requestAnimationFrame(animate);
            } else {
                element.style.opacity = 0;
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    }

    function smoothScrollTo(target, duration = 1500) {
        const start = window.pageYOffset;
        const startTime = performance.now();
        
        function easeInOutExpo(t) {
            if (t === 0) return 0;
            if (t === 1) return 1;
            if (t < 0.5) {
                return Math.pow(2, 20 * t - 10) / 2;
            }
            return (2 - Math.pow(2, -20 * t + 10)) / 2;
        }
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutExpo(progress);
            
            window.scrollTo(0, start + (target - start) * easeProgress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            const spinnerElement = document.getElementById('spinner');
            if (spinnerElement) {
                spinnerElement.classList.remove('show');
            }
        }, 1);
    };
    spinner(0);
    
    
    // Initiate the wowjs
    new WOW().init();

    // Initialize Bootstrap Carousel when DOM is loaded
    document.addEventListener('DOMContentLoaded', function () {
        // Bootstrap carousel will auto-start with data-bs-ride="carousel"
        // But we can also manually initialize it for more control
        const carouselElement = document.getElementById('carouselExampleCaptions');
        if (carouselElement && typeof bootstrap !== 'undefined') {
            const carousel = new bootstrap.Carousel(carouselElement, {
                interval: 5000, // 5 seconds between slides
                wrap: true,     // Enable infinite loop
                touch: true     // Enable touch/swipe support
            });
        }
    });

    // Sticky Navbar
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.pageYOffset > 45) {
                navbar.classList.add('sticky-top', 'shadow-sm');
            } else {
                navbar.classList.remove('sticky-top', 'shadow-sm');
            }
        }
    });

})();

