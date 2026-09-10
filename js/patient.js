// ===== PATIENT DASHBOARD =====
const API_URL = 'http://localhost:5000/api';

// ===== Check Authentication =====
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        alert('Please login to access your dashboard');
        window.location.href = '../../index.html';
        return null;
    }
    
    const userData = JSON.parse(user);
    if (userData.role !== 'patient') {
        alert('Access denied. Patient account required.');
        window.location.href = '../../index.html';
        return null;
    }
    
    return { token, user: userData };
}

// ===== Logout =====
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        window.location.href = '../../index.html';
    }
}

// ===== Load Patient Dashboard =====
async function loadDashboard() {
    const auth = checkAuth();
    if (!auth) return;
    
    const { token, user } = auth;
    
    // Update UI with user name
    document.getElementById('patientName').textContent = user.full_name;
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.full_name.split(' ')[0]}! 👋`;
    document.getElementById('profileImage').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=0a6b8a&color=fff`;
    
    try {
        const response = await fetch(`${API_URL}/patient/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            populateDashboard(data.data);
        } else {
            console.error('Failed to load dashboard:', data.message);
        }
    } catch (error) {
        console.error('Dashboard Error:', error);
        // Load demo data if backend is unavailable
        loadDemoData();
    }
}

// ===== Populate Dashboard =====
function populateDashboard(data) {
    const { patient, stats, bookings } = data;
    
    // Update stats
    document.getElementById('activeBookings').textContent = stats.active;
    document.getElementById('completedBookings').textContent = stats.completed;
    document.getElementById('upcomingBookings').textContent = stats.upcoming;
    document.getElementById('totalSpent').textContent = `₹${stats.totalSpent.toLocaleString()}`;
    
    // Active bookings
    const activeBookings = bookings.filter(b => ['pending', 'confirmed', 'assigned', 'in_progress'].includes(b.status));
    const activeList = document.getElementById('activeBookingsList');
    
    if (activeBookings.length === 0) {
        activeList.innerHTML = `
            <div style="text-align:center;padding:30px;color:var(--text-light);">
                <i class="fas fa-calendar-plus" style="font-size:2rem;color:var(--primary);"></i>
                <p style="margin-top:10px;">No active bookings</p>
                <button class="btn-primary" style="margin-top:10px;" onclick="window.location.href='new-booking.html'">
                    <i class="fas fa-plus"></i> Create Booking
                </button>
            </div>
        `;
    } else {
        activeList.innerHTML = activeBookings.map(booking => `
            <div class="booking-card active">
                <div class="booking-status-badge ${booking.status === 'in_progress' ? 'in-progress' : 'scheduled'}">
                    ${booking.status.replace('_', ' ').toUpperCase()}
                </div>
                <div class="booking-header">
                    <div class="bystander-info">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(booking.bystander?.user?.full_name || 'Pending')}&background=0a6b8a&color=fff" />
                        <div>
                            <h4>${booking.bystander?.user?.full_name || 'Awaiting Bystander'}</h4>
                            <span class="bystander-specialty">⭐ ${booking.bystander ? '4.9' : 'Pending'} · ${booking.service_type.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>
                <div class="booking-details">
                    <div class="detail-item">
                        <span class="detail-label">Service</span>
                        <span class="detail-value">${booking.service_type.replace('_', ' ')}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date</span>
                        <span class="detail-value">${new Date(booking.service_date).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Duration</span>
                        <span class="detail-value">${booking.service_duration_hours} hours</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Amount</span>
                        <span class="detail-value">₹${booking.estimated_price}</span>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="btn-chat"><i class="fas fa-comment"></i> Chat</button>
                    <button class="btn-call"><i class="fas fa-phone"></i> Call</button>
                </div>
            </div>
        `).join('');
    }
    
    // Booking history
    const historyBody = document.getElementById('bookingHistory');
    if (bookings.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--text-light);">No bookings yet</td></tr>';
    } else {
        historyBody.innerHTML = bookings.map(booking => `
            <tr>
                <td><span class="booking-id">#${booking.booking_id.substring(0, 8)}</span></td>
                <td>
                    <div class="user-info">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(booking.bystander?.user?.full_name || 'Pending')}&background=27ae60&color=fff" />
                        <span>${booking.bystander?.user?.full_name || 'Pending'}</span>
                    </div>
                </td>
                <td>${booking.service_type.replace('_', ' ')}</td>
                <td>${new Date(booking.service_date).toLocaleDateString()}</td>
                <td>₹${booking.estimated_price}</td>
                <td><span class="status-badge ${booking.status}">${booking.status.replace('_', ' ')}</span></td>
                <td><button class="btn-detail"><i class="fas fa-eye"></i></button></td>
            </tr>
        `).join('');
    }
    
    // Initialize charts
    initCharts(bookings);
}

// ===== Load Demo Data (if backend unavailable) =====
function loadDemoData() {
    const demoData = {
        stats: {
            active: 2,
            completed: 12,
            upcoming: 3,
            totalSpent: 24500
        },
        bookings: [
            {
                booking_id: 'bkg-2024-015',
                service_type: 'elderly_care',
                service_date: '2024-12-18',
                service_duration_hours: 4,
                estimated_price: 1200,
                status: 'in_progress',
                bystander: { user: { full_name: 'Priya Patel' } }
            },
            {
                booking_id: 'bkg-2024-016',
                service_type: 'home_care',
                service_date: '2024-12-20',
                service_duration_hours: 6,
                estimated_price: 2400,
                status: 'confirmed',
                bystander: { user: { full_name: 'Sunil Kumar' } }
            }
        ]
    };
    populateDashboard(demoData);
}

// ===== Initialize Charts =====
function initCharts(bookings) {
    // Booking trends
    const ctx1 = document.getElementById('patientBookingChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Nov', 'Dec 1-7', 'Dec 8-14', 'Dec 15-21', 'Dec 22-28'],
                datasets: [{
                    label: 'Bookings',
                    data: [3, 5, 7, 4, 2],
                    borderColor: '#0a6b8a',
                    backgroundColor: 'rgba(10, 107, 138, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
    
    // Service distribution
    const ctx2 = document.getElementById('patientServiceChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Elderly Care', 'Home Care', 'Hospital Stay', 'Emergency'],
                datasets: [{
                    data: [8, 5, 4, 2],
                    backgroundColor: ['#f39c12', '#2ecc71', '#3498db', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', loadDashboard);
