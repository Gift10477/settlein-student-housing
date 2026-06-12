/**
 * Interactive DOM Controller
 * Pure Separation of Concerns - Logic only, no HTML strings.
 */

const SEED_DATA = [
    { id: "prop-1", title: "Apex Student Executive Suites", type: "Bedsitter", price: 14500, campus: "strathmore", distance: "0.4km", verified: true, amenities: ["Wi-Fi", "Borehole Water", "CCTV Security"], landlord: "Elias Kamau", contact: "0712345678", reviews: [{ student: "Brian M.", rating: 5, comment: "Amazing water supply and lightning-fast fiber internet." }] },
    { id: "prop-2", title: "Madaraka Scholar Residence", type: "Hostel Room", price: 8500, campus: "strathmore", distance: "0.2km", verified: true, amenities: ["Borehole Water", "Biometric Access"], landlord: "Jane Wanjiku", contact: "0722112233", reviews: [] },
    { id: "prop-3", title: "Ngando Legacy Hall", type: "Shared Apartment", price: 18000, campus: "ku", distance: "0.8km", verified: true, amenities: ["Wi-Fi", "Hot Showers", "Balcony"], landlord: "Peter Omwamba", contact: "0733445566", reviews: [] }
];

class AppController {
    constructor() {
        this.initDB();
        this.activePropertyId = null;
        this.currentViewId = 'view-auth'; // Tells router state management the default context layer
        this.lastMousePos = { x: 0, y: 0 };
        this.setupEventListeners();
    }

    initDB() {
        if (!localStorage.getItem('settlein_db')) {
            localStorage.setItem('settlein_db', JSON.stringify(SEED_DATA));
        }
    }

    getDB() { return JSON.parse(localStorage.getItem('settlein_db')); }
    saveDB(data) { localStorage.setItem('settlein_db', JSON.stringify(data)); }

