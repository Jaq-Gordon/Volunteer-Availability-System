//Functions need to share the date variable
let selectedDate = null;
let calendar = null;

document.addEventListener("DOMContentLoaded", function() {

    showLogin();
})



async function showCalendar() {

    const calendarEl = document.getElementById("calendar-container");

      let query = supabaseClient
        .from("availability")
        .select(`*, users(name)`);

    if (window.currentUser.role === "volunteer") {

        query = query.eq(
            "user_id",
            window.currentUser.id
        );

    }

    const { data, error } = await query;

    console.log("Database availability:", data);

    if (error) {
        console.log(error);
        return;
    }

    console.log("Availability data:", data);

    const events = data.map(function(entry) {
        return {
            title: `${entry.users.name} - ${entry.status}`,
            start: entry.date,

            extendedProps: {
                status: entry.status,
                notes: entry.notes
            }
        };
    });
    console.log("Calendar events:", events);

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: events,

        //pass an object to the function containing information about the date clicked
        dateClick: function(info) {

            console.log("Date clicked:", info.dateStr);

            showAvailabilityForm(info.dateStr);
        }
    });

    calendar.render();

}

async function refreshCalendar() {

    let query = supabaseClient
        .from("availability")
        .select(`*, users(name)`);

    if (window.currentUser.role === "volunteer") {

        query = query.eq(
            "user_id",
            window.currentUser.id
        );

    }

    const { data, error } = await query;

    if (error) {
        console.log(error);
        return;
    }

    const events = data.map(function(entry) {
        return {
            title: `${entry.users.name} - ${entry.status}`,
            start: entry.date
        };
    });

    calendar.removeAllEvents();
    calendar.addEventSource(events);
}

//function to add availability details

function showAvailabilityForm(date) {

    selectedDate = date;

    console.log("Opening availability form:", date);

    const container = document.getElementById("availability-container");

  
    container.innerHTML =

        `<div class="availability-card">

            <h2>Availability</h2>

            <p>Date: ${date}</p>

            <label for="status">Status</label>

            <select id="status">
                <option>Available</option>
                <option>Not Available</option>
            </select>

            <label for="notes">Notes</label>

            <textarea
                id="notes"
                placeholder="Optional notes"
            ></textarea>

            <button id="saveAvailability">
                Save
            </button>
        </div>`;

    document.getElementById("saveAvailability").addEventListener("click", saveAvailability);
}

//Save function to record entry 
async function saveAvailability() {
    
    console.log("Save button clicked");

    const status = document.getElementById("status").value;
    const notes = document.getElementById("notes").value;

    const { data: existingEntry, error: fetchError } = await supabaseClient
        .from("availability")
        .select("*")
        .eq("user_id", window.currentUser.id)
        .eq("date", selectedDate)
        .maybeSingle();

     if (fetchError) {
        console.log(fetchError);
        return;
    }

    if (existingEntry) {

   const { error } = await supabaseClient
        .from("availability")
        .update({
        status: status,
        notes: notes
    })
        .eq("id", existingEntry.id);

    if (error) {
    console.log(error);
    return;
    }

} else {

   const { error } = await supabaseClient
    .from("availability")
    .insert([
        {
            user_id: window.currentUser.id,
            date: selectedDate,
            status: status,
            notes: notes
        }
    ]);

if (error) {
    console.log(error);
    return;
}

}

    console.log("Availability saved!");
    
    await refreshCalendar();

}
