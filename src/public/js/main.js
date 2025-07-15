// Arquivo JavaScript principal para funcionalidades globais

// Função para formatar datas
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

// Função para validar email
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// Função para validar ISBN
function validarISBN(isbn) {
    // Remove hífens e espaços
    const isbnLimpo = isbn.replace(/[-\s]/g, '');
    
    // Verifica se tem 10 ou 13 dígitos
    if (isbnLimpo.length !== 10 && isbnLimpo.length !== 13) {
        return false;
    }
    
    // Verifica se todos os caracteres são dígitos (exceto o último que pode ser X para ISBN-10)
    const regex = isbnLimpo.length === 10 ? /^\d{9}[\dX]$/ : /^\d{13}$/;
    return regex.test(isbnLimpo);
}

// Função para mostrar loading em botões
function mostrarLoading(botao, textoOriginal) {
    botao.disabled = true;
    botao.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
    
    return function() {
        botao.disabled = false;
        botao.innerHTML = textoOriginal;
    };
}

// Função para debounce (útil para pesquisas)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Configurações globais para requisições
const API_BASE_URL = '/api';

// Função para fazer requisições HTTP com tratamento de erro
async function fazerRequisicao(url, opcoes = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...opcoes.headers
            },
            ...opcoes
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisição');
        }
        
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar tooltips do Bootstrap se existirem
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Adicionar confirmação para links/botões de exclusão
    const deleteButtons = document.querySelectorAll('[data-confirm-delete]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm-delete') || 'Tem certeza que deseja excluir?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
    
    // Auto-hide alerts após 5 segundos
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.parentNode) {
                alert.classList.remove('show');
                setTimeout(() => {
                    if (alert.parentNode) {
                        alert.remove();
                    }
                }, 150);
            }
        }, 5000);
    });
});

// Exportar funções para uso global
window.formatarData = formatarData;
window.validarEmail = validarEmail;
window.validarISBN = validarISBN;
window.mostrarLoading = mostrarLoading;
window.debounce = debounce;
window.fazerRequisicao = fazerRequisicao;

