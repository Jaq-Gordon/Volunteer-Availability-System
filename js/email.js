

async function sendReminderEmail() {

    console.log("Sending reminder emails...");

    const dates = document.getElementById("reminderDates").value;

    console.log("Dates entered:", dates);

    const { data: volunteers, error } = await supabaseClient
        .from("users")
        .select("name, email")
        .eq("role", "volunteer")
        .not("email", "is", null);

    if (error) {
        console.error(error);
        alert("Could not find volunteers");
        return;
    }

    try {

    for (const volunteer of volunteers) {

        console.log(`Sending email to ${volunteer.name} (${volunteer.email})`);
        console.log("Volunteer:", volunteer);

        if (!volunteer.email) {
        continue;
        }

        console.log("Sending data:", {
        name: volunteer.name,
        email: volunteer.email,
        dates: dates
    });
        await emailjs.send(
            "service_54k9yph",
            "template_i4nuspr",
            {
                name: volunteer.name,
                email: volunteer.email,
                dates: dates
            }
        );

    }

        alert("Reminder emails sent!");
    } 

    catch(err) {
        console.error(err);
        alert("unable to send reiminder emails.")
    }
}