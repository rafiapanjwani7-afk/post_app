import supabase from "./supabase.js";

let edited = false;
var selectedTextColor = "";
var cardBg = "";
var title = document.getElementById("title");
var description = document.getElementById("description");
let editIndex = null;

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

        data.forEach(post => {
            // Agar color empty ho toh default white `#ffffff` set hoga
            let currentTextColor = post.text_color || "#ffffff";

            postsContainer.innerHTML += `
<div class="card mb-3">
    <div class="card-header d-flex justify-content-between">
        <span>~post ${post.id}</span>
        <div>
            <button class="btn btn-sm btn-edit text-warning"
            onclick="editPost(event, ${post.id}, '${post.description}', '${post.title}', '${post.bg_img}', '${currentTextColor}', '${post.user_id}')">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm btn-delete text-danger"
            onclick="delpost(event,${post.id}, '${post.user_id}')">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    </div>
    <div class="card-body" style="background-image:url('${post.bg_img}');background-size:cover;background-position:center;">
        <h4 style="color:${currentTextColor}">${post.title}</h4>
        <p style="color:${currentTextColor}">${post.description}</p>
    </div>
</div>
`;
        });
        console.log(data);
        if (!data.length) {
            Swal.fire({
                icon: "info",
                title: "No Results",
                text: "No posts found matching your search."
            });
            postsContainer.innerHTML = "<p class='text-center'>No posts found.</p>";
        }
        if (error) {
            console.log("Error searching posts:", error);
            return;
        }
    } catch (error) {
        console.log("Error searching posts:", error);
    }
}

window.onload = async function () {
    const postsContainer = document.getElementById("posts");

    try {
        const { data, error } = await supabase
            .from('post_app_table')
            .select("*")
            .order('id', { ascending: false });

        if (error) {
            console.log("Supabase Error:", error);
            return;
        }

        if (!data) {
            console.log("No data found");
            return;
        }

        data.forEach(post => {
            let currentTextColor = post.text_color || "#ffffff";

            postsContainer.innerHTML += `
<div class="card mb-3">
    <div class="card-header d-flex justify-content-between">
        <span> ${post.id}~${post.email}</span>
        <div>
            <button class="btn btn-sm"
            onclick="editPost(event, ${post.id}, '${post.description}', '${post.title}', '${post.bg_img}', '${post.text_color}' ,'${currentTextColor}', '${post.user_id}')">
                <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm"
            onclick="delpost(event,${post.id}, '${post.user_id}')">
                <i class="bi bi-trash"></i>
            </button>
        </div>
    </div>
    <div class="card-body" style="background-image:url('${post.bg_img}');background-size:cover;background-position:center;">
        <h4 style="color:${currentTextColor}">${post.title}</h4>
        <p style="color:${currentTextColor}">${post.description}</p>
    </div>
</div>
`;
        });

    } catch (err) {
        console.log("Catch Error:", err);
    }
};
let userid;
let Email;
async function post() {
    var title = document.getElementById("title");
    var description = document.getElementById("description");
    var posts = document.getElementById("posts");

    if (title.value.trim() && description.value.trim()) {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            console.log(user.email);
            userid = user.id;
            Email = user.email;
            if (error) console.log(error);
        } catch (error) {
            console.log(error);
        }

        // Agar koi color select nahi kiya, toh default white text rahega
        let colorToSave = selectedTextColor || "#ffffff";

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
                        user_id: userid
                    })
                    .select();
                if (error) console.log(error);
            } catch (error) {
                console.log(error);
            }
        }

        title.value = "";
        description.value = "";
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

    let user;

    try {
        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            Swal.fire({
                icon: "error",
                title: "Login Required",
                text: "Please login first."
            });
            return;
        }

        user = data.user;

    } catch (error) {
        console.log(error);
        return;
    }

    if (user.id !== userId) {
        Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You can only edit your own post."
        });
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
    postBtn.innerHTML = "Update Post";
}
// Dummy logout function added just in case window requires it globally
async function logout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
        Swal.fire('Error', error.message, 'error')
        return
    }

    Swal.fire({
        icon: 'success',
        title: 'Logged Out'
    }).then(() => {
        window.location.href = 'index.html'
    })
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

    let user;
    let result;

    try {

        const { data, error } = await supabase.auth.getUser();

        if (error || !data.user) {
            Swal.fire("Error", "Please login first", "error");
            return;
        }

        user = data.user;

        if (user.id !== UserId) {
            Swal.fire({
                icon: "error",
                title: "Access Denied",
                text: "You can only delete your own post."
            });
            return;
        }

        result = await Swal.fire({
            title: "Are you sure?",
            text: "This post will be deleted permanently!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!"
        });

    } catch (error) {
        console.log(error);
        return;
    }

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

window.logout = logout;
window.post = post;
window.addImg = addImg;
window.applycolor = applycolor;
window.editPost = editPost;
window.delpost = delpost;
window.searchPosts = searchPosts;
window.applyTheme = applyTheme;
window.toggleTheme = toggleTheme;




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
    applyTheme(current === "dark" ? "light" : "dark");
}
window.toggleTheme = toggleTheme;

(function initTheme() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (prefersDark ? 'dark' : 'light');
    applyTheme(theme);
})();