document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // 🔐 PROTECTION ACCÈS
    // =========================
    const allowed = sessionStorage.getItem("allow_facturation");

    if (!allowed) {
        window.location.replace("./service.html");
        return;
    }

    // 🔥 supprimer après accès
    sessionStorage.removeItem("allow_facturation");

    console.log("Accès facturation autorisé");

});


// =========================
// SECTION SWITCH
// =========================
function openSection(id) {

    document.querySelectorAll(".section").forEach(sec => {
        sec.classList.remove("active");
    });

    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
    }

    // scan QR
    if (id === "scan") {
        startScanner();
    } else {
        stopScanner();
    }
}

let html5Scanner = null;


// =========================
// SCANNER QR
// =========================
html5Scanner.start(
    { facingMode: "environment" },
    {
        fps: 10,
        qrbox: 250
    },
    (decodedText) => {
        document.getElementById("result").innerText = "Résultat: " + decodedText;
        html5Scanner.stop();
        html5Scanner = null;
    }
);


// =========================
// STOP SCANNER
// =========================
function stopScanner() {

    if (html5Scanner) {
        html5Scanner.stop();
        html5Scanner = null;
    }
}