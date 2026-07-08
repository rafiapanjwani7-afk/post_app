import supabase from "./supabase.js";

// ================= SIGNUP =================

const signupForm = document.getElementById('signupForm')

if (signupForm) {
    signupForm.addEventListener('submit', signup)
}

async function signup(event) {
    event.preventDefault()

    const name = document.getElementById('signName').value.trim()
    const email = document.getElementById('signEmail').value.trim()
    const password = document.getElementById('signPassword').value
    const number = document.getElementById('signNumber').value.trim()

    if (!name || !email || !password) {
        Swal.fire('Error', 'Please fill in all fields!', 'error')
        return
    }
    const passwordRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/
    if (!passwordRe.test(password)) {
        Swal.fire({
            icon: 'warning',
            title: 'Weak Password',
            text: 'Password must be 6+ characters with at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
            confirmButtonText: 'OK'
        })
        return
    }
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
    if (!emailRe.test(email)) {
        Swal.fire('Invalid email', 'Please enter a valid email address.', 'error')
        return
    }

    const submitBtn = signupForm.querySelector('button[type="submit"]')
    if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '.7'; }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: name,
                number: number
            }
        }
    })

    if (error) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
        Swal.fire('Error', error.message, 'error')
        return
    }

    Swal.fire({
        icon: 'success',
        title: `${name}, Registration Successful`,
        text: 'Please check your email for verification link.',
        showConfirmButton: true,
        confirmButtonText: 'OK'
    })

    // Email verification ke liye user ko dashboard ke bajaye login page par bhejna behtar hai
    setTimeout(() => {
        window.location.href = "login.html"
    }, 2500);
}

// ================= LOGIN =================

const loginForm = document.getElementById('loginForm')

if (loginForm) {
    loginForm.addEventListener('submit', login)
}

async function login(event) {
    event.preventDefault()

    // NEW HTML IDs: 'loginEmail' aur 'loginPassword' ko badal kar 'email' aur 'password' kiya hai
    const loginEmail = document.getElementById('email').value.trim()
    const loginPassword = document.getElementById('password').value

    const submitBtn = loginForm.querySelector('button[type="submit"]')
    if (submitBtn) { submitBtn.disabled = true; submitBtn.style.opacity = '.7'; }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
        })
        
        console.log(data);
        
        if (error) {
            console.log(error);
            if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
            Swal.fire({
                title: 'Error!',
                text: error.message,
                icon: 'error',
            });
        } else {
            Swal.fire({
                title: 'Success!',
                text: 'Login Successful',
                icon: 'success',
                showConfirmButton: false
            });
            setTimeout(() => {
                window.location.href = "dashboard.html"
            }, 2000);
        }
    } catch (error) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.style.opacity = ''; }
        Swal.fire({
            title: 'Error!',
            text: 'Login failed',
            icon: 'error',
        });
    }
}

// ================= AUTH STATE =================//
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Event:', event)
    console.log('Session:', session)
    if (event === 'INITIAL_SESSION') {
        console.log("Please log in again.");
        swal.fire({
            title: 'Session Expired',
            text: 'Please log in again.',
            icon: 'warning'
        });
    }
    if (event === 'SIGNED_IN') {
        console.log('User:', session?.user?.email)
        swal.fire({
            title: 'Welcome!',
            text: `Hello, ${session?.user?.email}`,
            icon: 'success'
        });
    }
})

// Make functions available globally if needed
window.signup = signup
window.login = login

export { supabase }