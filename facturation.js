// =========================
// SUPABASE CONFIG
// =========================
const SUPABASE_URL = "https://jiyqibvqwqomqxmgjcjb.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeXFpYnZxd3FvbXF4bWdqY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjMwMjQsImV4cCI6MjA5Nzc5OTAyNH0.5Z8LwiB-jhdGQqJ8POnFmH0YFaOaN7eWJanItfZEzrQ";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// VARIABLES GLOBALES
// =========================
let html5Scanner = null;
let scanning = false;

// sécurité reset
window.addEventListener("beforeunload", () => {
    scanning = false;
    if (html5Scanner) {
        html5Scanner.stop().catch(() => {});
        html5Scanner = null;
    }
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
    if (target) target.classList.add("active");

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

            if (!cameraId) cameraId = devices[0];

            html5Scanner.start(
                cameraId.id || cameraId,
                {
                    fps: 10,
                    qrbox: 250,
                    facingMode: "environment"
                },
                onScanSuccess
            );

        })
        .catch(err => console.error("Erreur caméra:", err));
}

// =========================
// SCAN CALLBACK
// =========================
async function onScanSuccess(decodedText) {

    if (scanning) return;
    scanning = true;

    const code = decodedText.trim();
    const result = document.getElementById("result");

    result.innerHTML = `🔍 Recherche: <b>${code}</b>`;

    try {

        const { data, error } = await supabase
            .from("produtos")
            .select("*")
            .eq("codigo_qr", code)
            .maybeSingle();

        if (error) {
            console.error(error);
            result.innerHTML = "❌ Erreur base de données";
            scanning = false;
            return;
        }

        if (!data) {
            result.innerHTML = `❌ Produit introuvable<br><b>${code}</b>`;
            scanning = false;
            return;
        }

        result.innerHTML = `
        <div style="padding:15px;border:1px solid #ddd;border-radius:10px;background:#fff">

            <h3>✅ Produit trouvé</h3>

            <p><b>Nom :</b> ${data.nome}</p>
            <p><b>Taille :</b> ${data.tamanho}</p>
            <p><b>Couleur :</b> ${data.cor}</p>

            <hr>

            <p><b>Quantité :</b> ${data.quantidade}</p>
            <p><b>Prix achat :</b> ${data.preco_compra_unitario} Kz</p>
            <p><b>Prix vente :</b> ${data.preco_venda_unitario} Kz</p>
            <p><b>Bénéfice :</b> ${data.beneficio} Kz</p>
            <p><b>Status :</b> ${data.status}</p>

        </div>
        `;

        // stop scanner après succès
        stopScanner();

    } catch (err) {
        console.error(err);
        result.innerHTML = "❌ Erreur lors de la recherche";
    }

    scanning = false;
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