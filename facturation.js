const SUPABASE_URL = "https://jiyqibvqwqomqxmgjcjb.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeXFpYnZxd3FvbXF4bWdqY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjMwMjQsImV4cCI6MjA5Nzc5OTAyNH0.5Z8LwiB-jhdGQqJ8POnFmH0YFaOaN7eWJanItfZEzrQ";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let html5Scanner = null;
let scanning = false;

window.addEventListener("beforeunload", () => {
    scanning = false;
});

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
                            .from("produtos")
                            .select("*")
                            .eq("codigo_qr", code)
                            .maybeSingle();

                        if (error) {
                            console.error(error);
                            document.getElementById("result").innerText =
                                "❌ Erreur base de données";
                            scanning = false;
                            return;
                        }

                        if (!data) {
                            document.getElementById("result").innerHTML =
                                "❌ Produit introuvable: " + code;

                            scanning = false;
                            return;
                        }

                        document.getElementById("result").innerHTML = `
                        <div style="padding:15px;border:1px solid #ddd;border-radius:10px;">

                            <h3>✅ Produit trouvé</h3>

                            <p><strong>Nom :</strong> ${data.nome}</p>

                            <p><strong>Taille :</strong> ${data.tamanho}</p>

                            <p><strong>Couleur :</strong> ${data.cor}</p>

                            <p><strong>Quantité :</strong> ${data.quantidade}</p>

                            <p><strong>Prix d'achat :</strong> ${data.preco_compra_unitario} Kz</p>

                            <p><strong>Prix de vente :</strong> ${data.preco_venda_unitario} Kz</p>

                            <p><strong>Bénéfice :</strong> ${data.beneficio} Kz</p>

                            <p><strong>Statut :</strong> ${data.status}</p>

                        </div>
                        `;

                        if (html5Scanner) {
                            html5Scanner.stop()
                                .then(() => {
                                    html5Scanner = null;
                                })
                                .catch(() => {
                                    html5Scanner = null;
                                });
                        }

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
                scanning = false;
            })
            .catch(() => {
                html5Scanner = null;
                scanning = false;
            });
    }
}