// ===== AUTHENTICATION SYSTEM =====

// ===== Open Auth Modal =====
function openAuthModal(type, role = 'patient') {
    const modal = document.getElementById('authModal');
    const body = document.getElementById('authBody');
    
    if (type === 'login') {
        body.innerHTML = getLoginForm();
    } else {
        body.innerHTML = getRegisterForm(role);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== Close Auth Modal =====
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Close on Outside Click =====
document.addEventListener('click', function(e) {
    const modal = document.getElementById('authModal');
    if (e.target === modal) {
        closeAuthModal();
    }
});

// ===== Get Login Form HTML =====
function getLoginForm() {
    return `
        <div class="auth-form">
            <h2>Welcome Back</h2>
            <p class="auth-subtitle">Login to your Carebridge account</p>
            
            <div class="auth-role-selector">
                <button class="role-btn active" onclick="switchLoginRole('patient')">
                    <i class="fas fa-user-injured"></i> Patient
                </button>
                <button class="role-btn" onclick="switchLoginRole('bystander')">
                    <i class="fas fa-user-nurse"></i> Bystander
                </button>
            </div>
            
            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label>Email or Mobile Number</label>
                    <input type="text" id="loginEmail" placeholder="you@example.com or 9876543210" required />
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="loginPassword" placeholder="Enter your password" required />
                </div>
                <div class="form-options">
                    <label>
                        <input type="checkbox" /> Remember me
                    </label>
                    <a href="#" onclick="showForgotPassword()">Forgot password?</a>
                </div>
                <button type="submit" class="btn-login">
                    <i class="fas fa-arrow-right"></i> Login
                </button>
            </form>
            
            <div class="auth-divider">or continue with</div>
            
            <div class="social-login">
                <button class="social-btn google">
                    <i class="fab fa-google"></i> Google
                </button>
                <button class="social-btn facebook">
                    <i class="fab fa-facebook"></i> Facebook
                </button>
            </div>
            
            <div class="auth-footer">
                Don't have an account? 
                <a href="#" onclick="openAuthModal('register', getCurrentRole())">Register here</a>
            </div>
        </div>
    `;
}

// ===== Get Register Form HTML =====
function getRegisterForm(role = 'patient') {
    const isPatient = role === 'patient';
    const title = isPatient ? 'Patient Registration' : 'Bystander Registration';
    const icon = isPatient ? 'fa-user-injured' : 'fa-user-nurse';
    const subtitle = isPatient ? 'Get care when you need it most' : 'Start earning by helping others';
    
    return `
        <div class="auth-form">
            <h2><i class="fas ${icon}" style="color:var(--primary);"></i> ${title}</h2>
            <p class="auth-subtitle">${subtitle}</p>
            
            <div class="auth-role-selector">
                <button class="role-btn ${isPatient ? 'active' : ''}" onclick="switchRegisterRole('patient')">
                    <i class="fas fa-user-injured"></i> Patient
                </button>
                <button class="role-btn ${!isPatient ? 'active' : ''}" onclick="switchRegisterRole('bystander')">
                    <i class="fas fa-user-nurse"></i> Bystander
                </button>
            </div>
            
            <form id="registerForm" onsubmit="handleRegister(event)">
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name <span class="required">*</span></label>
                        <input type="text" id="regName" placeholder="John Doe" required />
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <input type="date" id="regDob" />
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Email Address <span class="required">*</span></label>
                    <input type="email" id="regEmail" placeholder="you@example.com" required />
                </div>
                
                <div class="form-group">
                    <label>Mobile Number <span class="required">*</span></label>
                    <div class="otp-input-group">
                        <input type="tel" id="regMobile" placeholder="9876543210" required />
                        <button type="button" class="btn-otp" onclick="sendOTP()">
                            Send OTP
                        </button>
                    </div>
                    <small class="input-hint">We'll send a verification code to this number</small>
                </div>
                
                <div class="form-group">
                    <label>OTP <span class="required">*</span></label>
                    <input type="text" id="regOtp" placeholder="Enter 6-digit OTP" required />
                </div>
                
                <div class="form-group">
                    <label>Create Password <span class="required">*</span></label>
                    <input type="password" id="regPassword" placeholder="Min 8 characters" required />
                    <small class="input-hint">Use at least 8 characters with a mix of letters and numbers</small>
                </div>
                
                ${!isPatient ? `
                <div class="form-group">
                    <label>Aadhaar Number <span class="required">*</span></label>
                    <input type="text" id="regAadhaar" placeholder="1234 5678 9012" required />
                </div>
                <div class="form-group">
                    <label>PAN Number <span class="required">*</span></label>
                    <input type="text" id="regPan" placeholder="ABCDE1234F" required />
                </div>
                <div class="form-group">
                    <label>Experience (Years)</label>
                    <input type="number" id="regExperience" placeholder="Years of experience" />
                </div>
                <div class="form-group">
                    <label>Skills</label>
                    <select id="regSkills" multiple style="height:80px;">
                        <option>Elderly Care</option>
                        <option>Post-Surgery Support</option>
                        <option>Mobility Assistance</option>
                        <option>Medication Reminder</option>
                        <option>Companionship</option>
                        <option>Special Needs Care</option>
                    </select>
                    <small class="input-hint">Hold Ctrl (Cmd) to select multiple</small>
                </div>
                ` : `
                <div class="form-group">
                    <label>Medical Conditions (Optional)</label>
                    <textarea id="regMedical" rows="2" placeholder="Any specific care requirements..."></textarea>
                </div>
                <div class="form-group">
                    <label>Preferred Service Type</label>
                    <select id="regService">
                        <option value="hospital_stay">Hospital Stay Support</option>
                        <option value="home_care">Home Care</option>
                        <option value="emergency">Emergency Support</option>
                        <option value="elderly_care">Elderly Care</option>
                    </select>
                </div>
                `}
                
                <div class="form-group" style="display:flex;gap:12px;align-items:flex-start;margin-top:16px;">
                    <input type="checkbox" id="regTerms" required style="width:20px;margin-top:4px;" />
                    <label for="regTerms" style="font-weight:400;font-size:0.9rem;">
                        I agree to the <a href="#">Terms & Conditions</a> and 
                        <a href="#">Privacy Policy</a>. I understand my data will be used for service bookings.
                        <span class="required">*</span>
                    </label>
                </div>
                
                <button type="submit" class="btn-login">
                    <i class="fas fa-user-plus"></i> Create Account
                </button>
            </form>
            
            <div class="auth-footer">
                Already have an account? 
                <a href="#" onclick="openAuthModal('login')">Login here</a>
            </div>
        </div>
    `;
}

// ===== Handle Login =====
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // In production, call backend API
    // For demo, simulate login and redirect
    
    // Check if user is patient or bystander (mock check)
    const isPatient = email.includes('patient') || Math.random() > 0.5;
    
    // Store user info
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', isPatient ? 'patient' : 'bystander');
    localStorage.setItem('userName', isPatient ? 'Rahul Sharma' : 'Priya Patel');
    
    closeAuthModal();
    
    // Redirect to appropriate dashboard
    if (isPatient) {
        window.location.href = 'pages/patient/dashboard.html';
    } else {
        window.location.href = 'pages/bystander/dashboard.html';
    }
}

// ===== Handle Register =====
function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const mobile = document.getElementById('regMobile').value;
    const password = document.getElementById('regPassword').value;
    
    // Get role from active button
    const roleBtn = document.querySelector('.auth-role-selector .role-btn.active');
    const role = roleBtn ? roleBtn.textContent.trim().toLowerCase() : 'patient';
    
    // In production, call backend API
    alert(`✅ Registration successful! Welcome ${name}!`);
    
    closeAuthModal();
    
    // Store and redirect
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', name);
    
    if (role === 'patient') {
        window.location.href = 'pages/patient/dashboard.html';
    } else {
        window.location.href = 'pages/bystander/dashboard.html';
    }
}

