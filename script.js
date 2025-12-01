// ===== SISTEMA DE LOGIN E USUÁRIOS =====
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM para o sistema de usuário
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');
    
    const mobileUserMenu = document.getElementById('mobileUserMenu');
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');

    // Verificar se há usuário logado ao carregar a página
    checkUserLoginStatus();

    // Função para verificar status do login
    function checkUserLoginStatus() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (usuarioLogado && usuarioLogado.nome) {
            mostrarUsuarioLogado(usuarioLogado.nome);
        } else {
            mostrarUsuarioDeslogado();
        }
    }

    // Função para mostrar usuário logado
    function mostrarUsuarioLogado(nome) {
        // Atualizar menu desktop
        if (userMenu && userName) {
            userMenu.style.display = 'flex';
            userName.textContent = nome;
        }
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }

        // Atualizar menu mobile
        if (mobileUserMenu && mobileUserName) {
            mobileUserMenu.style.display = 'flex';
            mobileUserName.textContent = nome;
        }
        if (mobileLoginBtn) {
            mobileLoginBtn.style.display = 'none';
        }

        // Adicionar classe ao body para estilização
        document.body.classList.add('user-logged-in');
    }

    // Função para mostrar usuário deslogado
    function mostrarUsuarioDeslogado() {
        // Restaurar menu desktop
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }

        // Restaurar menu mobile
        if (mobileUserMenu) {
            mobileUserMenu.style.display = 'none';
        }
        if (mobileLoginBtn) {
            mobileLoginBtn.style.display = 'block';
        }

        // Remover classe do body
        document.body.classList.remove('user-logged-in');
    }

    // Função para fazer login
    function fazerLogin(email, senha) {
        // Buscar usuários do localStorage
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
        const usuario = usuarios.find(u => u.email === email && u.senha === senha);
        
        if (usuario) {
            // Salvar usuário logado no localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify({
                nome: usuario.nome,
                email: usuario.email
            }));
            
            mostrarUsuarioLogado(usuario.nome);
            return { success: true, nome: usuario.nome };
        }
        return { success: false };
    }

    // Função para fazer logout
    function fazerLogout() {
        localStorage.removeItem('usuarioLogado');
        mostrarUsuarioDeslogado();
        
        // LIMPAR FORMULÁRIO DE DOAÇÃO
        limparFormularioDoacao();
        
        // Fechar modais se estiverem abertos
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
        document.body.style.overflow = 'auto';
        
        alert('Logout realizado com sucesso!');
    }

    // Função para limpar formulário de doação
    function limparFormularioDoacao() {
        const nomeInput = document.getElementById('nome');
        const sobrenomeInput = document.getElementById('sobrenome');
        const emailInput = document.getElementById('email');
        
        if (nomeInput) nomeInput.value = '';
        if (sobrenomeInput) sobrenomeInput.value = '';
        if (emailInput) emailInput.value = '';
    }

    // Eventos de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', fazerLogout);
    }

    // ===== PREENCHER AUTOMATICAMENTE FORMULÁRIO DE DOAÇÃO =====
    function preencherFormularioDoacao() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        
        if (usuarioLogado && usuarioLogado.nome) {
            console.log('Usuário logado encontrado:', usuarioLogado);
            
            // Separar nome e sobrenome
            const nomeCompleto = usuarioLogado.nome.split(' ');
            const nome = nomeCompleto[0];
            const sobrenome = nomeCompleto.slice(1).join(' ');
            
            // Preencher campos do formulário de doação
            const nomeInput = document.getElementById('nome');
            const sobrenomeInput = document.getElementById('sobrenome');
            const emailInput = document.getElementById('email');
            
            console.log('Campos encontrados:', {
                nomeInput: !!nomeInput,
                sobrenomeInput: !!sobrenomeInput,
                emailInput: !!emailInput
            });
            
            if (nomeInput) {
                nomeInput.value = nome;
                console.log('Nome preenchido:', nome);
            }
            if (sobrenomeInput) {
                sobrenomeInput.value = sobrenome;
                console.log('Sobrenome preenchido:', sobrenome);
            }
            if (emailInput && usuarioLogado.email) {
                emailInput.value = usuarioLogado.email;
                console.log('Email preenchido:', usuarioLogado.email);
            }
        } else {
            console.log('Nenhum usuário logado encontrado');
        }
    }

    // ===== CARROSSEL PRINCIPAL =====
    const carousel = document.querySelector('.carousel');
    const indicators = document.querySelectorAll('.indicator');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    let currentIndex = 0;
    let autoPlayInterval;
    let touchStartX = 0;
    let touchEndX = 0;

    // Inicializar o carrossel
    function initCarousel() {
        if (!carousel) return;
        
        // Iniciar autoplay
        startAutoPlay();
        
        // Adicionar suporte a swipe
        addSwipeSupport();
        
        // Adicionar eventos aos indicadores
        indicators.forEach(indicator => {
            indicator.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                goToSlide(index);
            });
        });
    }

    // Ir para um slide específico
    function goToSlide(index) {
        currentIndex = index;
        updateCarousel();
    }

    // Atualizar o carrossel
    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Atualizar indicadores
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    // Próximo slide
    function nextSlide() {
        currentIndex = (currentIndex + 1) % indicators.length;
        updateCarousel();
    }

    // Slide anterior
    function prevSlide() {
        currentIndex = (currentIndex - 1 + indicators.length) % indicators.length;
        updateCarousel();
    }

    // Iniciar autoplay
    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 5000);
    }

    // Adicionar suporte a gestos de swipe
    function addSwipeSupport() {
        carousel.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carousel.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    // Processar gesto de swipe
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchStartX - touchEndX > swipeThreshold) {
            // Swipe para a esquerda - próximo slide
            nextSlide();
        } else if (touchEndX - touchStartX > swipeThreshold) {
            // Swipe para a direita - slide anterior
            prevSlide();
        }
        
        // Reiniciar autoplay após interação
        clearInterval(autoPlayInterval);
        startAutoPlay();
    }

    // Menu Mobile
    function initMobileMenu() {
        if (!mobileMenuBtn || !mobileMenu) return;
        
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
        });

        // Fechar menu ao clicar em um item
        mobileMenu.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
            });
        });
    }

    // Smooth scroll para links internos
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Pausar autoplay ao passar o mouse
    if (carousel) {
        carousel.addEventListener('mouseenter', () => {
            clearInterval(autoPlayInterval);
        });

        // Retomar autoplay ao retirar o mouse
        carousel.addEventListener('mouseleave', () => {
            startAutoPlay();
        });
    }

    // ===== CARROSSEL DE AJUDA =====
    const helpCarousel = document.querySelector('.help-cards-carousel');
    const helpCards = document.querySelectorAll('.help-card');
    const prevArrow = document.querySelector('.carousel-arrow-prev');
    const nextArrow = document.querySelector('.carousel-arrow-next');
    
    if (helpCarousel && prevArrow && nextArrow) {
        let currentHelpIndex = 0;
        const cardsPerView = getCardsPerView();
        
        function getCardsPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return 3;
        }
        
        function updateHelpCarousel() {
            const cardWidth = helpCards[0].offsetWidth + 30; // width + gap
            helpCarousel.style.transform = `translateX(-${currentHelpIndex * cardWidth}px)`;
        }
        
        function showNextCards() {
            const maxIndex = helpCards.length - cardsPerView;
            if (currentHelpIndex < maxIndex) {
                currentHelpIndex++;
                updateHelpCarousel();
            }
        }
        
        function showPrevCards() {
            if (currentHelpIndex > 0) {
                currentHelpIndex--;
                updateHelpCarousel();
            }
        }
        
        // Event listeners para as setas
        nextArrow.addEventListener('click', showNextCards);
        prevArrow.addEventListener('click', showPrevCards);
        
        // Atualizar na redimensionamento da tela
        window.addEventListener('resize', function() {
            const newCardsPerView = getCardsPerView();
            if (newCardsPerView !== cardsPerView) {
                currentHelpIndex = 0;
                updateHelpCarousel();
            }
        });
        
        // Inicializar carrossel
        updateHelpCarousel();
    }

    // ===== MODAL DE DOAÇÃO =====
    const modal = document.getElementById('donationModal');
    const openBtn = document.getElementById('openDonationModal');
    const closeBtn = document.querySelector('.close-modal');
    const donationForm = document.getElementById('donationForm');
    const instituicaoSelect = document.getElementById('instituicao');
    const outraInstituicaoGroup = document.getElementById('outra-instituicao-group');
    const tipoDoacaoSelect = document.getElementById('tipo-doacao');
    const valorGroup = document.getElementById('valor-group');

    if (modal && openBtn) {
        // Abrir modal
        openBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // PREENCHER AUTOMATICAMENTE SE USUÁRIO ESTIVER LOGADO
            preencherFormularioDoacao();
        });

        // Fechar modal
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Fechar modal clicando fora
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Mostrar/ocultar campo de outra instituição
        if (instituicaoSelect) {
            instituicaoSelect.addEventListener('change', function() {
                if (this.value === 'outro') {
                    outraInstituicaoGroup.style.display = 'block';
                } else {
                    outraInstituicaoGroup.style.display = 'none';
                }
            });
        }

        // Mostrar/ocultar campo de valor
        if (tipoDoacaoSelect) {
            tipoDoacaoSelect.addEventListener('change', function() {
                if (this.value === 'dinheiro') {
                    valorGroup.style.display = 'block';
                } else {
                    valorGroup.style.display = 'none';
                }
            });
        }

        // Formatação do CPF
        const cpfInput = document.getElementById('cpf');
        if (cpfInput) {
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 3 && value.length <= 6) {
                    value = value.replace(/(\d{3})(\d+)/, '$1.$2');
                } else if (value.length > 6 && value.length <= 9) {
                    value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
                } else if (value.length > 9) {
                    value = value.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
                }
                e.target.value = value;
            });
        }

        // Formatação do telefone
        const telefoneInput = document.getElementById('telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 2 && value.length <= 6) {
                    value = value.replace(/(\d{2})(\d+)/, '($1) $2');
                } else if (value.length > 6 && value.length <= 10) {
                    value = value.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
                } else if (value.length > 10) {
                    value = value.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
                }
                e.target.value = value;
            });
        }

        // Envio do formulário

        if (donationForm) {
            donationForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const nome = document.getElementById('nome').value;
                const dataNascimento = document.getElementById('data-nascimento').value;
                
                // Validações
                if (!nome) {
                    alert('Por favor, preencha todos os campos obrigatórios.');
                    return;
                }
                
                // Validar se é maior de idade
                if (!validarMaiorIdade(dataNascimento)) {
                    alert('Para fazer doações é necessário ser maior de idade (18 anos ou mais).');
                    return;
                }
                
                alert(`Obrigado pela sua doação, ${nome}! Sua contribuição fará a diferença.`);
                
                // Resetar formulário
                donationForm.reset();
                if (outraInstituicaoGroup) outraInstituicaoGroup.style.display = 'none';
                if (valorGroup) valorGroup.style.display = 'none';
                
                // Fechar modal
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        // Função para validar se é maior de idade

        function validarMaiorIdade(dataNascimento) {
            const hoje = new Date();
            const nascimento = new Date(dataNascimento);
            
            // Calcular idade
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            
            // Ajustar idade se ainda não fez aniversário este ano
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                idade--;
            }
            
            return idade >= 18;
        }

        // Validação em tempo real da data de nascimento
        
        const dataNascimentoInput = document.getElementById('data-nascimento');
        if (dataNascimentoInput) {
            dataNascimentoInput.addEventListener('change', function() {
                if (this.value && !validarMaiorIdade(this.value)) {
                    alert('Você precisa ser maior de idade (18 anos ou mais) para doar.');
                    this.value = ''; // Limpa o campo
                }
            });
        }
    }

    // ===== MODAL DE LOGIN =====
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');

    if (loginModal && loginForm) {
        // Abrir modal de login
        const loginBtns = document.querySelectorAll('.login-btn, .mobile-login-btn');
        loginBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                loginModal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                
                // Fechar menu mobile se estiver aberto
                if (mobileMenu) {
                    mobileMenu.classList.remove('active');
                }
            });
        });

        // Fechar modal de login
        const closeLoginBtn = document.querySelector('.close-login-modal');
        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', function() {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        // Fechar modal clicando fora
        window.addEventListener('click', function(event) {
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Envio do formulário de login
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            if (!email || !password) {
                alert('Por favor, preencha todos os campos.');
                return;
            }
            
            const resultado = fazerLogin(email, password);
            
            if (resultado.success) {
                alert(`Login realizado com sucesso! Bem-vindo(a), ${resultado.nome}!`);
                
                // Fechar modal
                loginModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Limpar formulário
                loginForm.reset();
            } else {
                alert('E-mail ou senha incorretos!');
            }
        });

        // Links do login
        const forgotPasswordLink = document.querySelector('.forgot-password-link');
        const createAccountLink = document.querySelector('.create-account-link');
        
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Abrir modal de recuperação de senha
                const forgotPasswordModal = document.getElementById('forgotPasswordModal');
                if (forgotPasswordModal) {
                    loginModal.style.display = 'none';
                    forgotPasswordModal.style.display = 'block';
                }
            });
        }

        if (createAccountLink) {
            createAccountLink.addEventListener('click', function(e) {
                e.preventDefault();
                // Abrir modal de criar conta
                const createAccountModal = document.getElementById('createAccountModal');
                if (createAccountModal) {
                    loginModal.style.display = 'none';
                    createAccountModal.style.display = 'block';
                }
            });
        }
    }

    // ===== MODAL DE CRIAR CONTA =====
    const createAccountModal = document.getElementById('createAccountModal');
    const createAccountForm = document.getElementById('createAccountForm');

    if (createAccountModal && createAccountForm) {
        // Fechar modal de criar conta
        const closeCreateAccountBtn = document.querySelector('.close-create-account-modal');
        if (closeCreateAccountBtn) {
            closeCreateAccountBtn.addEventListener('click', function() {
                createAccountModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }

        // Voltar para o login
        const backToLoginLinks = document.querySelectorAll('.back-to-login-link');
        backToLoginLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                createAccountModal.style.display = 'none';
                if (loginModal) loginModal.style.display = 'block';
            });
        });

        // Fechar modal clicando fora
        window.addEventListener('click', function(event) {
            if (event.target === createAccountModal) {
                createAccountModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Formatação do CNPJ
        const cnpjInput = document.getElementById('cnpj');
        if (cnpjInput) {
            cnpjInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 2 && value.length <= 5) {
                    value = value.replace(/(\d{2})(\d+)/, '$1.$2');
                } else if (value.length > 5 && value.length <= 8) {
                    value = value.replace(/(\d{2})(\d{3})(\d+)/, '$1.$2.$3');
                } else if (value.length > 8 && value.length <= 12) {
                    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d+)/, '$1.$2.$3/$4');
                } else if (value.length > 12) {
                    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/, '$1.$2.$3/$4-$5');
                }
                e.target.value = value.substring(0, 18);
            });
        }

        // Validação de força da senha
        const passwordInput = document.getElementById('create-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        const passwordMatch = document.querySelector('.password-match');

        if (passwordInput && strengthBar && strengthText) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                const strength = checkPasswordStrength(password);
                
                // Mostrar indicador apenas se houver texto
                const passwordStrength = document.querySelector('.password-strength');
                if (password.length > 0) {
                    passwordStrength.classList.add('show');
                } else {
                    passwordStrength.classList.remove('show');
                    return;
                }
                
                // Atualizar barra de força
                strengthBar.className = 'strength-bar';
                if (password.length > 0) {
                    strengthBar.classList.add(strength.level);
                    strengthText.textContent = strength.text;
                }
            });
        }

        // Verificar se as senhas coincidem
        if (confirmPasswordInput && passwordMatch) {
            confirmPasswordInput.addEventListener('input', function() {
                const password = passwordInput.value;
                const confirmPassword = this.value;
                
                if (confirmPassword.length === 0) {
                    passwordMatch.classList.remove('show');
                    return;
                }
                
                passwordMatch.classList.add('show');
                
                if (password === confirmPassword) {
                    passwordMatch.textContent = '✓ Senhas coincidem';
                    passwordMatch.className = 'password-match show valid';
                } else {
                    passwordMatch.textContent = '✗ Senhas não coincidem';
                    passwordMatch.className = 'password-match show invalid';
                }
            });
        }

        // Função para verificar força da senha
        function checkPasswordStrength(password) {
            let score = 0;
            
            if (password.length >= 8) score++;
            if (password.match(/[a-z]/)) score++;
            if (password.match(/[A-Z]/)) score++;
            if (password.match(/[0-9]/)) score++;
            if (password.match(/[^a-zA-Z0-9]/)) score++;
            
            if (score <= 2) {
                return { level: 'weak', text: 'Senha fraca' };
            } else if (score <= 4) {
                return { level: 'medium', text: 'Senha média' };
            } else {
                return { level: 'strong', text: 'Senha forte' };
            }
        }

        // Envio do formulário de criar conta
        createAccountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('create-email').value;
            const password = document.getElementById('create-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validações
            if (!fullName || !email || !password || !confirmPassword) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('As senhas não coincidem. Por favor, verifique.');
                return;
            }
            
            if (password.length < 8) {
                alert('A senha deve ter pelo menos 8 caracteres.');
                return;
            }
            
            // Salvar usuário no localStorage
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
            
            // Verificar se email já existe
            if (usuarios.some(u => u.email === email)) {
                alert('Este e-mail já está cadastrado. Tente fazer login.');
                return;
            }
            
            // Adicionar novo usuário
            usuarios.push({ 
                nome: fullName, 
                email: email, 
                senha: password 
            });
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            // Fazer login automaticamente
            localStorage.setItem('usuarioLogado', JSON.stringify({ 
                nome: fullName, 
                email: email 
            }));
            
            mostrarUsuarioLogado(fullName);
            
            // Fechar modal
            createAccountModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            alert(`Conta criada com sucesso! Bem-vindo(a) ao Abraço Solidário, ${fullName.split(' ')[0]}!`);
            
            // Limpar formulário
            createAccountForm.reset();
            
            // Resetar indicadores
            const passwordStrength = document.querySelector('.password-strength');
            if (passwordStrength) passwordStrength.classList.remove('show');
            if (passwordMatch) passwordMatch.classList.remove('show');
        });
    }

    // ===== MODAL DE RECUPERAÇÃO DE SENHA =====
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    if (forgotPasswordModal && forgotPasswordForm) {
        // Fechar modal de recuperação de senha
        const closeForgotPasswordBtn = document.querySelector('.close-forgot-password-modal');
        if (closeForgotPasswordBtn) {
            closeForgotPasswordBtn.addEventListener('click', function() {
                forgotPasswordModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                resetForgotPasswordForm();
            });
        }

        // Voltar para o login a partir da recuperação de senha
        const backToLoginFromForgotLinks = document.querySelectorAll('.back-to-login-from-forgot, .back-to-login-btn');
        backToLoginFromForgotLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                forgotPasswordModal.style.display = 'none';
                resetForgotPasswordForm();
                if (loginModal) loginModal.style.display = 'block';
            });
        });

        // Fechar modal clicando fora
        window.addEventListener('click', function(event) {
            if (event.target === forgotPasswordModal) {
                forgotPasswordModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                resetForgotPasswordForm();
            }
        });

        // Função para resetar o formulário de recuperação
        function resetForgotPasswordForm() {
            forgotPasswordForm.reset();
            forgotPasswordForm.style.display = 'block';
            const recoverySuccess = document.querySelector('.recovery-success');
            if (recoverySuccess) recoverySuccess.style.display = 'none';
            forgotPasswordForm.classList.remove('sending');
        }

        // Envio do formulário de recuperação de senha
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('recovery-email').value;
            
            // Validação básica
            if (!email) {
                alert('Por favor, informe seu e-mail.');
                return;
            }
            
            // Validar formato do e-mail
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Por favor, informe um e-mail válido.');
                return;
            }
            
            // Enviar instruções de recuperação
            sendRecoveryInstructions(email);
        });

        // Função para simular envio de instruções
        function sendRecoveryInstructions(email) {
            const submitBtn = forgotPasswordForm.querySelector('.send-instructions-btn');
            const originalText = submitBtn.innerHTML;
            
            // Mostrar estado de envio
            forgotPasswordForm.classList.add('sending');
            submitBtn.disabled = true;
            
            // Simular delay de rede
            setTimeout(() => {
                // Simular resposta do servidor
                const recoverySuccess = true;
                
                if (recoverySuccess) {
                    // Mostrar mensagem de sucesso
                    showRecoverySuccess();
                } else {
                    alert('Erro ao enviar instruções. Tente novamente.');
                }
                
                // Restaurar botão
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                forgotPasswordForm.classList.remove('sending');
            }, 2000);
        }

        // Função para mostrar mensagem de sucesso
        function showRecoverySuccess() {
            const email = document.getElementById('recovery-email').value;
            
            // Esconder formulário e mostrar sucesso
            forgotPasswordForm.style.display = 'none';
            const recoverySuccess = document.querySelector('.recovery-success');
            if (recoverySuccess) {
                recoverySuccess.style.display = 'block';
                
                // Opcional: você pode atualizar a mensagem com o e-mail
                const successMessage = recoverySuccess.querySelector('p');
                if (successMessage) {
                    successMessage.textContent = `Enviamos as instruções de recuperação para: ${email}`;
                }
            }
        }

        // Adicionar evento para o botão de voltar ao login na tela de sucesso
        const backToLoginBtn = document.querySelector('.back-to-login-btn');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                forgotPasswordModal.style.display = 'none';
                resetForgotPasswordForm();
                if (loginModal) loginModal.style.display = 'block';
            });
        }
    }

    // Inicializar todas as funcionalidades
    initCarousel();
    initMobileMenu();
    initSmoothScroll();
});

