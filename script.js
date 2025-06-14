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
    initEmailProtection(); // Add this new initialization
    initProjectLoading(); // Add this new initialization
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
    
    // Check for system preference if no stored theme
    const getPreferredTheme = () => {
        // First check localStorage
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme;
        }
        
        // If no stored preference, check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    
    // Set initial theme based on preference
    const preferredTheme = getPreferredTheme();
    document.documentElement.setAttribute('data-theme', preferredTheme);
    
    // Watch for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only update if user hasn't set a manual preference
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    });
    
    // Theme toggle button click handler
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
    const loadMoreBtn = document.getElementById('load-more-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            let visibleCount = 0;
            
            // Reset all cards to normal state first (removing hidden class)
            projectCards.forEach(card => {
                card.classList.remove('hidden');
                card.style.display = 'block';
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
            });
            
            // Apply filtering
            projectCards.forEach((card, index) => {
                if (filterValue === 'all' || card.getAttribute('data-category').includes(filterValue)) {
                    visibleCount++;
                    // Show only first 4 filtered items initially
                    if (visibleCount <= 4) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'scale(1)';
                        }, 50 * visibleCount);
                    } else {
                        // Hide additional items
                        card.classList.add('hidden');
                    }
                } else {
                    // Hide non-matching items
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
            
            // Show or hide load more button based on filtered results
            if (visibleCount > 4) {
                loadMoreBtn.style.display = 'inline-block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
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
        'login-screen': {
            title: 'Interactive Login Screen',
            images: ['images/projects/login.gif'],
            description: `
                <p>A modern and interactive login screen with smooth animations and visual feedback. Features include:</p>
                <ul>
                    <li>Floating background shapes for visual interest</li>
                    <li>Animated form inputs with validation feedback</li>
                    <li>Loading animation when submitting credentials</li>
                    <li>Social login options with clean icon integration</li>
                    <li>Subtle rotation effect that follows cursor movement</li>
                </ul>
                <p>Built with HTML5, CSS3, and JavaScript to create an engaging user experience for authentication flows.</p>
            `,
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'Animation', 'Responsive Design'],
            link: 'Projects/Login screen/index.html',
            localPath: 'Projects/Login screen'
        },
        'dice-roller': {
            title: 'Satisfying Digital Dice Roller',
            images: ['images/projects/roll-anim.webp'],
            description: `
                <p>This 3D dice rolling simulator creates a realistic and satisfying experience for tabletop gamers.</p>

                <p>Built with JavaScript and Three.js, this tool demonstrates my ability to create interactive 3D web applications.</p>
            `,
            technologies: ['JavaScript', 'Three.js', 'CSS3', 'HTML5', 'Physics Engine'],
            link: 'Projects/D20/index.html',
            localPath: 'Projects/D20'
        },
        'tarot': {
            title: 'Tarot Card Picker',
            images: ['images/projects/flip-anim.webp'],
            description: `
                <p>An interactive tarot card experience that lets users draw cards with beautiful animations.</p>
                <p>This project combines CSS animations with JavaScript logic to create a fluid, engaging user experience.</p>
            `,
            technologies: ['HTML5', 'CSS3', 'JavaScript', 'Animation', 'Web Storage API'],
            link: 'Projects/Tarot/tarot-webapp/src/cardflip.html',
            localPath: 'Projects/Tarot'
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

// Email protection functionality
function initEmailProtection() {
    const showEmailBtn = document.getElementById('show-email');
    const emailContainer = document.getElementById('email-address');
    
    if (showEmailBtn && emailContainer) {
        // Encode the email address to make it harder for bots to scrape
        const encodedEmail = "jhitchcock687" + String.fromCharCode(64) + "gmail" + String.fromCharCode(46) + "com";
        
        showEmailBtn.addEventListener('click', function() {
            // Display the email only when clicked
            emailContainer.textContent = encodedEmail;
            emailContainer.classList.add('visible');
            
            // Create a mailto link
            const emailLink = document.createElement('a');
            emailLink.href = `mailto:${encodedEmail}`;
            emailLink.textContent = encodedEmail;
            
            // Replace the text with the link
            emailContainer.textContent = '';
            emailContainer.appendChild(emailLink);
            
            // Hide the button as it's no longer needed
            showEmailBtn.style.display = 'none';
        });
    }
}

// Initialize project loading functionality
function initProjectLoading() {
    const projectCards = document.querySelectorAll('.project-card');
    const loadMoreBtn = document.getElementById('load-more-btn');
    const initialVisibleCount = 4; // Show only 4 projects initially
    let visibleCount = initialVisibleCount;
    
    // Hide projects beyond the initial count
    if (projectCards.length > initialVisibleCount) {
        for (let i = initialVisibleCount; i < projectCards.length; i++) {
            projectCards[i].classList.add('hidden');
        }
        
        // Show load more button
        loadMoreBtn.style.display = 'inline-block';
    } else {
        // Hide button if not enough projects
        loadMoreBtn.style.display = 'none';
    }
    
    // Load more button click handler
    loadMoreBtn.addEventListener('click', function() {
        // Show next batch of projects (4 more)
        const batchSize = 4;
        const maxVisible = Math.min(visibleCount + batchSize, projectCards.length);
        
        for (let i = visibleCount; i < maxVisible; i++) {
            projectCards[i].classList.remove('hidden');
            
            // Trigger animation with slight delay for each card
            setTimeout(() => {
                projectCards[i].style.opacity = '1';
                projectCards[i].style.transform = 'translateY(0)';
            }, 100 * (i - visibleCount));
        }
        
        visibleCount = maxVisible;
        
        // Hide button if all projects are visible
        if (visibleCount >= projectCards.length) {
            loadMoreBtn.style.display = 'none';
        }
    });
}
