import supabase from "./supabase.js";

let edited = false;
var selectedTextColor = "";
var cardBg = "";
var title = document.getElementById("title");
var description = document.getElementById("description");
let editIndex = null;
let userName = "";
let userid;
let Email;

// 1. Popup menu ko toggle karne ka function
window.toggleProfileMenu = function () {
    const popup = document.getElementById("profilePopup");
    if (popup) {
        popup.classList.toggle("show");
    }
}

// Bahar click karne par dropdown auto close ho jaye
window.addEventListener("click", function (e) {
    const dropdown = document.querySelector(".profile-dropdown");
    const popup = document.getElementById("profilePopup");
    if (dropdown && popup && !dropdown.contains(e.target)) {
        popup.classList.remove("show");
    }
});

// FIXED HOISTING: Defined up here so window.onload and searchPosts can access it immediately
async function fetchLikeCounts() {
    try {
        const { data, error } = await supabase.from("like_table").select("post_id");
        if (error) throw error;

        // Group counts by post_id
        const counts = {};
        data.forEach(like => {
            counts[like.post_id] = (counts[like.post_id] || 0) + 1;
        });

        // Update DOM elements
        Object.keys(counts).forEach(postId => {
            const el = document.getElementById(`like-${postId}`);
            if (el) el.innerText = counts[postId];
        });
    } catch (err) {
        console.log("Error fetching initial likes:", err);
    }
}

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


        let currentTheme = localStorage.getItem('theme') || 'light';
        let emailColor = (currentTheme === "dark") ? "#cbd5e1" : "#475569";
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
        <button class="btn btn-sm d-flex align-items-center gap-2 text-secondary" onclick="toggleLike(${post.id})">
            <i class="bi bi-hand-thumbs-up" style="font-size: 16px;"></i><span id="like-${post.id}">0</span> Like
        </button>
        <button class="btn btn-sm d-flex align-items-center gap-2 text-secondary" onclick="Swal.fire('Comments Coming Soon!', 'Working on live interactions.', 'info')">
            <i class="bi bi-chat-left-text" style="font-size: 16px;"></i> Comment
        </button>
    </div>
</div>
`;
        });

        await fetchLikeCounts(); // Refresh on search render

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
    const imgInput = document.getElementById("imgInput");
    if (imgInput) {
        imgInput.addEventListener("change", previewFile);
    }

    // SYSTEM TO FETCH USER INFO SAFELY
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user) {
            userid = user.id;
            Email = user.email;
            userName = `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim();
            if (!userName) {
                userName = user.email.split("@")[0];
            }

            const firstLetter = userName.charAt(0).toUpperCase();

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

        postsContainer.innerHTML = "";
        let currentTheme = localStorage.getItem('theme') || 'light';
        let emailColor = (currentTheme === "dark") ? "#cbd5e1" : "#475569";
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

    <div class="card-footer bg-transparent border-top-0 pt-2 pb-2">
        <div class="d-flex justify-content-around w-100 mb-2">
            <button class="btn btn-sm d-flex align-items-center gap-2 text-secondary" onclick="toggleLike(${post.id})">
                <i class="bi bi-hand-thumbs-up" style="font-size: 16px;"></i><span id="like-${post.id}">0</span> Like
            </button>
            <button class="btn btn-sm d-flex align-items-center gap-2 text-secondary" onclick="toggleCommentSection(${post.id})">
                <i class="bi bi-chat-left-text" style="font-size: 16px;"></i> Comment
            </button>
        </div>
        
        <div id="comment-box-${post.id}" class="d-none w-100 mt-2 border-top pt-3">
            <div id="comments-list-${post.id}" class="mb-3 overflow-y-auto" style="max-height: 150px;"></div>
            
            <div class="input-group">
                <input type="text" id="comment-input-${post.id}" class="form-control bg-dark text-white border-secondary" placeholder="Write a comment..." style="font-size: 14px; padding: 10px;">
                <button class="btn px-4 fw-bold text-white" style="background-color: #14b8a6; border: none; transition: 0.2s;" onmouseover="this.style.backgroundColor='#0d9488'" onmouseout="this.style.backgroundColor='#14b8a6'" onclick="addComment(${post.id})">Send</button>
            </div>
        </div>
    </div>