// Função auxiliar para verificar se usuário está logado
function isUserLoggedIn() {
    return localStorage.getItem('usuarioLogado') !== null;
}

// Função para obter dados do usuário logado
function getLoggedInUser() {
    const usuario = localStorage.getItem('usuarioLogado');
    return usuario ? JSON.parse(usuario) : null;
}

// Dados das instituições
const institutionsData = {
    'pf': {
        name: 'Patas Felizes',
        image: 'cachorro.png',
        description: 'Somos o Instituto Patas Felizes, um refúgio para animais abandonados e vítimas de maus-tratos.',
        needs: ['Ração para cães e gatos', 'Medicamentos veterinários', 'Produtos de higiene', 'Brinquedos para animais', 'Coleiras e guias'],
        address: 'Rua dos Animais, 123 - Jardim Pet, São Paulo - SP, 01234-567'
    },
    'ct': {
        name: 'Instituição Casa Todos',
        image: 'casatodos.png',
        description: 'Somos o Instituto Casa de Todos, um espaço de reabilitação para quem busca um novo começo com dignidade e apoio.',
        needs: ['Alimentos não perecíveis', 'Produtos de higiene pessoal', 'Roupas e calçados', 'Material de limpeza', 'Cobertores'],
        address: 'Av. da Solidariedade, 456 - Centro, São Paulo - SP, 01234-568'
    },
    'rs': {
        name: 'Instituição Recanto da Sabedoria',
        image: 'Recanto da Sabedoria.png',
        description: 'Somos o Recanto da Sabedoria, um lar acolhedor para idosos que merecem todo o carinho e respeito.',
        needs: ['Fraldas geriátricas', 'Suplementos alimentares', 'Medicamentos', 'Material de higiene', 'Roupas de cama'],
        address: 'Rua da Esperança, 789 - Vila Feliz, São Paulo - SP, 01234-569'
    },
    'sc': {
        name: 'Instituição Sonho Colorido',
        image: 'sonhocolorido.png',
        description: 'Somos o Instituto Sonho Colorido, um farol de esperança para crianças em comunidades carentes.',
        needs: ['Material escolar', 'Brinquedos educativos', 'Roupas infantis', 'Livros infantis', 'Alimentos'],
        address: 'Praça da Criança, 321 - Jardim Infantil, São Paulo - SP, 01234-570'
    },
    'florescer': {
        name: 'Instituição Florescer',
        image: 'florescer.png',
        description: 'Somos o Instituto Florescer, um amparo para aqueles em situação de vulnerabilidade, oferecendo acolhimento, apoio e a chance de reconstruir suas vidas.',
        needs: ['Alimentos', 'Produtos de higiene', 'Roupas', 'Material de construção', 'Móveis usados'],
        address: 'Alameda das Flores, 654 - Jardim Social, São Paulo - SP, 01234-571'
    }
};

