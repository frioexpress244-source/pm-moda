// ================================
// SUPABASE CONFIG
// ================================

const SUPABASE_URL = "https://jiyqibvqwqomqxmgjcjb.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeXFpYnZxd3FvbXF4bWdqY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjMwMjQsImV4cCI6MjA5Nzc5OTAyNH0.5Z8LwiB-jhdGQqJ8POnFmH0YFaOaN7eWJanItfZEzrQ";

let supabaseClient = null;
let qrCodeGenerated = null;

// ================================
// QR GENERATOR (2 LETTRES + 5 CHIFFRES)
// ================================

function generateQRCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const l1 = letters[Math.floor(Math.random() * letters.length)];
    const l2 = letters[Math.floor(Math.random() * letters.length)];

    const numbers = Math.floor(10000 + Math.random() * 90000);

    return `${l1}${l2}${numbers}`;
}

// ================================
// INIT
// ================================

document.addEventListener("DOMContentLoaded", () => {

    if (window.supabase) {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
    }

    loadProducts();

    const search = document.getElementById("search");
    search?.addEventListener("input", filterTable);

    const modalProduct = document.getElementById("modal-product");
    const modalConfirm = document.getElementById("modal-confirm");
    const form = document.getElementById("form-product");

    // OPEN MODAL
    window.openModal = () => {
        modalProduct.style.display = "flex";
        modalProduct.classList.add("show");
    };

    // CLOSE MODALS
    window.closeModal = () => {
        modalProduct.style.display = "none";
        modalProduct.classList.remove("show");
    };

    window.closeConfirmModal = () => {
        modalConfirm.style.display = "none";
        modalConfirm.classList.remove("show");
    };

    // SUBMIT FORM
    form?.addEventListener("submit", (e) => {
        e.preventDefault();

        const nome = getVal("nome");
        const qtd = parseFloat(getVal("qtd")) || 0;

        const precoCompra = parseFloat(getVal("precoUnit")) || 0;
        const precoVenda = parseFloat(getVal("precoUnitVenda")) || 0;
        const despesa = parseFloat(getVal("despesa")) || 0;

        const totalAchat = qtd * precoCompra;
        const totalVente = qtd * precoVenda;
        const custoTotal = totalAchat + despesa;
        const beneficio = totalVente - custoTotal;

        const status = beneficio >= 0 ? "LUCRO" : "PERDA";

        const tipoQR = getVal("tipo-qr");
        const manual = getVal("codigo-manual");

        qrCodeGenerated =
            tipoQR === "automatico"
                ? generateQRCode()
                : manual || generateQRCode();

        renderDetails({
            nome,
            qtd,
            precoCompra,
            precoVenda,
            totalAchat,
            totalVente,
            despesa,
            custoTotal,
            beneficio,
            status
        });

        showConfirmModal(qrCodeGenerated);
    });
});

// ================================
// LOAD PRODUCTS FROM SUPABASE
// ================================

async function loadProducts() {

    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from("produtos")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    renderTable(data);
}

// ================================
// TABLE RENDER
// ================================

// ================================
// TABLE RENDER
// ================================

function renderTable(products) {

    const tbody = document.getElementById("stock-body");

    if (!tbody) return;

    tbody.innerHTML = "";

    products.forEach(item => {

        const total =
            (Number(item.quantidade) || 0) *
            (Number(item.preco_venda) || 0);

        const statusText =
            Number(item.quantidade) <= 5
                ? "Baixo"
                : "OK";

        const statusClass =
            Number(item.quantidade) <= 5
                ? "status-low"
                : "status-ok";

        tbody.innerHTML += `
            <tr>

                <td data-label="ID">${item.id ?? "-"}</td>

                <td data-label="Código">${item.codigo_qr || "-"}</td>

                <td data-label="Produto" class="product-name">
                    ${item.nome || "-"}
                </td>

                <td data-label="Tamanho">
                    ${item.tamanho || "-"}
                </td>

                <td data-label="Cor">
                    ${item.cor || "-"}
                </td>

                <td data-label="Qtd" class="num-cell">
                    ${item.quantidade || 0}
                </td>

                <td data-label="P. Unit">
                    ${(Number(item.preco_venda) || 0).toFixed(2)}
                </td>

                <td data-label="Total">
                    ${total.toFixed(2)}
                </td>

                <td data-label="Status">
                    <span class="${statusClass}">
                        ${statusText}
                    </span>
                </td>

                <td data-label="Ações">
                    <button
                        class="btn-view"
                        onclick="viewProduct(${item.id})"
                    >
                        Ver
                    </button>
                </td>

            </tr>
        `;
    });
}// ================================
// SEARCH FILTER
// ================================

function filterTable(e) {

    const value = e.target.value.toLowerCase();
    const rows = document.querySelectorAll("#stock-body tr");

    rows.forEach(row => {
        row.style.display =
            row.innerText.toLowerCase().includes(value)
                ? ""
                : "none";
    });
}

