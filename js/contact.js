// Sends the contact form to Formspree without leaving the page.
// If JavaScript is off, the form still works as a normal POST to Formspree.
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;
  var status = document.getElementById("form-status");
  var btn = document.getElementById("submit-btn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Browser autofill / password managers sometimes fill the hidden spam
    // trap (_gotcha), which makes Formspree reject real people. A real click
    // or Enter press is a trusted event, so clear the trap for real visitors.
    // Bots that post straight to Formspree never run this script.
    var trap = form.querySelector('[name="_gotcha"]');
    if (trap && e.isTrusted) trap.value = "";

    status.className = "form-status";
    status.textContent = "Sending...";
    btn.disabled = true;

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          status.className = "form-status ok";
          status.textContent = "Thank you! Your message was sent.";
        } else {
          throw new Error("Bad response");
        }
      })
      .catch(function () {
        status.className = "form-status err";
        status.textContent = "Sorry, something went wrong. Please try again in a little while.";
      })
      .then(function () {
        btn.disabled = false;
      });
  });
})();