// Modal de detalhes da instituição
document.addEventListener('DOMContentLoaded', function() {
    const institutionModal = document.getElementById('institutionModal');
    const closeInstitutionModal = document.querySelector('.close-institution-modal');
    const donateToInstitutionBtn = document.getElementById('donateToInstitution');

    // Adicionar evento de clique nas instituições
    const helpCards = document.querySelectorAll('.help-card');
    
    helpCards.forEach(card => {
        card.style.cursor = 'pointer'; // Muda cursor para indicar que é clicável
        
        card.addEventListener('click', function() {
            // Encontrar qual instituição foi clicada
            const institutionId = this.querySelector('img').getAttribute('src').split('.')[0];
            const institutionKey = getInstitutionKey(institutionId);
            
            if (institutionKey && institutionsData[institutionKey]) {
                openInstitutionModal(institutionKey);
            }
        });
    });

    // Função para abrir o modal
    function openInstitutionModal(institutionKey) {
        const institution = institutionsData[institutionKey];
        
        // Preencher dados no modal
        document.getElementById('modalInstitutionImage').src = institution.image;
        document.getElementById('modalInstitutionName').textContent = institution.name;
        document.getElementById('modalInstitutionDescription').textContent = institution.description;
        document.getElementById('modalInstitutionAddress').textContent = institution.address;
        
        // Preencher necessidades
        const needsList = document.getElementById('modalInstitutionNeeds');
        needsList.innerHTML = '';
        institution.needs.forEach(need => {
            const li = document.createElement('li');
            li.textContent = need;
            needsList.appendChild(li);
        });
        
        // Abrir modal
        institutionModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Configurar botão de doação
        donateToInstitutionBtn.onclick = function() {
            // Fechar modal de instituição
            institutionModal.style.display = 'none';
            // Abrir modal de doação com a instituição pré-selecionada
            const donationModal = document.getElementById('donationModal');
            const instituicaoSelect = document.getElementById('instituicao');
            
            if (donationModal && instituicaoSelect) {
                donationModal.style.display = 'block';
                instituicaoSelect.value = institutionKey;
            }
        };
    }

    // Fechar modal
    if (closeInstitutionModal) {
        closeInstitutionModal.addEventListener('click', function() {
            institutionModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Fechar modal clicando fora
    window.addEventListener('click', function(event) {
        if (event.target === institutionModal) {
            institutionModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Função auxiliar para encontrar a chave da instituição
    function getInstitutionKey(imageName) {
        const mapping = {
            'cachorro': 'pf',
            'casatodos': 'ct',
            'Recanto da Sabedoria': 'rs',
            'sonhocolorido': 'sc',
            'florescer': 'florescer'
        };
        
        for (let key in mapping) {
            if (imageName.includes(key)) {
                return mapping[key];
            }
        }
        return null;
    }
    
    
});
// ===== SISTEMA DO QR CODE =====
document.addEventListener("DOMContentLoaded", function() {
    const gerarQRBtn = document.getElementById("gerarQR");
    const qrContainer = document.getElementById("qrContainer");
    const closeQRBtn = document.getElementById("closeQR");
    const donationForm = document.getElementById("formDoacao");
    const donationModal = document.getElementById("donationModal");

    if (gerarQRBtn && qrContainer) {
        gerarQRBtn.addEventListener("click", function() {
            // Validar se todos os campos obrigatórios estão preenchidos
            const dataNascimento = document.getElementById("dataNascimento").value;
            const instituicao = document.getElementById("instituicao").value;
            const tipoDoacao = document.getElementById("tipoDoacao").value;
            
            if (!dataNascimento || !instituicao || !tipoDoacao) {
                alert("Por favor, preencha todos os campos obrigatórios antes de gerar o QR Code.");
                return;
            }
            
            // Validar idade (maior de 18 anos)
            if (!validarMaiorIdade(dataNascimento)) {
                alert("Para fazer doações é necessário ser maior de idade (18 anos ou mais).");
                return;
            }
            
            // Mostrar seção do QR Code
            mostrarQRCode();
        });
    }

    if (closeQRBtn) {
        closeQRBtn.addEventListener("click", function() {
            esconderQRCode();
        });
    }

    function mostrarQRCode() {
        // Adicionar classe ao modal para estilização
        donationModal.classList.add("qr-active");
        
        // Mostrar seção do QR Code com animação
        qrContainer.classList.remove("qr-hidden");
        qrContainer.classList.add("qr-visible");
        
        // Rolar para a seção do QR Code
        qrContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
        
        console.log("QR Code gerado com sucesso!");
    }

    function esconderQRCode() {
        // Remover classes de animação
        donationModal.classList.remove("qr-active");
        qrContainer.classList.remove("qr-visible");
        qrContainer.classList.add("qr-hidden");
        
        // Rolar de volta para o topo do modal
        donationModal.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        });
    }

    // Função para validar maioridade
    function validarMaiorIdade(dataNascimento) {
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mes = hoje.getMonth() - nascimento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        
        return idade >= 18;
    }

    // Fechar QR Code quando o modal for fechado
    if (donationModal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'style') {
                    const display = window.getComputedStyle(donationModal).display;
                    if (display === 'none') {
                        esconderQRCode();
                    }
                }
            });
        });
        
        observer.observe(donationModal, {
            attributes: true,
            attributeFilter: ['style']
        });
    }

});

