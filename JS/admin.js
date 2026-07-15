import supabase from "../supabase.js";

const admin_Email = "admin@gmail.com";

// DOM Load Event
window.addEventListener("DOMContentLoaded", async () => {
    console.log("Admin page successfully loaded, initializing data...");
    await checkAdminSecurity(); // Security pehle check hogi
});

// Security Check
async function checkAdminSecurity() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        window.location.href = "login.html";
        return;
    }

    if (user.email !== admin_Email) {
        Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'You are not authorized to view this page!',
            confirmButtonColor: '#d33'
        }).then(() => {
            window.location.href = "dashboard.html";
        });
        return;
    }

    console.log("Welcome admin!", user.email);

    // Agar login check ok ho, toh sara data load karein
    await fetchStats();
    await loadAllPost();
    await loadAllComments();
}
// async function fetchStats() {
//     try {
//         const { count, error } = await supabase
//             .from('post_app_table')
//             .select('*', { count: 'exact', head: true });

//         if (error) {
//             console.log(error);
//             return;
//         }

//         // Error Fix: 'totalPosts' ki jagah 'count' variable use kiya jo upar destructure ho raha hai
//         document.getElementById("stat-posts").innerText = count || 0;

//     } catch (error) {
//         console.log(error);
//     }
// }

// 1. Fetch statistics
async function fetchStats() {
    try {
        const { count: postsCount, error: postErr } = await supabase
            .from('post_app_table')
            .select('*', { count: 'exact', head: true });

        const { count: commentsCount, error: commentErr } = await supabase
            .from('comment_table')
            .select('*', { count: 'exact', head: true });

        const { count: likesCount, error: likeErr } = await supabase
            .from('like_table')
            .select('*', { count: 'exact', head: true });

        if (postErr) console.error("Post stats error:", postErr);
        if (commentErr) console.error("Comment stats error:", commentErr);
        if (likeErr) console.error("Like stats error:", likeErr);

        const totalPostsEl = document.getElementById("total-posts");
        const totalCommentsEl = document.getElementById("total-comments");
        const totalLikesEl = document.getElementById("total-likes");
        if (totalPostsEl) {
            totalPostsEl.innerText = postsCount || 0; 
        }
        if (totalCommentsEl) totalCommentsEl.innerText = commentsCount || 0;
        if (totalLikesEl) totalLikesEl.innerText = likesCount || 0;

    } catch (err) {
        console.error("Error in fetchStats:", err);
    }
}
// async function loadAllPost() {
//     try {
//         const { data, error } = await supabase
//             .from("post_app_table")
//             .select("*")
//             .order("id", { ascending: false });

//         if (error) {
//             console.log("Error:", error);
//             return;
//         }

//         console.log("All Posts:", data);


