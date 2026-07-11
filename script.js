/* ============ Aidyl & Jhay · wedding site ============ */
(function () {
  "use strict";

  /* ---- config ---- */
  var WEDDING = new Date("2026-08-07T13:00:00+08:00"); // ceremony 1:00 PM PHT
  var RSVP_EMAILS = ["nj15reyes@gmail.com", "aidyljeanv@gmail.com"];

  /* ---- nav: scrolled state + active link + mobile menu ---- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var navLinks = document.getElementById("navLinks");
  var links = Array.prototype.slice.call(navLinks.querySelectorAll("a"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  window.addEventListener("scroll", function () {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    var pos = window.scrollY + 120;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s; });
    links.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + (current && current.id));
    });
  });

  burger.addEventListener("click", function () { navLinks.classList.toggle("open"); });
  links.forEach(function (a) {
    a.addEventListener("click", function () { navLinks.classList.remove("open"); });
  });

  /* ---- countdown ---- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var diff = WEDDING - new Date();
    if (diff < 0) diff = 0;
    var d = Math.floor(diff / 864e5);
    var h = Math.floor((diff % 864e5) / 36e5);
    var m = Math.floor((diff % 36e5) / 6e4);
    var s = Math.floor((diff % 6e4) / 1e3);
    document.getElementById("cdDays").textContent = pad(d);
    document.getElementById("cdHours").textContent = pad(h);
    document.getElementById("cdMins").textContent = pad(m);
    document.getElementById("cdSecs").textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  /* ---- falling petals ---- */
  var petalWrap = document.getElementById("petals");
  var COUNT = 14;
  for (var i = 0; i < COUNT; i++) {
    var p = document.createElement("span");
    p.className = "petal";
    p.style.left = Math.random() * 100 + "%";
    p.style.animationDuration = 7 + Math.random() * 8 + "s";
    p.style.animationDelay = -Math.random() * 12 + "s";
    var scale = 0.6 + Math.random() * 0.9;
    p.style.transform = "scale(" + scale + ")";
    petalWrap.appendChild(p);
  }

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---- music toggle ---- */
  var music = document.getElementById("bgMusic");
  var musicBtn = document.getElementById("musicBtn");
  var label = musicBtn.querySelector(".music-label");
  musicBtn.addEventListener("click", function () {
    if (music.paused) {
      music.play().then(function () {
        musicBtn.classList.add("playing");
        label.textContent = "Music On";
      }).catch(function () {
        label.textContent = "No Audio";
      });
    } else {
      music.pause();
      musicBtn.classList.remove("playing");
      label.textContent = "Music Off";
    }
  });

  /* ---- add to calendar (.ics download) ---- */
  document.getElementById("addCalendar").addEventListener("click", function (ev) {
    ev.preventDefault();
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//AidylJhay//Wedding//EN",
      "BEGIN:VEVENT",
      "UID:aidyl-jhay-2026@wedding",
      "DTSTART:20260807T050000Z",   // 1:00 PM PHT
      "DTEND:20260807T140000Z",     // 10:00 PM PHT (send-off)
      "SUMMARY:Wedding of Aidyl & Jhay",
      "LOCATION:Alabang Philippines Temple",
      "DESCRIPTION:Ceremony 1:00 PM at Alabang Philippines Temple. Reception 4:00 PM at Archie's Events Place, San Pedro, Laguna.",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var blob = new Blob([ics], { type: "text/calendar" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "aidyl-and-jhay-wedding.ics";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  });

  /* ---- RSVP -> email to both addresses ---- */
  var form = document.getElementById("rsvpForm");
  var note = document.getElementById("rsvpNote");
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var name = form.fullname.value.trim();
    var attending = (form.querySelector('input[name="attending"]:checked') || {}).value;
    var message = form.message.value.trim();
    var submitBtn = document.getElementById("rsvpSubmit");

    note.hidden = false;
    note.className = "rsvp-note";
    if (!name || !attending) {
      note.className = "rsvp-note error";
      note.textContent = "Please enter your name and choose whether you'll attend.";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    note.textContent = "Sending your RSVP…";

    // FormSubmit delivers the RSVP by email to both addresses — no backend needed.
    fetch("https://formsubmit.co/ajax/" + RSVP_EMAILS[0], {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: "Wedding RSVP — " + name + " (" + attending + ")",
        _cc: RSVP_EMAILS.slice(1).join(","),
        _template: "table",
        "Full Name(s)": name,
        "Attending": attending,
        "Message": message || "—"
      })
    })
      .then(function (r) { return r.json(); })
      .then(function () {
        note.className = "rsvp-note";
        note.textContent = "Thank you, " + name + "! Your RSVP has been sent. 💛";
        form.reset();
      })
      .catch(function () {
        // Fallback to the guest's email app if the network request fails.
        var body = "Full Name(s): " + name + "\nAttending: " + attending +
          "\nMessage: " + (message || "—");
        window.location.href = "mailto:" + RSVP_EMAILS.join(",") +
          "?subject=" + encodeURIComponent("Wedding RSVP — " + name) +
          "&body=" + encodeURIComponent(body);
        note.className = "rsvp-note error";
        note.textContent = "We couldn't send automatically — your email app is opening as a backup.";
      })
      .then(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit RSVP";
      });
  });
})();
