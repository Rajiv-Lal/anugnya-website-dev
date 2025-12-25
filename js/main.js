/* ============================================
   ANUGNYA HOLISTIC CARE - SHARED JAVASCRIPT
   Version: 2.0 Multi-page
   ============================================ */

// ==================================================
// CONFIGURATION
// ==================================================

const CONFIG = {
    whatsappNumber: '918106248800',
    whatsappMessage: 'Hi, I found you online and would like to know more about your cancer support services.',
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwqQsPq-7yDEww-D14LCb1g4k-vOauWjfLVLllQdSRVFweiQqM4EI3Nam2ew97Wsdf5/exec',
    calendlyUrl: 'https://calendly.com/anugnyaholisticcare/welcome'
};

// ==================================================
// MOBILE NAVIGATION
// ==================================================

function toggleMobileNav() {
    const nav = document.getElementById('mainNav');
    if (nav) {
        nav.classList.toggle('active');
    }
}

function closeMobileNav() {
    const nav = document.getElementById('mainNav');
    if (nav) {
        nav.classList.remove('active');
    }
}

// Close mobile nav when clicking outside
document.addEventListener('click', function(event) {
    const nav = document.getElementById('mainNav');
    const toggle = document.querySelector('.nav-toggle');
    
    if (nav && toggle) {
        if (!nav.contains(event.target) && !toggle.contains(event.target)) {
            nav.classList.remove('active');
        }
    }
});

// ==================================================
// BOOKING MODAL
// ==================================================

function openBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetBookingFlow();
    }
}

// Close modal when clicking overlay
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        // Check which modal was clicked and close it
        if (event.target.id === 'videoModal') {
            closeVideoModal();
        } else {
            closeBookingModal();
        }
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeBookingModal();
        closeVideoModal();
    }
});

// ==================================================
// BOOKING FLOW
// ==================================================

let currentBookingStep = 'selection';
let bookingData = {};

function selectCustomerType(type) {
    bookingData.customerType = type;
    
    // Hide selection, show appropriate form
    hideAllBookingSteps();
    
    if (type === 'treatment') {
        showBookingStep('treatment-assessment');
    } else if (type === 'recovery') {
        showBookingStep('recovery-assessment');
    } else if (type === 'caregiver') {
        showBookingStep('caregiver-assessment');
    }
}

function showBookingStep(stepId) {
    const step = document.getElementById(stepId);
    if (step) {
        step.classList.add('active');
        currentBookingStep = stepId;
    }
}

function hideAllBookingSteps() {
    document.querySelectorAll('.booking-step').forEach(step => {
        step.classList.remove('active');
    });
}

function resetBookingFlow() {
    hideAllBookingSteps();
    const selection = document.getElementById('customer-selection');
    if (selection) {
        selection.classList.add('active');
    }
    currentBookingStep = 'selection';
    bookingData = {};
    
    // Reset all forms
    document.querySelectorAll('.modal form').forEach(form => form.reset());
}

function goBackToSelection() {
    resetBookingFlow();
}

// Treatment path functions
function showTreatmentPausedForm() {
    hideAllBookingSteps();
    showBookingStep('treatment-paused-form');
}

function showActiveTreatmentForm() {
    hideAllBookingSteps();
    showBookingStep('active-treatment-form');
}

function backToTreatmentAssessment() {
    hideAllBookingSteps();
    showBookingStep('treatment-assessment');
}

// ==================================================
// CALENDLY INTEGRATION
// ==================================================

function openCalendly(prefillData = {}) {
    if (typeof Calendly !== 'undefined') {
        Calendly.initPopupWidget({
            url: CONFIG.calendlyUrl,
            prefill: prefillData,
            utm: {}
        });
    } else {
        // Fallback: open Calendly in new tab
        window.open(CONFIG.calendlyUrl, '_blank');
    }
    return false;
}

async function submitBookingWithCalendly(event, pathType) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    // Convert FormData to object
    const allData = {};
    for (let [key, value] of formData.entries()) {
        if (key === 'symptoms') {
            if (!allData.symptoms) allData.symptoms = [];
            allData.symptoms.push(value);
        } else {
            allData[key] = value;
        }
    }
    
    // Send to Google Sheets
    await sendToGoogleSheets(allData, pathType);
    
    // Prepare Calendly prefill data
    const prefillData = {
        name: formData.get('name') || '',
        email: formData.get('email') || '',
        customAnswers: { a1: pathType }
    };
    
    // Close modal and open Calendly
    closeBookingModal();
    openCalendly(prefillData);
}

// ==================================================
// GOOGLE SHEETS INTEGRATION
// ==================================================

async function sendToGoogleSheets(formData, formType) {
    try {
        const response = await fetch(CONFIG.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formData,
                formType: formType,
                timestamp: new Date().toISOString()
            })
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

// Contact form handler
async function handleContactSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const allData = {};
    for (let [key, value] of formData.entries()) {
        allData[key] = value;
    }
    
    const result = await sendToGoogleSheets(allData, 'contact');
    
    if (result.success) {
        alert('Thank you for contacting us! We will respond within 24 hours.');
        form.reset();
    } else {
        alert('There was an error submitting your message. Please try again or contact us directly at care@anugnyaholisticcare.com');
    }
}

// ==================================================
// FAQ ACCORDION
// ==================================================

function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                // Close other items (optional - remove for multi-open)
                faqItems.forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

// ==================================================
// VIDEO MODAL (for Guides page)
// ==================================================

function openVideoModal(videoUrl, title) {
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('videoModalTitle');
    const videoContainer = document.getElementById('videoContainer');
    
    if (modal && videoContainer) {
        // Extract YouTube video ID
        const videoId = extractYouTubeId(videoUrl);
        
        if (videoId) {
            videoContainer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        }
        
        if (modalTitle) {
            modalTitle.textContent = title;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const videoContainer = document.getElementById('videoContainer');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Stop video by clearing container
        if (videoContainer) {
            videoContainer.innerHTML = '';
        }
    }
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// ==================================================
// SERVICE DETAILS (for Services page)
// ==================================================

function showServiceDetail(serviceId) {
    // Hide all service details
    document.querySelectorAll('.service-details').forEach(detail => {
        detail.classList.remove('active');
    });
    
    // Show selected service detail
    const detail = document.getElementById(`service-${serviceId}`);
    if (detail) {
        detail.classList.add('active');
        
        // Scroll to detail
        setTimeout(() => {
            detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

function closeServiceDetail() {
    document.querySelectorAll('.service-details').forEach(detail => {
        detail.classList.remove('active');
    });
}

// ==================================================
// WHATSAPP
// ==================================================

function openWhatsApp(customMessage = null) {
    const message = customMessage || CONFIG.whatsappMessage;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedMessage}`;
    window.open(url, '_blank');
}

// ==================================================
// RESOURCES LOADING - REMOVED
// ==================================================
// Note: guides.html now uses hardcoded content for better SEO.
// JSON loading removed in v2.1 refactor.

// ==================================================
// INITIALIZATION
// ==================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize FAQ accordion if on FAQ page
    if (document.querySelector('.faq-container')) {
        initFaqAccordion();
    }
    
    // Set active nav link based on current page
    setActiveNavLink();
});

function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// ==================================================
// SUPPORT GROUP (for FAQ page CTAs)
// ==================================================

function joinSupportGroup() {
    // Open WhatsApp with support group message
    const message = 'Hi, I would like to join the Cancer Support Group.';
    openWhatsApp(message);
}