//     } catch (error) {
//         console.log(error);
//     }
// }
// 2. Load Posts Table
async function loadAllPost() {
    try {
        const { data: posts, error } = await supabase
            .from('post_app_table')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const tableBody = document.getElementById("posts-table-body");
        if (!tableBody) return;

        if (posts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No posts available.</td></tr>`;
            return;
        }

        tableBody.innerHTML = "";

        posts.forEach((post, index) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>
                        <strong>${post.user_name || 'Anonymous'}</strong><br>
                        <small class="text-muted">${post.email || ''}</small>
                    </td>
                    <td>${post.title || 'No Title'}</td>
                    <td class="text-truncate" style="max-width: 250px;">${post.description || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deletePost('${post.id}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                       

                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading posts:", err);
    }
}
 //<button type="button" class="btn btn-info text-white" onclick="updatePostData()">edited</button>
// 3. Load Comments Table
async function loadAllComments() {
    try {
        const { data: comments, error } = await supabase
            .from('comment_table')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const tableBody = document.getElementById("comments-table-body");
        if (!tableBody) return;

        if (comments.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No comments available.</td></tr>`;
            return;
        }

        tableBody.innerHTML = "";

        comments.forEach((comment, index) => {
            tableBody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${comment.user_name || 'Anonymous'}</strong></td>
                    <td>${comment.comment_text || comment.text || 'No comment text'}</td>
                    <td>Post #${comment.post_id || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="deleteComment('${comment.id}')">
                            <i class="bi bi-trash"></i> Delete
                        </button>
                       
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error("Error loading comments:", err);
    }
}
 // <button type="button" class="btn btn-info  text-white" onclick="updatecommentData()">edited</button>
function openEditMode(id, title, description) {
    document.getElementById('edit-post-id').value = id;
    document.getElementById('edit-post-title').value = title;
    document.getElementById('edit-post-desc').value = description;

    // Bootstrap modal show karne ke liye
    const editModal = new bootstrap.Modal(document.getElementById('editPostModal'));
    editModal.show();
}
async function updatePostData(){
    const postId = document.getElementById('edit-post-id').value;
    const updatedTitle = document.getElementById('edit-post-title').value;
    const updatedDesc = document.getElementById('edit-post-desc').value;

    if (!updatedTitle.trim() || !updatedDesc.trim()) {
        Swal.fire({
            icon: 'error',
            title: 'Fields Empty',
            text: 'Title and Description cannot be empty!',
            background: '#15222e',
            color: '#f3f4f6'
        });
        return;
    }

    try {
        const { error } = await supabase
            .from('post_app_table')
            .update({ 
                title: updatedTitle, 
                description: updatedDesc 
            })
            .eq('id', postId);

        if (error) throw error;

        // Modal close karne ke liye
        const modalEl = document.getElementById('editPostModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }

        // Success Alert
        Swal.fire({
            title: 'Updated!',
            text: 'Post has been updated successfully.',
            icon: 'success',
            iconColor: '#10b981',
            background: '#15222e',
            color: '#f3f4f6',
            timer: 1500,
            showConfirmButton: false
        });

        // UI refresh
        await loadAllPost();

    } catch (err) {
        Swal.fire({
            title: 'Error!',
            text: err.message,
            icon: 'error',
            background: '#15222e',
            color: '#f3f4f6'
        });
        console.error("Update error:", err);
    }
}
// 4. Delete Post
async function deletePost(postId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this post!",
        icon: 'warning',
        iconColor: '#f59e0b',
        showCancelButton: true,
        confirmButtonColor: '#0d9488',
        cancelButtonColor: '#e11d48',
        confirmButtonText: '<i class="bi bi-trash"></i> Yes, delete it!',
        cancelButtonText: 'Cancel',
        background: '#15222e',
        color: '#f3f4f6',
        customClass: { popup: 'rounded-4 border border-secondary shadow-lg' }
    });

    if (result.isConfirmed) {
        try {
            const { error } = await supabase
                .from('post_app_table')
                .delete()
                .eq('id', postId);

            if (error) throw error;

            Swal.fire({
                title: 'Deleted!',
                text: 'Post has been removed.',
                icon: 'success',
                iconColor: '#10b981',
                background: '#15222e',
                color: '#f3f4f6',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-4 border border-secondary' }
            });

            await loadAllPost();
            await fetchStats();

        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error',
                background: '#15222e',
                color: '#f3f4f6'
            });
        }
    }
}

// 5. Delete Comment
async function deleteComment(commentId) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "This comment will be permanently deleted!",
        icon: 'warning',
        iconColor: '#f59e0b',
        showCancelButton: true,
        confirmButtonColor: '#0d9488',
        cancelButtonColor: '#e11d48',
        confirmButtonText: '<i class="bi bi-trash"></i> Yes, delete it!',
        cancelButtonText: 'Cancel',
        background: '#15222e',
        color: '#f3f4f6',
        customClass: { popup: 'rounded-4 border border-secondary shadow-lg' }
    });

    if (result.isConfirmed) {
        try {
            const { error } = await supabase
                .from('comment_table')
                .delete()
                .eq('id', commentId);

            if (error) throw error;

            Swal.fire({
                title: 'Deleted!',
                text: 'Comment has been removed.',
                icon: 'success',
                iconColor: '#10b981',
                background: '#15222e',
                color: '#f3f4f6',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'rounded-4 border border-secondary' }
            });

            await loadAllComments();
            await fetchStats();

        } catch (err) {
            Swal.fire({
                title: 'Error!',
                text: err.message,
                icon: 'error',
                background: '#15222e',
                color: '#f3f4f6'
            });
        }
    }
}

// 🚀 clean and safe global tab-switching logic
function showSection(sectionId) {
    // 1. Sabhi sections dhoondein aur unpar 'd-none' class laga dein (hidden)
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(sec => {
        sec.classList.add('d-none');
    });

    // 2. Sirf select kiye gaye section se 'd-none' remove karein (visible)
    const targetSection = document.getElementById('section-' + sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }

    // 3. Sidebar links ki active styling update karein
    const links = document.querySelectorAll('.sidebar .nav-link');
    links.forEach(link => link.classList.remove('active'));

    // Sidebar buttons ki simple IDs match karne ke liye
    const activeLink = document.getElementById('tab-' + sectionId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Globals set karein taaki HTML inline onclick seamlessly kaam karein
window.showSection = showSection;
window.deletePost = deletePost;
window.deleteComment = deleteComment;
window.fetchStats = fetchStats;
window.loadAllPost = loadAllPost;
window.loadAllComments = loadAllComments;
window.updatePostData=updatePostData
window.openEditMode=openEditMode