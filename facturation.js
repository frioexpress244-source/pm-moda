const SUPABASE_URL = "https://jiyqibvqwqomqxmgjcjb.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeXFpYnZxd3FvbXF4bWdqY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjMwMjQsImV4cCI6MjA5Nzc5OTAyNH0.5Z8LwiB-jhdGQqJ8POnFmH0YFaOaN7eWJanItfZEzrQ";

// 🔥 Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 🔥 variables globales
let html5Scanner = null;
let scanning = false;


// =========================
// PROTECTION ACCÈS
// =========================
document.addEventListener("DOMContentLoaded", () => {

    const allowed = sessionStorage.getItem("allow_facturation");

    if (!allowed) {
        window.location.replace("./service.html");
        return;
    }

    sessionStorage.removeItem("allow_facturation");

    console.log("Accès facturation autorisé");
});


// =========================
// SWITCH SECTION
// =========================
function openSection(id) {

    document.querySelectorAll(".section").forEach(sec => {
        sec.classList.remove("active");
    });

    const target = document.getElementById(id);
    if (target) {
        target.classList.add("active");
    }

    if (id === "scan") {
        startScanner();
    } else {
        stopScanner();
    }
}


// =========================
// START SCANNER
// =========================
function startScanner() {

    if (html5Scanner) return;

    html5Scanner = new Html5Qrcode("reader");

    Html5Qrcode.getCameras()
        .then(devices => {

            if (!devices || devices.length === 0) {
                console.error("Aucune caméra détectée");
                return;
            }

            let cameraId = devices.find(d =>
                d.label.toLowerCase().includes("back") ||
                d.label.toLowerCase().includes("rear") ||
                d.label.toLowerCase().includes("environment")
            );

            if (!cameraId) {
                cameraId = devices[0];
            }

            html5Scanner.start(
                cameraId.id || cameraId,
                {
                    fps: 10,
                    qrbox: 250,
                    facingMode: "environment"
                },
                async (decodedText) => {

                    if (scanning) return;
                    scanning = true;

                    const code = decodedText.trim();

                    document.getElementById("result").innerText =
                        "Recherche produit: " + code;

                    try {
                        const { data, error } = await supabase
                            .from("produit")
                            .select("*")
                            .eq("code", code)
                            .maybeSingle();

                        if (error) {
                            console.error(error);
                        }

                        if (!data) {
                            document.getElementById("result").innerHTML =
                                "❌ Produit introuvable: " + code;

                            scanning = false;
                            return;
                        }

                        document.getElementById("result").innerHTML = `
                            <div style="padding:10px;">
                                <h3>✔ Produit trouvé</h3>
                                <p><b>Nom:</b> ${data.nom}</p>
                                <p><b>Prix:</b> ${data.prix}</p>
                                <p><b>Stock:</b> ${data.stock}</p>
                            </div>
                        `;

                        html5Scanner.stop().then(() => {
                            html5Scanner = null;
                        }).catch(console.error);

                    } catch (err) {
                        console.error(err);
                        document.getElementById("result").innerText =
                            "❌ Erreur de recherche";
                    }

                    scanning = false;
                }
            );

        })
        .catch(err => {
            console.error("Erreur caméra:", err);
        });
}


// =========================
// STOP SCANNER
// =========================
function stopScanner() {

    if (html5Scanner) {
        html5Scanner.stop()
            .then(() => {
                html5Scanner = null;
            })
            .catch(console.error);
    }
}