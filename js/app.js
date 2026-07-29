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

    let events = [];
    
    if (window.currentUser.role === "volunteer") {

    events = data.map(function(entry) {
        return {
            title: "",
            start: entry.date,

            className: entry.status === "Available"
                ? "available-event"
                : "unavailable-event",

            extendedProps: {
                status: entry.status,
                notes: entry.notes
            }
        };
    });

    }
    else if (window.currentUser.role === "admin") {

        let dailyCounts = {};

        data.forEach(function(entry) {
            if (!dailyCounts[entry.date]) {
                dailyCounts[entry.date] = {
                    available: 0,
                    unavailable: 0
                };
            }
             if (entry.status === "Available") {

            dailyCounts[entry.date].available++;

            } else {

            dailyCounts[entry.date].unavailable++;

            }
        });

        events = Object.keys(dailyCounts).map(function(date) {

        let summary = "";

        if (dailyCounts[date].available > 0) {

            summary += `Available: ${dailyCounts[date].available} `;
        }

        if (dailyCounts[date].unavailable > 0) {

            summary += `Not Available: ${dailyCounts[date].unavailable}`;
        }

        return {
            title: "",
            start: date,
            classNames: ["admin-summary-event"],

            extendedProps: {
                available: dailyCounts[date].available,
                unavailable: dailyCounts[date].unavailable
        }

    };

    });
}


    console.log("Calendar events:", events);

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        eventDisplay: "dot",
        events: events,

        eventContent: function(info) {
            if (window.currentUser.role === "admin") {
                const available = info.event.extendedProps.available || 0;
                const unavailable = info.event.extendedProps.unavailable || 0;

                return {
                    html: 
                    ` <div class="admin-summary">
                    <span class="available-event"></span>
                    ${available}

                    <span class="unavailable-event"></span>
                    ${unavailable}
                </div>`

                };
            }
        },
    
    

        //pass an object to the function containing information about the date clicked
        dateClick: function(info) {

            console.log("Date clicked:", info.dateStr);

            showAvailabilityForm(info.dateStr);
        }
    });

    calendar.render();

}

async function refreshCalendar() {

    console.log("refreshCalendar started");

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

    let events = [];


    if (window.currentUser.role === "volunteer") {

        events = data.map(function(entry) {

            return {
                title: "",
                start: entry.date,

                className: entry.status === "Available"
                    ? "available-event"
                    : "unavailable-event"
            };

        });

    }


    else if (window.currentUser.role === "admin") {

        let dailyCounts = {};

        data.forEach(function(entry) {

            if (!dailyCounts[entry.date]) {

                dailyCounts[entry.date] = {
                    available: 0,
                    unavailable: 0
                };

            }


            if (entry.status === "Available") {
                dailyCounts[entry.date].available++;
            } 
            else {
                dailyCounts[entry.date].unavailable++;
            }

        });


        events = Object.keys(dailyCounts).map(function(date) {

            let summary = "";

            if (dailyCounts[date].available > 0) {
                summary += `Available: ${dailyCounts[date].available} `;
            }

            if (dailyCounts[date].unavailable > 0) {
                summary += `Not Available: ${dailyCounts[date].unavailable}`;
            }


            return {
                title: "",
                start: date,
                classNames: ["admin-summary-event"],
                

                extendedProps: {
                    available: dailyCounts[date].available,
                    unavailable: dailyCounts[date].unavailable
                }
            };

        });
    }
    calendar.removeAllEvents();
    calendar.addEventSource(events);
}

//function to add availability details

async function showAvailabilityForm(date) {

    selectedDate = date;

    console.log("Opening availability modal:", date);

    document.getElementById("modal-date").textContent = `Date: ${date}`;

    // Clear old values first
    document.getElementById("modal-status").value = "Available";
    document.getElementById("modal-notes").value = "";


    // Check if user already has availability for this date

    const { data: existingEntry, error } = await supabaseClient
        .from("availability")
        .select("*")
        .eq("user_id", window.currentUser.id)
        .eq("date",selectedDate)
        .maybeSingle();


    if (error) {
        console.log(error);
        return;
    }


    // If existing entry exists, load it

    if (existingEntry) {

        document.getElementById("modal-status").value = existingEntry.status;

        document.getElementById("modal-notes").value = existingEntry.notes || "";

    }


    // Open Bootstrap modal

    const modal = new bootstrap.Modal(
        document.getElementById("availabilityModal")
    );

    modal.show();

    document.getElementById("modal-save").onclick = saveAvailability;

}



//Save function to record entry 
async function saveAvailability() {
    
    console.log("Save button clicked");

    const status = document.getElementById("modal-status").value;
    const notes = document.getElementById("modal-notes").value;

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

