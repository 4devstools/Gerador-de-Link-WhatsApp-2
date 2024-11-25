// Seleção dos elementos do DOM
const generatorScreen = document.getElementById('generator-screen');
const resultScreen = document.getElementById('result-screen');
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');
const generateBtn = document.getElementById('generate-btn');
const generatedLinkInput = document.getElementById('generated-link');
const copyBtn = document.getElementById('copy-btn');
const newLinkBtn = document.getElementById('new-link-btn');
const downloadPngBtn = document.getElementById('download-png');
const downloadSvgBtn = document.getElementById('download-svg');
const qrSizeSelect = document.getElementById('qr-size');
const navbarToggle = document.querySelector('.navbar-toggle');
const navLinks = document.querySelector('.nav-links');

// Verifica se a biblioteca QR Code está carregada
if (typeof qrcode === 'undefined') {
    console.error('Biblioteca QR Code não carregada');
}

// Formatação automática do número de telefone
phoneInput.addEventListener('input', (e) => {
    try {
        // Remove todos os caracteres não numéricos
        let value = e.target.value.replace(/\D/g, '');
        // Limita o número a 11 dígitos
        if (value.length > 11) value = value.slice(0, 11);
        
        // Adiciona formatação (XX) XXXXX-XXXX
        if (value.length >= 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        }
        if (value.length >= 10) {
            value = value.slice(0, 10) + '-' + value.slice(10);
        }
        
        e.target.value = value;
    } catch (error) {
        console.error('Erro na formatação do número:', error);
    }
});

// Geração do link do WhatsApp e QR code
generateBtn.addEventListener('click', () => {
    try {
        // Remove formatação do número e verifica se é válido
        const phone = phoneInput.value.replace(/\D/g, '');
        if (phone.length !== 11) {
            alert('Por favor, insira um número de telefone válido');
            return;
        }

        // Cria o link do WhatsApp com a mensagem (se houver)
        const message = encodeURIComponent(messageInput.value.trim());
        const whatsappLink = `https://wa.me/55${phone}${message ? '?text=' + message : ''}`;
        
        // Atualiza a interface e gera o QR code
        generatedLinkInput.value = whatsappLink;
        generateQRCode(whatsappLink);
        
        // Mostra a tela de resultado
        generatorScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao gerar link:', error);
        alert('Ocorreu um erro ao gerar o link. Por favor, tente novamente.');
    }
});

// Função para gerar o QR Code
function generateQRCode(url) {
    try {
        if (typeof qrcode !== 'function') {
            throw new Error('Biblioteca QR Code não está disponível');
        }

        const qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = '';
        
        // Cria o QR code com nível de correção L (menor)
        const qr = qrcode(0, 'L');
        qr.addData(url);
        qr.make();
        
        // Gera a imagem do QR code no tamanho selecionado
        const size = parseInt(qrSizeSelect.value);
        qrContainer.innerHTML = qr.createImgTag(Math.ceil(size / 33));
    } catch (error) {
        console.error('Erro ao gerar QR code:', error);
        const qrContainer = document.getElementById('qr-code');
        qrContainer.innerHTML = '<p class="error">Erro ao gerar QR code. Por favor, recarregue a página.</p>';
    }
}

// Função para copiar o link para a área de transferência
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(generatedLinkInput.value);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        }, 2000);
    } catch (err) {
        console.error('Erro ao copiar:', err);
        alert('Falha ao copiar o link. Por favor, copie manualmente.');
    }
});

// Função para gerar um novo link
newLinkBtn.addEventListener('click', () => {
    try {
        // Limpa os campos e volta para a tela inicial
        phoneInput.value = '';
        messageInput.value = '';
        resultScreen.classList.add('hidden');
        generatorScreen.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao resetar formulário:', error);
    }
});

// Função para baixar o QR code
function downloadQRCode(format) {
    try {
        const qrImg = document.querySelector('#qr-code img');
        if (!qrImg) {
            throw new Error('Imagem QR code não encontrada');
        }

        const size = parseInt(qrSizeSelect.value);
        
        // Cria um canvas para manipular a imagem
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = size;
        canvas.height = size;
        
        // Desenha o fundo branco
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Desenha o QR code
        ctx.drawImage(qrImg, 0, 0, size, size);
        
        // Cria o link de download
        const link = document.createElement('a');
        if (format === 'png') {
            link.download = 'whatsapp-qr.png';
            link.href = canvas.toDataURL('image/png');
        } else {
            // Converte para SVG
            const svgString = `
                <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
                    <image href="${canvas.toDataURL('image/png')}" width="${size}" height="${size}"/>
                </svg>
            `;
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            link.download = 'whatsapp-qr.svg';
            link.href = URL.createObjectURL(blob);
        }
        
        // Inicia o download
        link.click();
    } catch (error) {
        console.error('Erro ao baixar QR code:', error);
        alert('Erro ao baixar o QR code. Por favor, tente novamente.');
    }
}

// Eventos para download do QR code
downloadPngBtn.addEventListener('click', () => downloadQRCode('png'));
downloadSvgBtn.addEventListener('click', () => downloadQRCode('svg'));

// Atualiza o QR code quando o tamanho é alterado
qrSizeSelect.addEventListener('change', () => {
    if (generatedLinkInput.value) {
        generateQRCode(generatedLinkInput.value);
    }
});

// Navegação mobile
navbarToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});
