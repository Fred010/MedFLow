// MedFlow Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // Form validation enhancements
    const forms = document.querySelectorAll('.needs-validation');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Password strength checker
    const passwordInputs = document.querySelectorAll('input[type="password"][name="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

    // Loading states for buttons
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(button => {
        const form = button.closest('form');
        if (form) {
            form.addEventListener('submit', function() {
                if (form.checkValidity()) {
                    const originalText = button.innerHTML;
                    button.innerHTML = '<span class="spinner"></span> Processing...';
                    button.disabled = true;
                    
                    // Re-enable after 10 seconds (fallback)
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.disabled = false;
                    }, 10000);
                }
            });
        }
    });

    // Dynamic table sorting
    enableTableSorting();

    // Search functionality
    enableSearch();

    // Date picker enhancements
    enhanceDatePickers();

    // Time slot availability checker
    enhanceTimePickers();

    // Print functionality
    document.querySelectorAll('[data-action="print"]').forEach(button => {
        button.addEventListener('click', function() {
            window.print();
        });
    });

    // Copy to clipboard functionality
    document.querySelectorAll('[data-action="copy"]').forEach(button => {
        button.addEventListener('click', function() {
            const text = this.dataset.copy || this.textContent;
            copyToClipboard(text);
        });
    });

    // Confirm dangerous actions
    document.querySelectorAll('[data-confirm]').forEach(element => {
        element.addEventListener('click', function(e) {
            const message = this.dataset.confirm;
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
});

// Password strength checker
function checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('password-strength');
    if (!strengthIndicator) return;

    let strength = 0;
    const checks = [
        password.length >= 8,
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^a-zA-Z0-9]/.test(password)
    ];

    checks.forEach(check => {
        if (check) strength++;
    });

    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['#dc3545', '#fd7e14', '#ffc107', '#20c997', '#198754'][strength];

    strengthIndicator.textContent = strengthText;
    strengthIndicator.style.color = strengthColor;
    strengthIndicator.className = `form-text text-${strength === 0 ? 'danger' : strength === 1 ? 'warning' : strength === 2 ? 'info' : strength === 3 ? 'success' : 'primary'}`;
}

// Table sorting functionality
function enableTableSorting() {
    document.querySelectorAll('table[data-sortable]').forEach(table => {
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function() {
                const column = this.dataset.sort;
                const tbody = table.querySelector('tbody');
                const rows = Array.from(tbody.querySelectorAll('tr'));
                const isAscending = this.classList.contains('sort-asc');
                
                // Remove all sort classes
                headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
                
                // Add current sort class
                this.classList.add(isAscending ? 'sort-desc' : 'sort-asc');
                
                // Sort rows
                rows.sort((a, b) => {
                    const aText = a.children[column].textContent.trim();
                    const bText = b.children[column].textContent.trim();
                    
                    if (isAscending) {
                        return bText.localeCompare(aText);
                    } else {
                        return aText.localeCompare(bText);
                    }
                });
                
                // Reorder rows
                rows.forEach(row => tbody.appendChild(row));
            });
        });
    });
}

// Search functionality
function enableSearch() {
    document.querySelectorAll('[data-search]').forEach(input => {
        const targetSelector = input.dataset.search;
        const targets = document.querySelectorAll(targetSelector);
        
        input.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            targets.forEach(target => {
                const text = target.textContent.toLowerCase();
                const row = target.closest('tr') || target.closest('.card');
                
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
}

// Date picker enhancements
function enhanceDatePickers() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        input.min = today;
        
        // Disable weekends for medical appointments
        if (input.dataset.disableWeekends) {
            input.addEventListener('change', function() {
                const date = new Date(this.value);
                const day = date.getDay();
                
                if (day === 0 || day === 6) { // Sunday or Saturday
                    this.value = '';
                    alert('Appointments are not available on weekends. Please select a weekday.');
                }
            });
        }
    });
}

// Time picker enhancements
function enhanceTimePickers() {
    const timeInputs = document.querySelectorAll('input[type="time"]');
    timeInputs.forEach(input => {
        input.addEventListener('change', function() {
            const time = this.value;
            const [hours, minutes] = time.split(':').map(Number);
            
            // Check if time is within business hours (9 AM - 5 PM)
            if (hours < 9 || hours > 17 || (hours === 17 && minutes > 0)) {
                this.value = '';
                alert('Please select a time between 9:00 AM and 5:00 PM.');
            }
        });
    });
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!', 'success');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy text', 'error');
        }
        
        document.body.removeChild(textArea);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        const alert = new bootstrap.Alert(notification);
        alert.close();
    }, 5000);
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export functions for use in other scripts
window.MedFlow = {
    formatCurrency,
    formatDate,
    formatTime,
    debounce,
    showNotification,
    copyToClipboard
};