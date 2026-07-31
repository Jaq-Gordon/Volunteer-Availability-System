//For Admin features
function initializeAdmin() {

    if (window.currentUser?.role === "admin") {

        document.getElementById("calendarButton").style.display = "block";

        document.getElementById("usersButton").style.display = "block";

        document.getElementById("usersButton").addEventListener("click", openAdminPage);

        document.getElementById("calendarButton").addEventListener("click", openCalendarPage);

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

                 <button 
                    id="viewAvailabilityButton"
                    class="btn btn-outline-primary">
                    View Availability
                </button>

            </div>

        </div>

        <div id="users-table-container"></div>

        <div id="availability-list-container"></div>



    </div>

</div>

    <div class="modal" id="reminderModal">
    <div class="modal-dialog">
    <div class="modal-content">
    <div class="modal-header">

    <h5 class="modal-title">
    Send Availability Reminder
    </h5>

    <button
        id="closeReminderModal"
        type="button"
        class="btn-close">
    </button>

    </div>
    <div class="modal-body">
    <label>
    Dates:
    </label>

    <input id="reminderDates" class="form-control" Placeholder="Example: July 28 - August 3">

    </div>

    <div class="modal-footer">

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

    document.getElementById("closeReminderModal").addEventListener("click", function () {

    document.getElementById("reminderModal").style.display = "none";

});

    document.getElementById("reminderModal").addEventListener("click", function(event) {
    const modal = document.getElementById("reminderModal");

    if (event.target === this) {
        modal.style.display = "none";
        }
    });

    document.getElementById("confirmSendReminder").addEventListener("click", sendReminderEmail);
    document.getElementById("viewAvailabilityButton").addEventListener("click", showAvailabilityList);

    console.log("User management rendered");

    loadUsers();

}

async function showAvailabilityList() {
    console.log("Loading admin availability");

    const { data, error } = await supabaseClient
        .from("availability")
        .select(`
            date,
            users(name),
            status,
            notes
            
        `)
        .order("date", { ascending: true });

        if (error) {
        console.log(error);
        return;
    }


    const container = document.getElementById(
        "availability-list-container"
    );

    container.innerHTML = `

        <div class="admin-card">

            <h3>Availability</h3>

            <table class="table table-striped availability-table">

                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Volunteer</th>
                        <th>Status</th>
                        <th>Notes</th>
                    </tr>
                </thead>


                <tbody>

                    ${data.map(function(entry) {

                        return `
                            <tr>
                                <td>${entry.date}</td>
                                <td>${entry.users.name}</td>
                                <td>${entry.status}</td>
                                <td>${entry.notes || ""}</td>
                            </tr>
                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>

    `;
console.log(data);
}



//Return to calendar

function openCalendarPage() {

    document.getElementById("admin-page").style.display = "none";
    document.getElementById("calendar-page").style.display = "block";

    showCalendar();

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

     const existingModal = document.getElementById("addUserModal");

    if (existingModal) {
        existingModal.remove();
    }

    const generatedPassword = generatePassword();
    console.log("Generated password:", generatedPassword);

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

    <input 
    id="new-password" 
    type="text" 
    class="form-control mb-3" 
    value="${generatedPassword}"
    readonly
    >

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

     const emailSent = await sendWelcomeEmail(
        name,
        username,
        email,
        password
    );

    if (!emailSent) {
        alert("User created, but welcome email failed.");

    } else {
        alert("User added successfully");
    }

    const modalElement = document.getElementById("addUserModal");

    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
        modal.hide()

        setTimeout(() => {
        modalElement.remove();
        }, 300);
    }

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




