import supabase from "./supabase.js";

let edited = false;
var selectedTextColor = "";
var cardBg = "";
var title = document.getElementById("title");
var description = document.getElementById("description");
let editIndex = null;
let userName = "";
let imageUrl = "";
let userid;
let Email;

// 1. Popup menu ko toggle karne ka function
window.toggleProfileMenu = function() {
    const popup = document.getElementById("profilePopup");
    if (popup) {
        popup.classList.toggle("show");
    }
}

// Bahar click karne par dropdown auto close ho jaye
window.addEventListener("click", function(e) {
    const dropdown = document.querySelector(".profile-dropdown");
    const popup = document.getElementById("profilePopup");
    if (dropdown && popup && !dropdown.contains(e.target)) {
        popup.classList.remove("show");
    }
});

async function searchPosts() {
    let searchInput = document.getElementById("searchInput").value;
    console.log("Searching for:", searchInput);
    try {
        const { data, error } = await supabase
            .from("post_app_table")
            .select("*").order('id', { ascending: false })
            .or(`title.ilike.%${searchInput}%,description.ilike.%${searchInput}%`);

        const postsContainer = document.getElementById("posts");
        postsContainer.innerHTML = "";

        if (error) {
            console.log("Error searching posts:", error);
            return;
        }

          data.forEach(post => {
    let currentTextColor = post.text_color || "#ffffff";
    let displayUserName = post.user_name || 'Anonymous'; 
    let displayEmail = post.email ? `~${post.email}` : '';

    postsContainer.innerHTML += `
<div class="card mb-3" style="border: 1px solid rgba(255,255,255,0.12); overflow: hidden;">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span>
            <strong style="font-size: 16px; display: block;">${post.id}.${displayUserName}</strong> 
           <small class="d-block email-text-element" style="font-size: 12.5px; margin-top: 2px; color: ${emailColor} !important; font-weight: 500;">
                <i class="bi bi-envelope-fill me-1" style="color: #38bdf8 !important; font-size: 11px;"></i>${displayEmail}
            </small>
        </span>
        <div>
            <button class="btn btn-sm"
            onclick="editPost(event, ${post.id}, '${post.description}', '${post.title}', '${post.bg_img}', '${post.text_color}', '${currentTextColor}', '${post.user_id}')">
                <i class="bi bi-pencil-square text-warning"></i>
            </button>
            <button class="btn btn-sm"
            onclick="delpost(event,${post.id}, '${post.user_id}')">
                <i class="bi bi-trash text-danger"></i>
            </button>
        </div>
    </div>

    <div class="card-body" style="background-image:url('${post.bg_img}');background-size:cover;background-position:center; min-height: 140px;">
        <h4 style="color:${currentTextColor}; font-weight: bold;">${post.title}</h4>
        <p style="color:${currentTextColor}">${post.description}</p>
    </div>

    <div class="card-footer d-flex justify-content-around bg-transparent border-top-0 pt-1 pb-2">
        <button class="btn btn-sm d-flex align-items-center gap-2 text-secondary" onclick="Swal.fire('Liked!', 'You liked this post.', 'success')">
            <i class="bi bi-hand-thumbs-up" style="font-size: 16px;"></i> Like
        </button>
        <button class="btn btn-sm d-flex align-items-center gap-2 text-secondary" onclick="Swal.fire('Comments Coming Soon!', 'Working on live interactions.', 'info')">
            <i class="bi bi-chat-left-text" style="font-size: 16px;"></i> Comment
        </button>
    </div>
</div>
`;
});
        
        if (!data.length) {
            Swal.fire({
                icon: "info",
                title: "No Results",
                text: "No posts found matching your search."
            });
            postsContainer.innerHTML = "<p class='text-center text-muted'>No posts found.</p>";
        }
    } catch (error) {
        console.log("Error searching posts:", error);
    }
}

