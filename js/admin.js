//For Admin features
function initializeAdmin() {

    if (window.currentUser?.role === "admin") {

        document.getElementById("usersButton").style.display = "block";

        document.getElementById("usersButton").addEventListener("click", openAdminPage);

    }

}

//Navigation/Admin View

function openAdminPage() {

    document.getElementById("calendar-page").style.display = "none";

    document.getElementById("admin-page").style.display = "block";

    showUserManagement();

}

//For user management

async function showUserManagement() {

    const container = document.getElementById("user-management-container");

    container.innerHTML = `
        <h3 class="mt-4">Users</h3>
        <div id="users-list"></div>
    `;

   const { data, error } = await supabaseClient
        .from("users")
        .select("name, username, email, role");

    if (error) {
        console.log(error);
        return;
    }

    console.log("Users:", data);

}


