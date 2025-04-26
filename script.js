// DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initThemeToggle();
    initSkillBars();
    initProjectFilters();
    initModalFunctionality();
    initContactForm();
    initScrollAnimations();
    initAllProjectsModal(); // Add this new initialization
});

// All Projects modal functionality
function initAllProjectsModal() {
    const showAllProjectsBtn = document.getElementById('showAllProjects');
    const allProjectsModal = document.getElementById('all-projects-modal');
    const closeAllProjectsModal = allProjectsModal.querySelector('.close-modal');
    
    if (showAllProjectsBtn) {
        showAllProjectsBtn.addEventListener('click', function() {
            allProjectsModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
        });
    }
    
    if (closeAllProjectsModal) {
        closeAllProjectsModal.addEventListener('click', function() {
            allProjectsModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
    }
    
    // Close when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === allProjectsModal) {
            allProjectsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Handle navigation functionality
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            // Toggle icon between bars and close
            this.querySelector('i').classList.toggle('fa-bars');
            this.querySelector('i').classList.toggle('fa-times');
        });
    }

    // Close mobile menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                menuToggle.querySelector('i').classList.add('fa-bars');
                menuToggle.querySelector('i').classList.remove('fa-times');
            }
        });
    });

    // Highlight active section in navigation based on scroll position
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.section-container');
        let current = '';

        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = '#' + section.getAttribute('id');
            }
        });

        navItems.forEach((item) => {
            item.classList.remove('active');
            if (item.getAttribute('href') === current) {
                item.classList.add('active');
            }
        });
    });
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    const storedTheme = localStorage.getItem('theme') || 'light';
    
    // Set initial theme from localStorage
    document.documentElement.setAttribute('data-theme', storedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Initialize skill bars animation
function initSkillBars() {
    const skillLevels = document.querySelectorAll('.skill-level');
    
    // Set skill levels width based on data-level attribute
    function animateSkills() {
        skillLevels.forEach(skill => {
            const level = skill.getAttribute('data-level');
            setTimeout(() => {
                skill.style.width = `${level}%`;
            }, 300);
        });
    }

    // Use Intersection Observer to trigger animation when in viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkills();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const skillsSection = document.querySelector('.skills');
    if (skillsSection) {
        observer.observe(skillsSection);
    }
}

// Project filtering functionality
function initProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    if (card.getAttribute('data-category').includes(filterValue)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                }
            });
        });
    });
}

