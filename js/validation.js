/*
  validation.js
  Used by: login.html

  What this file does:
    1. Checks the four form fields (avatar, name, email, GitHub username)
    2. Shows an error message under any field that is not valid
    3. Saves the valid data in sessionStorage and opens ticket.html
*/

// ---------- Settings ----------
const MAX_FILE_SIZE = 500 * 1024;             // 500KB written in bytes

// Regular expressions
const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;   // user@domain.com
const GITHUB_PATTERN = /^@[A-Za-z0-9][A-Za-z0-9-]{0,38}$/;                                    // @username, up to 39 characters

// ---------- Page elements ----------
const form = document.getElementById("ticket-form");
const dropzone = document.getElementById("dropzone");
const avatarInput = document.getElementById("avatar");
const promptBox = document.getElementById("dropzone-prompt");
const previewBox = document.getElementById("dropzone-preview");
const previewImage = document.getElementById("avatar-preview");
const removeButton = document.getElementById("remove-avatar");
const changeButton = document.getElementById("change-avatar");

const nameInput = document.getElementById("fullname");
const emailInput = document.getElementById("email");
const githubInput = document.getElementById("github");

const avatarError = document.getElementById("avatar-error");
const nameError = document.getElementById("fullname-error");
const emailError = document.getElementById("email-error");
const githubError = document.getElementById("github-error");

// The chosen picture, stored as text (a data URL) once it has been read
let avatarData = "";


// ---------- Showing and clearing errors ----------

// Put a message under a field and mark the field as invalid
function showError(input, errorBox, message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
  input.setAttribute("aria-invalid", "true");
}

// Remove the message and the invalid mark
function clearError(input, errorBox) {
  errorBox.textContent = "";
  errorBox.hidden = true;
  input.removeAttribute("aria-invalid");
}


// ---------- Checking each field (each returns true when the field is fine) ----------

function checkName() {
  // trim() removes spaces, so a name made only of spaces counts as empty
  if (nameInput.value.trim() === "") {
    showError(nameInput, nameError, "Please enter your full name.");
    return false;
  }
  clearError(nameInput, nameError);
  return true;
}

function checkEmail() {
  const email = emailInput.value.trim();

  if (email === "") {
    showError(emailInput, emailError, "Please enter your email address.");
    return false;
  }
  if (!EMAIL_PATTERN.test(email)) {
    showError(emailInput, emailError, "Please enter a valid email address.");
    return false;
  }
  clearError(emailInput, emailError);
  return true;
}

function checkGithub() {
  const handle = githubInput.value.trim();

  if (handle === "") {
    showError(githubInput, githubError, "Please enter your GitHub username.");
    return false;
  }
  if (handle.charAt(0) !== "@") {
    showError(githubInput, githubError, "Your GitHub username must start with @ (example: @yourusername).");
    return false;
  }
  if (!GITHUB_PATTERN.test(handle)) {
    showError(githubInput, githubError, "Use only letters, numbers and hyphens after the @ (maximum 39 characters).");
    return false;
  }
  clearError(githubInput, githubError);
  return true;
}

// Looks at the chosen file and returns a message, or "" when the file is fine
function getAvatarProblem(file) {
  if (!file) {
    return "Please upload a photo of yourself.";
  }
  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    return "Wrong file type. Please upload a JPG or PNG photo.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File too large. Please upload a photo under 500KB.";
  }
  return "";
}

function checkAvatar() {
  let problem = getAvatarProblem(avatarInput.files[0]);

  // The file looks fine, but the browser has not managed to read it
  if (problem === "" && avatarData === "") {
    problem = "Your photo could not be read. Please choose it again.";
  }

  if (problem !== "") {
    showError(avatarInput, avatarError, problem);
    return false;
  }
  clearError(avatarInput, avatarError);
  return true;
}


// ---------- Avatar upload box ----------

// Show the box that asks for a photo
function hidePreview() {
  avatarData = "";
  previewBox.hidden = true;
  promptBox.hidden = false;
}

// Read the file as text so it can be previewed and saved
function readAvatar(file) {
  const reader = new FileReader();

  reader.addEventListener("load", function () {
    avatarData = reader.result;
    previewImage.src = avatarData;
    promptBox.hidden = true;
    previewBox.hidden = false;
  });

  reader.addEventListener("error", function () {
    hidePreview();
    showError(avatarInput, avatarError, "Sorry, that file could not be read. Please try another photo.");
  });

  reader.readAsDataURL(file);
}

// Runs when the user picks a file (click or drag and drop)
function handleAvatarChange() {
  const file = avatarInput.files[0];

  // The file window was closed without choosing anything
  if (!file) {
    removeAvatar();
    return;
  }

  const problem = getAvatarProblem(file);
  if (problem !== "") {
    hidePreview();
    showError(avatarInput, avatarError, problem);
  } else {
    clearError(avatarInput, avatarError);
    readAvatar(file);
  }
}

function removeAvatar() {
  avatarInput.value = "";
  hidePreview();
  clearError(avatarInput, avatarError);
}

// If the preview picture cannot be displayed, the file was not a real image
previewImage.addEventListener("error", function () {
  hidePreview();
  showError(avatarInput, avatarError, "That file is not a valid image. Please choose another photo.");
});

avatarInput.addEventListener("change", handleAvatarChange);
removeButton.addEventListener("click", removeAvatar);
changeButton.addEventListener("click", function () {
  avatarInput.click();
});

// Highlight the box while a file is dragged over it
dropzone.addEventListener("dragover", function () {
  dropzone.classList.add("dragging");
});
dropzone.addEventListener("dragleave", function () {
  dropzone.classList.remove("dragging");
});
dropzone.addEventListener("drop", function () {
  dropzone.classList.remove("dragging");
});


// ---------- Checking while the user types ----------

// Check a field when the user leaves it, and again as they type
// (but only if it is already showing an error, so the message disappears once fixed)
function watchField(input, checkFunction) {
  input.addEventListener("blur", checkFunction);
  input.addEventListener("input", function () {
    if (input.hasAttribute("aria-invalid")) {
      checkFunction();
    }
  });
}

watchField(nameInput, checkName);
watchField(emailInput, checkEmail);
watchField(githubInput, checkGithub);


// ---------- Submitting the form ----------

// Makes a ticket number like #01609
function makeTicketNumber() {
  let digits = String(Math.floor(Math.random() * 99999) + 1);

  // Add zeros at the front until there are 5 digits (7 becomes 00007)
  while (digits.length < 5) {
    digits = "0" + digits;
  }
  return "#" + digits;
}

// Save everything ticket.html needs, then go to that page
function saveTicket() {
  // ticket.js reads each value back with the same key
  sessionStorage.setItem("ticketName", nameInput.value.trim());
  sessionStorage.setItem("ticketEmail", emailInput.value.trim());
  sessionStorage.setItem("ticketGithub", githubInput.value.trim());
  sessionStorage.setItem("ticketAvatar", avatarData);
  sessionStorage.setItem("ticketNumber", makeTicketNumber());

  window.location.href = "ticket.html";
}

form.addEventListener("submit", function (event) {
  event.preventDefault();   // stop the browser from reloading the page

  // All four checks run (no && here) so every error shows at the same time
  const nameOk = checkName();
  const emailOk = checkEmail();
  const githubOk = checkGithub();
  const avatarOk = checkAvatar();

  if (nameOk && emailOk && githubOk && avatarOk) {
    saveTicket();
  } else {
    // Move the cursor to the first field with a problem
    form.querySelector("[aria-invalid='true']").focus();
  }
});
