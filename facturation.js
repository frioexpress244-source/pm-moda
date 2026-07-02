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
function startScanner() {

    if (html5Scanner) return;

    html5Scanner = new Html5Qrcode("reader");

    Html5Qrcode.getCameras().then(devices => {

        if (devices && devices.length) {

            // 🔥 chercher caméra arrière
            let cameraId = devices.find(d =>
                d.label.toLowerCase().includes("back") ||
                d.label.toLowerCase().includes("rear") ||
                d.label.toLowerCase().includes("environment")
            );

            // fallback si pas trouvée
            if (!cameraId) {
                cameraId = devices[0];
            }

            html5Scanner.start(
                cameraId.id || cameraId,
                {
                    fps: 10,
                    qrbox: 250,
                    facingMode: "environment" // 🔥 important
                },
                (decodedText) => {

                    document.getElementById("result").innerText =
                        "Résultat: " + decodedText;

                    html5Scanner.stop();
                    html5Scanner = null;
                }
            );
        }
    }).catch(err => {
        console.error("Erreur caméra:", err);
    });
}


// =========================
// STOP SCANNER
// =========================
function stopScanner() {

    if (html5Scanner) {
        html5Scanner.stop();
        html5Scanner = null;
    }
}