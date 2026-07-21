
window.currentUser = null;



function showLogin () {

    const loginContainer = document.getElementById("login-container");

    loginContainer.innerHTML =
        `<div class="login-card"> 
            <h2>Login</h2>
        
            <input
                id="username"
                type="text"
                placeholder="Username"
            >
        
            <input
                id="password"
                type="password"
                placeholder="Password"
        
            >
        
            <button id="loginButton">Log In</button>

            <p id="login-message"></p>
        
            </div>`;

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
        
        console.log("Login successful");
        console.log("Welcome:", user.name);
        console.log("Role:", user.role);
        console.log("Current User:", window.currentUser);

        document.getElementById("login-container").style.display = "none";

        document.getElementById("calendar-container").style.display = "block";

        showCalendar();
    }
        else {
            document.getElementById("login-message").textContent = "Invalid username or password";
        }

    
}

