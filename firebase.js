const firebaseConfig ={
    apiKey: "AIzaSyDqdY9-50mplRzp9d7yNi6OtjcmxzPaz_w",
    databaseURL: "https://tcc-abracosolidario-default-rtdb.firebaseio.com"
};

console.log('🔥 Inicializando Firebase Flexível...');

// ===== INICIALIZAR FIREBASE =====
try {
    const app = firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    console.log('✅ Firebase inicializado com sucesso!');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    alert('Erro no Firebase. Verifique o console.');
}

// ===== FUNÇÃO PRINCIPAL - SALVAR QUALQUER DOAÇÃO =====
/**
 * Salva QUALQUER estrutura de dados no Firebase
 * @param {Object} dados - Objeto com os dados da doação
 * @returns {Promise} Promessa com resultado
 */
function salvarDoacaoFlexivel(dados) {
    return new Promise((resolve, reject) => {
        console.group('📤 SALVANDO NO BANCO FLEXÍVEL');
        console.log('Dados recebidos:', dados);
        
        // Validar dados mínimos
        if (!dados || typeof dados !== 'object') {
            const erro = 'Dados inválidos. Precisa ser um objeto.';
            console.error('❌', erro);
            console.groupEnd();
            reject({ success: false, error: erro });
            return;
        }
        
        // Preparar dados completos
        const dadosCompletos = {
            ...dados, // Mantém TODOS os campos originais
            _metadata: {
                timestamp: new Date().toISOString(),
                timestampLegivel: new Date().toLocaleString('pt-BR'),
                versaoSistema: 'flexivel_v1.0',
                origem: 'site_abraco_solidario'
            },
            status: 'pendente',
            processado: false
        };
        
        // Gerar ID único
        const doacaoId = 'doacao_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        console.log('Dados completos:', dadosCompletos);
        console.log('ID gerado:', doacaoId);
        
        // Salvar no Firebase
        const ref = firebase.database().ref('doacoes_flexiveis/' + doacaoId);
        
        ref.set(dadosCompletos)
            .then(() => {
                console.log('✅ Salvo com sucesso!');
                console.log('📍 Caminho:', ref.toString());
                console.groupEnd();
                
                resolve({
                    success: true,
                    id: doacaoId,
                    message: 'Doação salva no banco flexível',
                    path: 'doacoes_flexiveis/' + doacaoId,
                    timestamp: dadosCompletos._metadata.timestamp
                });
            })
            .catch((error) => {
                console.error('❌ Erro ao salvar:', error);
                console.groupEnd();
                reject({
                    success: false,
                    error: error.message,
                    code: error.code
                });
            });
    });
}

// ===== FUNÇÕES ÚTEIS PARA TESTE =====

/**
 * Testa o banco com dados fictícios
 */
