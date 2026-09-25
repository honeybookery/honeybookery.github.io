// Launch-day countdown for the home page.
// The target date/time lives in the data-launch attribute in index.html.
(function () {
  var box = document.querySelector("[data-countdown]");
  if (!box) return;

  var target = new Date(box.getAttribute("data-launch")).getTime();
  if (isNaN(target)) return;

  var DAY = 86400000, HOUR = 3600000, MIN = 60000;
  var nums = {};
  ["days", "hours", "minutes", "seconds"].forEach(function (u) {
    nums[u] = box.querySelector('[data-unit="' + u + '"]');
  });
  var title = box.querySelector("[data-cd-title]");
  var note = box.querySelector("[data-cd-note]");
  var clock = box.querySelector("[data-cd-clock]");
  var sr = box.querySelector("[data-cd-sr]");
  var lastSrDays = null;
  var timer;

  function pad(n) { return n < 10 ? "0" + n : String(n); }

  function set(el, value) {
    if (el.textContent === value) return;
    el.textContent = value;
    // restart the "tick" animation
    el.classList.remove("tick");
    void el.offsetWidth;
    el.classList.add("tick");
  }

  function finish() {
    clearInterval(timer);
    box.classList.add("is-live");
    clock.hidden = true;
    var sameDay = Date.now() - target < DAY;
    if (sameDay) {
      title.innerHTML = "Case open: it's launch day!";
      note.innerHTML = "<em>Framed</em> is officially here. Grab your copy and start investigating.";
    } else {
      title.innerHTML = "The case is open!";
      note.innerHTML = "<em>Framed</em> is out now. Have you cracked the case yet?";
    }
    var ics = box.querySelector("[data-cd-ics]");
    if (ics) ics.hidden = true;
    var stamp = box.querySelector("[data-cd-stamp]");
    if (stamp) stamp.textContent = "Case open";
    var more = box.querySelector("[data-cd-more]");
    if (more) {
      more.textContent = "Get your copy";
      more.href = "framed.html#buy";
      more.className = "btn btn-accent";
    }
    sr.textContent = title.textContent;
  }

  function tick() {
    var diff = target - Date.now();
    if (diff <= 0) { finish(); return; }

    var d = Math.floor(diff / DAY);
    var h = Math.floor((diff % DAY) / HOUR);
    var m = Math.floor((diff % HOUR) / MIN);
    var s = Math.floor((diff % MIN) / 1000);

    set(nums.days, String(d));
    set(nums.hours, pad(h));
    set(nums.minutes, pad(m));
    set(nums.seconds, pad(s));

    if (d <= 7) box.classList.add("is-close");

    // Screen readers: announce only when the day count changes.
    if (d !== lastSrDays) {
      lastSrDays = d;
      sr.textContent = d > 0
        ? d + (d === 1 ? " day" : " days") + " until Framed launches on Saturday, November 14, 2026."
        : "Framed launches today!";
    }
  }

  // "Add to my calendar" (.ics file, all-day event)
  var icsLink = box.querySelector("[data-cd-ics]");
  if (icsLink) {
    // Use the calendar date as written in data-launch, so every time zone gets Nov 14.
    var parts = box.getAttribute("data-launch").slice(0, 10).split("-");
    var y = +parts[0], mo = +parts[1], da = +parts[2];
    var end = new Date(Date.UTC(y, mo - 1, da + 1));
    function ymd(dt) { return dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()); }
    var ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//honeybookery//Framed launch//EN",
      "BEGIN:VEVENT",
      "UID:framed-launch-" + String(y) + pad(mo) + pad(da) + "@honeybookery.com",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z",
      "DTSTART;VALUE=DATE:" + String(y) + pad(mo) + pad(da),
      "DTEND;VALUE=DATE:" + ymd(end),
      "SUMMARY:Framed book launch!",
      "DESCRIPTION:Framed by Z. A. Aweke launches today. https://honeybookery.com/",
      "URL:https://honeybookery.com/",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");
    icsLink.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(ics);
  }

  tick();
  timer = setInterval(tick, 1000);
})();
