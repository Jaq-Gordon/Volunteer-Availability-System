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
    <div class="admin-dashboard">

    <h2>
        Admin Dashboard
    </h2>

    <div class="admin-card">

        <div class="admin-header">

        <h3> User Management </h3>


            <div class="admin-actions">

                <button
                    id="addUserButton"
                    class="btn btn-primary">
                    Add User
                </button>

                <button
                    id="sendReminderButton"
                    class="btn btn-outline-primary">
                    Send Email
                </button>

            </div>

        </div>


        <div id="users-table-container"></div>


    </div>

</div>

    <div class="modal" id="reminderModal">
    <div class="modal-dialog">
    <div class="modal-content">
    <div class="modal-header">

    <h5 class="modal-title">
    Send Availability Reminder
    </h5>

    </div>
    <div class="modal-body">
    <label>
    Dates:
    </label>

    <input id="reminderDates" class="form-control" Placeholder="Example: July 28 - August 3">

    </div>

    <div class="modal-footer">

<button id="closeReminderModal" class="btn btn-secondary">
Cancel
</button>

<button id="confirmSendReminder" class="btn btn-primary">
Send
</button>

    </div>

    </div>

    </div>

    </div>
`;


    document.getElementById("addUserButton").addEventListener("click", showAddUserModal);

    document.getElementById("sendReminderButton").addEventListener("click", function() {
    
        document.getElementById("reminderModal").style.display = "block";

});

    document.getElementById("confirmSendReminder").addEventListener("click", sendReminderEmail);

    console.log("User management rendered");

    loadUsers();

}

//User table

async function loadUsers() {

    console.log("loadUsers started");

    const { data: users, error } = await supabaseClient
        .from("users")
        .select("*")
        .order("name");

    if (error) {
        console.error(error);
        return;
    }

    const container = document.getElementById("users-table-container");

    container.innerHTML = `
     <table class="table table-hover align-middle">
     <thead class="table-light">
        <tr>
        <th>Name</th>
        <th>Username</th>
        <th>Email</th>
        <th>Role</th>
        <th>Action</th>
        </tr>
     </thead>

    <tbody>

    ${users.map(user => `

    <tr>

    <td>${user.name}</td>

    <td>${user.username}</td>

    <td>${user.email}</td>

    <td>${user.role}</td>

    <td>

     ${user.role === "admin" ? `<span class="badge bg-success">Admin</span>`

    : `<button class="btn btn-sm btn-outline-primary" onclick="promoteUser('${user.id}')">
            Promote
     </button>`
        }

    </td>

    </tr>

    `).join("")}

    </tbody>

    </table>
    `;
}

function showAddUserModal() {

    const modalHTML = `
    <div class="modal fade" id="addUserModal" tabindex="-1">

    <div class="modal-dialog">
    <div class="modal-content">
    <div class="modal-header">

    <h5 class="modal-title">
    Add User
    </h5>

    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
    </div>



    <div class="modal-body">

    <input id="new-name"class="form-control mb-3"placeholder="Name">

    <input id="new-username" class="form-control mb-3" placeholder="Username">

    <input id="new-email"class="form-control mb-3"placeholder="Email">

    <input id="new-password"type="password"class="form-control mb-3" placeholder="Password">

    </div>

    <div class="modal-footer">

    <button class="btn btn-secondary"data-bs-dismiss="modal">Cancel</button>

    <button id="saveUserButton"class="btn btn-primary">Save User </button>


    </div>

    </div>

    </div>

    </div>
    `;


    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = new bootstrap.Modal( document.getElementById("addUserModal"));

    modal.show();

    document.getElementById("saveUserButton").addEventListener("click",addUser);

}
async function addUser() {

    const name = document.getElementById("new-name").value;
    const username = document.getElementById("new-username").value;
    const email = document.getElementById("new-email").value;
    const password = document.getElementById("new-password").value;


    const { data, error } = await supabaseClient
        .from("users")
        .insert([
            {
                name: name,
                username: username,
                email: email,
                password: password,
                role: "volunteer"
            }
        ]);


    if (error) {

        console.error(error);
        alert("Unable to add user");
        return;

    }
    alert("User added successfully");

    document.getElementById("addUserModal").remove();

    loadUsers();

}

//admin promotion
async function promoteUser(userId) {

// Check how many admins exist
const { data: admins, error: adminError } = await supabaseClient
    .from("users")
    .select("id")
    .eq("role", "admin");

    if (adminError) {

        console.error(adminError);
        return;
    }

    if (admins.length >= 2) {

        alert("Maximum of two administrators allowed.");
        return;

    }


// Promote user
const { error } = await supabaseClient
    .from("users")
    .update({
    role: "admin"
    })
    .eq("id", userId);

    if (error) {

        console.error(error);
        alert("Unable to promote user");
        return;

    }

    alert("User promoted to Admin");

    loadUsers();

}