// Project modal functionality
function initModalFunctionality() {
    const viewButtons = document.querySelectorAll('.view-project-btn');
    const modal = document.getElementById('project-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalContent = document.getElementById('modal-content-container');
    
    // Project data for modals
    const projectData = {
        'personal-site': {
            title: 'Personal Website',
            images: ['images/projects/webpage.png'],
            description: `
                <p>My personal website showcases who I am beyond just my professional skills. It includes:</p>
                <ul>
                    <li>Interactive portfolio of personal projects</li>
                    <li>Blog where I share my thoughts on technology and game development</li>
                    <li>Custom animations and transitions for a modern feel</li>
                    <li>Responsive design for all devices</li>
                </ul>
                <p>Built with HTML5, CSS3, and JavaScript, this site demonstrates my front-end development abilities.</p>
            `,
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
            link: '../Personal Site/index.html',
            localPath: '../Personal Site'
        },
        'dice-roller': {
            title: 'Satisfying Digital Dice Roller',
            images: ['images/projects/roll-anim.webp'],
            description: `
                <p>This 3D dice rolling simulator creates a realistic and satisfying experience for tabletop gamers.</p>
                <ul>
                    <li>3D rendered dice with realistic physics</li>
                    <li>Multiple dice types (d4, d6, d8, d10, d12, d20, d100)</li>
                    <li>Customizable dice appearances and themes</li>
                    <li>Sound effects for enhanced immersion</li>
                    <li>Ability to roll multiple dice simultaneously</li>
                </ul>
                <p>Built with JavaScript and Three.js, this tool demonstrates my ability to create interactive 3D web applications.</p>
            `,
            technologies: ['JavaScript', 'Three.js', 'CSS3', 'HTML5', 'Physics Engine'],
            link: '../D20/index.html',
            localPath: '../D20'
        },
        'tarot': {
            title: 'Tarot Card Picker',
            images: ['images/projects/flip-anim.webp'],
            description: `
                <p>An interactive tarot card experience that lets users draw cards with beautiful animations.</p>
                <ul>
                    <li>Complete 78-card deck with custom illustrations</li>
                    <li>Card flip animations and meaningful transitions</li>
                    <li>Detailed interpretations for each card</li>
                    <li>Support for different reading layouts (3-card spread, Celtic Cross, etc.)</li>
                    <li>Save and share your readings</li>
                </ul>
                <p>This project combines CSS animations with JavaScript logic to create a fluid, engaging user experience.</p>
            `,
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'Animation', 'Web Storage API'],
            link: '../Tarot/tarot-webapp/src/cardflip.html',
            localPath: '../Tarot'
        }
    };
    
    // Open modal with project details
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            const project = projectData[projectId];
            
            if (project) {
                // Build modal content
                let modalHTML = `
                    <h2>${project.title}</h2>
                    <div class="modal-gallery">
                        ${project.images.map(img => `<img src="${img}" alt="${project.title}">`).join('')}
                    </div>
                    <div class="modal-description">
                        ${project.description}
                    </div>
                    <div class="modal-technologies">
                        <h3>Technologies Used</h3>
                        <div class="tech-tags">
                            ${project.technologies.map(tech => `<span>${tech}</span>`).join('')}
                        </div>
                    </div>
                    <div class="modal-link">
                        <a href="${project.link}" target="_blank" class="view-project-btn">Visit Project</a>
                    </div>
                `;
                
                modalContent.innerHTML = modalHTML;
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevent scrolling behind modal
            }
        });
    });
    
    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        });
    }
    
    // Also close when clicking outside the modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Form validation and submission
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Reset previous errors
            document.querySelectorAll('.form-error').forEach(el => {
                el.textContent = '';
            });
            
            let isValid = true;
            
            // Validate name (minimum 2 characters)
            const nameInput = document.getElementById('name');
            if (nameInput.value.trim().length < 2) {
                document.querySelector('label[for="name"] + .form-error').textContent = 'Name must be at least 2 characters';
                isValid = false;
            }
            
            // Validate email
            const emailInput = document.getElementById('email');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                document.querySelector('label[for="email"] + .form-error').textContent = 'Please enter a valid email address';
                isValid = false;
            }
            
            // Validate message (minimum 10 characters)
            const messageInput = document.getElementById('message');
            if (messageInput.value.trim().length < 10) {
                document.querySelector('label[for="message"] + .form-error').textContent = 'Message must be at least 10 characters';
                isValid = false;
            }
            
            // If form is valid, show success message
            if (isValid) {
                contactForm.classList.add('hidden');
                formSuccess.classList.remove('hidden');
                
                // Reset form after 5 seconds
                setTimeout(() => {
                    contactForm.reset();
                    contactForm.classList.remove('hidden');
                    formSuccess.classList.add('hidden');
                }, 5000);
            }
        });
        
        // Real-time validation for better UX
        const formInputs = contactForm.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('invalid')) {
                    validateInput(this);
                }
            });
        });
        
        function validateInput(input) {
            const errorElement = input.nextElementSibling.nextElementSibling;
            
            switch (input.id) {
                case 'name':
                    if (input.value.trim().length < 2) {
                        errorElement.textContent = 'Name must be at least 2 characters';
                        input.classList.add('invalid');
                    } else {
                        errorElement.textContent = '';
                        input.classList.remove('invalid');
                    }
                    break;
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(input.value)) {
                        errorElement.textContent = 'Please enter a valid email address';
                        input.classList.add('invalid');
                    } else {
                        errorElement.textContent = '';
                        input.classList.remove('invalid');
                    }
                    break;
                case 'message':
                    if (input.value.trim().length < 10) {
                        errorElement.textContent = 'Message must be at least 10 characters';
                        input.classList.add('invalid');
                    } else {
                        errorElement.textContent = '';
                        input.classList.remove('invalid');
                    }
                    break;
            }
        }
    }
}

// Scroll animations
function initScrollAnimations() {
    const sections = document.querySelectorAll('.section-container');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Back to top button visibility
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                backToTop.style.opacity = '1';
            } else {
                backToTop.style.opacity = '0';
            }
        });
    }
}
