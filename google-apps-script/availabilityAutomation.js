
/**
 * Updates the Google Form with the next 10 Tuesdays
 * and refreshes the availability period shown in the description.
 *
 * Run this function whenever a new volunteer availability
 * period needs to be collected.
 */

function collectVolunteerAvailability() {

  updateAvailabilityDates();

  sendAvailabilityEmails();

}

/**This is the function that updates the availability Period */

function updateAvailabilityDates() {

  const formId = "Form ID";

  const form = FormApp.openById(formId);

  let dates = [];
  let currentDate = new Date();

/**This variable changes how far out the availability period goes
 * you can make it wider or lessen it bychanging the number
 * below. It calculates the number of Tuesdays from the day of the 
 * week you run the script.
 */

  //The following method allows you to push the period forward by one week,
  //assuming you're sending out the availability period on a week you do not need to request availabbility.Remove the slashes below to use the method.
  //currentDate.setDate(currentDate.getDate() + 1);

  const numberOfTuesdays = 12;

  while (dates.length < numberOfTuesdays) {

    if (currentDate.getDay() === 2) {
      dates.push(
        new Date(currentDate)
      );
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }


  // Format dates for checkbox choices
  const formattedDates = dates.map(date =>
    "Tuesday, " +
    date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric"
    })
  );


  // Update checkbox question
  const items = form.getItems(FormApp.ItemType.CHECKBOX);

  const checkboxQuestion = items.find(item =>
    item.getTitle() === "Available Tuesdays"
  ).asCheckboxItem();

  checkboxQuestion.setChoiceValues(formattedDates);


  // Update description
  const startDate = dates[0].toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  });

  const endDate = dates[dates.length - 1].toLocaleDateString("en-US", {
    month: "long",
    day: "numeric"
  });


  form.setDescription(
    "Please select the Tuesdays you are available to volunteer.\n\n" +
    "Availability Period: " + startDate + " - " + endDate 
   
  );

}

function sendAvailabilityEmails() {

  const sheet = SpreadsheetApp
    .openById("spreadsheet ID")
    .getSheetByName("Volunteers");

  const data = sheet.getDataRange().getValues();

  const formUrl = FormApp
    .openById("form")
    .getPublishedUrl();


  for (let i = 1; i < data.length; i++) {

    const email = data[i][1];

    if (!email) {
      continue;
    }


    MailApp.sendEmail({
      to: email,
      subject: "Volunteer Availability Update",
      body:
    "Greetings from LAH Tech Support,\n\n" +
    "We have updated the volunteer availability process. Please use the form below to submit your availability for the upcoming volunteer period.\n\n" +
    "Availability Form:\n" +
    formUrl +
    "\n\nThank you for your continued support!"

    });

  }
}
