document.addEventListener("DOMContentLoaded", () => {

   // 1. Vérification connexion
const userName = localStorage.getItem("user_name");
const userType = localStorage.getItem("user_type");

// Bloquer accès direct
if (!userName || userType !== "Administrativo") {
    window.location.replace("./index.html");
    return;
}

console.log("Utilisateur connecté :", userName);

    // 2. Modules
    const modules = [
        { icon: "fa-solid fa-file-invoice-dollar", label: "Faturação" },
        { icon: "fa-solid fa-clock-rotate-left", label: "Histórico" },
        { icon: "fa-solid fa-screwdriver-wrench", label: "Serviços" },
        { icon: "fa-solid fa-wallet", label: "Saldo" },
        { icon: "fa-solid fa-chart-line", label: "Estatísticas" },
        { icon: "fa-solid fa-bell", label: "Notificações" },
        { icon: "fa-solid fa-shirt", label: "Stock" },
        { icon: "fa-solid fa-cart-shopping", label: "Compras" },
        { icon: "fa-solid fa-tags", label: "Descontos" },
        { icon: "fa-solid fa-users", label: "Clientes" },
        { icon: "fa-solid fa-credit-card", label: "Pagamentos" },
        { icon: "fa-solid fa-star", label: "Avaliações" },
    ];

    const gridContainer = document.querySelector(".modules-grid");

    modules.forEach(mod => {

        const card = document.createElement("div");
        card.className = "grid-card";

        card.innerHTML = `
            <i class="fa-solid ${mod.icon.split(" ").pop()} block-icon"></i>
            <span>${mod.label}</span>
        `;

        // =========================
        // CLICK ACTIONS
        // =========================
        card.addEventListener("click", () => {

            // ACTION STOCK
            if (mod.label === "Stock") {
                goStock();
                return;
            }

            console.log("Module:", mod.label);
        });

        gridContainer.appendChild(card);
    });

});


// ================================
// NAVIGATION STOCK
// ================================
function goStock() {

    document.body.style.transition = "all 0.25s ease";
    document.body.style.opacity = "0.3";
    document.body.style.transform = "scale(0.98)";
    document.body.style.filter = "blur(2px)";

    setTimeout(() => {
        window.location.replace("./stock.html");
    }, 200);
}

document.getElementById("logout-btn").addEventListener("click", () => {

    // nettoyage session
    localStorage.clear();

    // redirection vers login
    window.location.href = "index.html";
});

