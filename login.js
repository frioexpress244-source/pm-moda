(() => {
    const SUPABASE_URL = "https://jiyqibvqwqomqxmgjcjb.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppeXFpYnZxd3FvbXF4bWdqY2piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjMwMjQsImV4cCI6MjA5Nzc5OTAyNH0.5Z8LwiB-jhdGQqJ8POnFmH0YFaOaN7eWJanItfZEzrQ";

    const minhaConexaoSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    let tempSignupData = null;

    function showLoading() {
        const modal = document.getElementById("loading-modal");
        if (modal) modal.classList.add("active");
    }

    function hideLoading() {
        const modal = document.getElementById("loading-modal");
        if (modal) modal.classList.remove("active");
    }

    function gerarNumeroAleatorio(digitos) {
        let numero = "";
        for (let i = 0; i < digitos; i++) {
            numero += Math.floor(Math.random() * 10);
        }
        return numero;
    }

    function alterarTela(mode) {
        const signup = document.getElementById("signup");
        const signin = document.getElementById("signin");
        if (mode === "signup") {
            signup.classList.remove("cache");
            signin.classList.add("cache");
        } else {
            signin.classList.remove("cache");
            signup.classList.add("cache");
        }
    }

    document.getElementById("to-signin-btn").onclick = () => alterarTela('signin');
    document.getElementById("to-signup-btn").onclick = () => alterarTela('signup');

    document.querySelectorAll(".eye-icon").forEach(icon => {
        icon.onclick = () => {
            const input = icon.parentElement.querySelector("input");
            if (input.type === "password") {
                input.type = "text";
                icon.classList.replace("fa-eye-slash", "fa-eye");
            } else {
                input.type = "password";
                icon.classList.replace("fa-eye", "fa-eye-slash");
            }
        };
    });

    const modalConfirmation = document.getElementById("confirmation-modal");
    const modalSuccess = document.getElementById("success-modal");
    const adminCodeWrapper = document.getElementById("admin-code-wrapper");
    const adminSecretInput = document.getElementById("admin-secret-code");

    document.getElementById("form-signup").addEventListener("submit", (e) => {
        e.preventDefault();
        const accountType = document.getElementById("account-type").value;
        const name = document.getElementById("name").value;
        const phone = "+244 " + document.getElementById("phone").value;
        const birthdate = document.getElementById("birthdate").value;
        const email = document.getElementById("email").value;
        tempSignupData = { accountType, name, phone, birthdate, email };
        document.getElementById("summary-account-type").textContent = accountType;
        document.getElementById("summary-name").textContent = name;
        document.getElementById("summary-phone").textContent = phone;
        const dateObj = new Date(birthdate);
        document.getElementById("summary-birthdate").textContent = !isNaN(dateObj) ? dateObj.toLocaleDateString('pt-PT', {timeZone: 'UTC'}) : birthdate;
        document.getElementById("summary-email").textContent = email;
        if (accountType === "Administrativo") {
            adminCodeWrapper.classList.remove("cache");
            adminSecretInput.required = true;
            adminSecretInput.value = ""; 
        } else {
            adminCodeWrapper.classList.add("cache");
            adminSecretInput.required = false;
            adminSecretInput.value = "";
        }
        modalConfirmation.classList.add("active");
    });

    document.getElementById("btn-modal-cancel").onclick = () => {
        modalConfirmation.classList.remove("active");
        tempSignupData = null;
    };

    document.getElementById("btn-modal-confirm").onclick = async () => {
    if (!tempSignupData) return;

    // 1. Génération des codes
    const finalIdService = gerarNumeroAleatorio(6);
    const finalAccessCode = gerarNumeroAleatorio(4);

    // 2. Validation administrative (Votre logique existante)
    if (tempSignupData.accountType === "Administrativo") {
        const codeValue = adminSecretInput.value.trim();
       if (!codeValue) {
            showError("Por favor, insira o código.", "Atenção"); 
            adminSecretInput.focus(); 
            return;
       }
        
        const { data: codeData, error: codeError } = await minhaConexaoSupabase
            .from('security')
            .select('codigo_secreto')
            .eq('codigo_secreto', codeValue)
            .single();

       if (codeError || !codeData) { 
            showError("O código inserido é inválido.", "Erro de Acesso"); 
            return; 
        }
        tempSignupData.adminCode = codeValue;
    }

    const btnConfirm = document.getElementById("btn-modal-confirm");
    const oldText = btnConfirm.textContent;
    btnConfirm.disabled = true;
    btnConfirm.textContent = "A processar...";
    showLoading();

    try {
        const { data, error: authError } = await minhaConexaoSupabase.auth.signUp({
            email: tempSignupData.email,
            password: "Pass_" + gerarNumeroAleatorio(8),
            options: {
                data: {
                    account_type: tempSignupData.accountType,
                    full_name: tempSignupData.name,
                    phone_number: tempSignupData.phone,
                    birthdate: tempSignupData.birthdate,
                    id_service: finalIdService,
                    code_access: finalAccessCode
                }
            }
        });

        if (authError) throw authError;

        // 1. Masquer le modal de confirmation
        modalConfirmation.classList.remove("active");
        
        // 2. Préparer les données pour le modal de succès (Commun pour Agent et Admin)
        document.getElementById("success-agent-name").textContent = tempSignupData.name;
        document.getElementById("disp-id-service").textContent = finalIdService;
        document.getElementById("disp-access-code").textContent = finalAccessCode;

        // 3. Personnaliser le titre du modal selon le rôle
        const modalTitle = modalSuccess.querySelector(".modal-title");
        modalTitle.innerHTML = tempSignupData.accountType === "Administrativo" 
            ? '<i class="fa-solid fa-user-shield"></i> Conta Admin Criada!' 
            : '<i class="fa-solid fa-circle-check"></i> Conta Criada!';
        
        // 4. Afficher le modal de succès pour tout le monde
        modalSuccess.classList.add("active");

    } catch (err) {
        console.error("Erreur détaillée :", err);
        let msg = err.message || "Erro desconhecido";
        if (typeof err === 'object' && !err.message) {
            msg = JSON.stringify(err);
        }
        if (msg.includes("already registered")) {
            showError("Este e-mail já está cadastrado.", "Conta Existente");
        } else {
            showError(msg, "Falha na criação da conta");
        }
    } finally {
        hideLoading();
        btnConfirm.disabled = false;
        btnConfirm.textContent = oldText;
    }
};

    document.getElementById("btn-success-now").onclick = () => {
        modalSuccess.classList.remove("active");
        document.getElementById("form-signup").reset();
        alterarTela("signin");
        tempSignupData = null;
    };

    document.getElementById("btn-success-later").onclick = () => {
        modalSuccess.classList.remove("active");
        document.getElementById("form-signup").reset();
        alterarTela("signup");
        tempSignupData = null;
    };

    document.getElementById("form-signin").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const accountType = document.getElementById("login-account-type").value;
        const idService = document.getElementById("login-id-service").value;
        const codico = document.getElementById("login-codico").value;

        // CORRECTION : Définir la table selon le choix réel
        // Assurez-vous que les noms 'agent' et 'administrativo' correspondent à vos tables dans Supabase
        let tableName = "";
        if (accountType === "Administrativo") {
            tableName = "administrativo"; 
        } else {
            tableName = "agent";
        }

        showLoading();

        try {
            const { data, error } = await minhaConexaoSupabase
                .from(tableName)
                .select('*')
                .eq('identifiant_service', idService)
                .eq('codico', codico);

            if (error) throw error;

            if (data && data.length > 0) {

                localStorage.setItem("user_name", data[0].nom_completo);
                localStorage.setItem("user_type", accountType);

                // Redirection depuis index.html
                const destination =
                    accountType === "Administrativo"
                        ? "./admin.html"
                        : "./service.html";

                window.location.replace(destination);

            } else {
                showError(
                    "ID ou código incorreto para este tipo de conta.",
                    "Acesso Negado"
                );
            }
        } catch (err) {
            showError(err.message, "Erro de Conexão");
        } finally {
            hideLoading();
        }
    });

// 1. La fonction d'affichage
    window.showError = function(message, title = "Erro") {
        const errorModal = document.getElementById('error-modal');
        const errorText = document.getElementById('error-message');
        const modalTitle = errorModal.querySelector('.modal-title');
        
        modalTitle.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${title}`;
        errorText.textContent = message;
        
        errorModal.classList.add('active');
    };

    

    // 2. L'écouteur pour fermer la modale
    const btnErrorClose = document.getElementById('btn-error-close');
    if (btnErrorClose) {
        btnErrorClose.onclick = () => {
            document.getElementById('error-modal').classList.remove('active');
        };
    }

    

    alterarTela("signin");
})();