window.onload = async function () {
    const postsContainer = document.getElementById("posts");
    
    // ONE CENTRALIZED SYSTEM TO FETCH USER INFO SAFELY
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user) {
            userid = user.id;
            Email = user.email;
            userName = user.user_metadata?.first_name || user.email.split('@')[0]; 
            
            const firstLetter = Email.charAt(0).toUpperCase();
            
            // Dynamic UI Elements Allocation (Avatar & Email panel)
            if (document.getElementById("userInitial")) {
                document.getElementById("userInitial").innerText = firstLetter;
            }
            if (document.getElementById("dropdownEmail")) {
                document.getElementById("dropdownEmail").innerText = Email;
            }
        } else {
            console.log("No active session found.");
        }
        if (error) console.log("Auth Error:", error);
    } catch (error) {
        console.log("User load error:", error);
    }

    // FETCH ALL POSTS FROM DATABASE
    try {
        const { data, error } = await supabase
            .from('post_app_table')
            .select("*")
            .order('id', { ascending: false });

        if (error) {
            console.log("Supabase Fetch Error:", error);
            return;
        }

        if (!data || data.length === 0) {
            postsContainer.innerHTML = "<p class='text-center text-muted'>No posts available yet.</p>";
            return;
        }

        postsContainer.innerHTML = ""; // Clear loader/previous templates
let currentTheme = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        
        // Agar dark theme ho to email silver white (#cbd5e1) dikhe, warna dark gray (#5c636a) dikhe
        let emailColor = (currentTheme === "dark") ? "#cbd5e1" : "#5c636a";
        data.forEach(post => {
    let currentTextColor = post.text_color || "#ffffff";
    let displayUserName = post.user_name || 'Anonymous'; 
    let displayEmail = post.email ? `~${post.email}` : '';

    postsContainer.innerHTML += `
<div class="card mb-3" style="border: 1px solid rgba(255,255,255,0.12); overflow: hidden;">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span>
            <strong style="font-size: 16px; display: block;"> ${post.id}. ${displayUserName}</strong> 
         <small class="d-block email-text-element" style="font-size: 12.5px; margin-top: 2px; color: ${emailColor} !important; font-weight: 500;">
                <i class="bi bi-envelope-fill me-1" style="color: #38bdf8 !important; font-size: 11px;"></i>${displayEmail}
            </small>
        </span>
        <div>
            <button class="btn btn-sm"
            onclick="editPost(event, ${post.id}, '${post.description}', '${post.title}', '${post.bg_img}', '${post.text_color}', '${currentTextColor}', '${post.user_id}')">
                <i class="bi bi-pencil-square text-warning"></i>
            </button>
            <button class="btn btn-sm"
            onclick="delpost(event,${post.id}, '${post.user_id}')">
                <i class="bi bi-trash text-danger"></i>
            </button>
        </div>
    </div>

    <div class="card-body" style="background-image:url('${post.bg_img}');background-size:cover;background-position:center; min-height: 140px;">
        <h4 style="color:${currentTextColor}; font-weight: bold;">${post.title}</h4>
        <p style="color:${currentTextColor}">${post.description}</p>
    </div>

    <div class="card-footer d-flex justify-content-around bg-transparent border-top-0 pt-1 pb-2">
        <button class="btn btn-sm d-flex align-items-center gap-2 text-secondary" onclick="Swal.fire('Liked!', 'You liked this post.', 'success')">
            <i class="bi bi-hand-thumbs-up" style="font-size: 16px;"></i> Like
        </button>
        <button class="btn btn-sm d-flex align-items-center gap-2 text-secondary" onclick="Swal.fire('Comments Coming Soon!', 'Working on live interactions.', 'info')">
            <i class="bi bi-chat-left-text" style="font-size: 16px;"></i> Comment
        </button>
    </div>
</div>
`;
});
    } catch (err) {
        console.log("Catch Block Error:", err);
    }
};
// let imageInput = document.getElementById("imgInput");
// let previewImg = document.getElementById("previewImg");
// imageInput.addEventListener("change", function () {

//     const file = imageInput.files[0];

//     if (file) {

//         const reader = new FileReader();

//         reader.onload = function (e) {

//             previewImg.src = e.target.result;
//             previewImg.style.display = "block";

//         };

//         reader.readAsDataURL(file);

//     }

// });
// async function uploadImage() {

//     const file = document.getElementById("imgInput").files[0];

//     if (!file) {
//         console.log("No image selected");
//         return null;
//     }

//     const fileName = `${Date.now()}-${file.name}`;

//     console.log("Uploading file:", fileName);


//     const { error } = await supabase.storage
//         .from("post-images")
//         .upload(fileName, file);


//     if (error) {
//         console.log("Upload Error:", error);
//         return null;
//     }


//     const { data } = supabase.storage
//         .from("post-images")
//         .getPublicUrl(fileName);


//     console.log("Image URL:", data.publicUrl);


//     return data.publicUrl;
// }

