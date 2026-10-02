/* ==================== RENDERIZA A LISTA DE ITENS ==================== */
function renderizarItens() {
  Object.entries(itensCardapio).forEach(([categoria, itens]) => {
    const grid = document.getElementById(categoria);
    const contadorCategoria = document.querySelector(`.category-title[data-categoria="${categoria}"] .category-count`);
    const fragmento = document.createDocumentFragment();

    if (contadorCategoria) {
      contadorCategoria.textContent = itens.length;
      contadorCategoria.setAttribute('aria-label', `${itens.length} produtos`);
    }

    itens.forEach(({ nome, preco, imagem }) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'item';
      if (categoria === 'bebidas') item.classList.add('item-bebida');
      item.dataset.nome = nome;
      item.dataset.preco = preco;
      item.setAttribute('aria-label', `Adicionar uma unidade de ${nome}, 0 no carrinho`);
      const imagemElemento = document.createElement(imagem ? 'img' : 'span');
      if (imagem) {
        const miniatura = imagem.replace('.jpg', '_thumb.jpg');
        imagemElemento.className = 'item-image';
        if (categoria === 'pratos') {
          imagemElemento.src = miniatura;
        } else {
          imagemElemento.dataset.src = miniatura;
        }
        imagemElemento.alt = '';
        imagemElemento.loading = 'lazy';
        imagemElemento.decoding = 'async';
        imagemElemento.fetchPriority = 'low';
      } else {
        imagemElemento.className = 'item-image item-image-placeholder';
        imagemElemento.textContent = 'Sem foto';
        imagemElemento.setAttribute('aria-hidden', 'true');
      }
      const imagemContainer = document.createElement('span');
      imagemContainer.className = 'item-image-container';
      const nomeElemento = document.createElement('div');
      nomeElemento.className = 'item-name';
      nomeElemento.textContent = nome;
      const precoElemento = document.createElement('span');
      precoElemento.className = 'item-price';
      precoElemento.textContent = preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const contador = document.createElement('span');
      contador.className = 'item-contador';
      contador.textContent = '0';
      contador.hidden = true;
      const acoesElemento = document.createElement('span');
      acoesElemento.className = 'item-acoes';
      const incrementoElemento = document.createElement('span');
      incrementoElemento.className = 'item-incremento';
      incrementoElemento.textContent = '+';
      incrementoElemento.setAttribute('aria-hidden', 'true');
      imagemContainer.append(imagemElemento, contador);
      acoesElemento.append(precoElemento, incrementoElemento);
      item.append(imagemContainer, nomeElemento, acoesElemento);
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

    /* ==================== CLICK SOMA UMA UNIDADE ==================== */
    document.querySelectorAll('.item').forEach(card => {
      card.addEventListener('click', () => {
        const nome = card.dataset.nome;
        const existente = carrinho.find(item => item.nome === nome);
        if (existente) {
          if (!Number.isSafeInteger(existente.qtd + 1)) return;
          existente.qtd += 1;
        } else {
          carrinho.push({ nome, qtd: 1, preco: Number(card.dataset.preco) });
        }
        atualizarCarrinho();
      });
    });

    function editarQuantidade(index) {
      itemSelecionado = carrinho[index];
      if (!itemSelecionado) return;
      popupProduto.textContent = itemSelecionado.nome;
      popupInput.value = itemSelecionado.qtd;
      document.getElementById('resumo-pedido').style.display = 'none';
      popup.style.display = 'flex';
      popupInput.focus();
    }

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

      if (!itemSelecionado || !carrinho.includes(itemSelecionado)) return;
      itemSelecionado.qtd = qtd;
      atualizarCarrinho();
      fecharPopup();
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
      document.querySelectorAll('.item').forEach(card => {
        const qtd = carrinho.find(item => item.nome === card.dataset.nome)?.qtd || 0;
        const contador = card.querySelector('.item-contador');
        contador.textContent = qtd;
        contador.hidden = qtd === 0;
        card.classList.toggle('item-selecionado', qtd > 0);
        card.setAttribute('aria-label', `Adicionar uma unidade de ${card.dataset.nome}, ${qtd} no carrinho`);
      });
    }

    /* ==================== FUNÇÕES DE FECHAR POPUPS ==================== */
    function fecharPopup() {
      popup.style.display = 'none';
      if (itemSelecionado && carrinho.length > 0) mostrarResumo();
      itemSelecionado = null;
    }
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
            <button type="button" class="resumo-quantidade" onclick="editarQuantidade(${index})" aria-label="Editar quantidade de ${item.nome}" title="Editar quantidade">${item.qtd}×</button>
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
      carregarImagensCategoria(id);
    }

    function carregarImagensCategoria(id) {
      document.querySelectorAll(`#${id} .item-image[data-src]`).forEach(imagem => {
        imagem.src = imagem.dataset.src;
        imagem.removeAttribute('data-src');
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
