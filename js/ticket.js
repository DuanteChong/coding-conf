/*
  ticket.js
  Used by: ticket.html

  What this file does:
    1. Reads the ticket data that validation.js saved in sessionStorage
    2. Sends the visitor back to index.html if there is no saved data
    3. Fills the page with the visitor's name, email, photo, GitHub link and ticket number
*/

// Read the five saved values (each one is saved under its own key in validation.js)
const savedName = sessionStorage.getItem("ticketName");
const savedEmail = sessionStorage.getItem("ticketEmail");
const savedGithub = sessionStorage.getItem("ticketGithub");
const savedAvatar = sessionStorage.getItem("ticketAvatar");
const savedNumber = sessionStorage.getItem("ticketNumber");

// "Register another ticket" clears the saved data and goes back to the form
document.getElementById("start-over").addEventListener("click", function () {
  sessionStorage.clear();
  window.location.href = "login.html";
});

// Route guard: no saved name or photo means the visitor skipped the form
if (!savedName || !savedAvatar) {
  window.location.replace("index.html");
} else {
  // textContent is used (not innerHTML) so typed text can never run as code
  document.getElementById("banner-name").textContent = savedName;
  document.getElementById("banner-email").textContent = savedEmail;
  document.getElementById("ticket-name").textContent = savedName;
  document.getElementById("ticket-handle").textContent = savedGithub;
  document.getElementById("ticket-number").textContent = savedNumber;

  // The GitHub link goes to the profile page (the @ is removed from the address)
  document.getElementById("ticket-github").href = "https://github.com/" + savedGithub.slice(1);

  // The uploaded photo was saved as text, so it can be used as the image source
  const photo = document.getElementById("ticket-avatar");
  photo.src = savedAvatar;
  photo.alt = "Profile photo of " + savedName;
}
