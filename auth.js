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
                name
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
        text: 'Please check your email for verification.',
        confirmButtonText: 'Proceed to Login',
        showConfirmButton: false
    })// Timeout taake user success alert dekh sake
        setTimeout(() => {
            window.location.href = "dashboard.html"
        }, 2000);

}

// ================= LOGIN =================

const loginForm = document.getElementById('loginForm')

if (loginForm) {
    loginForm.addEventListener('submit', login)
}

async function login(event) {
    event.preventDefault()

    const loginEmail = document.getElementById('loginEmail').value.trim()
    const loginPassword = document.getElementById('loginPassword').value

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
        })
        
        console.log(data);
        
        if (error) {
            console.log(error);
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
            });
            setTimeout(() => {
                window.location.href = "dashboard.html"
            }, 2000);
        }
    } catch (error) {
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
    
    // if (!session) {
    //     Swal.fire({
    //         icon: 'info',
    //         title: 'Session Expired',
    //         text: 'Please log in again.',
    //         confirmButtonText: 'OK'
    //     }).then(() => {
    //         location.href = "index.html";
    //     });
    // }
}
if (event === 'SIGNED_IN') {
    console.log('User:', session?.user?.email)
    // Swal.fire({
    //     icon: 'success',
    //     title: 'Welcome Back!',
    // })
    // location.href = 'dashboard.html'
}

   
})


// Make functions available globally if needed
window.signup = signup
window.login = login



export { supabase }