// ===== SISTEMA DE QR CODE - ISOLADO E FUNCIONAL =====

// EVITAR CONFLITOS - Executar APENAS quando necessário
(function() {
    'use strict'; // Modo estrito para evitar erros
    
    console.log('🔒 Inicializando sistema QR Code isolado...');
    
    // AGUARDAR TUDO CARREGAR
    window.addEventListener('load', function() {
        console.log('✅ Página totalmente carregada, iniciando QR Code...');
        
        // Esperar mais 2 segundos para evitar conflitos
        setTimeout(iniciarSistemaQRCodeIsolado, 2000);
    });
    
    function iniciarSistemaQRCodeIsolado() {
        console.log('🎯 Sistema QR Code isolado iniciando...');
        
        // ENCONTRAR BOTÃO DE FORMA AGGRESSIVA
        let botaoQR = encontrarBotaoQRCode();
        
        if (!botaoQR) {
            console.error('❌ Botão QR Code não encontrado!');
            criarBotaoManual();
            return;
        }
        
        console.log('✅ Botão encontrado:', botaoQR);
        
        // CONFIGURAR BOTÃO COM EVENTO DIRETO
        configurarBotaoQRCode(botaoQR);
        
        // BOTÃO FECHAR
        const btnFechar = document.getElementById('closeQR');
        if (btnFechar) {
            btnFechar.addEventListener('click', function() {
                const qrSection = document.getElementById('qrContainer');
                if (qrSection) {
                    qrSection.classList.add('qr-hidden');
                    qrSection.classList.remove('qr-visible');
                }
            });
        }
        
        console.log('🎉 Sistema QR Code configurado com sucesso!');
    }
    
    function encontrarBotaoQRCode() {
        // Método 1: Pelo ID correto
        let botao = document.getElementById('gerarQR');
        if (botao) return botao;
        
        // Método 2: Pelo ID errado (com O)
        botao = document.getElementById('geraroQR');
        if (botao) {
            console.log('⚠️ Botão com ID errado "geraroQR", corrigindo...');
            botao.id = 'gerarQR'; // Corrigir o ID
            return botao;
        }
        
        // Método 3: Por classe
        botao = document.querySelector('.submit-donation-btn');
        if (botao && (botao.textContent.includes('QR') || botao.innerHTML.includes('QR'))) {
            return botao;
        }
        
        // Método 4: Por texto
        const botoes = document.getElementsByTagName('button');
        for (let i = 0; i < botoes.length; i++) {
            const btn = botoes[i];
            if (btn.textContent.includes('Gerar QR') || btn.textContent.includes('QR Code')) {
                return btn;
            }
        }
        
        return null;
    }
    
    function configurarBotaoQRCode(botao) {
        console.log('⚙️ Configurando botão QR Code...');
        
        // 1. GARANTIR que é type="button"
        botao.type = 'button';
        
        // 2. REMOVER QUALQUER EVENTO EXISTENTE
        const novoBotao = botao.cloneNode(true);
        botao.parentNode.replaceChild(novoBotao, botao);
        botao = novoBotao;
        
        // 3. ADICIONAR NOSSO EVENTO (com capture phase)
        botao.addEventListener('click', handleClickQRCode, true);
        
        // 4. TAMBÉM adicionar onclick direto
        botao.onclick = handleClickQRCode;
        
        console.log('✅ Botão configurado com múltiplos eventos!');
    }
    
    function handleClickQRCode(event) {
        // PARAR TUDO
        if (event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
        
        console.log('🎯 EVENTO QR CODE CAPTURADO!');
        
        // VALIDAR
        if (!validarFormularioDoacao()) {
            return false;
        }
        
        // GERAR QR CODE
        gerarQRCodeDoacao();
        
        // IMPEDIR QUALQUER OUTRO COMPORTAMENTO
        return false;
    }
    
    function validarFormularioDoacao() {
        console.log('📋 Validando formulário...');
        
        const elementos = {
            data: document.getElementById('dataNascimento'),
            instituicao: document.getElementById('instituicao'),
            tipo: document.getElementById('tipoDoacao')
        };
        
        // Verificar existência
        for (let [nome, elem] of Object.entries(elementos)) {
            if (!elem) {
                console.error(`Elemento ${nome} não encontrado`);
                alert('Erro no formulário. Campos não encontrados.');
                return false;
            }
        }
        
        // Verificar preenchimento
        if (!elementos.data.value || !elementos.instituicao.value || !elementos.tipo.value) {
            alert('❌ Por favor, preencha todos os campos obrigatórios (*)');
            return false;
        }
        
        // Validar idade
        const dataNasc = new Date(elementos.data.value);
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNasc.getFullYear();
        
        if (hoje.getMonth() < dataNasc.getMonth() || 
            (hoje.getMonth() === dataNasc.getMonth() && hoje.getDate() < dataNasc.getDate())) {
            idade--;
        }
        
        if (idade < 18) {
            alert('❌ Para doar é necessário ter 18 anos ou mais.');
            return false;
        }
        
        return true;
    }
    
  // ===== SISTEMA INTEGRADO DE DOAÇÃO =====

// Mapeamento dos tipos de doação
const tiposDoacao = {
    'dinheiro': {
        texto: 'Gerar QR Code PIX',
        icone: 'fa-qrcode',
        cor: '#008080',
        acao: 'gerarQRCodeDoacao' // ⬅️ Agora chama a função existente
    },
    'alimentos': {
        texto: 'Doar Alimentos',
        icone: 'fa-apple-alt',
        cor: '#28a745',
        acao: 'processarDoacaoItem'
    },
    'roupas': {
        texto: 'Doar Roupas',
        icone: 'fa-tshirt',
        cor: '#17a2b8',
        acao: 'processarDoacaoItem'
    },
    'brinquedos': {
        texto: 'Doar Brinquedos',
        icone: 'fa-gamepad',
        cor: '#ffc107',
        acao: 'processarDoacaoItem'
    }
};

// Sistema principal
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('🚀 Inicializando sistema integrado de doação...');
        inicializarSistemaIntegrado();
    }, 1500);
});

