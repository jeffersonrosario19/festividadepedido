/* ==================== RENDERIZA A LISTA DE ITENS ==================== */
function renderizarItens() {
  Object.entries(itensCardapio).forEach(([categoria, itens]) => {
    const grid = document.getElementById(categoria);
    const fragmento = document.createDocumentFragment();

    itens.forEach(({ nome, preco }) => {
      const item = document.createElement('div');
      item.className = 'item';
      const nomeElemento = document.createElement('div');
      nomeElemento.className = 'item-name';
      nomeElemento.textContent = nome;
      const precoElemento = document.createElement('div');
      precoElemento.className = 'item-price';
      precoElemento.textContent = preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      item.append(nomeElemento, precoElemento);
      fragmento.append(item);
    });

    grid.replaceChildren(fragmento);
  });
}

renderizarItens();

    /* ==================== VARIÁVEIS GLOBAIS ==================== */
    let carrinho = []; // lista de itens do carrinho
    const popup = document.getElementById('popup');
    const popupProduto = document.getElementById('popup-produto');
    const popupInput = document.getElementById('popup-input');
    let itemSelecionado = null; // item clicado no cardápio

    /* ==================== EVENTO: CLICK EM CADA ITEM ==================== */
    document.querySelectorAll('.item').forEach(item => {
      item.addEventListener('click', () => {
        itemSelecionado = item;
        const nome = item.querySelector('.item-name')?.innerText || "Produto";
        popupProduto.textContent = nome;
        popupInput.value = 1;
        popup.style.display = 'flex';
        popupInput.focus();
      });
    });

    /* ==================== CONFIRMA A QUANTIDADE NO POPUP ==================== */
    function alterarQuantidade(delta) {
      const atual = Number(popupInput.value);
      const quantidade = Number.isSafeInteger(atual) && atual >= 1 ? atual : 1;
      const proxima = quantidade + delta;
      if (Number.isSafeInteger(proxima)) popupInput.value = Math.max(1, proxima);
    }

    function confirmarPopup() {
      const qtd = Number(popupInput.value);
      if (!Number.isSafeInteger(qtd) || qtd < 1) {
        alert('Digite uma quantidade válida.');
        popupInput.focus();
        return;
      }

      // Extrai dados do item selecionado
      const nome = itemSelecionado?.querySelector('.item-name')?.innerText || 'Produto';
      const precoText = itemSelecionado?.querySelector('.item-price')?.innerText || 'R$ 0,00';
      const preco = parseFloat(precoText.replace('R$', '').replace(',', '.'));

      // Se item já existe no carrinho, soma; caso contrário adiciona
      const existente = carrinho.find(item => item.nome === nome);
      if (existente) {
        existente.qtd += qtd;
      } else {
        carrinho.push({ nome, qtd, preco });
      }

      atualizarCarrinho();
      popup.style.display = 'none';


  // Limpa input para próxima vez
  popupInput.value = 1;
    }

    /* ==================== ATUALIZA O BOTÃO DO CARRINHO ==================== */
    function atualizarCarrinho() {
      let total = carrinho.reduce((soma, item) => soma + item.qtd * item.preco, 0);
      const botao = document.querySelector('.botao-carrinho');
      const quantidade = carrinho.reduce((soma, item) => soma + item.qtd, 0);
      const itensTexto = quantidade === 1 ? '1 item' : `${quantidade} itens`;
      const valorTexto = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById('carrinho-quantidade').textContent = itensTexto;
      document.getElementById('carrinho-total').textContent = valorTexto;
      botao.setAttribute('aria-label', `Ver carrinho, ${itensTexto}, total ${valorTexto}`);
    }

    /* ==================== FUNÇÕES DE FECHAR POPUPS ==================== */
    function fecharPopup() { popup.style.display = 'none'; }
    function fecharResumo() { document.getElementById('resumo-pedido').style.display = 'none'; }
    function fecharPagamento() { document.getElementById('pagamento').style.display = 'none'; }

    /* ==================== MOSTRAR RESUMO DO PEDIDO ==================== */
    function mostrarResumo() {
      if (carrinho.length === 0) {
    mostrarPopupAlerta(); // Mostra o novo popup
    return;
  }

      const lista = document.getElementById('lista-pedido');
      const formatarValor = valor => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const total = carrinho.reduce((soma, item) => soma + item.qtd * item.preco, 0);

      lista.innerHTML = `<ul class="resumo-lista">${carrinho.map((item, index) => `
        <li class="resumo-item">
            <span class="resumo-quantidade">${item.qtd}×</span>
            <div class="resumo-item-detalhes">
              <strong class="resumo-nome">${item.nome}</strong>
              <span class="resumo-preco">${formatarValor(item.preco)} cada</span>
            </div>
            <strong class="resumo-subtotal">${formatarValor(item.qtd * item.preco)}</strong>
          <button type="button" class="remover-item" onclick="removerItem(${index})" aria-label="Remover ${item.nome} do pedido" title="Remover item">×</button>
        </li>
      `).join('')}</ul>`;
      lista.innerHTML += `<div class="resumo-total"><span>Total do pedido</span><strong>${formatarValor(total)}</strong></div>`;
      document.getElementById('resumo-pedido').style.display = 'flex';
    }

    /* ==================== REMOVER ITEM DO CARRINHO ==================== */
    function removerItem(index) {
      if (index > -1 && index < carrinho.length) {
        carrinho.splice(index, 1);
        atualizarCarrinho();
        if (carrinho.length === 0) {
          fecharResumo();
        } else {
          mostrarResumo();
        }
      }
    }

    /* ==================== TROCA ENTRE CATEGORIAS (PRATOS, BEBIDAS, ETC.) ==================== */
    function toggleGrid(id) {
      const grids = document.querySelectorAll('.grid');
      grids.forEach(grid => {
        grid.id === id ? grid.classList.remove('hidden') : grid.classList.add('hidden');
      });
    }

    /* ==================== ABRE TELA DE PAGAMENTO ==================== */
    function abrirPagamento() {
      const total = carrinho.reduce((soma, item) => soma + item.qtd * item.preco, 0);
      document.getElementById('pagamento-total').textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      document.getElementById("valor-dinheiro").value = "";
      document.getElementById("valor-troco").textContent = "";
      delete document.getElementById("valor-troco").dataset.estado;
      document.getElementById('pagamento').style.display = 'flex';
    }

    /* ==================== CALCULAR TROCO ==================== */
    function calcularTroco() {
      const valor = parseFloat(document.getElementById("valor-dinheiro").value);
      const trocoElemento = document.getElementById("valor-troco");
      let total = carrinho.reduce((soma, item) => soma + item.qtd * item.preco, 0);

      if (!isNaN(valor)) {
        let troco = valor - total;
        let trocoTexto = troco >= 0 
          ? `Troco: R$ ${troco.toFixed(2).replace('.', ',')}` 
          : `Falta: R$ ${(troco * -1).toFixed(2).replace('.', ',')}`;
        trocoElemento.textContent = trocoTexto;
        trocoElemento.dataset.estado = troco >= 0 ? "suficiente" : "insuficiente";
      } else {
        trocoElemento.textContent = "";
        delete trocoElemento.dataset.estado;
      }
    }

    /* ==================== CONCLUIR PEDIDO ==================== */
    function concluirPedido() {
      const valor = parseFloat(document.getElementById("valor-dinheiro").value);
      let total = carrinho.reduce((soma, item) => soma + item.qtd * item.preco, 0);

      if (isNaN(valor)) {
        document.getElementById("popup-alerta-pagamento").style.display = "flex";
        // alert("Por favor, informe o valor em dinheiro.");
        document.getElementById("valor-dinheiro").focus();
        return;
      }

      if (valor < total) {
        const falta = (total - valor).toFixed(2).replace('.', ',');
        alert(`O valor informado é insuficiente. Ainda faltam R$ ${falta}.`);
        document.getElementById("valor-dinheiro").focus();
        return;
      }

      // Mostra a mensagem final
      document.getElementById("mensagem-final").style.display = "flex";

      // Fecha e reinicia após 2 segundos
      setTimeout(() => {
        fecharMensagemFinal();
      }, 2000);
    }

    /* ==================== RESETAR APÓS FINALIZAÇÃO ==================== */
    function fecharMensagemFinal() {
      carrinho = []; 
      atualizarCarrinho(); 
      document.getElementById("mensagem-final").style.display = "none";
      fecharPopup();
      fecharResumo();
      fecharPagamento();
    }

	// Função para mostrar o popup de alerta
	function mostrarPopupAlerta() {
		document.getElementById('popup-alerta-carrinho').style.display = 'flex';
	}

// Função para fechar o popup de alerta
function fecharPopupAlerta() {
  document.getElementById('popup-alerta-carrinho').style.display = 'none';
}

  function fecharPopuppagamento() {
    document.getElementById('popup-alerta-pagamento').style.display = 'none';
  }
    
    /* ==================== ATALHOS DE TECLADO ==================== */
    popup.addEventListener('click', (e) => { if (e.target === popup) fecharPopup(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharPopup(); });
