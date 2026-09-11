// ===== AUTHENTICATION SYSTEM =====
const API_URL = 'https://ideal-space-robot-g4vpw477wrj6396px-5000.app.github.dev/api';

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
                    <label>Email</label>
                    <input type="email" id="loginEmail" placeholder="you@example.com" required />
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
                <button type="submit" class="btn-login" id="loginBtn">
                    <i class="fas fa-spinner fa-spin" style="display:none;"></i>
                    <span id="loginBtnText">Login</span>
                </button>
            </form>
            
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
                
                <button type="submit" class="btn-login" id="registerBtn">
                    <i class="fas fa-spinner fa-spin" style="display:none;"></i>
                    <span id="registerBtnText">Create Account</span>
                </button>
            </form>
            
            <div class="auth-footer">
                Already have an account? 
                <a href="#" onclick="openAuthModal('login')">Login here</a>
            </div>
        </div>
    `;
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
                <input type="email" id="resetEmail" placeholder="you@example.com" />
            </div>
            <button class="btn-login" onclick="handleResetPassword()">
                <i class="fas fa-envelope"></i> Send Reset Link
            </button>
            <div class="auth-footer" style="margin-top:16px;">
                <a href="#" onclick="openAuthModal('login')">Back to Login</a>
            </div>
        </div>
    `;
}

function handleResetPassword() {
    const email = document.getElementById('resetEmail').value;
    if (!email) {
        alert('Please enter your email');
        return;
    }
    alert(`📧 Password reset link sent to ${email}`);
    openAuthModal('login');
}

// ===== HANDLE LOGIN =====
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('loginBtnText');
    const spinner = btn.querySelector('.fa-spinner');
    
    // Show loading
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Logging in...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store user data
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            localStorage.setItem('userRole', data.data.user.role);
            localStorage.setItem('userName', data.data.user.full_name);
            
            alert('✅ Login successful!');
            closeAuthModal();
            
            // Redirect based on role
            if (data.data.user.role === 'patient') {
                window.location.href = 'pages/patient/dashboard.html';
            } else if (data.data.user.role === 'bystander') {
                window.location.href = 'pages/bystander/dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Login Error:', error);
        alert('❌ Connection error. Please make sure the backend is running.');
    } finally {
        // Hide loading
        spinner.style.display = 'none';
        btnText.textContent = 'Login';
        btn.disabled = false;
    }
}

// ===== HANDLE REGISTER =====
async function handleRegister(event) {
    event.preventDefault();
    
    // Get role from active button
    const roleBtn = document.querySelector('.auth-role-selector .role-btn.active');
    const role = roleBtn ? roleBtn.textContent.trim().toLowerCase() : 'patient';
    
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const mobile = document.getElementById('regMobile').value;
    const password = document.getElementById('regPassword').value;
    const dob = document.getElementById('regDob')?.value || null;
    
    const btn = document.getElementById('registerBtn');
    const btnText = document.getElementById('registerBtnText');
    const spinner = btn.querySelector('.fa-spinner');
    
    // Build request body
    const requestBody = {
        full_name: name,
        email,
        mobile,
        password,
        role: role === 'patient' ? 'patient' : 'bystander',
        date_of_birth: dob
    };
    
    // Add role-specific fields
    if (role === 'bystander') {
        const aadhaar = document.getElementById('regAadhaar')?.value || '';
        const pan = document.getElementById('regPan')?.value || '';
        const experience = document.getElementById('regExperience')?.value || 0;
        const skillsSelect = document.getElementById('regSkills');
        const skills = skillsSelect ? Array.from(skillsSelect.selectedOptions).map(opt => opt.value) : [];
        
        requestBody.aadhaar_number = aadhaar;
        requestBody.pan_number = pan;
        requestBody.experience_years = parseInt(experience) || 0;
        requestBody.skills = skills;
    } else {
        const medical = document.getElementById('regMedical')?.value || '';
        const service = document.getElementById('regService')?.value || 'home_care';
        requestBody.medical_conditions = medical;
        requestBody.preferred_service = service;
    }
    
    // Show loading
    spinner.style.display = 'inline-block';
    btnText.textContent = 'Creating account...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Registration successful! Please login.');
            closeAuthModal();
            openAuthModal('login');
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Registration Error:', error);
        alert('❌ Connection error. Please make sure the backend is running.');
    } finally {
        // Hide loading
        spinner.style.display = 'none';
        btnText.textContent = 'Create Account';
        btn.disabled = false;
    }
}

// ===== CHECK IF USER IS LOGGED IN =====
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const userData = JSON.parse(user);
        // Update UI to show logged in state
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            const loginBtn = navLinks.querySelector('.btn-outline');
            const registerBtn = navLinks.querySelector('.register-btn');
            if (loginBtn) loginBtn.textContent = 'Dashboard';
            if (registerBtn) {
                registerBtn.textContent = userData.full_name || 'Profile';
                registerBtn.style.background = '#27ae60';
                registerBtn.style.color = 'white';
                registerBtn.onclick = function(e) {
                    e.preventDefault();
                    if (userData.role === 'patient') {
                        window.location.href = 'pages/patient/dashboard.html';
                    } else if (userData.role === 'bystander') {
                        window.location.href = 'pages/bystander/dashboard.html';
                    }
                };
            }
        }
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuth();
});