function testarBancoComDadosFicticios() {
    console.group('🧪 TESTE COM DADOS FICTÍCIOS');
    
    const testes = [
        {
            instituicao: 'Patas Felizes',
            tipo_doacao: 'dinheiro',
            valor: 75.50,
            data_nascimento: '1998-07-15',
            motivacao: 'Amo animais!',
            usuario: 'teste_automatico'
        },
        {
            instituicao: 'Casa Todos',
            tipo: 'alimentos',
            quantidade: 8,
            item: 'Arroz e feijão',
            data: new Date().toLocaleDateString('pt-BR'),
            observacao: 'Teste automático do sistema'
        },
        {
            // Estrutura DIFERENTE propositalmente
            instituicao_selecionada: 'Recanto da Sabedoria',
            tipo_selecionado: 'roupas',
            qtd: 12,
            descricao: 'Roupas de inverno',
            doador: { nome: 'Testador', idade: 30 }
        }
    ];
    
    console.log(`Enviando ${testes.length} testes...`);
    
    // Enviar todos os testes
    const promises = testes.map((dados, index) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Enviando teste ${index + 1}...`);
                salvarDoacaoFlexivel(dados)
                    .then(result => {
                        console.log(`✅ Teste ${index + 1} OK: ${result.id}`);
                        resolve(result);
                    })
                    .catch(error => {
                        console.error(`❌ Teste ${index + 1} FALHOU:`, error);
                        resolve(error);
                    });
            }, index * 1000); // Delay de 1 segundo entre testes
        });
    });
    
    Promise.all(promises).then(() => {
        console.log('🎉 Todos os testes completados!');
        console.log('💡 Verifique o Firebase Console para ver os dados.');
        console.groupEnd();
        alert('✅ Testes completados! Verifique o console e o Firebase.');
    });
}

/**
 * Verifica todas as doações salvas
 */
function verificarDoacoesSalvas() {
    console.group('📊 VERIFICANDO DOAÇÕES SALVAS');
    
    firebase.database().ref('doacoes_flexiveis').once('value')
        .then(snapshot => {
            const dados = snapshot.val();
            const total = dados ? Object.keys(dados).length : 0;
            
            console.log(`Total de doações: ${total}`);
            
            if (dados) {
                Object.entries(dados).forEach(([id, doacao], index) => {
                    console.log(`\n${index + 1}. ${id}`);
                    console.log('   Instituição:', doacao.instituicao || doacao.instituicao_selecionada || 'Não informada');
                    console.log('   Tipo:', doacao.tipo || doacao.tipo_doacao || doacao.tipo_selecionado || 'Não informado');
                    console.log('   Data:', doacao._metadata?.timestampLegivel || 'Desconhecida');
                });
            } else {
                console.log('Nenhuma doação encontrada.');
            }
            
            console.groupEnd();
        })
        .catch(error => {
            console.error('❌ Erro ao verificar:', error);
            console.groupEnd();
        });
}

/**
 * Limpa dados de teste (use com cuidado!)
 */
function limparDadosTeste() {
    if (confirm('⚠️  ATENÇÃO: Isso apagará TODOS os dados de teste. Continuar?')) {
        firebase.database().ref('doacoes_flexiveis').remove()
            .then(() => {
                console.log('✅ Dados de teste removidos!');
                alert('Dados removidos com sucesso!');
            })
            .catch(error => {
                console.error('❌ Erro ao remover:', error);
                alert('Erro ao remover dados.');
            });
    }
}

// ===== INTERFACE PARA TESTE RÁPIDO =====
function criarInterfaceTeste() {
    // Evitar criar múltiplas interfaces
    if (document.getElementById('interface-teste-firebase')) return;
    
    const div = document.createElement('div');
    div.id = 'interface-teste-firebase';
    div.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border: 3px solid #008080;
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        max-width: 300px;
        font-family: Arial, sans-serif;
    `;
    
    div.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong style="color: #008080;">🧪 TESTE FIREBASE</strong>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="float: right; background: none; border: none; cursor: pointer; font-size: 18px;">×</button>
        </div>
        
        <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
            Banco: tcc-abracosolidario
        </div>
        
        <button onclick="testarBancoComDadosFicticios()" 
                style="width: 100%; padding: 8px; margin: 5px 0; background: #008080; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🔥 Testar com Dados Fictícios
        </button>
        
        <button onclick="verificarDoacoesSalvas()" 
                style="width: 100%; padding: 8px; margin: 5px 0; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
            📊 Ver Doações Salvas
        </button>
        
        <button onclick="limparDadosTeste()" 
                style="width: 100%; padding: 8px; margin: 5px 0; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">
            🗑️ Limpar Dados Teste
        </button>
        
        <div style="margin-top: 10px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 5px;">
            Sistema Flexível v1.0 - Aceita QUALQUER estrutura
        </div>
    `;
    
    document.body.appendChild(div);
    console.log('✅ Interface de teste criada!');
}

// ===== INICIALIZAÇÃO =====
// Aguardar Firebase carregar
setTimeout(() => {
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        console.log('🚀 Firebase Flexível pronto para uso!');
        
        // Criar interface de teste após 3 segundos
        setTimeout(criarInterfaceTeste, 3000);
        
        // Exportar funções para uso global
        window.firebaseFlexivel = {
            salvar: salvarDoacaoFlexivel,
            testar: testarBancoComDadosFicticios,
            verificar: verificarDoacoesSalvas,
            limpar: limparDadosTeste,
            config: firebaseConfig
        };
        
    } else {
        console.error('❌ Firebase não carregou corretamente.');
    }
}, 1000);

// Mensagem de ajuda no console
console.log(`
===========================================
   FIREBASE FLEXÍVEL - TCC ABRAÇO SOLIDÁRIO
===========================================

FUNÇÕES DISPONÍVEIS:
• firebaseFlexivel.salvar(dados)  - Salva qualquer estrutura
• firebaseFlexivel.testar()       - Testa com dados fictícios
• firebaseFlexivel.verificar()    - Verifica doações salvas
• firebaseFlexivel.limpar()       - Limpa dados de teste

COMO USAR:
1. Chame firebaseFlexivel.salvar() com SEUS dados
2. Não importa a estrutura - aceita QUALQUER campo
3. A interface de teste aparece no canto inferior direito

CONFIGURAÇÃO:
• Projeto: tcc-abracosolidario
• Database: https://tcc-abracosolidario.firebaseio.com
• Status: ✅ Pronto para uso
===========================================
`);