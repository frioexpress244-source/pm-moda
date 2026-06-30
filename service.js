document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificação de sessão
    const session = localStorage.getItem("userSession");

    if (!session) {
        window.location.href = "index.html";
        return;
    }

    try {
        const user = JSON.parse(session);
        console.log("Utilisateur connecté :", user.nom_completo);
    } catch (e) {
        window.location.href = "index.html";
        return;
    }

    // 2. Definição dos módulos (Cards)
    const modules = [
        { icon: "fa-file-invoice-dollar", label: "Faturação" },
        { icon: "fa-clock-rotate-left", label: "Histórico" },
        { icon: "fa-screwdriver-wrench", label: "Serviços" },
        { icon: "fa-vault", label: "Saldo" },
        { icon: "fa-chart-line", label: "Estatísticas" },
        { icon: "fa-bell", label: "Notificação" },
        { icon: "fa-boxes-stacked", label: "Stock" },
        { icon: "fa-credit-card", label: "Pagamento" },
        { icon: "fa-star", label: "Avaliação" },
        { icon: "fa-spinner fa-spin", label: "Carregamento" }
    ];

    // 3. Renderização dos cards
    const gridContainer = document.querySelector(".modules-grid");
    
    modules.forEach(mod => {
        const card = document.createElement("div");
        card.className = "grid-card";
        card.innerHTML = `
            <i class="fa-solid ${mod.icon} block-icon"></i>
            <span>${mod.label}</span>
        `;
        gridContainer.appendChild(card);
    });
});