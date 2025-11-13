// Admin Panel Main JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.data = {
            payments: [],
            projects: [],
            artists: [],
            tracks: [],
            savings: [],
            activities: [],
            notifications: []
        };
        
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadSampleData();
        this.showSection('dashboard');
        this.renderDashboard();
        this.loadNotifications();
    }

    checkAuth() {
        // This would normally check with adminAuth, but for simplicity:
        const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        if (!token && !window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item[data-target]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('data-target');
                this.showSection(target);
            });
        });

        // Mobile navigation toggle
        const navToggle = document.getElementById('navToggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                document.querySelector('.nav-content').classList.toggle('active');
            });
        }

        // Notifications
        const notificationsBtn = document.getElementById('notificationsBtn');
        const closeNotifications = document.getElementById('closeNotifications');
        const notificationsPanel = document.getElementById('notificationsPanel');

        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                notificationsPanel.classList.add('active');
            });
        }

        if (closeNotifications) {
            closeNotifications.addEventListener('click', () => {
                notificationsPanel.classList.remove('active');
            });
        }

        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }

        // Payment management
        document.getElementById('applyPaymentFilters')?.addEventListener('click', () => {
            this.filterPayments();
        });

        document.getElementById('exportPayments')?.addEventListener('click', () => {
            this.exportPayments();
        });

        document.getElementById('refreshPayments')?.addEventListener('click', () => {
            this.loadPayments();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLogout();
        });

        // Close notifications panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notifications-panel') && 
                !e.target.closest('#notificationsBtn') &&
                notificationsPanel.classList.contains('active')) {
                notificationsPanel.classList.remove('active');
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.showSection('dashboard');
                        break;
                    case '2':
                        e.preventDefault();
                        this.showSection('payments');
                        break;
                    case '3':
                        e.preventDefault();
                        this.showSection('artists');
                        break;
                    case 'l':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.handleLogout();
                        }
                        break;
                    case 'k':
                        e.preventDefault();
                        document.querySelector('.search-box input').focus();
                        break;
                }
            }
        });
    }

    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-target="${sectionId}"]`)?.classList.add('active');

        // Update sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId)?.classList.add('active');

        // Update page title
        this.updatePageTitle(sectionId);

        // Load section data
        this.currentSection = sectionId;
        this.loadSectionData(sectionId);
    }

    updatePageTitle(sectionId) {
        const titles = {
            dashboard: 'Dashboard',
            payments: 'Payment Management',
            artists: 'Artist Management',
            tracks: 'Track Management',
            projects: 'Project Management',
            savings: 'Savings Goals',
            reports: 'Reports & Analytics',
            settings: 'Settings'
        };

        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');

        if (pageTitle) {
            pageTitle.textContent = titles[sectionId] || 'Admin Panel';
        }

        if (pageSubtitle) {
            const subtitles = {
                dashboard: 'Welcome to your admin dashboard',
                payments: 'Manage and track all payments',
                artists: 'Manage artist profiles and content',
                tracks: 'Manage music tracks and releases',
                projects: 'Track ongoing projects and progress',
                savings: 'Monitor client savings goals',
                reports: 'View analytics and reports',
                settings: 'Configure studio settings'
            };
            pageSubtitle.textContent = subtitles[sectionId] || 'Manage your studio operations';
        }
    }

    loadSectionData(sectionId) {
        this.showLoading();

        // Simulate API call delay
        setTimeout(() => {
            switch(sectionId) {
                case 'dashboard':
                    this.renderDashboard();
                    break;
                case 'payments':
                    this.loadPayments();
                    break;
                case 'projects':
                    this.loadProjects();
                    break;
                case 'artists':
                    this.loadArtists();
                    break;
                case 'tracks':
                    this.loadTracks();
                    break;
                case 'savings':
                    this.loadSavings();
                    break;
                case 'reports':
                    this.loadReports();
                    break;
                case 'settings':
                    this.loadSettings();
                    break;
            }
            this.hideLoading();
        }, 500);
    }

    loadSampleData() {
        // Sample data - in a real app, this would come from an API
        this.data = {
            payments: [
                {
                    id: 'TX001',
                    artist: 'Alex Nova',
                    amount: 1800000,
                    service: 'Music Production',
                    date: '2025-03-15',
                    status: 'completed'
                },
                {
                    id: 'TX002',
                    artist: 'Luna Sky',
                    amount: 900000,
                    service: 'Mixing & Mastering',
                    date: '2025-03-14',
                    status: 'pending'
                },
                {
                    id: 'TX003',
                    artist: 'Marcus Sound',
                    amount: 540000,
                    service: 'Vocal Production',
                    date: '2025-03-13',
                    status: 'completed'
                }
            ],
            projects: [
                {
                    id: 'P001',
                    name: 'Midnight Echo Album',
                    artist: 'Alex Nova',
                    service: 'Full Production',
                    budget: 5000000,
                    progress: 75,
                    deadline: '2025-04-15',
                    status: 'active'
                }
            ],
            artists: [
                {
                    id: 'A001',
                    name: 'Alex Nova',
                    genre: 'Electronic',
                    tracks: 12,
                    since: '2020',
                    status: 'active'
                }
            ],
            tracks: [
                {
                    id: 'T001',
                    title: 'Midnight Echo',
                    artist: 'Alex Nova',
                    genre: 'Electronic',
                    year: '2024',
                    streams: 125000
                }
            ],
            activities: [
                {
                    type: 'payment',
                    message: 'Payment received from Alex Nova - UGX 1,800,000',
                    time: '2 hours ago'
                },
                {
                    type: 'project',
                    message: 'Project "Electric Dreams" completed',
                    time: '1 day ago'
                },
                {
                    type: 'artist',
                    message: 'New artist registration: Sofia Beats',
                    time: '2 days ago'
                }
            ],
            notifications: [
                {
                    id: 'N001',
                    type: 'payment',
                    title: 'New Payment Received',
                    message: 'Alex Nova just paid UGX 1,800,000 for music production',
                    time: '2 hours ago',
                    read: false
                },
                {
                    id: 'N002',
                    type: 'project',
                    title: 'Project Deadline Approaching',
                    message: 'Midnight Echo Album deadline is in 30 days',
                    time: '5 hours ago',
                    read: false
                },
                {
                    id: 'N003',
                    type: 'system',
                    title: 'System Update Available',
                    message: 'New admin panel update is ready to install',
                    time: '1 day ago',
                    read: true
                }
            ]
        };
    }

    renderDashboard() {
        // Update stats
        const totalRevenue = this.data.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, payment) => sum + payment.amount, 0);
        
        // Render activity
        this.renderActivity();
        
        // Render charts
        this.renderCharts();
    }

    renderActivity() {
        const activityList = document.getElementById('activityList');
        if (activityList) {
            activityList.innerHTML = this.data.activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activity.message}</p>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    renderCharts() {
        // In a real implementation, you would use Chart.js or similar
        console.log('Charts would be rendered here');
    }

    loadPayments() {
        const table = document.getElementById('paymentsTable');
        if (table) {
            table.innerHTML = this.data.payments.map(payment => `
                <tr>
                    <td>${payment.id}</td>
                    <td>${payment.artist}</td>
                    <td>UGX ${this.formatNumber(payment.amount)}</td>
                    <td>${payment.service}</td>
                    <td>${payment.date}</td>
                    <td><span class="status-badge status-${payment.status}">${payment.status}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="adminPanel.viewPayment('${payment.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="adminPanel.editPayment('${payment.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    }

    filterPayments() {
        // Implementation for filtering payments
        console.log('Filtering payments...');
    }

    exportPayments() {
        // Implementation for exporting payments
        const csvContent = "data:text/csv;charset=utf-8," 
            + ["ID,Artist,Amount,Service,Date,Status"]
            .concat(this.data.payments.map(p => 
                `${p.id},${p.artist},${p.amount},${p.service},${p.date},${p.status}`
            ))
            .join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "payments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    loadNotifications() {
        const notificationsList = document.querySelector('.notifications-list');
        if (notificationsList) {
            notificationsList.innerHTML = this.data.notifications.map(notification => `
                <div class="activity-item ${notification.read ? 'read' : 'unread'}">
                    <div class="activity-icon">
                        <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <strong>${notification.title}</strong>
                        <p>${notification.message}</p>
                        <div class="activity-time">${notification.time}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    getActivityIcon(type) {
        const icons = {
            payment: 'money-bill-wave',
            project: 'project-diagram',
            artist: 'user-plus',
            track: 'music',
            system: 'cog'
        };
        return icons[type] || 'bell';
    }

    getNotificationIcon(type) {
        const icons = {
            payment: 'money-bill-wave',
            project: 'project-diagram',
            artist: 'user',
            track: 'music',
            system: 'cog',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'bell';
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    handleLogout() {
        // Clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminUser');
        
        // Redirect to login
        window.location.href = 'index.html';
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Additional methods for other sections would be implemented here
    loadProjects() { /* ... */ }
    loadArtists() { /* ... */ }
    loadTracks() { /* ... */ }
    loadSavings() { /* ... */ }
    loadReports() { /* ... */ }
    loadSettings() { /* ... */ }

    viewPayment(id) {
        const payment = this.data.payments.find(p => p.id === id);
        alert(`Viewing payment: ${payment.id}\nArtist: ${payment.artist}\nAmount: UGX ${this.formatNumber(payment.amount)}`);
    }

    editPayment(id) {
        const payment = this.data.payments.find(p => p.id === id);
        alert(`Editing payment: ${payment.id}`);
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel();

// Make available globally
window.adminPanel = adminPanel;