// ===== Switch Login Role =====
let currentLoginRole = 'patient';

function switchLoginRole(role) {
    currentLoginRole = role;
    document.querySelectorAll('.auth-role-selector .role-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function getCurrentRole() {
    return currentLoginRole;
}

// ===== Switch Register Role =====
function switchRegisterRole(role) {
    const modal = document.getElementById('authModal');
    const body = document.getElementById('authBody');
    body.innerHTML = getRegisterForm(role);
}

// ===== Send OTP =====
function sendOTP() {
    const mobile = document.getElementById('regMobile').value;
    if (!mobile || mobile.length < 10) {
        alert('Please enter a valid mobile number');
        return;
    }
    alert(`📱 OTP sent to ${mobile}`);
}

// ===== Show Forgot Password =====
function showForgotPassword() {
    const body = document.getElementById('authBody');
    body.innerHTML = `
        <div class="auth-form">
            <h2>Reset Password</h2>
            <p class="auth-subtitle">Enter your email to receive reset instructions</p>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="you@example.com" />
            </div>
            <button class="btn-login">
                <i class="fas fa-envelope"></i> Send Reset Link
            </button>
            <div class="auth-footer" style="margin-top:16px;">
                <a href="#" onclick="openAuthModal('login')">Back to Login</a>
            </div>
        </div>
    `;
}

// ===== Close Mobile Menu =====
function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== Check if user is already logged in =====
function checkAuth() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (token && role) {
        // Redirect to appropriate dashboard
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            if (role === 'patient') {
                window.location.href = 'pages/patient/dashboard.html';
            } else if (role === 'bystander') {
                window.location.href = 'pages/bystander/dashboard.html';
            }
        }
    }
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', function() {
    // Check auth on page load
    // checkAuth(); // Uncomment when ready
});
