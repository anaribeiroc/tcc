// ===== CONFIGURAÇÕES GLOBAIS =====
const API_URL = 'http://localhost/abraco-solidario/backend/api';
let currentUser = null;
let processandoDoacao = false; // Variável global para evitar duplo clique

// ===== SISTEMA DE LOGIN E USUÁRIOS COM BACKEND =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('Iniciando sistema Abraço Solidário...');

    // Elementos do DOM para o sistema de usuário
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');
    const mobileUserMenu = document.getElementById('mobileUserMenu');
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    const mobileLoginBtn = document.getElementById('mobileLoginBtn');

    // ===== FUNÇÃO DE LOG SIMPLIFICADA =====
    function log(message, data = null) {
        console.log(`[Abraço Solidário] ${message}`, data || '');
    }

    // ===== TESTAR CONEXÃO COM BACKEND =====
    async function testarConexaoBackend() {
        try {
            log('Testando conexão com backend...');
            const response = await fetch(`${API_URL}/test-connection.php`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            log('Conexão com backend:', data);

            if (data.status === 'success') {
                return true;
            } else {
                console.warn('Backend retornou erro:', data);
                return false;
            }

        } catch (error) {
            console.error('Falha na conexão com backend:', error);
            console.info('Dica: Verifique se:');
            console.info('1. Servidor Apache/XAMPP está rodando');
            console.info('2. Arquivos PHP estão na pasta correta (htdocs)');
            console.info('3. URL do backend está correta:', API_URL);
            return false;
        }
    }

    // ===== FUNÇÕES DO SISTEMA DE USUÁRIO =====
    async function checkUserLoginStatus() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (usuarioLogado && usuarioLogado.nome) {
            try {
                // Usar verificação simples baseada no localStorage
                mostrarUsuarioLogado(usuarioLogado.nome);
                log('Usuário encontrado no localStorage:', usuarioLogado.nome);
            } catch (error) {
                log('Token inválido, fazendo logout');
                fazerLogout();
            }
        } else {
            mostrarUsuarioDeslogado();
        }
    }

    // Função para mostrar usuário logado
    function mostrarUsuarioLogado(nome) {
        try {
            // Atualizar menu desktop
            if (userMenu && userName) {
                userMenu.style.display = 'flex';
                userName.textContent = nome.substring(0, 15) + (nome.length > 15 ? '...' : '');
            }
            if (loginBtn) {
                loginBtn.style.display = 'none';
            }

            // Atualizar menu mobile
            if (mobileUserMenu && mobileUserName) {
                mobileUserMenu.style.display = 'flex';
                mobileUserName.textContent = nome.substring(0, 15) + (nome.length > 15 ? '...' : '');
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.style.display = 'none';
            }

            // Adicionar classe ao body para estilização
            document.body.classList.add('user-logged-in');

        } catch (error) {
            console.error('Erro ao mostrar usuário logado:', error);
        }
    }

    // Função para mostrar usuário deslogado
    function mostrarUsuarioDeslogado() {
        try {
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

        } catch (error) {
            console.error('Erro ao mostrar usuário deslogado:', error);
        }
    }

    // Função para fazer login com backend
    async function fazerLogin(email, senha) {
        try {
            log('Tentando login para:', email);

            // Primeiro testar conexão
            const conexaoOk = await testarConexaoBackend();
            if (!conexaoOk) {
                return {
                    success: false,
                    message: 'Servidor temporariamente indisponível. Usando modo offline.'
                };
            }

            const response = await fetch(`${API_URL}/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            // Verificar se a resposta é JSON válido
            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Resposta não é JSON válido:', text.substring(0, 200));
                return {
                    success: false,
                    message: 'Erro no servidor. Tente novamente mais tarde.'
                };
            }

            if (data.status === 'success') {
                // Salvar dados do usuário no localStorage
                localStorage.setItem('usuarioLogado', JSON.stringify(data.data));
                mostrarUsuarioLogado(data.data.nome);
                log('Login realizado com sucesso:', data.data.nome);
                return { success: true, nome: data.data.nome };
            } else {
                log('Login falhou:', data.message);
                return { success: false, message: data.message || 'Credenciais inválidas' };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                message: 'Erro de conexão. Verifique se o servidor está rodando.'
            };
        }
    }

    // Função para criar conta com backend
    async function criarContaBackend(dadosUsuario) {
        try {
            log('Criando conta para:', dadosUsuario.email);

            const conexaoOk = await testarConexaoBackend();
            if (!conexaoOk) {
                // Modo offline - salvar no localStorage
                const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

                // Verificar se email já existe
                if (usuarios.some(u => u.email === dadosUsuario.email)) {
                    return { success: false, message: 'Este e-mail já está cadastrado localmente.' };
                }

                // Adicionar usuário
                usuarios.push({
                    id: Date.now(),
                    nome: dadosUsuario.nome_completo,
                    email: dadosUsuario.email,
                    senha: dadosUsuario.senha,
                    data_nascimento: dadosUsuario.data_nascimento
                });

                localStorage.setItem('usuarios', JSON.stringify(usuarios));

                // Fazer login automático
                localStorage.setItem('usuarioLogado', JSON.stringify({
                    id: Date.now(),
                    nome: dadosUsuario.nome_completo,
                    email: dadosUsuario.email
                }));

                mostrarUsuarioLogado(dadosUsuario.nome_completo);
                return { success: true, nome: dadosUsuario.nome_completo };
            }

            const response = await fetch(`${API_URL}/usuarios.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosUsuario)
            });

            const text = await response.text();
            let data;

            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Resposta não é JSON:', text.substring(0, 200));
                return {
                    success: false,
                    message: 'Erro no servidor. Conta criada apenas localmente.'
                };
            }

            if (data.status === 'success') {
                // Fazer login automático
                const loginResult = await fazerLogin(dadosUsuario.email, dadosUsuario.senha);
                return loginResult;
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Erro ao criar conta:', error);
            return {
                success: false,
                message: 'Erro de conexão. Conta criada apenas localmente.'
            };
        }
    }

    // Função para fazer logout
    function fazerLogout() {
        try {
            localStorage.removeItem('usuarioLogado');
            mostrarUsuarioDeslogado();

            // Limpar formulário de doação
            limparFormularioDoacao();

            // Fechar modais se estiverem abertos
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';

            log('Logout realizado');
            alert('Logout realizado com sucesso!');

        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    // Eventos de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', fazerLogout);
    }

    // ===== CARREGAR INSTITUIÇÕES =====
    async function carregarInstituicoes() {
        try {
            log('Carregando instituições...');

            // Dados de fallback
            const instituicoesFallback = [
                {
                    id: 1,
                    nome: 'Patas Felizes',
                    descricao: 'Refúgio para animais abandonados e vítimas de maus-tratos.',
                    imagem: 'image/cachorro.png',
                    itens_necessarios: 'Ração, Medicamentos, Cobertores',
                    endereco: 'Rua dos Animais, 123 - Centro, São Paulo - SP',
                    horario_funcionamento: 'Seg-Sáb: 8h-18h'
                },
                {
                    id: 2,
                    nome: 'Casa de Todos',
                    descricao: 'Espaço de reabilitação para quem busca um novo começo com dignidade e apoio.',
                    imagem: 'image/casatodos.png',
                    itens_necessarios: 'Alimentos, Produtos higiene, Roupas',
                    endereco: 'Av. da Solidariedade, 456 - São Paulo - SP',
                    horario_funcionamento: 'Todos os dias: 9h-17h'
                },
                {
                    id: 3,
                    nome: 'Recanto da Sabedoria',
                    descricao: 'Lar acolhedor para idosos que merecem todo o carinho e respeito.',
                    imagem: 'image/Recanto da Sabedoria.png',
                    itens_necessarios: 'Fraldas, Suplementos, Medicamentos',
                    endereco: 'Travessa da Paz, 789 - São Paulo - SP',
                    horario_funcionamento: 'Seg-Sex: 7h-19h'
                },
                {
                    id: 4,
                    nome: 'Sonho Colorido',
                    descricao: 'Farol de esperança para crianças em comunidades carentes.',
                    imagem: 'image/sonhocolorido.png',
                    itens_necessarios: 'Material escolar, Brinquedos, Roupas',
                    endereco: 'Rua Esperança, 101 - São Paulo - SP',
                    horario_funcionamento: 'Seg-Sex: 13h-17h'
                },
                {
                    id: 5,
                    nome: 'Florescer',
                    descricao: 'Espaço de acolhimento e apoio para quem vive em vulnerabilidade.',
                    imagem: 'image/florescer.png',
                    itens_necessarios: 'Cestas básicas, Higiene, Roupas',
                    endereco: 'Alameda Renovação, 202 - São Paulo - SP',
                    horario_funcionamento: 'Seg-Sex: 10h-16h'
                },
                {
                    id: 6,
                    nome: 'Brilho do Sol',
                    descricao: 'Lar acolhedor onde crianças encontram amor, segurança e esperança.',
                    imagem: 'image/brilhosol.png',
                    itens_necessarios: 'Leite em pó, Fraldas, Roupas bebê',
                    endereco: 'Praça Criança, 303 - São Paulo - SP',
                    horario_funcionamento: 'Todos os dias: 8h-20h'
                }
            ];

            // Tentar carregar do backend
            try {
                const conexaoOk = await testarConexaoBackend();
                if (conexaoOk) {
                    const response = await fetch(`${API_URL}/instituicoes.php`);

                    if (response.ok) {
                        const text = await response.text();
                        if (text) {
                            const data = JSON.parse(text);
                            if (data.status === 'success' && data.data.length > 0) {
                                log('Instituições carregadas do backend:', data.data.length);
                                localStorage.setItem('instituicoes', JSON.stringify(data.data));
                                atualizarInterfaceInstituicoes(data.data);
                                return;
                            }
                        }
                    }
                }
            } catch (backendError) {
                log('Falha ao carregar do backend, usando fallback');
            }

            // Usar dados de fallback
            localStorage.setItem('instituicoes', JSON.stringify(instituicoesFallback));
            atualizarInterfaceInstituicoes(instituicoesFallback);

        } catch (error) {
            console.error('Erro ao carregar instituições:', error);
        }
    }

    function atualizarInterfaceInstituicoes(instituicoes) {
        // 1. Atualizar dropdown no modal de doação
        const selectInstituicao = document.getElementById('instituicao');
        if (selectInstituicao) {
            // Manter primeira opção
            while (selectInstituicao.options.length > 1) {
                selectInstituicao.remove(1);
            }
            
            // Adicionar novas opções
            instituicoes.forEach(inst => {
                const option = document.createElement('option');
                option.value = inst.id;
                option.textContent = inst.nome;
                selectInstituicao.appendChild(option);
            });
        }
        
        // 2. Atualizar cards
        const cards = document.querySelectorAll('.help-card');
        cards.forEach((card, index) => {
            if (instituicoes[index]) {
                const inst = instituicoes[index];
                
                const img = card.querySelector('.help-image img');
                if (img && inst.imagem && !img.src.includes('http')) {
                    const testImg = new Image();
                    testImg.onerror = function() {
                        img.src = inst.imagem;
                        img.alt = inst.nome;
                    };
                    testImg.src = img.src;
                }
                
                // Atualizar texto
                const title = card.querySelector('.help-overlay h3');
                if (title) title.textContent = inst.nome;
                
                const desc = card.querySelector('.help-overlay p');
                if (desc) {
                    desc.textContent = inst.descricao.length > 100 
                        ? inst.descricao.substring(0, 100) + '...' 
                        : inst.descricao;
                }
                
                // Configurar clique
                card.dataset.instituicaoId = inst.id;
                card.onclick = (e) => {
                    e.preventDefault();
                    abrirDetalhesInstituicao(inst.id, inst);
                };
            }
        });
    }

    // ===== PREENCHER AUTOMATICAMENTE FORMULÁRIO =====
    function preencherFormularioDoacao() {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

        if (usuarioLogado && usuarioLogado.nome) {
            try {
                const nomeCompleto = usuarioLogado.nome.split(' ');
                const nome = nomeCompleto[0];
                const sobrenome = nomeCompleto.slice(1).join(' ');

                const nomeInput = document.getElementById('nome');
                const sobrenomeInput = document.getElementById('sobrenome');
                const emailInput = document.getElementById('email');

                if (nomeInput) nomeInput.value = nome || '';
                if (sobrenomeInput) sobrenomeInput.value = sobrenome || '';
                if (emailInput && usuarioLogado.email) {
                    emailInput.value = usuarioLogado.email;
                }

                log('Formulário preenchido automaticamente');
            } catch (error) {
                console.error('Erro ao preencher formulário:', error);
            }
        }
    }

    // ===== REGISTRAR DOAÇÃO =====
    async function registrarDoacaoBackend(dadosDoacao) {
        try {
            const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));

            if (!usuario) {
                return {
                    status: 'error',
                    message: 'Faça login para registrar sua doação'
                };
            }

            // Tentar backend primeiro
            const conexaoOk = await testarConexaoBackend();
            if (conexaoOk) {
                dadosDoacao.usuario_id = usuario.id || 0;

                const response = await fetch(`${API_URL}/doacoes.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dadosDoacao)
                });

                const text = await response.text();
                if (text) {
                    try {
                        const data = JSON.parse(text);
                        return data;
                    } catch (e) {
                        console.error('Resposta não é JSON:', text.substring(0, 200));
                    }
                }
            }

            // Se falhar, salvar localmente
            const doacoes = JSON.parse(localStorage.getItem('doacoes')) || [];
            const novaDoacao = {
                id: Date.now(),
                usuario_id: usuario.id || 0,
                usuario_nome: usuario.nome,
                ...dadosDoacao,
                data_doacao: new Date().toISOString(),
                status: 'pendente'
            };

            doacoes.push(novaDoacao);
            localStorage.setItem('doacoes', JSON.stringify(doacoes));

            return {
                status: 'success',
                message: 'Doação registrada localmente (servidor offline)',
                data: novaDoacao
            };

        } catch (error) {
            console.error('Erro ao registrar doação:', error);
            return {
                status: 'error',
                message: 'Erro ao registrar doação. Tente novamente.'
            };
        }
    }

    // ===== FUNÇÕES DO MODAL DE DETALHES =====
    async function abrirDetalhesInstituicao(instId, instData = null) {
        try {
            let instituicao = instData;

            if (!instituicao) {
                // Buscar do localStorage
                const instituicoes = JSON.parse(localStorage.getItem('instituicoes')) || [];
                instituicao = instituicoes.find(inst => inst.id == instId);

                if (!instituicao) {
                    alert('Instituição não encontrada');
                    return;
                }
            }

            // Preencher modal
            const detailModal = document.getElementById('institutionDetailModal');
            if (!detailModal) return;

            document.getElementById('detailInstitutionName').textContent = instituicao.nome;
            document.getElementById('detailInstitutionTitle').textContent = instituicao.nome;
            document.getElementById('detailInstitutionDescription').textContent = instituicao.descricao;

            const imgElement = document.getElementById('detailInstitutionImage');
            if (imgElement && instituicao.imagem) {
                imgElement.src = instituicao.imagem;
                imgElement.alt = instituicao.nome;
            }

            document.getElementById('detailInstitutionAddress').textContent = instituicao.endereco || 'Endereço não informado';
            document.getElementById('detailInstitutionHours').textContent = instituicao.horario_funcionamento || 'Horário não informado';

            const needsList = document.getElementById('needsList');
            if (needsList && instituicao.itens_necessarios) {
                const itens = instituicao.itens_necessarios.split(',').map(item => item.trim());
                needsList.innerHTML = itens.map(item =>
                    `<div class="need-item"><i class="fas fa-check"></i> ${item}</div>`
                ).join('');
            }

            // Botão de doar
            const donateBtn = document.getElementById('donateToInstitutionBtn');
            if (donateBtn) {
                donateBtn.onclick = () => {
                    fecharDetalhes();
                    setTimeout(() => {
                        openDonationModalWithInstitution(instituicao.id);
                    }, 300);
                };
            }

            // Abrir modal
            detailModal.style.display = 'block';
            document.body.style.overflow = 'hidden';

        } catch (error) {
            console.error('Erro ao abrir detalhes:', error);
            alert('Erro ao carregar detalhes da instituição');
        }
    }

    function fecharDetalhes() {
        const modal = document.getElementById('institutionDetailModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    function openDonationModalWithInstitution(instituicaoId) {
        try {
            const modal = document.getElementById('donationModal');
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';

                // Selecionar instituição
                const instituicaoSelect = document.getElementById('instituicao');
                if (instituicaoSelect) {
                    instituicaoSelect.value = instituicaoId;
                }

                // Preencher automaticamente
                preencherFormularioDoacao();

                // Configurar sistema de doação
                setTimeout(() => {
                    try {
                        configurarSistemaDoacao();
                    } catch (error) {
                        console.error('Erro ao configurar sistema de doação:', error);
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Erro ao abrir modal de doação:', error);
        }
    }

    // ===== CARROSSEL PRINCIPAL (CORRIGIDO) =====
    function initCarousel() {
        try {
            const carousel = document.querySelector('.carousel');
            const indicators = document.querySelectorAll('.indicator');

            if (!carousel || indicators.length === 0) return;

            let currentIndex = 0;
            let autoPlayInterval;

            function updateCarousel() {
                carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentIndex);
                });
            }

            function nextSlide() {
                currentIndex = (currentIndex + 1) % indicators.length;
                updateCarousel();
            }

            function startAutoPlay() {
                if (autoPlayInterval) clearInterval(autoPlayInterval);
                autoPlayInterval = setInterval(nextSlide, 5000);
            }

            // Adicionar eventos aos indicadores
            indicators.forEach(indicator => {
                indicator.addEventListener('click', function () {
                    const index = parseInt(this.getAttribute('data-index') || '0');
                    if (!isNaN(index)) {
                        currentIndex = index;
                        updateCarousel();
                    }
                });
            });

            // Iniciar autoplay
            startAutoPlay();

            // Pausar ao passar o mouse
            carousel.addEventListener('mouseenter', () => {
                clearInterval(autoPlayInterval);
            });

            carousel.addEventListener('mouseleave', startAutoPlay);

        } catch (error) {
            console.error('Erro ao inicializar carrossel:', error);
        }
    }

    // ===== MENU MOBILE =====
    function initMobileMenu() {
        try {
            const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
            const mobileMenu = document.querySelector('.mobile-menu');

            if (!mobileMenuBtn || !mobileMenu) return;

            mobileMenuBtn.addEventListener('click', function () {
                mobileMenu.classList.toggle('active');
            });

            // Fechar menu ao clicar em um item
            mobileMenu.querySelectorAll('.mobile-nav-item').forEach(item => {
                item.addEventListener('click', function () {
                    mobileMenu.classList.remove('active');
                });
            });

        } catch (error) {
            console.error('Erro ao inicializar menu mobile:', error);
        }
    }

    // ===== SMOOTH SCROLL (CORRIGIDO - EVITAR ERRO COM '#') =====
    function initSmoothScroll() {
        try {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');

                    // Ignorar links vazios ou apenas '#'
                    if (!href || href === '#' || href === '#!') {
                        e.preventDefault();
                        return;
                    }

                    const target = document.querySelector(href);
                    if (target) {
                        e.preventDefault();
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Erro no smooth scroll:', error);
        }
    }

    // ===== CARROSSEL DE AJUDA =====
    function initHelpCarousel() {
        try {
            const helpCarousel = document.querySelector('.help-cards-carousel');
            const helpCards = document.querySelectorAll('.help-card');
            const prevArrow = document.querySelector('.carousel-arrow-prev');
            const nextArrow = document.querySelector('.carousel-arrow-next');

            if (!helpCarousel || !prevArrow || !nextArrow) return;

            let currentHelpIndex = 0;

            function getCardsPerView() {
                if (window.innerWidth <= 768) return 1;
                if (window.innerWidth <= 1024) return 2;
                return 3;
            }

            function updateHelpCarousel() {
                const cardsPerView = getCardsPerView();
                const cardWidth = helpCards[0]?.offsetWidth || 300;
                const gap = 30;
                const translateX = currentHelpIndex * (cardWidth + gap);

                helpCarousel.style.transform = `translateX(-${translateX}px)`;
            }

            function showNextCards() {
                const cardsPerView = getCardsPerView();
                const maxIndex = Math.max(0, helpCards.length - cardsPerView);

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

            // Event listeners
            nextArrow.addEventListener('click', showNextCards);
            prevArrow.addEventListener('click', showPrevCards);

            // Atualizar na redimensionamento
            window.addEventListener('resize', updateHelpCarousel);

            // Inicializar
            updateHelpCarousel();

        } catch (error) {
            console.error('Erro no carrossel de ajuda:', error);
        }
    }

    // ===== MODAL DE LOGIN =====
    function initLoginModal() {
        try {
            const loginModal = document.getElementById('loginModal');
            const loginFormModal = document.querySelector('#loginModal form');

            if (!loginModal || !loginFormModal) return;

            // Abrir modal de login
            const loginBtns = document.querySelectorAll('.login-btn, .mobile-login-btn');
            loginBtns.forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault();
                    loginModal.style.display = 'block';
                    document.body.style.overflow = 'hidden';
                });
            });

            // Fechar modal de login
            const closeLoginBtn = document.querySelector('.close-login-modal');
            if (closeLoginBtn) {
                closeLoginBtn.addEventListener('click', function () {
                    loginModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                });
            }

            // Fechar modal clicando fora
            window.addEventListener('click', function (event) {
                if (event.target === loginModal) {
                    loginModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });

            // Envio do formulário de login
            loginFormModal.addEventListener('submit', async function (e) {
                e.preventDefault();

                const email = document.getElementById('login-email')?.value || '';
                const password = document.getElementById('login-password')?.value || '';

                if (!email || !password) {
                    alert('Por favor, preencha todos os campos.');
                    return;
                }

                const resultado = await fazerLogin(email, password);

                if (resultado.success) {
                    alert(`Bem-vindo(a), ${resultado.nome}!`);
                    loginModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    loginFormModal.reset();
                } else {
                    alert(resultado.message || 'E-mail ou senha incorretos!');
                }
            });

            // Links do login
            const forgotPasswordLink = document.querySelector('.forgot-password-link');
            const createAccountLink = document.querySelector('.create-account-link');

            if (forgotPasswordLink) {
                forgotPasswordLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
                    if (forgotPasswordModal) {
                        loginModal.style.display = 'none';
                        forgotPasswordModal.style.display = 'block';
                    }
                });
            }

            if (createAccountLink) {
                createAccountLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    const createAccountModal = document.getElementById('createAccountModal');
                    if (createAccountModal) {
                        loginModal.style.display = 'none';
                        createAccountModal.style.display = 'block';
                    }
                });
            }

        } catch (error) {
            console.error('Erro no modal de login:', error);
        }
    }

    // ===== MODAL DE CRIAR CONTA =====
    function initCreateAccountModal() {
        try {
            const createAccountModal = document.getElementById('createAccountModal');
            const createAccountForm = document.getElementById('createAccountForm');

            if (!createAccountModal || !createAccountForm) return;

            // Elementos de validação
            const passwordInput = document.getElementById('create-password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            const passwordMatchDiv = document.querySelector('.password-match');
            const birthdateInput = document.getElementById('birthdate');
            const validationMessage = document.getElementById('validationMessage');

            // Validação de senha
            if (passwordInput) {
                passwordInput.addEventListener('input', function () {
                    const password = this.value;
                    let score = 0;
                    let strength = 'fraca';

                    if (password.length >= 8) score++;
                    if (/[A-Z]/.test(password)) score++;
                    if (/[a-z]/.test(password)) score++;
                    if (/[0-9]/.test(password)) score++;
                    if (/[^A-Za-z0-9]/.test(password)) score++;

                    if (score === 5) strength = 'forte';
                    else if (score >= 3) strength = 'média';

                    if (strengthBar) {
                        strengthBar.style.width = (score * 20) + '%';
                        strengthBar.style.backgroundColor =
                            strength === 'fraca' ? '#dc3545' :
                                strength === 'média' ? '#ffc107' : '#28a745';
                    }

                    if (strengthText) {
                        strengthText.textContent = `Força: ${strength}`;
                        strengthText.style.color =
                            strength === 'fraca' ? '#dc3545' :
                                strength === 'média' ? '#ffc107' : '#28a745';
                    }

                    this.setAttribute('data-strength', strength);
                });
            }

            // Confirmação de senha
            if (confirmPasswordInput && passwordMatchDiv) {
                confirmPasswordInput.addEventListener('input', function () {
                    const password = passwordInput?.value || '';
                    const confirmPassword = this.value;

                    if (!confirmPassword) {
                        passwordMatchDiv.style.display = 'none';
                        return;
                    }

                    passwordMatchDiv.style.display = 'block';

                    if (password === confirmPassword) {
                        passwordMatchDiv.className = 'password-match match';
                        passwordMatchDiv.textContent = '✅ Senhas correspondem';
                        passwordMatchDiv.style.color = '#28a745';
                    } else {
                        passwordMatchDiv.className = 'password-match mismatch';
                        passwordMatchDiv.textContent = '❌ Senhas não correspondem';
                        passwordMatchDiv.style.color = '#dc3545';
                    }
                });
            }

            // Validação de idade
            if (birthdateInput && validationMessage) {
                birthdateInput.addEventListener('change', function () {
                    const dataNascimento = this.value;

                    if (!dataNascimento) {
                        validationMessage.style.display = 'none';
                        return;
                    }

                    const hoje = new Date();
                    const nascimento = new Date(dataNascimento);
                    let idade = hoje.getFullYear() - nascimento.getFullYear();
                    const mes = hoje.getMonth() - nascimento.getMonth();

                    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                        idade--;
                    }

                    validationMessage.style.display = 'block';

                    if (idade >= 18) {
                        validationMessage.className = 'validation-message valid';
                        validationMessage.textContent = `✅ Idade válida: ${idade} anos`;
                        this.classList.add('valid-date');
                        this.classList.remove('invalid-date');
                    } else {
                        validationMessage.className = 'validation-message invalid';
                        validationMessage.textContent = `❌ Idade insuficiente: ${idade} anos`;
                        this.classList.add('invalid-date');
                        this.classList.remove('valid-date');
                    }
                });
            }

            // Fechar modal
            const closeCreateAccountBtn = document.querySelector('.close-create-account-modal');
            if (closeCreateAccountBtn) {
                closeCreateAccountBtn.addEventListener('click', function () {
                    createAccountModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                });
            }

            // Voltar para login
            const backToLoginLinks = document.querySelectorAll('.back-to-login-link');
            backToLoginLinks.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    createAccountModal.style.display = 'none';
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'block';
                });
            });

            // Fechar clicando fora
            window.addEventListener('click', function (event) {
                if (event.target === createAccountModal) {
                    createAccountModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });

            // Envio do formulário
            createAccountForm.addEventListener('submit', async function (e) {
                e.preventDefault();

                const fullName = document.getElementById('full-name')?.value || '';
                const email = document.getElementById('create-email')?.value || '';
                const password = document.getElementById('create-password')?.value || '';
                const confirmPassword = document.getElementById('confirm-password')?.value || '';
                const birthdate = document.getElementById('birthdate')?.value || '';
                const cnpj = document.getElementById('cnpj')?.value || '';

                // Validações
                if (!fullName || !email || !password || !confirmPassword || !birthdate) {
                    alert('Preencha todos os campos obrigatórios.');
                    return;
                }

                if (password !== confirmPassword) {
                    alert('As senhas não coincidem.');
                    return;
                }

                // Validar idade
                const hoje = new Date();
                const nascimento = new Date(birthdate);
                let idade = hoje.getFullYear() - nascimento.getFullYear();
                const mes = hoje.getMonth() - nascimento.getMonth();

                if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                    idade--;
                }

                if (idade < 18) {
                    alert('É necessário ter 18 anos ou mais.');
                    return;
                }

                // Criar conta
                const resultado = await criarContaBackend({
                    nome_completo: fullName,
                    email: email,
                    senha: password,
                    data_nascimento: birthdate,
                    cnpj: cnpj || null
                });

                if (resultado.success) {
                    alert(`Conta criada! Bem-vindo(a), ${fullName.split(' ')[0]}!`);
                    createAccountModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    createAccountForm.reset();

                    // Resetar indicadores
                    if (strengthBar) strengthBar.style.width = '0%';
                    if (strengthText) strengthText.textContent = 'Força da senha';
                    if (passwordMatchDiv) passwordMatchDiv.style.display = 'none';
                } else {
                    alert(resultado.message || 'Erro ao criar conta');
                }
            });

        } catch (error) {
            console.error('Erro no modal de criar conta:', error);
        }
    }

    // ===== SISTEMA DE DOAÇÃO CORRIGIDO =====
    function configurarSistemaDoacao() {
        try {
            log('Configurando sistema de doação...');

            const tipoSelect = document.getElementById('tipoDoacao');
            const doarBtn = document.getElementById('botaoDoacao');
            const finalizarBtn = document.getElementById('finalizarDoacaoBtn');

            if (!tipoSelect || !doarBtn) {
                console.warn('Elementos de doação não encontrados');
                return;
            }

            const config = {
                'dinheiro': { cor: '#008080', emoji: '💰' },
                'alimentos': { cor: '#28a745', emoji: '🍎' },
                'ração': { cor: '#28a700', emoji: '🐾' },
                'roupas': { cor: '#17a2b8', emoji: '👕' },
                'produtos': { cor: '#6f42c1', emoji: '🧼' },
                'fraldas': { cor: '#e83e8c', emoji: '👶' },
                'materiais': { cor: '#fd7e14', emoji: '📚' },
                'brinquedos': { cor: '#ffc107', emoji: '🧸' },
                'cobertores': { cor: '#20c997', emoji: '🛏️' }
            };

            // Quando muda o tipo de doação
            tipoSelect.addEventListener('change', function () {
                const tipo = this.value;
                const texto = this.options[this.selectedIndex].text;

                if (!tipo) {
                    doarBtn.innerHTML = '<i class="fas fa-heart"></i> Selecione o tipo de doação';
                    doarBtn.style.background = '#6c757d';
                    doarBtn.disabled = true;
                    if (finalizarBtn) finalizarBtn.style.display = 'none';
                    return;
                }

                const cfg = config[tipo] || { cor: '#008080', emoji: '🎁' };

                doarBtn.innerHTML = `${cfg.emoji} Doar ${texto}`;
                doarBtn.style.background = cfg.cor;
                doarBtn.style.color = 'white';
                doarBtn.disabled = false;

                if (finalizarBtn) {
                    finalizarBtn.style.display = tipo === 'dinheiro' ? 'none' : 'flex';
                }
            });

            // Clique no botão DOAR - CORRIGIDO PARA EVITAR DUPLICAÇÃO
            doarBtn.addEventListener('click', async function (e) {
                e.preventDefault();

                // Evitar clique duplo
                if (processandoDoacao) {
                    console.log('Doação já está sendo processada...');
                    return;
                }

                const tipo = tipoSelect.value;
                const instituicaoSelect = document.getElementById('instituicao');
                const motivacao = document.getElementById('motivacao')?.value || '';

                if (!instituicaoSelect || !instituicaoSelect.value) {
                    alert('Selecione uma instituição.');
                    return;
                }

                if (!tipo) {
                    alert('Selecione um tipo de doação.');
                    return;
                }

                const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
                if (!usuario) {
                    alert('Faça login para doar.');
                    document.getElementById('loginModal').style.display = 'block';
                    return;
                }

                // Desabilitar botão enquanto processa
                processandoDoacao = true;
                doarBtn.disabled = true;
                doarBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

                try {
                    if (tipo === 'dinheiro') {
                        // Para dinheiro: gera QR Code
                        await gerarQRCodeDoacaoCompleto();
                    } else {
                        // Para itens: mostra confirmação UMA VEZ
                        const instituicaoNome = instituicaoSelect.options[instituicaoSelect.selectedIndex].text;
                        const tipoNome = tipoSelect.options[tipoSelect.selectedIndex].text;

                        // Mostrar modal de confirmação customizado
                        const confirmar = await mostrarConfirmacaoDoacao(
                            instituicaoNome,
                            tipoNome,
                            motivacao
                        );

                        if (!confirmar) {
                            // Usuário cancelou - reabilitar botão
                            processandoDoacao = false;
                            doarBtn.disabled = false;
                            doarBtn.innerHTML = `${config[tipo].emoji} Doar ${tipoNome}`;
                            return;
                        }

                        // Registrar doação APENAS UMA VEZ
                        const resultado = await registrarDoacaoBackend({
                            instituicao_id: instituicaoSelect.value,
                            tipo_doacao: tipo,
                            descricao: `Doação de ${tipoNome}`,
                            motivacao: motivacao,
                            valor: null,
                            usuario_id: usuario.id || 0
                        });

                        if (resultado.status === 'success') {
                            // Feedback visual de sucesso
                            doarBtn.innerHTML = '<i class="fas fa-check"></i> Doação Registrada!';
                            doarBtn.style.background = '#28a745';
                            
                            setTimeout(() => {
                                alert('✅ Doação registrada com sucesso! Entraremos em contato.');
                                limparFormularioDoacao();
                                
                                setTimeout(() => {
                                    const modal = document.getElementById('donationModal');
                                    if (modal) modal.style.display = 'none';
                                    document.body.style.overflow = 'auto';
                                }, 500);
                            }, 300);
                        } else {
                            alert('Erro: ' + resultado.message);
                            // Restaurar botão em caso de erro
                            processandoDoacao = false;
                            doarBtn.disabled = false;
                            doarBtn.innerHTML = `${config[tipo].emoji} Doar ${tipoNome}`;
                        }
                    }
                } catch (error) {
                    console.error('Erro no processo de doação:', error);
                    alert('Erro ao processar doação. Tente novamente.');
                    processandoDoacao = false;
                    doarBtn.disabled = false;
                    doarBtn.innerHTML = `${config[tipo].emoji} Doar ${tipoSelect.options[tipoSelect.selectedIndex].text}`;
                } finally {
                    // Reabilitar o botão depois de 3 segundos (para evitar clique rápido)
                    setTimeout(() => {
                        processandoDoacao = false;
                    }, 3000);
                }
            });

            // Botão FINALIZAR - Só fecha o modal
            if (finalizarBtn) {
                finalizarBtn.addEventListener('click', function () {
                    const confirmar = confirm('Deseja fechar o formulário de doação?');
                    if (confirmar) {
                        const modal = document.getElementById('donationModal');
                        if (modal) modal.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }
                });
            }

            // Estado inicial
            doarBtn.innerHTML = '<i class="fas fa-heart"></i> Selecione o tipo de doação';
            doarBtn.style.background = '#6c757d';
            doarBtn.disabled = true;
            if (finalizarBtn) finalizarBtn.style.display = 'none';

        } catch (error) {
            console.error('Erro ao configurar sistema de doação:', error);
        }
    }

    // ===== FUNÇÃO AUXILIAR: CONFIRMAÇÃO DE DOAÇÃO =====
    function mostrarConfirmacaoDoacao(instituicaoNome, tipoNome, motivacao) {
        return new Promise((resolve) => {
            const modalId = 'confirmacaoDoacaoModal';
            
            // Remover modal existente se houver
            const modalExistente = document.getElementById(modalId);
            if (modalExistente) {
                document.body.removeChild(modalExistente);
            }
            
            // Criar modal de confirmação dinâmico
            const modal = document.createElement('div');
            modal.id = modalId;
            modal.innerHTML = `
                <div class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                    <div class="modal-content" style="background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
                        <h3 style="color: #008080; margin-bottom: 20px;">Confirmar Doação</h3>
                        
                        <div style="margin-bottom: 20px;">
                            <p><strong>🏢 Instituição:</strong> ${instituicaoNome}</p>
                            <p><strong>🎁 Tipo de Doação:</strong> ${tipoNome}</p>
                            ${motivacao ? `<p><strong>💭 Motivação:</strong> ${motivacao.substring(0, 100)}${motivacao.length > 100 ? '...' : ''}</p>` : ''}
                        </div>
                        
                        <div style="color: #666; font-size: 14px; margin-bottom: 25px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
                            <i class="fas fa-info-circle"></i> Clique apenas UMA vez em "Confirmar"
                        </div>
                        
                        <div style="display: flex; gap: 15px; justify-content: flex-end;">
                            <button id="cancelarDoacaoBtn" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Cancelar
                            </button>
                            <button id="confirmarDoacaoBtn" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                                <i class="fas fa-check"></i> Confirmar Doação
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Configurar botões
            setTimeout(() => {
                document.getElementById('cancelarDoacaoBtn').addEventListener('click', () => {
                    document.body.removeChild(modal);
                    resolve(false);
                });
                
                document.getElementById('confirmarDoacaoBtn').addEventListener('click', () => {
                    document.body.removeChild(modal);
                    resolve(true);
                });
            }, 100);
        });
    }

    // ===== GERAR QR CODE COMPLETO =====
    async function gerarQRCodeDoacaoCompleto() {
        try {
            const instituicaoSelect = document.getElementById('instituicao');
            const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
            
            if (!instituicaoSelect || !instituicaoSelect.value) {
                alert('Selecione uma instituição primeiro.');
                return;
            }
            
            const instituicaoId = instituicaoSelect.value;
            const instituicaoNome = instituicaoSelect.options[instituicaoSelect.selectedIndex].text;
            
            console.log('Gerando QR Code para:', { instituicaoId, instituicaoNome });
            
            const container = document.querySelector('.qr-image-container');
            if (!container) {
                console.error('Container do QR Code não encontrado');
                return;
            }
            
            // LIMPAR O CONTAINER
            container.innerHTML = '';
            
            // TEXTO DO QR CODE
            const timestamp = Date.now().toString().slice(-6);
            const qrText = `PIX:${instituicaoId}:${timestamp}`;
            
            console.log('Texto do QR Code:', qrText);
            
            // Gerar QR Code
            if (typeof QRCode === 'undefined') {
                container.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div style="width: 180px; height: 180px; background: #008080; color: white; 
                         margin: 0 auto; display: flex; align-items: center; justify-content: center; 
                         border-radius: 10px; font-weight: bold; flex-direction: column;">
                        <i class="fas fa-qrcode" style="font-size: 60px; margin-bottom: 10px;"></i>
                        <div style="font-size: 14px;">${instituicaoNome.substring(0, 15)}</div>
                    </div>
                    <p style="margin-top: 10px; color: #666; font-size: 14px;">
                        Código: ${qrText}<br>
                        <small>Use no seu app bancário</small>
                    </p>
                </div>
            `;
            } else {
                try {
                    new QRCode(container, {
                        text: qrText,
                        width: 180,
                        height: 180,
                        colorDark: "#008080",
                        colorLight: "#ffffff",
                        correctLevel: QRCode.CorrectLevel.L
                    });
                } catch (qrError) {
                    console.error('Erro no QR Code:', qrError);
                    container.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="width: 180px; height: 180px; background: #f0f0f0; 
                             margin: 0 auto; display: flex; align-items: center; justify-content: center; 
                             border-radius: 10px; border: 2px dashed #ccc; flex-direction: column;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: #ffc107; margin-bottom: 10px;"></i>
                            <div style="color: #666; font-size: 14px;">QR Code indisponível</div>
                        </div>
                    </div>
                `;
                }
            }
            
            // Mostrar seção do QR Code
            const qrSection = document.getElementById('qrContainer');
            if (qrSection) {
                qrSection.classList.remove('qr-hidden');
                qrSection.classList.add('qr-visible');
                
                setTimeout(() => {
                    qrSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 150);
            }
            
            // Registrar doação PIX APENAS SE CONFIRMADO
            const confirmar = await mostrarConfirmacaoDoacao(
                instituicaoNome, 
                'Doação PIX', 
                'Pagamento via QR Code PIX'
            );
            
            if (confirmar && usuario) {
                const resultado = await registrarDoacaoBackend({
                    instituicao_id: instituicaoId,
                    tipo_doacao: 'dinheiro',
                    descricao: `Doação PIX para ${instituicaoNome}`,
                    valor: 0,
                    status: 'pendente',
                    usuario_id: usuario.id || 0
                });
                
                if (resultado.status === 'success') {
                    alert('✅ Doação PIX registrada! QR Code gerado com sucesso.');
                }
            }
            
        } catch (error) {
            console.error('❌ Erro no QR Code:', error);
            alert('Erro ao gerar QR Code. Tente novamente.');
        } finally {
            // Reabilitar o botão
            setTimeout(() => {
                processandoDoacao = false;
                const doarBtn = document.getElementById('botaoDoacao');
                if (doarBtn) {
                    doarBtn.disabled = false;
                    doarBtn.innerHTML = '💰 Doar Dinheiro';
                }
            }, 2000);
        }
    }

    // Função auxiliar para QR Code simples
    function gerarQRCodeSimples(texto, instituicaoNome) {
        const container = document.querySelector('.qr-image-container');
        if (!container) return;

        container.innerHTML = '';

        if (typeof QRCode !== 'undefined') {
            try {
                new QRCode(container, {
                    text: texto,
                    width: 160,
                    height: 160,
                    colorDark: "#008080",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.L
                });
            } catch (e) {
                // Fallback final
                container.innerHTML = `
                <div style="text-align: center; padding: 15px;">
                    <div style="width: 160px; height: 160px; background: #008080; 
                         margin: 0 auto; border-radius: 8px; display: flex; 
                         align-items: center; justify-content: center; color: white;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">PIX</div>
                            <div style="font-size: 12px; margin-top: 5px;">${instituicaoNome.substring(0, 12)}</div>
                        </div>
                    </div>
                </div>
            `;
            }
        }
    }

    function limparFormularioDoacao() {
        try {
            const form = document.getElementById('formDoacao');
            if (form) form.reset();

            const doarBtn = document.getElementById('botaoDoacao');
            if (doarBtn) {
                doarBtn.innerHTML = '<i class="fas fa-heart"></i> Selecione o tipo de doação';
                doarBtn.style.background = '#6c757d';
                doarBtn.disabled = true;
            }

            const finalizarBtn = document.getElementById('finalizarDoacaoBtn');
            if (finalizarBtn) finalizarBtn.style.display = 'none';

            const qrSection = document.getElementById('qrContainer');
            if (qrSection) {
                qrSection.classList.add('qr-hidden');
                qrSection.classList.remove('qr-visible');
            }

            // Limpar container QR Code
            const container = document.querySelector('.qr-image-container');
            if (container) container.innerHTML = '';

        } catch (error) {
            console.error('Erro ao limpar formulário:', error);
        }
    }

    // ===== CONFIGURAR MODAL DE DOAÇÃO =====
    function initDonationModal() {
        try {
            const modal = document.getElementById('donationModal');
            const openBtn = document.getElementById('openDonationModal');
            const closeBtn = document.querySelector('.close-modal');

            if (!modal || !openBtn) return;

            openBtn.addEventListener('click', function (e) {
                e.preventDefault();
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
                preencherFormularioDoacao();
            });

            if (closeBtn) {
                closeBtn.addEventListener('click', function () {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                });
            }

            window.addEventListener('click', function (event) {
                if (event.target === modal) {
                    modal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });

        } catch (error) {
            console.error('Erro no modal de doação:', error);
        }
    }

    // ===== CONFIGURAR MODAL DE DETALHES =====
    function initDetailModal() {
        try {
            const closeBtn = document.querySelector('.close-detail-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', fecharDetalhes);
            }

            const modal = document.getElementById('institutionDetailModal');
            if (modal) {
                modal.addEventListener('click', function (e) {
                    if (e.target === this) fecharDetalhes();
                });
            }
        } catch (error) {
            console.error('Erro no modal de detalhes:', error);
        }
    }

    // ===== CONFIGURAR CLIQUE NAS INSTITUIÇÕES =====
    function configurarCliqueInstituicoes() {
        try {
            const cards = document.querySelectorAll('.help-card');

            cards.forEach(card => {
                card.style.cursor = 'pointer';

                card.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Obter ID da instituição
                    const instId = this.dataset.instituicaoId;
                    if (!instId) return;

                    // Buscar dados
                    const instituicoes = JSON.parse(localStorage.getItem('instituicoes')) || [];
                    const instituicao = instituicoes.find(inst => inst.id == instId);

                    if (instituicao) {
                        abrirDetalhesInstituicao(instId, instituicao);
                    }
                });
            });
        } catch (error) {
            console.error('Erro ao configurar clique nas instituições:', error);
        }
    }

    // ===== BOTÃO FECHAR QR CODE =====
    function initQRCloseButton() {
        try {
            const closeQRBtn = document.getElementById('closeQR');
            if (closeQRBtn) {
                closeQRBtn.addEventListener('click', function () {
                    const qrSection = document.getElementById('qrContainer');
                    if (qrSection) {
                        qrSection.classList.add('qr-hidden');
                        qrSection.classList.remove('qr-visible');
                    }
                });
            }
        } catch (error) {
            console.error('Erro no botão fechar QR:', error);
        }
    }

    // ===== INICIALIZAR TUDO =====
    async function init() {
        try {
            log('Inicializando sistema...');

            // Testar conexão
            await testarConexaoBackend();

            // Inicializar componentes
            initCarousel();
            initMobileMenu();
            initSmoothScroll();
            initHelpCarousel();
            initLoginModal();
            initCreateAccountModal();
            initDonationModal();
            initDetailModal();
            initQRCloseButton();

            // Carregar dados
            await carregarInstituicoes();
            checkUserLoginStatus();

            // Configurar cliques
            setTimeout(() => {
                configurarCliqueInstituicoes();
                configurarSistemaDoacao();
            }, 500);

            log('Sistema inicializado com sucesso!');

        } catch (error) {
            console.error('Erro na inicialização:', error);
            alert('Algumas funcionalidades podem não estar disponíveis. Recarregue a página.');
        }
    }

    // Iniciar o sistema
    init();
});