</div>
`;
        });

        await fetchLikeCounts(); // Securely run now that it's positioned above
    } catch (err) {
        console.log("Catch Block Error:", err);
    }
};
async function toggleCommentSection(postId) {
    const commentBox = document.getElementById(`comment-box-${postId}`);
    if (!commentBox) return;

    // Toggle hidden class
    commentBox.classList.toggle("d-none");

    // Agar section khula hai toh purane comments fetch karke dikhao
    if (!commentBox.classList.contains("d-none")) {
        await fetchComments(postId);
    }
}
// New Comment input data ko table mein insert karne ka function
async function addComment(postId) {
    if (!userid) {
        Swal.fire("Error", "Please login first to comment.", "error");
        return;
    }

    const input = document.getElementById(`comment-input-${postId}`);
    if (!input) return;
    const text = input.value.trim();

    if (!text) return;

    try {
        const { error } = await supabase
            .from("comment_table")
            .insert({
                post_id: postId,
                user_id: userid,
                user_name: userName,
                comment_text: text
            });

        if (error) throw error;

        input.value = ""; // Input field ko khali karein

        // Live UI refresh karne ke liye list ko dobara fetch karein
        await fetchComments(postId);

        // Auto scroll to bottom taaki naya comment foran nazar aaye
        const container = document.getElementById(`comments-list-${postId}`);
        if (container) {
            container.scrollTop = container.scrollHeight;
        }

    } catch (err) {
        console.log("Error inserting comment:", err);
        Swal.fire("Error", "Could not submit your comment.", "error");
    }
}
// Database se kisi specific post ke saare comments fetch karne ka function
async function fetchComments(postId) {
    const container = document.getElementById(`comments-list-${postId}`);
    if (!container) return;

    try {
        const { data, error } = await supabase
            .from("comment_table")
            .select("*")
            .eq("post_id", postId)
            .order("id", { ascending: true }); // Purane comments upar, naye neeche

        if (error) throw error;

        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = `<p class="text-muted small ps-2 mb-1" style="font-size:12px;">No comments yet. Be the first to comment!</p>`;
            return;
        }

        // Loop chalakar saare comments ko dynamic HTML ke zariye render karein
        data.forEach(c => {
            container.innerHTML += `
                <div class="p-2 mb-1 rounded bg-dark text-start" style="font-size: 13px; border-left: 3px solid #14b8a6;">
                    <strong style="color: #14b8a6;">${c.user_name}:</strong> 
                    <span class="text-white-50" style="word-break: break-word;">${c.comment_text}</span>
                </div>
            `;
        });
        container.scrollTop = container.scrollHeight;

    } catch (err) {
        console.log("Error fetching comments:", err);
    }
}

async function toggleLike(postId) {
    if (!userid) {
        Swal.fire("Error", "Please login first to like posts.", "error");
        return;
    }

    try {
        const { data: likeData, error: likeError } = await supabase
            .from('like_table')
            .select("*")
            .eq('post_id', postId)
            .eq('user_id', userid);

        if (likeError) throw likeError;

        if (likeData && likeData.length > 0) {
            const { error: deleteError } = await supabase
                .from('like_table')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userid);
            if (deleteError) throw deleteError;
        } else {
            const { error: insertError } = await supabase
                .from("like_table")
                .insert({ post_id: postId, user_id: userid });
            if (insertError) throw insertError;
        }

        const { count } = await supabase.from('like_table').select('*', { count: 'exact', head: true }).eq('post_id', postId);
        document.getElementById(`like-${postId}`).innerText = count || 0;

    } catch (err) {
        console.log("Error in toggleLike handling:", err);
    }
}

async function post() {
    var title = document.getElementById("title");
    var description = document.getElementById("description");
    let imageInput = document.getElementById("imgInput");
    let previewImg = document.getElementById("previewImg");

    if (title.value.trim() && description.value.trim()) {
        let colorToSave = selectedTextColor || "#ffffff";
        let imageFile = imageInput ? imageInput.files[0] : null;
        let finalBgUrl = "";

        if (imageFile) {
            let fileExtension = imageFile.name.split('.').pop();
            let fileName = `${Date.now()}_${fileExtension}`;

            const { error: uploadError } = await supabase.storage.from('post-images').upload(fileName, imageFile);

            if (uploadError) {
                Swal.fire("Image Upload Failed!", "There was an error uploading the image.", "error");
                return;
            }

            const { data: imageData } = supabase.storage.from('post-images').getPublicUrl(fileName);
            finalBgUrl = imageData.publicUrl;

        } else if (cardBg) {
            finalBgUrl = cardBg;
        } else {
            Swal.fire("No Image Selected!", "Please select or upload an image for the post.", "error");
            return;
        }

        if (edited) {
            try {
                const { error } = await supabase
                    .from('post_app_table')
                    .update({
                        title: title.value,
                        description: description.value,
                        bg_img: finalBgUrl,
                        text_color: colorToSave
                    })
                    .eq('id', editIndex);

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
                const { error } = await supabase
                    .from('post_app_table')
                    .insert({
                        title: title.value,
                        description: description.value,
                        bg_img: finalBgUrl,
                        text_color: colorToSave,
                        email: Email,
                        user_id: userid,
                        user_name: userName
                    });

                if (error) {
                    console.log("Database Insert Error:", error);
                }
            } catch (error) {
                console.log(error);
            }
        }

        title.value = "";
        description.value = "";
        cardBg = "";
        if (imageInput) imageInput.value = "";
        if (previewImg) {
            previewImg.classList.add("d-none");
            previewImg.src = "";
        }
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
    const card = event.target.closest(".card");
    if (card) card.remove();
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
        window.location.href = 'login.html';
    });
}

function previewFile(e) {
    const previewImg = document.getElementById("previewImg");
    const file = e.target.files[0];

    if (!file) return;

    previewImg.src = URL.createObjectURL(file);
    previewImg.classList.remove("d-none");
    previewImg.style.display = "block";

    cardBg = "";
    document.querySelectorAll(".bgImg").forEach(img => {
        img.classList.remove("addImg");
    });
}

function addImg(src) {
    cardBg = src;
    let imageInput = document.getElementById("imgInput");
    let previewImg = document.getElementById("previewImg");
    if (imageInput) imageInput.value = "";
    if (previewImg) {
        previewImg.classList.add("d-none");
        previewImg.src = "";
    }

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
        icon.style.setProperty('color', '#ffffff', 'important');
    }
}
function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const nextTheme = current === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    
    const emailElements = document.querySelectorAll('.email-text-element');
    emailElements.forEach(el => {
        el.style.setProperty('color', (nextTheme === "dark" ? "#cbd5e1" : "#475569"), 'important');
    });
}
// Global functions scoping
window.logout = logout;
window.post = post;
window.addImg = addImg;
window.previewFile = previewFile;
window.applycolor = applycolor;
window.editPost = editPost;
window.delpost = delpost;
window.searchPosts = searchPosts;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;
window.toggleProfileMenu = toggleProfileMenu;
window.toggleLike = toggleLike;
window.fetchLikeCounts = fetchLikeCounts;
window.toggleCommentSection = toggleCommentSection;
window.addComment = addComment;
window.fetchComments = fetchComments;


(function initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
})();