    // --- VIEW ROUTING (Toggling CSS Classes) ---
    switchView(viewId) {
        this.currentViewId = viewId; // Tracks the view actively rendered globally
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
    
        const target = document.getElementById(viewId);
        if (target) {
            target.classList.remove('hidden');
            target.classList.add('active');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (viewId === 'view-listings') this.renderListings();
    }

    // --- EVENT LISTENERS ---
    setupEventListeners() {
        // --- Authentication View Tab Switching Listeners ---
        const btnSignInTab = document.getElementById('auth-toggle-signin');
        const btnSignUpTab = document.getElementById('auth-toggle-signup');
        const formSignIn = document.getElementById('form-signin');
        const formSignUp = document.getElementById('form-signup');

        if (btnSignInTab && btnSignUpTab && formSignIn && formSignUp) {
            btnSignInTab.addEventListener('click', () => {
                btnSignInTab.classList.add('active');
                btnSignUpTab.classList.remove('active');
                formSignIn.classList.remove('hidden');
                formSignUp.classList.add('hidden');
                const speech = document.querySelector('.mascot-speech-bubble');
                if (speech) speech.innerText = "Welcome back! Let's log in!";
            });

            btnSignUpTab.addEventListener('click', () => {
                btnSignUpTab.classList.add('active');
                btnSignInTab.classList.remove('active');
                formSignUp.classList.remove('hidden');
                formSignIn.classList.add('hidden');
                const speech = document.querySelector('.mascot-speech-bubble');
                if (speech) speech.innerText = "Awesome! Let's make a new profile!";
            });

            formSignIn.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showToast("Successfully authenticated student access session.");
                this.switchView('view-home');
            });

            formSignUp.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showToast("Student profile initialization successful.");
                this.switchView('view-listings');
            });
        }

        // --- MOUSE MOVE RESPONSIVE CARTOON EYE TRACKING ENGINE ---
        window.addEventListener('mousemove', (e) => {
            this.lastMousePos = { x: e.clientX, y: e.clientY };
            this.updateMascotEyes();
        });

        // --- GLOBAL SCROLL RESPONSIVE MASCOT MOVEMENT LOGIC ---
        window.addEventListener('scroll', () => {
            const bodyGroup = document.getElementById('mascot-body-group');
            if (!bodyGroup) return;

            const scrollDepth = window.scrollY;
            
            // Map the scroll dimension directly to a dynamic floating displacement and subtle body skew physics
            const floatOffset = Math.sin(scrollDepth * 0.01) * 8; 
            const dynamicSquash = 1 + (Math.cos(scrollDepth * 0.01) * 0.04);
            const dynamicStretch = 1 - (Math.cos(scrollDepth * 0.01) * 0.02);

            bodyGroup.style.transform = `translateY(${floatOffset}px) scale(${dynamicSquash}, ${dynamicStretch})`;
            
            // Update eyes on scroll too since the mascot moves
            this.updateMascotEyes();
        });

        // Navigation Links
        document.querySelectorAll('[data-target]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView(e.target.dataset.target);
            });
        });

        // Home Search Button
        const btnHomeSearch = document.getElementById('btn-home-search');
        if (btnHomeSearch) {
            btnHomeSearch.addEventListener('click', () => {
                const val = document.getElementById('home-campus-select').value;
                document.getElementById('f-campus').value = val;
                this.switchView('view-listings');
            });
        }

        // Filters auto-update
        const filterIds = ['f-campus', 'f-type', 'f-budget', 'f-wifi'];
        filterIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.renderListings());
            }
        });

        // Forms and Actions
        const landlordForm = document.getElementById('landlord-add-form');
        if (landlordForm) {
            landlordForm.addEventListener('submit', (e) => this.handleLandlordSubmit(e));
        }
        const btnBook = document.getElementById('btn-book-room');
        if (btnBook) {
            btnBook.addEventListener('click', () => this.handleMpesaPush());
        }
        const btnReview = document.getElementById('btn-submit-review');
        if (btnReview) {
            btnReview.addEventListener('click', () => this.handleReviewSubmit());
        }

        // --- PASSWORD INPUT EYE COVER DETECTOR ---
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        const mascotElement = document.getElementById('cartoon-mascot');
        const speechBubble = document.querySelector('.mascot-speech-bubble');

        passwordInputs.forEach(input => {
            input.addEventListener('focus', () => {
                if (mascotElement) mascotElement.classList.add('covering-eyes');
                if (speechBubble) speechBubble.innerText = "Privacy mode! I'm not looking! 🙈";
                
                // Center pupils behind hands
                const pL = document.getElementById('mascot-pupil-left');
                const pR = document.getElementById('mascot-pupil-right');
                if (pL) pL.style.transform = 'translate(0px, 0px)';
                if (pR) pR.style.transform = 'translate(0px, 0px)';
            });

            input.addEventListener('blur', () => {
                if (mascotElement) mascotElement.classList.remove('covering-eyes');
                if (speechBubble) {
                    const isSignUp = document.getElementById('auth-toggle-signup')?.classList.contains('active');
                    speechBubble.innerText = isSignUp ? "Awesome! Let's make a new profile!" : "Welcome back! Let's log in!";
                }
            });
        });
    }

    updateMascotEyes() {
        // Run coordinates tracking logic only if auth screen view is visible to preserve resources
        if (this.currentViewId !== 'view-auth') {
            const authSection = document.getElementById('view-auth');
            if (authSection && authSection.classList.contains('hidden')) return;
        }

        // PAUSE tracking if the eyes are currently covered
        const mascotEl = document.getElementById('cartoon-mascot');
        if (mascotEl && mascotEl.classList.contains('covering-eyes')) return;

        const pupilLeft = document.getElementById('mascot-pupil-left');
        const pupilRight = document.getElementById('mascot-pupil-right');
        if (!pupilLeft || !pupilRight) return;

        // Compute exact relative tracking center point vectors for each eye structure ring
        // Using Left Eye default position absolute center mapping vector coords: (x:75, y:120)
        this.calculateEyeGazeTransform(this.lastMousePos.x, this.lastMousePos.y, pupilLeft, 75, 120);
        this.calculateEyeGazeTransform(this.lastMousePos.x, this.lastMousePos.y, pupilRight, 125, 120);
    }

    // --- RENDER LOGIC (Using HTML <template> tags) ---
    renderListings() {
        const grid = document.getElementById('listings-target-grid');
        const spinner = document.getElementById('loading-spinner');
        if (!grid) return;
        
        grid.innerHTML = "";
        if (spinner) spinner.classList.remove('hidden'); // Show loading simulation

        setTimeout(() => {
            if (spinner) spinner.classList.add('hidden');

            const fCampus = document.getElementById('f-campus')?.value || 'all';
            const fType = document.getElementById('f-type')?.value || 'all';
            const fBudget = document.getElementById('f-budget')?.value;
            const fWifi = document.getElementById('f-wifi')?.checked;

            const filtered = this.getDB().filter(item => {
                if (fCampus !== 'all' && item.campus !== fCampus) return false;
                if (fType !== 'all' && item.type !== fType) return false;
                if (fBudget && item.price > parseInt(fBudget)) return false;
                if (fWifi && !item.amenities.some(a => a.toLowerCase().includes('wi-fi'))) return false;
                return true;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--gray);">No verified units match your criteria.</p>`;
                return;
            }

            const template = document.getElementById('tmpl-property-card');
            if (!template) return;

            filtered.forEach((item, index) => {
                // Clone the template purely
                const clone = template.content.cloneNode(true);
                const card = clone.querySelector('.card');
                
                // Add cascade animation delay
                card.style.animation = `slideUp 0.4s ease forwards ${index * 0.1}s`;
                card.style.opacity = '0';

                if (item.verified) clone.querySelector('.verified-badge').classList.remove('hidden');
                
                clone.querySelector('.card-price').innerText = `KES ${item.price.toLocaleString()}`;
                clone.querySelector('.card-title').innerText = item.title;
                clone.querySelector('.card-meta').innerText = `${item.type} • ${item.distance} from ${item.campus.toUpperCase()}`;
                
                const amContainer = clone.querySelector('.card-amenities');
                item.amenities.slice(0, 3).forEach(am => {
                    const span = document.createElement('span');
                    span.className = 'amenity-tag';
                    span.innerText = am;
                    amContainer.appendChild(span);
                });

                // Attach click event for detail view
                card.addEventListener('click', () => this.loadDetailView(item.id));
                grid.appendChild(clone);
            });
        }, 400); // 400ms artificial loading delay for interactivity
    }

    loadDetailView(id) {
        const prop = this.getDB().find(p => p.id === id);
        if (!prop) return;
        this.activePropertyId = id;

        // Inject data into existing DOM nodes
        const title = document.getElementById('detail-title');
        const price = document.getElementById('detail-price');
        const type = document.getElementById('detail-type');
        const dist = document.getElementById('detail-distance');
        const landlord = document.getElementById('detail-landlord');
        
        if (title) title.innerText = prop.title;
        if (price) price.innerText = `KES ${prop.price.toLocaleString()} / month`;
        if (type) type.innerText = prop.type;
        if (dist) dist.innerText = `${prop.distance} from ${prop.campus.toUpperCase()}`;
        if (landlord) landlord.innerText = prop.landlord;

        const amContainer = document.getElementById('detail-amenities');
        if (amContainer) {
            amContainer.innerHTML = "";
            prop.amenities.forEach(am => {
                const span = document.createElement('span');
                span.className = 'amenity-tag';
                span.innerText = am;
                amContainer.appendChild(span);
            });
        }

        this.renderReviews(prop.reviews);
        this.switchView('view-detail');
    }

    renderReviews(reviews) {
        const container = document.getElementById('reviews-list-container');
        if (!container) return;
        container.innerHTML = "";
        
        if (reviews.length === 0) {
            container.innerHTML = '<p style="color:var(--gray)">No peer validation records compiled yet.</p>';
            return;
        }

        const template = document.getElementById('tmpl-review');
        if (!template) return;
        reviews.forEach(r => {
            const clone = template.content.cloneNode(true);
            clone.querySelector('.review-author').innerText = r.student;
            clone.querySelector('.review-stars').innerText = '★'.repeat(r.rating);
            clone.querySelector('.review-text').innerText = `"${r.comment}"`;
            container.appendChild(clone);
        });
    }

    // --- ACTIONS ---
    handleLandlordSubmit(e) {
        e.preventDefault();
        const amString = document.getElementById('p-amenities').value;
        const newListing = {
            id: 'prop-' + Date.now(),
            title: document.getElementById('p-title').value,
            campus: document.getElementById('p-campus').value,
            type: document.getElementById('p-type').value,
            price: parseInt(document.getElementById('p-price').value),
            distance: document.getElementById('p-dist').value,
            landlord: document.getElementById('p-landlord').value,
            contact: document.getElementById('p-contact').value,
            verified: true,
            amenities: amString ? amString.split(',').map(s => s.trim()) : [],
            reviews: []
        };

        const db = this.getDB();
        db.push(newListing);
        this.saveDB(db);

        this.showToast("Verified Unit Registered Successfully!");
        e.target.reset();
        this.switchView('view-listings');
    }

    handleReviewSubmit() {
        const student = document.getElementById('rev-name').value || "Anonymous";
        const rating = parseInt(document.getElementById('rev-rating').value);
        const comment = document.getElementById('rev-comment').value;

        if (!comment) return alert("Please provide a comment.");

        const db = this.getDB();
        const index = db.findIndex(p => p.id === this.activePropertyId);
        if (index > -1) {
            db[index].reviews.push({ student, rating, comment });
            this.saveDB(db);
            this.renderReviews(db[index].reviews);
            document.getElementById('rev-comment').value = '';
            this.showToast("Review published!");
        }
    }

    handleMpesaPush() {
        const phone = document.getElementById('booking-phone').value;
        if (phone.length < 10) return alert("Enter valid Safaricom number.");
        
        const btn = document.getElementById('btn-book-room');
        btn.innerText = "Requesting...";
        btn.style.opacity = "0.7";

        setTimeout(() => {
            btn.innerText = "Initiate Booking";
            btn.style.opacity = "1";
            alert(`[M-Pesa STK Push Simulation]\nCheck your phone (${phone}) to enter your PIN.`);
            this.showToast("M-Pesa prompt sent successfully.");
        }, 1500);
    }

    showToast(msg) {
        const t = document.getElementById('toast-notification');
        if (!t) return;
        t.innerText = msg;
        t.classList.remove('hidden');
        setTimeout(() => t.classList.add('hidden'), 3000);
    }

    calculateEyeGazeTransform(mouseX, mouseY, pupilElement, eyeCenterXOffset, eyeCenterYOffset) {
        const rect = pupilElement.ownerSVGElement.getBoundingClientRect();
        const absoluteEyeX = rect.left + (rect.width * (eyeCenterXOffset / 200));
        const absoluteEyeY = rect.top + (rect.height * (eyeCenterYOffset / 220));

        const deltaX = mouseX - absoluteEyeX;
        const deltaY = mouseY - absoluteEyeY;
        const angle = Math.atan2(deltaY, deltaX);

        const maxRadiusLimit = 5; 
        const moveX = Math.cos(angle) * maxRadiusLimit;
        const moveY = Math.sin(angle) * maxRadiusLimit;

        pupilElement.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
}

// Initialize System
document.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();

    const splash = document.getElementById('splash-screen');
    
    setTimeout(() => {
        if (splash) splash.classList.add('app-loaded');
        
        const homeHero = document.querySelector('.hero-section');
        if(homeHero) {
            homeHero.style.animation = 'none';
            homeHero.offsetHeight; /* Trigger reflow hack */
            homeHero.style.animation = 'fadeIn 0.6s ease forwards';
        }

        const params = new URLSearchParams(window.location.search);
        const view = params.get('view') || 'view-auth'; 
        window.appController.switchView(view);
    }, 2400);
});
