
window.currentUser = null;



function showLogin () {

    const loginContainer = document.getElementById("login-container");

    loginContainer.innerHTML =
    `<section class="login-page">

    <div class="container py-5">
        <div class="row g-0 justify-content-center align-items-center">

            <!-- Login Card -->
            <div class="col-lg-10">

                <div class="card shadow rounded-4 overflow-hidden">

                    <div class="row g-0">

                        <!-- Left Side -->
                        <div class="col-lg-6">

                            <div class="card-body p-md-5">

                                <div class="text-center mb-4">

                                    <i class="bi bi-calendar-check login-icon"></i>

                                    <h2 class="mt-3">
                                        Volunteer Availability
                                    </h2>

                                </div>


                                <form>

                                    <div class="mb-4">

                                        <label class="form-label">
                                            Username
                                        </label>

                                        <input 
                                            id="username"
                                            type="text"
                                            class="form-control"
                                        >

                                    </div>


                                    <div class="mb-4">

                                        <label class="form-label">
                                            Password
                                        </label>

                                        <input 
                                            id="password"
                                            type="password"
                                            class="form-control"
                                        >

                                    </div>


                                    <div class="text-center">

                                        <button 
                                            id="loginButton"
                                            type="button"
                                            class="btn login-button px-5">

                                            Log In

                                        </button>

                                    </div>


                                    <p id="login-message" class="text-center mt-3"></p>


                                </form>


                            </div>

                        </div>


                        <!-- Image Side -->
                        <div class="col-lg-6">

                            <img 
                                src="images/workers.jpg"
                                class="w-100 h-100 object-fit-cover"
                                alt="Workers">

                        </div>


                    </div>

                </div>

            </div>

        </div>

    </div>

</section>`;


        document
            .getElementById("loginButton")
            .addEventListener("click", login);

}

//Async function says wait for the database to respond before login
async function login() {

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    //Expect to query user table, all columns, with correct username and password for one user
    const { data, error } = await supabaseClient
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .maybeSingle();

    const user = data;

    if (user) {

        window.currentUser = user;

        document.getElementById("user-info").textContent =`Welcome ${user.name} `;
        
        console.log("Login successful");
        console.log("Welcome:", user.name);
        console.log("Role:", user.role);
        console.log("Current User:", window.currentUser);

        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-navbar").style.display = "flex"; 
        document.getElementById("calendar-page").style.display = "block";
        

        initializeAdmin();

        showCalendar();

    }
        else {
            document.getElementById("login-message").textContent = "Invalid username or password";
        }

    
}

function logout() {

        window.currentUser =null;


        document.getElementById("main-navbar").style.display = "none";
        document.getElementById("calendar-page").style.display = "none";
        document.getElementById("admin-page").style.display = "none";
        document.getElementById("login-container").style.display = "block";

        document.getElementById("usersButton").style.display = "none";

        document.getElementById("username").value = "";
        document.getElementById("password").value = "";
        document.getElementById("login-message").textContent = "";
        
        document.getElementById("user-info").textContent = "";
    }

     document.getElementById("logoutButton").addEventListener("click", logout);

     
   
   
   
