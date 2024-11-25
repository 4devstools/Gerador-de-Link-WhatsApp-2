// Elementos do DOM
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const downloadPngBtn = document.getElementById('download-png');
const downloadSvgBtn = document.getElementById('download-svg');
const newLinkBtn = document.getElementById('new-link-btn');
const generatorScreen = document.getElementById('generator-screen');
const resultScreen = document.getElementById('result-screen');
const generatedLinkInput = document.getElementById('generated-link');
const qrSizeSelect = document.getElementById('qr-size');
const navbarToggle = document.querySelector('.navbar-toggle');
const navLinks = document.querySelector('.nav-links');

// Formatação e validação do número de telefone
phoneInput.addEventListener('keypress', (e) => {
    // Impede a entrada de caracteres não numéricos
    if (!/\d/.test(e.key)) {
        e.preventDefault();
    }
    
    // Obtém o valor atual sem caracteres não numéricos
    const currentValue = e.target.value.replace(/\D/g, '');
    
    // Impede a entrada se exceder 11 dígitos
    if (currentValue.length >= 11 && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault();
    }
});

phoneInput.addEventListener('input', (e) => {
    // Remove caracteres não numéricos
    let value = e.target.value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    value = value.slice(0, 11);
    
    // Formata o número
    let formattedValue = '';
    if (value.length > 0) {
        formattedValue = '(' + value.substring(0, 2);
        if (value.length > 2) {
            formattedValue += ') ' + value.substring(2, 7);
            if (value.length > 7) {
                formattedValue += '-' + value.substring(7, 11);
            }
        }
    }
    
    e.target.value = formattedValue;
});

// Alternância do menu mobile
navbarToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Geração do link do WhatsApp e QR code
generateBtn.addEventListener('click', () => {
    const phone = phoneInput.value.replace(/\D/g, '');
    if (phone.length !== 11) {
        alert('Por favor, insira um número de telefone válido com 11 dígitos');
        return;
    }

    const message = encodeURIComponent(messageInput.value);
    const whatsappLink = `https://wa.me/55${phone}${message ? '?text=' + message : ''}`;
    generatedLinkInput.value = whatsappLink;

    // Gera o QR code
    generateQRCode(whatsappLink);

    // Mostra a tela de resultado
    generatorScreen.classList.add('hidden');
    resultScreen.classList.remove('hidden');
});

// Função para gerar o QR Code
function generateQRCode(text) {
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = '';

    // Configuração do QR Code com densidade aumentada
    const qr = qrcode(0, 'M'); // Aumenta a densidade usando o nível de correção 'M'
    qr.addData(text);
    qr.make();

    const size = parseInt(qrSizeSelect.value);
    qrcodeContainer.innerHTML = qr.createSvgTag({
        cellSize: size / 29, // Ajustado para melhor densidade
        margin: 8, // Margem interna aumentada
        scalable: true
    });

    // Estilização do SVG
    const svg = qrcodeContainer.querySelector('svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.maxWidth = '300px';
    svg.style.borderRadius = '15px';
    svg.style.padding = '15px';
}

// Copia o link para a área de transferência
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(generatedLinkInput.value);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copiado!';
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
        }, 2000);
    } catch (err) {
        alert('Falha ao copiar o link');
    }
});

// Função para download do QR Code (corrigido para PNG)
function downloadQRCode(format) {
    const svg = document.querySelector('#qrcode svg');
    const size = parseInt(qrSizeSelect.value);
    
    if (format === 'svg') {
        // Download em formato SVG
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(svgBlob);
        link.download = 'whatsapp-qr.svg';
        link.click();
    } else {
        // Download em formato PNG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        canvas.width = size;
        canvas.height = size;
        
        img.onload = () => {
            // Preenchimento da imagem com fundo branco
            ctx.fillStyle = '#FFFFFF';  // Cor de fundo
            ctx.fillRect(0, 0, size, size);  // Preenche toda a área do canvas

            // Ajuste para bordas arredondadas
            const radius = 15;  // Raio para bordas arredondadas
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(size - radius, 0);
            ctx.quadraticCurveTo(size, 0, size, radius);
            ctx.lineTo(size, size - radius);
            ctx.quadraticCurveTo(size, size, size - radius, size);
            ctx.lineTo(radius, size);
            ctx.quadraticCurveTo(0, size, 0, size - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.clip();  // Aplica o recorte arredondado na imagem

            // Desenha a imagem do QR Code no canvas
            ctx.drawImage(img, 0, 0, size, size);
            
            const link = document.createElement('a');
            link.download = 'whatsapp-qr.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg));
    }
}

// Event listeners para download
downloadPngBtn.addEventListener('click', () => downloadQRCode('png'));
downloadSvgBtn.addEventListener('click', () => downloadQRCode('svg'));

// Atualiza o QR code quando o tamanho é alterado
qrSizeSelect.addEventListener('change', () => {
    generateQRCode(generatedLinkInput.value);
});

// Gera novo link
newLinkBtn.addEventListener('click', () => {
    phoneInput.value = '';
    messageInput.value = '';
    resultScreen.classList.add('hidden');
    generatorScreen.classList.remove('hidden');
});