// ================================
window.viewProduct = async (id) => {

try{

const { data } =
await supabaseClient
.from("produtos")
.select("*")
.eq("id", id)
.single();

if(!data) return;

document
.getElementById("view-content")
.innerHTML = `

<div class="view-row">
<div class="view-title">Produit</div>
<div class="view-value">
${data.nome}
</div>
</div>

<div class="view-row">
<div class="view-title">Quantité</div>
<div class="view-value">
${data.quantidade}
</div>
</div>

<div class="view-row">
<div class="view-title">Prix Vente</div>
<div class="view-value">
${Number(data.preco_venda||0).toFixed(2)} AOA
</div>
</div>

<div class="view-row">
<div class="view-title">QR</div>
<div class="view-value">
${data.codigo_qr||"-"}
</div>
</div>

`;

document
.getElementById("view-modal")
.style.display="flex";

}catch(err){

console.error(err);

}

};

window.closeViewModal = () => {
    document.getElementById("view-modal").style.display = "none";
};

// ================================
// DETAILS MODAL
// ================================

function renderDetails(data) {

    const details = document.getElementById("confirm-details");
    if (!details) return;

    details.innerHTML = `
        <p><strong>Produto:</strong> ${data.nome}</p>
        <p><strong>Qtd:</strong> ${data.qtd}</p>
        <hr>
        <p>Total Achat: ${data.totalAchat.toFixed(2)} AOA</p>
        <p>Total Vente: ${data.totalVente.toFixed(2)} AOA</p>
        <p>Despesa: ${data.despesa.toFixed(2)} AOA</p>
        <p>Custo: ${data.custoTotal.toFixed(2)} AOA</p>
        <p style="color:${data.beneficio >= 0 ? "green" : "red"};font-weight:800;">
            Benefício (${data.status}): ${data.beneficio.toFixed(2)} AOA
        </p>
    `;
}

// ================================
// QR MODAL
// ================================

// ================================
// QR MODAL
// ================================

function showConfirmModal(code) {

    const modal = document.getElementById("modal-confirm");
    const container = document.getElementById("confirm-qr");

    container.innerHTML = "";

    const tipo = getVal("tipo-qr");
    const safeCode = (code && code.trim()) ? code.trim() : "ABC123456";

    // 🔥 OUVRIR MODAL D'ABORD (TRÈS IMPORTANT)
    modal.style.display = "flex";
    modal.classList.add("show");

    setTimeout(() => {

        if (tipo === "manual") {

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            container.appendChild(svg);

            JsBarcode(svg, safeCode, {
                format: "CODE128",
                width: 2,
                height: 90,
                displayValue: true,
                margin: 10,
                background: "#ffffff",
                lineColor: "#000000"
            });

        } else {

            new QRCode(container, {
                text: safeCode,
                width: 150,
                height: 150
            });

        }

    }, 50); // 🔥 petit délai pour laisser le DOM s'afficher

    // 🔥 OUVRIR MODAL ICI (très important)
    modal.style.display = "flex";
    modal.classList.add("show");
}
function getVal(id) {
    return document.getElementById(id)?.value || "";
}

// ================================
// SAVE SUPABASE
// ================================

window.confirmarSalvar = async () => {
    console.log("CLICK OK");

    try {

        if (!supabaseClient) throw new Error("Supabase non chargé");

        const nome = getVal("nome");
        const tamanho = getVal("tam");
        const cor = getVal("cor");

        const qtd = parseFloat(getVal("qtd")) || 0;
        const precoCompra = parseFloat(getVal("precoUnit")) || 0;
        const precoVenda = parseFloat(getVal("precoUnitVenda")) || 0;
        const despesa = parseFloat(getVal("despesa")) || 0;

        const totalAchat = qtd * precoCompra;
        const totalVente = qtd * precoVenda;
        const custoTotal = totalAchat + despesa;
        const beneficio = totalVente - custoTotal;

        const status = beneficio >= 0 ? "LUCRO" : "PERDA";

        const data = {
            nome,
            tamanho,
            cor,
            quantidade: qtd,
            preco_compra: precoCompra,
            preco_venda: precoVenda,
            total_achat: totalAchat,
            total_venda: totalVente,
            despesa,
            custo_total: custoTotal,
            beneficio,
            status,
            codigo_qr: qrCodeGenerated
        };

        const { error } = await supabaseClient
            .from("produtos")
            .insert([data]);

        if (error) throw error;

        alert("Produit enregistré avec succès");

        resetForm();
        closeModal();
        closeConfirmModal();

        qrCodeGenerated = null;

        loadProducts();

    } catch (err) {
        console.error(err);
        alert("Erreur: " + err.message);
    }
};

// ================================
// RESET
// ================================

// ================================
// RESET
// ================================

function resetForm() {

    document.getElementById("form-product")?.reset();

    const input =
        document.getElementById("codigo-manual");

    if (input) {
        input.style.display = "none";
        input.value = "";
        input.required = false;
    }

}

// ================================
// QR INPUT
// ================================

window.gerenciarInput = (value) => {

    const input = document.getElementById("codigo-manual");

    const manual = value === "manual";

    input.style.display = manual ? "block" : "none";
    input.required = manual;

    if (!manual) input.value = "";
};