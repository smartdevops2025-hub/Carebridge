// ===== BYSTANDER DASHBOARD =====
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
    if (userData.role !== 'bystander') {
        alert('Access denied. Bystander account required.');
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

// ===== Load Bystander Dashboard =====
async function loadDashboard() {
    const auth = checkAuth();
    if (!auth) return;
    
    const { token, user } = auth;
    
    // Update UI
    document.getElementById('bystanderName').textContent = user.full_name;
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${user.full_name.split(' ')[0]}! 👋`;
    document.getElementById('profileImage').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=0a6b8a&color=fff`;
    
    try {
        const response = await fetch(`${API_URL}/bystander/dashboard`, {
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
        loadDemoData();
    }
}

// ===== Populate Dashboard =====
function populateDashboard(data) {
    const { bystander, stats, bookings, pendingJobs } = data;
    
    // Update stats
    document.getElementById('totalJobs').textContent = stats.totalJobs || 0;
    document.getElementById('avgRating').textContent = `${stats.avgRating.toFixed(1)} ★`;
    document.getElementById('ratingCount').textContent = `From ${bystander.rating_count || 0} reviews`;
    document.getElementById('pendingJobs').textContent = stats.pendingJobs || 0;
    document.getElementById('totalEarnings').textContent = `₹${parseFloat(stats.totalEarnings || 0).toLocaleString()}`;
    document.getElementById('jobCount').textContent = pendingJobs.length;
    document.getElementById('headerJobCount').textContent = pendingJobs.length;
    document.getElementById('notifCount').textContent = pendingJobs.length;
    
    // Update availability
    const isAvailable = bystander.is_available;
    document.getElementById('availabilityToggle').checked = isAvailable;
    updateAvailabilityUI(isAvailable);
    
    // Verification status
    const verificationBanner = document.getElementById('verificationBanner');
    const verificationTitle = document.getElementById('verificationTitle');
    const verificationMessage = document.getElementById('verificationMessage');
    
    if (bystander.verification_status === 'verified') {
        verificationBanner.className = 'verification-banner verified';
        verificationTitle.textContent = '✓ Verification Complete';
        verificationMessage.textContent = 'Your profile is fully verified. You can accept jobs.';
    } else if (bystander.verification_status === 'pending') {
        verificationBanner.className = 'verification-banner pending';
        verificationTitle.textContent = '⏳ Verification Pending';
        verificationMessage.textContent = 'Your documents are being reviewed. This usually takes 24-48 hours.';
    } else if (bystander.verification_status === 'rejected') {
        verificationBanner.className = 'verification-banner pending';
        verificationTitle.textContent = '❌ Verification Rejected';
        verificationMessage.textContent = 'Please contact support for more information.';
    }
    
    // Job requests preview
    const previewContainer = document.getElementById('jobRequestsPreview');
    if (pendingJobs.length === 0) {
        previewContainer.innerHTML = `
            <div style="text-align:center;padding:30px;color:var(--text-light);">
                <i class="fas fa-check-circle" style="font-size:2rem;color:var(--success);"></i>
                <p style="margin-top:10px;">No new job requests. You're all caught up!</p>
            </div>
        `;
    } else {
        const preview = pendingJobs.slice(0, 2);
        previewContainer.innerHTML = preview.map(job => `
            <div style="border:1px solid #eef3f7;border-radius:12px;padding:16px;margin-bottom:12px;background:white;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                    <div style="display:flex;align-items:center;gap:12px;">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(job.patient?.user?.full_name || 'Patient')}&background=27ae60&color=fff" style="width:40px;height:40px;border-radius:50%;" />
                        <div>
                            <h4 style="font-weight:700;font-size:0.95rem;">${job.patient?.user?.full_name || 'Patient'}</h4>
                            <span style="font-size:0.8rem;color:var(--text-light);">${job.service_type.replace('_', ' ')} · ${job.pickup_address || 'Location'}</span>
                        </div>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
                        <span style="font-weight:700;color:var(--primary);">₹${job.estimated_price}</span>
                        <span style="font-size:0.7rem;color:var(--text-light);">${new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div style="display:flex;gap:10px;margin-top:12px;border-top:1px solid #eef3f7;padding-top:12px;">
                    <button onclick="window.location.href='jobs.html'" style="flex:1;padding:8px;background:var(--success);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">
                        <i class="fas fa-check"></i> View & Accept
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Active jobs
    const activeJobs = bookings.filter(b => ['assigned', 'in_progress'].includes(b.status));
    const activeContainer = document.getElementById('activeJobsContainer');
    if (activeJobs.length === 0) {
        activeContainer.innerHTML = `
            <div style="text-align:center;padding:30px;color:var(--text-light);">
                <i class="fas fa-briefcase" style="font-size:2rem;color:var(--primary);"></i>
                <p style="margin-top:10px;">No active jobs. Check available jobs above!</p>
            </div>
        `;
    } else {
        activeContainer.innerHTML = activeJobs.map(job => `
            <div class="booking-card active" style="margin-bottom:12px;">
                <div class="booking-status-badge in-progress">${job.status.replace('_', ' ').toUpperCase()}</div>
                <div class="booking-header">
                    <div class="patient-info">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(job.patient?.user?.full_name || 'Patient')}&background=27ae60&color=fff" />
                        <div>
                            <h4>${job.patient?.user?.full_name || 'Patient'}</h4>
                            <span class="patient-location"><i class="fas fa-map-marker-alt"></i> ${job.pickup_address || 'Location'}</span>
                        </div>
                    </div>
                </div>
                <div class="booking-details">
                    <div class="detail-item"><span class="detail-label">Service</span><span class="detail-value">${job.service_type.replace('_', ' ')}</span></div>
                    <div class="detail-item"><span class="detail-label">Date</span><span class="detail-value">${new Date(job.service_date).toLocaleDateString()}</span></div>
                    <div class="detail-item"><span class="detail-label">Duration</span><span class="detail-value">${job.service_duration_hours} hours</span></div>
                    <div class="detail-item"><span class="detail-label">Amount</span><span class="detail-value">₹${job.estimated_price}</span></div>
                </div>
                <div class="booking-actions">
                    <button class="btn-chat"><i class="fas fa-comment"></i> Chat</button>
                    <button class="btn-call"><i class="fas fa-phone"></i> Call</button>
                    <button class="btn-track"><i class="fas fa-map-marker-alt"></i> Share Location</button>
                </div>
            </div>
        `).join('');
    }
    
    // Initialize charts
    initCharts();
}

// ===== Load Demo Data =====
function loadDemoData() {
    const demoData = {
        bystander: {
            verification_status: 'verified',
            is_available: true,
            total_jobs_completed: 48,
            rating_sum: 205.8,
            rating_count: 42,
            total_earnings: 142500
        },
        stats: {
            totalJobs: 48,
            avgRating: 4.9,
            pendingJobs: 3,
            totalEarnings: 142500
        },
        bookings: [],
        pendingJobs: [
            {
                booking_id: 'demo-1',
                service_type: 'home_care',
                pickup_address: 'Trivandrum, Kerala',
                estimated_price: 1500,
                created_at: new Date().toISOString(),
                patient: { user: { full_name: 'Meera Nair' } }
            },
            {
                booking_id: 'demo-2',
                service_type: 'emergency',
                pickup_address: 'Kochi, Kerala',
                estimated_price: 2800,
                created_at: new Date().toISOString(),
                patient: { user: { full_name: 'Ananya Reddy' } }
            },
            {
                booking_id: 'demo-3',
                service_type: 'elderly_care',
                pickup_address: 'Kozhikode, Kerala',
                estimated_price: 2200,
                created_at: new Date().toISOString(),
                patient: { user: { full_name: 'Vikram Singh' } }
            }
        ]
    };
    populateDashboard(demoData);
}

// ===== Update Availability UI =====
function updateAvailabilityUI(isAvailable) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('availabilityText');
    const message = document.getElementById('availabilityMessage');
    
    if (isAvailable) {
        statusDot.className = 'status-dot online';
        statusText.textContent = 'Available';
        message.innerHTML = 'You are <strong>available</strong> for new jobs';
    } else {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'Unavailable';
        message.innerHTML = 'You are <strong>unavailable</strong> for new jobs';
    }
}

// ===== Availability Toggle =====
document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.getElementById('availabilityToggle');
    if (toggle) {
        toggle.addEventListener('change', async function() {
            const isAvailable = this.checked;
            updateAvailabilityUI(isAvailable);
            
            // Send to backend
            const token = localStorage.getItem('token');
            try {
                await fetch(`${API_URL}/bystander/availability`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ is_available: isAvailable })
                });
            } catch (error) {
                console.error('Failed to update availability:', error);
            }
        });
    }
});

// ===== Initialize Charts =====
function initCharts() {
    const ctx1 = document.getElementById('earningsChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Earnings (₹)',
                    data: [6500, 8200, 7100, 9200],
                    backgroundColor: ['#0a6b8a', '#2ecc71', '#3498db', '#f39c12'],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
    
    const ctx2 = document.getElementById('bystanderServiceChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Elderly Care', 'Home Care', 'Emergency', 'Hospital Stay'],
                datasets: [{
                    data: [18, 12, 10, 8],
                    backgroundColor: ['#f39c12', '#2ecc71', '#e74c3c', '#3498db'],
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
