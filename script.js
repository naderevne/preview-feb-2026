// Network Grid Animation
class NetworkAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.points = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationId = null;
        this.isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        // Configuration
        this.config = {
            pointCount: 80,
            pointRadius: 2,
            lineMaxDistance: 150,
            pointSpeed: 0.3,
            color: { r: 153, g: 69, b: 255 }, // #9945FF
            mouseInfluence: 80
        };

        this.init();
    }

    init() {
        this.resize();
        this.createPoints();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const newWidth = rect.width;
        const newHeight = rect.height;

        // On mobile, only resize if width changed (ignore height changes from address bar)
        if (this.isMobile && this.canvas.width === newWidth) {
            return false;
        }

        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        return true;
    }

    createPoints() {
        this.points = [];
        const count = Math.floor(this.config.pointCount * (this.canvas.width / 1200));

        for (let i = 0; i < Math.max(count, 40); i++) {
            this.points.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.config.pointSpeed,
                vy: (Math.random() - 0.5) * this.config.pointSpeed,
                radius: this.config.pointRadius + Math.random() * 1
            });
        }
    }

    bindEvents() {
        // Debounced resize to prevent jitter
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.resize()) {
                    this.createPoints();
                }
            }, 150);
        });

        this.canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.parentElement.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });

        // Touch support for mobile
        this.canvas.parentElement.addEventListener('touchmove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.mouse.x = touch.clientX - rect.left;
            this.mouse.y = touch.clientY - rect.top;
        }, { passive: true });

        this.canvas.parentElement.addEventListener('touchend', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updatePoints();
        this.drawLines();
        this.drawPoints();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    updatePoints() {
        for (const point of this.points) {
            // Move points
            point.x += point.vx;
            point.y += point.vy;

            // Bounce off edges
            if (point.x < 0 || point.x > this.canvas.width) point.vx *= -1;
            if (point.y < 0 || point.y > this.canvas.height) point.vy *= -1;

            // Mouse influence
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = point.x - this.mouse.x;
                const dy = point.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    point.x += (dx / dist) * force * 2;
                    point.y += (dy / dist) * force * 2;
                }
            }
        }
    }

    drawPoints() {
        const { r, g, b } = this.config.color;

        for (const point of this.points) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
            this.ctx.fill();

            // Glow effect
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, point.radius * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
            this.ctx.fill();
        }
    }

    drawLines() {
        const { r, g, b } = this.config.color;

        for (let i = 0; i < this.points.length; i++) {
            for (let j = i + 1; j < this.points.length; j++) {
                const dx = this.points[i].x - this.points[j].x;
                const dy = this.points[i].y - this.points[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.config.lineMaxDistance) {
                    const opacity = 1 - (dist / this.config.lineMaxDistance);
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.points[i].x, this.points[i].y);
                    this.ctx.lineTo(this.points[j].x, this.points[j].y);
                    this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }
}

// Fade-in animation on scroll
document.addEventListener('DOMContentLoaded', () => {
    // Initialize network animation
    new NetworkAnimation('network-canvas');
    const fadeElements = document.querySelectorAll('.fade-in');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay for elements in the same section
                const delay = index * 100;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // Smooth scroll for anchor links
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

    // Navbar background on scroll
    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            nav.style.background = 'rgba(10, 10, 10, 0.95)';
        } else {
            nav.style.background = 'rgba(10, 10, 10, 0.8)';
        }

        lastScroll = currentScroll;
    });
});