function inicializarSistemaIntegrado() {
    const tipoSelect = document.getElementById('tipoDoacao');
    const botao = document.getElementById('botaoDoacao') || document.getElementById('gerarQR');
    
    if (!tipoSelect || !botao) {
        console.error('Elementos não encontrados');
        return;
    }
    
    // Configurar eventos
    tipoSelect.addEventListener('change', function() {
        atualizarBotaoDoacao(this.value);
    });
    
    botao.addEventListener('click', function(e) {
        e.preventDefault();
        
        const tipoSelecionado = tipoSelect.value;
        
        if (!tipoSelecionado) {
            alert('❌ Selecione um tipo de doação primeiro.');
            return;
        }
        
        if (!validarFormularioDoacao()) {
            return;
        }
        
        // Chamar função baseada no tipo
        if (tipoSelecionado === 'dinheiro') {
            gerarQRCodeDoacao(); // ⬅️ Chama a função EXISTENTE
        } else {
            processarDoacaoItem(tipoSelecionado);
        }
    });
    
    // Estado inicial
    atualizarBotaoDoacao('');
}

function atualizarBotaoDoacao(tipo) {
    const botao = document.getElementById('botaoDoacao') || document.getElementById('gerarQR');
    
    if (!botao) return;
    
    if (!tipo) {
        botao.innerHTML = '<i class="fas fa-heart"></i> Selecione o tipo de doação';
        botao.style.background = '#6c757d';
        botao.disabled = true;
        return;
    }
    
    const config = tiposDoacao[tipo];
    
    if (!config) return;
    
    botao.innerHTML = `<i class="fas ${config.icone}"></i> ${config.texto}`;
    botao.style.background = config.cor;
    botao.disabled = false;
}