async function post() {
    var title = document.getElementById("title");
    var description = document.getElementById("description");

    if (title.value.trim() && description.value.trim()) {
        let colorToSave = selectedTextColor || "#ffffff";
         // let imageUrl = await uploadImage();
        // console.log("IMAGE URL:", imageUrl);

        if (edited) {
            try {
                const { data, error } = await supabase
                    .from('post_app_table')
                    .update({
                        title: title.value,
                        description: description.value,
                        bg_img: cardBg,
                        text_color: colorToSave
                    })
                    .eq('id', editIndex)
                    .select();

                if (error) console.log(error);

                Swal.fire({
                    icon: "success",
                    title: "Updated!",
                    text: "Your post has been updated successfully.",
                });
                edited = false;
                editIndex = null;
                document.getElementById("postBtn").innerHTML = "Post";

            } catch (error) {
                console.log(error);
            }
        } else {
            try {
                const { data, error } = await supabase
                    .from('post_app_table')
                    .insert({
                        title: title.value,
                        description: description.value,
                        bg_img: cardBg,
                        text_color: colorToSave,
                        email: Email,
                        user_id: userid,
                        user_name: userName
                    })
                    .select();
                if (error) console.log(error);
            } catch (error) {
                console.log(error);
            }
        }

        title.value = "";
        description.value = "";
        cardBg = "";
        // previewImg.style.display = "none";
        // previewImg.src = "";
        location.reload();
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Title & description can't be empty!",
        });
    }
}

async function editPost(event, id, desc, titleVal, bg_img, textColor, currentTextColor, userId) {
    if (!userid) {
        Swal.fire({ icon: "error", title: "Login Required", text: "Please login first." });
        return;
    }

    if (userid !== userId) {
        Swal.fire({ icon: "error", title: "Access Denied", text: "You can only edit your own post." });
        return;
    }

    document.getElementById("title").value = titleVal;
    document.getElementById("description").value = desc;
    cardBg = bg_img;
    selectedTextColor = textColor || "#ffffff";
    
    edited = true;
    editIndex = id;
    let postBtn = document.getElementById("postBtn");
    if (postBtn) postBtn.innerHTML = "Update Post";
}

async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
        Swal.fire('Error', error.message, 'error');
        return;
    }
    Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        timer: 1200,
        showConfirmButton: false
    }).then(() => {
        window.location.href = 'index.html';
    });
}

function addImg(src) {
    cardBg = src;
    const images = document.querySelectorAll(".bgImg");
    images.forEach((img) => {
        img.classList.remove("addImg");
        if (img.getAttribute("src") === src) {
            img.classList.add("addImg");
        }
    });
}

async function delpost(event, id, UserId) {
    if (!userid) {
        Swal.fire("Error", "Please login first", "error");
        return;
    }

    if (userid !== UserId) {
        Swal.fire({ icon: "error", title: "Access Denied", text: "You can only delete your own post." });
        return;
    }

    let result = await Swal.fire({
        title: "Are you sure?",
        text: "This post will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    });

    if (!result.isConfirmed) return;

    const { error: deleteError } = await supabase
        .from("post_app_table")
        .delete()
        .eq("id", id);

    if (deleteError) {
        Swal.fire("Error", deleteError.message, "error");
        return;
    }

    Swal.fire("Deleted!", "Post deleted successfully.", "success");
    const card = event.target.closest(".card");
    if (card) card.remove();
}

function applycolor(element) {
    var colorbox = document.getElementsByClassName('colorbox');
    for (var i = 0; i < colorbox.length; i++) {
        colorbox[i].classList.remove('selected');
    }
    element.classList.add('selected');
    selectedTextColor = element.style.backgroundColor;
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    const icon = document.getElementById("themeIcon");
    if (icon) {
        if (theme === "dark") {
            icon.className = "bi bi-sun-fill";
        } else {
            icon.className = "bi bi-moon-fill";
        }
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nextTheme = current === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    const emailElements = document.querySelectorAll('.email-text-element');
    emailElements.forEach(el => {
        el.style.setProperty('color', (nextTheme === "dark" ? "#cbd5e1" : "#5c636a"), 'important');
    });
}

// Global functions scoping
window.logout = logout;
window.post = post;
window.addImg = addImg;
window.applycolor = applycolor;
window.editPost = editPost;
window.delpost = delpost;
window.searchPosts = searchPosts;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;

(function initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
})();