function processarDoacaoItem(tipo) {
    const instituicaoSelect = document.getElementById('instituicao');
    const nomeInstituicao = instituicaoSelect.options[instituicaoSelect.selectedIndex].text;
    
        const mensagem = `Obrigado pela sua doação, ${nome}! Sua contribuição fará a diferença.`;
        
        alert(mensagem);
        
        // Fechar modal após sucesso
        setTimeout(() => {
            const modal = document.getElementById('donationModal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Resetar
            const form = document.getElementById('formDoacao');
            if (form) {
                form.reset();
                atualizarBotaoDoacao('');
            }
        }, 3000);
}


    function gerarQRCodeDoacao() {
        console.log('🎨 Gerando QR Code de doação...');
        
        if (typeof QRCode === 'undefined') {
            alert('❌ Biblioteca QRCode não carregada!');
            return;
        }
        
        try {
            // Obter dados
            const instituicaoSelect = document.getElementById('instituicao');
            const tipoSelect = document.getElementById('tipoDoacao');
            
            // VERIFICAR se é doação em dinheiro
            if (!tipoSelect || tipoSelect.value !== 'dinheiro') {
                alert('⚠️ Esta função só está disponível para doações em dinheiro.');
                return;
            }
            
            const nomeInstituicao = instituicaoSelect.options[instituicaoSelect.selectedIndex].text;
            
            // Container do QR Code
            let container = document.querySelector('.qr-image-container');
            
            if (!container) {
                container = document.createElement('div');
                container.className = 'qr-image-container';
                container.style.cssText = 'margin: 20px auto; text-align: center;';
                
                const qrContainer = document.getElementById('qrContainer');
                if (qrContainer) {
                    const header = qrContainer.querySelector('.qr-header');
                    if (header) header.after(container);
                }
            }
            
            // Limpar e gerar QR Code com texto CURTO
            container.innerHTML = '';
            
            // Texto SUPER CURTO para evitar erro "overflow"
            const textoQR = `DOA:${nomeInstituicao.substring(0, 3).toUpperCase()}:10.00`;
            
            new QRCode(container, {
                text: textoQR,
                width: 250,
                height: 250,
                colorDark: "#008080",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
            

            // Mensagem de sucesso
            setTimeout(() => {
                alert(`✅ QR Code gerado com sucesso!`);
            }, 300);
            
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro: ' + error.message);
        }
    }
    
    // Função para criar texto SIMPLIFICADO para QR Code
    function criarTextoQRSimplificado(nomeInstituicao) {
        // Para PIX, precisamos de um formato específico
        // Vamos usar um texto BEM CURTO
        
        // Opção 1: Apenas dados essenciais
        const textoCurto = `PIX:ABRACOSOLIDARIO\nINST:${nomeInstituicao.substring(0, 20)}\nVAL:10.00`;
        
        // Opção 2: Apenas um link ou código simples
        // const textoCurto = `DOACAO:${nomeInstituicao.substring(0, 15)}:10.00`;
        
        // Opção 3: Código mínimo
        // const textoCurto = `D:${nomeInstituicao.charAt(0)}:10`;
        
        console.log('Texto simplificado criado:', textoCurto);
        return textoCurto;
    }
    
    // Função de EMERGÊNCIA para QR Code ULTRA SIMPLES
    function gerarQRCodeUltraSimples() {
        console.log('🚨 Gerando QR Code ULTRA SIMPLES...');
        
        const container = document.querySelector('.qr-image-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Texto MINIMALISTA
        const textoMinimo = "DOACAO:10.00"; // Apenas 12 caracteres!
        
        try {
            new QRCode(container, {
                text: textoMinimo,
                width: 250,
                height: 250,
                colorDark: "#008080",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L // ⬅️ Nível mais baixo (mais caracteres permitidos)
            });
            
            console.log('✅ QR Code ultra simples gerado!');
            alert('✅ QR Code gerado (versão simplificada)!');
            
        } catch (error) {
            console.error('❌ ERRO CRÍTICO:', error);
            alert('❌ Não foi possível gerar QR Code. O texto é muito longo.');
        }
    }
    
    function criarContainerQRCode() {
        const container = document.createElement('div');
        container.className = 'qr-image-container';
        container.style.cssText = `
            width: 250px;
            height: 250px;
            margin: 20px auto;
            padding: 10px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
        `;
        
        // Inserir no local correto
        const qrContainer = document.getElementById('qrContainer');
        if (qrContainer) {
            const qrHeader = qrContainer.querySelector('.qr-header');
            if (qrHeader) {
                qrHeader.after(container);
            } else {
                qrContainer.prepend(container);
            }
        }
        
        return container;
    }
    
    function mostrarSecaoQRCode(instituicao) {
        const qrContainer = document.getElementById('qrContainer');
        
        if (!qrContainer) {
            console.error('Seção QR não encontrada!');
            return;
        }
        
        // Mostrar
        qrContainer.classList.remove('qr-hidden');
        qrContainer.classList.add('qr-visible');
        
        // Atualizar título
        const titulo = qrContainer.querySelector('h3');
        if (titulo) {
            titulo.textContent = `QR Code PIX - ${instituicao}`;
        }
        
        // Scroll
        setTimeout(() => {
            qrContainer.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 100);
    }
    
    function criarBotaoManual() {
        console.log('⚠️ Criando botão manual de emergência...');
        
        // Criar botão flutuante
        const botaoEmergencia = document.createElement('button');
        botaoEmergencia.textContent = '🎯 GERAR QR CODE (EMERGÊNCIA)';
        botaoEmergencia.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            background: #008080;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,128,128,0.4);
        `;
        
        botaoEmergencia.onclick = function() {
            alert('Botão de emergência funcionando!');
            gerarQRCodeDoacao();
        };
        
        document.body.appendChild(botaoEmergencia);
        
        console.log('✅ Botão de emergência criado!');
    }
    
})();

// ===== SISTEMA DE BOTÃO DINÂMICO =====

// Mapeamento dos tipos de doação para textos e ícones
const tiposDoacao = {
    'dinheiro': {
        texto: 'Gerar QR Code PIX',
        icone: 'fa-qrcode',
        cor: '#008080',
        acao: 'gerarQRCode'
    },
    'alimentos': {
        texto: 'Doar Alimentos',
        icone: 'fa-apple-alt',
        cor: '#28a745',
        acao: 'processarDoacaoItem'
    },
    'roupas': {
        texto: 'Doar Roupas',
        icone: 'fa-tshirt',
        cor: '#17a2b8',
        acao: 'processarDoacaoItem'
    },
    'brinquedos': {
        texto: 'Doar Brinquedos',
        icone: 'fa-gamepad',
        cor: '#ffc107',
        acao: 'processarDoacaoItem'
    }
};

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarSistemaDoacao, 1000);
});

function inicializarSistemaDoacao() {
    console.log('⚙️ Inicializando sistema de doação dinâmica...');
    
    const tipoSelect = document.getElementById('tipoDoacao');
    const botaoDoacao = document.getElementById('botaoDoacao') || document.getElementById('gerarQR');
    
    if (!tipoSelect || !botaoDoacao) {
        console.error('Elementos não encontrados!');
        return;
    }
    
    // 1. Configurar evento no select
    tipoSelect.addEventListener('change', function() {
        atualizarBotaoDoacao(this.value);
        verificarExibicaoQRCode(this.value);
    });
    
    // 2. Configurar clique no botão
    botaoDoacao.addEventListener('click', function(e) {
        e.preventDefault();
        
        const tipoSelecionado = tipoSelect.value;
        
        if (!tipoSelecionado) {
            alert('❌ Por favor, selecione um tipo de doação primeiro.');
            return;
        }
        
        // Validar formulário primeiro
        if (!validarFormularioDoacao()) {
            return;
        }
        
        // Executar ação baseada no tipo
        executarAcaoDoacao(tipoSelecionado);
    });
    
    // 3. Estado inicial
    atualizarBotaoDoacao('');
    
    console.log('✅ Sistema de doação dinâmica configurado!');
}

// Função para atualizar o botão conforme o tipo selecionado
function atualizarBotaoDoacao(tipo) {
    const botao = document.getElementById('botaoDoacao') || document.getElementById('gerarQR');
    
    if (!botao) return;
    
    if (!tipo) {
        // Nenhum tipo selecionado
        botao.innerHTML = '<i class="fas fa-heart"></i> Selecione o tipo de doação';
        botao.style.background = '#6c757d';
        botao.disabled = true;
        botao.style.opacity = '0.7';
        botao.style.cursor = 'not-allowed';
        return;
    }
    
    const config = tiposDoacao[tipo];
    
    if (!config) {
        console.error('Tipo não reconhecido:', tipo);
        return;
    }
    
    // Atualizar botão
    botao.innerHTML = `<i class="fas ${config.icone}"></i> ${config.texto}`;
    botao.style.background = config.cor;
    botao.disabled = false;
    botao.style.opacity = '1';
    botao.style.cursor = 'pointer';
    
    // Adicionar efeito de transição
    botao.style.transition = 'all 0.3s ease';
    
    console.log(`✅ Botão atualizado para: ${config.texto}`);
}

// Função para verificar se deve mostrar QR Code
function verificarExibicaoQRCode(tipo) {
    const qrSection = document.getElementById('qrContainer');
    
    if (!qrSection) return;
    
    if (tipo === 'dinheiro') {
        // Para dinheiro, apenas esconder se estiver visível
        // O QR Code será gerado ao clicar no botão
        console.log('💰 Doação em dinheiro selecionada');
    } else {
        // Para outros tipos, garantir que QR Code esteja escondido
        qrSection.classList.add('qr-hidden');
        qrSection.classList.remove('qr-visible');
        console.log(`📦 Doação de ${tipo} selecionada - QR Code escondido`);
    }
}

// Função para executar a ação baseada no tipo
function executarAcaoDoacao(tipo) {
    const config = tiposDoacao[tipo];
    
    if (!config) {
        alert('Tipo de doação não reconhecido.');
        return;
    }
    
    console.log(`🎯 Executando ação: ${config.acao} para ${tipo}`);
    
    switch(config.acao) {
        case 'gerarQRCode':
            gerarQRCodeDoacao();
            break;
            
        case 'processarDoacaoItem':
            processarDoacaoItem(tipo);
            break;
            
        default:
            alert('Ação não configurada para este tipo de doação.');
    }
}

// Função para processar doação de itens
function processarDoacaoItem(tipoItem) {
    const instituicaoSelect = document.getElementById('instituicao');
    const motivacaoTextarea = document.getElementById('motivacao');
    
    if (!instituicaoSelect) {
        alert('Erro: Instituição não selecionada.');
        return;
    }
    
    const nomeInstituicao = instituicaoSelect.options[instituicaoSelect.selectedIndex].text;
    const motivacao = motivacaoTextarea ? motivacaoTextarea.value : '';
    
    // Mapear tipo para texto amigável
    const tiposTexto = {
        'alimentos': 'alimentos',
        'roupas': 'roupas',
        'brinquedos': 'brinquedos'
    };
    
    const tipoTexto = tiposTexto[tipoItem] || 'itens';
    
    
    // Registrar a doação no localStorage (opcional)
    registrarDoacaoItem(tipoItem, nomeInstituicao, motivacao);
    
    // Fechar o modal após alguns segundos
    setTimeout(() => {
        const modal = document.getElementById('donationModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Resetar formulário
        const form = document.getElementById('formDoacao');
        if (form) {
            form.reset();
            atualizarBotaoDoacao('');
        }
    }, 5000);
}

// Função para registrar doação de item
function registrarDoacaoItem(tipo, instituicao, motivacao) {
    try {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        
        const doacao = {
            tipo: 'item',
            item: tipo,
            instituicao: instituicao,
            usuario: usuarioLogado ? usuarioLogado.nome : 'Visitante',
            motivacao: motivacao,
            data: new Date().toLocaleString('pt-BR'),
            status: 'pendente'
        };
        
        console.log('📝 Doação de item registrada:', doacao);
        
        // Salvar no localStorage
        const doacoes = JSON.parse(localStorage.getItem('doacoes')) || [];
        doacoes.push(doacao);
        localStorage.setItem('doacoes', JSON.stringify(doacoes));
        
    } catch (error) {
        console.error('Erro ao registrar doação:', error);
    }
}

// Atualizar a função de validar formulário
function validarFormularioDoacao() {
    console.log('📋 Validando formulário...');
    
    const dataInput = document.getElementById('dataNascimento');
    const instituicaoSelect = document.getElementById('instituicao');
    const tipoSelect = document.getElementById('tipoDoacao');
    
    // Verificar existência
    if (!dataInput || !instituicaoSelect || !tipoSelect) {
        alert('Erro no formulário. Recarregue a página.');
        return false;
    }
    
    // Verificar preenchimento
    if (!dataInput.value || !instituicaoSelect.value || !tipoSelect.value) {
        alert('❌ Por favor, preencha todos os campos obrigatórios (*)');
        return false;
    }
    
    // Validar idade (18+)
    const dataNasc = new Date(dataInput.value);
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    
    if (hoje.getMonth() < dataNasc.getMonth() || 
        (hoje.getMonth() === dataNasc.getMonth() && hoje.getDate() < dataNasc.getDate())) {
        idade--;
    }
    
    if (idade < 18) {
        alert('❌ Para doar é necessário ter 18 anos ou mais.');
        return false;
    }
    
    return true;
}
// Função para adicionar classe de cor ao botão
function adicionarClasseCorBotao(tipo) {
    const botao = document.getElementById('botaoDoacao') || document.getElementById('gerarQR');
    
    if (!botao) return;
    
    // Remover todas as classes de cor
    botao.classList.remove('botao-dinheiro', 'botao-alimentos', 'botao-roupas', 'botao-brinquedos');
    
    // Adicionar classe específica
    switch(tipo) {
        case 'dinheiro':
            botao.classList.add('botao-dinheiro');
            break;
        case 'alimentos':
            botao.classList.add('botao-alimentos');
            break;
        case 'roupas':
            botao.classList.add('botao-roupas');
            break;
        case 'brinquedos':
            botao.classList.add('botao-brinquedos');
            break;
    }
}

// Atualize a função atualizarBotaoDoacao para incluir isso:
function atualizarBotaoDoacao(tipo) {
    const botao = document.getElementById('botaoDoacao') || document.getElementById('gerarQR');
    
    if (!botao) return;
    
    if (!tipo) {
        // Estado neutro
        botao.innerHTML = '<i class="fas fa-heart"></i> Selecione o tipo de doação';
        botao.style.background = '#6c757d';
        botao.disabled = true;
        botao.classList.remove('botao-dinheiro', 'botao-alimentos', 'botao-roupas', 'botao-brinquedos');
        return;
    }
    
    const config = tiposDoacao[tipo];
    
    if (!config) return;
    
    // Atualizar conteúdo
    botao.innerHTML = `<i class="fas ${config.icone}"></i> ${config.texto}`;
    botao.disabled = false;
    
    // Adicionar classe de cor
    adicionarClasseCorBotao(tipo);
    
    console.log(`✅ Botão atualizado para: ${config.texto}`);
}

// Adicione esta função para diagnóstico
function verificarConexoesQR() {
    console.log('🔍 Verificando conexões do sistema QR...');
    
    const elementos = {
        tipoSelect: document.getElementById('tipoDoacao'),
        botao: document.getElementById('botaoDoacao') || document.getElementById('gerarQR'),
        qrContainer: document.getElementById('qrContainer'),
        imageContainer: document.querySelector('.qr-image-container'),
        instituicaoSelect: document.getElementById('instituicao')
    };
    
    Object.entries(elementos).forEach(([nome, elem]) => {
        console.log(`${nome}:`, elem ? '✅ ENCONTRADO' : '❌ NÃO ENCONTRADO');
    });
    
    // Testar se a função gerarQRCodeDoacao é chamada
    console.log('gerarQRCodeDoacao é função?', typeof gerarQRCodeDoacao === 'function');
    
    // Testar clique manual
    if (elementos.botao) {
        console.log('ID do botão:', elementos.botao.id);
        console.log('HTML do botão:', elementos.botao.outerHTML.substring(0, 100) + '...');
    }
}

// Execute no Console para diagnóstico
verificarConexoesQR();

// ===== SISTEMA DE QR CODE - VERSÃO FINAL FUNCIONAL =====

// Garantir que as funções existam
if (typeof gerarQRCodeDoacao === 'undefined') {
    window.gerarQRCodeDoacao = function() {
        console.log('🎨 GERANDO QR CODE (função de emergência)...');
        
        if (typeof QRCode === 'undefined') {
            alert('❌ Biblioteca QRCode não carregada!');
            return;
        }
        
        try {
            // Obter dados
            const instituicaoSelect = document.getElementById('instituicao');
            const tipoSelect = document.getElementById('tipoDoacao');
            
            if (!instituicaoSelect || !tipoSelect) {
                alert('Erro: Elementos não encontrados.');
                return;
            }
            
            const nomeInstituicao = instituicaoSelect.options[instituicaoSelect.selectedIndex].text;
            
            // Container do QR Code
            let container = document.querySelector('.qr-image-container');
            
            if (!container) {
                console.log('📦 Criando container...');
                container = document.createElement('div');
                container.className = 'qr-image-container';
                container.style.cssText = `
                    width: 250px;
                    height: 250px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 10px;
                    padding: 10px;
                `;
                
                const qrContainer = document.getElementById('qrContainer');
                if (qrContainer) {
                    const header = qrContainer.querySelector('.qr-header');
                    if (header) {
                        header.after(container);
                    }
                }
            }
            
            // Limpar e gerar
            container.innerHTML = '';
            
            // Texto CURTO
            const textoQR = `DOA:${nomeInstituicao.substring(0, 3).toUpperCase()}:10.00`;
            
            new QRCode(container, {
                text: textoQR,
                width: 250,
                height: 250,
                colorDark: "#008080",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
            
            console.log('✅ QR Code gerado!');
            
            // CHAMAR FUNÇÃO PARA MOSTRAR
            if (typeof mostrarSecaoQRCode === 'function') {
                mostrarSecaoQRCode(nomeInstituicao);
            } else {
                // Se a função não existir, mostrar manualmente
                mostrarQRCodeManual(nomeInstituicao);
            }
            
            setTimeout(() => {
                alert(`✅ QR Code gerado!\n\nInstituição: ${nomeInstituicao}`);
            }, 300);
            
        } catch (error) {
            console.error('❌ Erro:', error);
            alert('Erro: ' + error.message);
        }
    };
    
    console.log('✅ Função gerarQRCodeDoacao criada (emergência)');
}

// Função para mostrar QR Code (se a original não existir)
if (typeof mostrarSecaoQRCode === 'undefined') {
    window.mostrarSecaoQRCode = function(instituicao) {
        console.log('👁️ MOSTRANDO QR Code (função de emergência)...');
        mostrarQRCodeManual(instituicao);
    };
}

// Função manual para mostrar QR Code
function mostrarQRCodeManual(instituicao) {
    const qrContainer = document.getElementById('qrContainer');
    
    if (!qrContainer) {
        console.error('❌ Container QR não encontrado!');
        return;
    }
    
    console.log('🎯 Mostrando QR Code manualmente...');
    
    // REMOVER hidden
    qrContainer.classList.remove('qr-hidden');
    
    // ADICIONAR visible
    qrContainer.classList.add('qr-visible');
    
    // FORÇAR estilos
    qrContainer.style.cssText = `
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        background: white !important;
        padding: 20px !important;
        border-radius: 10px !important;
        margin: 20px 0 !important;
        border: 2px solid #008080 !important;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important;
    `;
    
    // Atualizar título
    const titulo = qrContainer.querySelector('h3');
    if (titulo) {
        titulo.textContent = `QR Code PIX - ${instituicao}`;
        titulo.style.color = '#008080';
    }
    
    // Scroll
    setTimeout(() => {
        qrContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }, 100);
    
    console.log('✅ QR Code mostrado!');
}

// Sistema do botão dinâmico (SE ainda não existir)
if (!window.sistemaDoacaoInicializado) {
    setTimeout(() => {
        console.log('⚙️ Configurando botão dinâmico...');
        
        const tipoSelect = document.getElementById('tipoDoacao');
        const botao = document.getElementById('botaoDoacao');
        
        if (tipoSelect && botao) {
            // Evento de change no select
            tipoSelect.addEventListener('change', function() {
                const tipo = this.value;
                
                if (tipo === 'dinheiro') {
                    botao.innerHTML = '<i class="fas fa-qrcode"></i> Gerar QR Code PIX';
                    botao.style.background = '#008080';
                } else if (tipo === 'alimentos') {
                    botao.innerHTML = '<i class="fas fa-apple-alt"></i> Doar Alimentos';
                    botao.style.background = '#28a745';
                } else if (tipo === 'roupas') {
                    botao.innerHTML = '<i class="fas fa-tshirt"></i> Doar Roupas';
                    botao.style.background = '#17a2b8';
                } else if (tipo === 'brinquedos') {
                    botao.innerHTML = '<i class="fas fa-gamepad"></i> Doar Brinquedos';
                    botao.style.background = '#ffc107';
                } else {
                    botao.innerHTML = '<i class="fas fa-heart"></i> Selecione o tipo';
                    botao.style.background = '#6c757d';
                }
                
                botao.disabled = !tipo;
            });
            
            // Evento de clique no botão
            botao.addEventListener('click', function(e) {
                e.preventDefault();
                
                const tipo = tipoSelect.value;
                
                if (!tipo) {
                    alert('Selecione um tipo de doação.');
                    return;
                }
                
                // Validar campos obrigatórios
                const data = document.getElementById('dataNascimento').value;
                const instituicao = document.getElementById('instituicao').value;
                
                if (!data || !instituicao) {
                    alert('Preencha todos os campos obrigatórios.');
                    return;
                }
                
                // Ação baseada no tipo
                if (tipo === 'dinheiro') {
                    // Chamar função de gerar QR Code
                    if (typeof gerarQRCodeDoacao === 'function') {
                        gerarQRCodeDoacao();
                    } else {
                        alert('Erro: Função não disponível.');
                    }
                } else {
                    const tiposTexto = {
                        'alimentos': 'alimentos',
                        'roupas': 'roupas', 
                        'brinquedos': 'brinquedos'
                    };
                    
                    alert(`✅ Doação de ${tiposTexto[tipo]} registrada!`);
                }
            });
            
            console.log('✅ Botão dinâmico configurado!');
            window.sistemaDoacaoInicializado = true;
        }
    }, 1000);
}