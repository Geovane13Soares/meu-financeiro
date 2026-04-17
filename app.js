let telaIndex = 0;
const telas = ["home", "lancamentos", "busca", "backup"];

/* =========================
   NAVEGAÇÃO
========================= */
function trocarTela(nome) {
  telaIndex = telas.indexOf(nome);
  
  document.getElementById("telas").style.transform =
    `translateX(-${telaIndex * 100}%)`;
  
  atualizarMenu();
  atualizar();
}

function atualizarMenu() {
  document.querySelectorAll(".menu button").forEach(btn => {
    btn.classList.remove("ativo");
  });
  
  document.getElementById("btn-" + telas[telaIndex]).classList.add("ativo");
}

/* =========================
   SWIPE MOBILE
========================= */
let startX = 0;

document.getElementById("telas").addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.getElementById("telas").addEventListener("touchend", e => {
  let diff = startX - e.changedTouches[0].clientX;
  
  if (diff > 50 && telaIndex < telas.length - 1) telaIndex++;
  if (diff < -50 && telaIndex > 0) telaIndex--;
  
  trocarTela(telas[telaIndex]);
});

/* =========================
   DADOS
========================= */
let lancamentos = JSON.parse(localStorage.getItem("lancamentos")) || [];
let grafico;

/* =========================
   ADICIONAR
========================= */
function adicionar() {
  const descricao = document.getElementById("descricao").value.trim();
  const valor = parseFloat(document.getElementById("valor").value);
  const tipo = document.getElementById("tipo").value;
  
  if (!descricao || isNaN(valor) || valor <= 0) {
    alert("Preencha corretamente os campos!");
    return;
  }
  
  const novo = {
    id: Date.now(),
    descricao,
    valor,
    tipo,
    data: new Date().toISOString()
  };
  
  lancamentos.push(novo);
  salvar();
  limparCampos();
  atualizar();
}

/* =========================
   EXCLUIR
========================= */
function del(id) {
  lancamentos = lancamentos.filter(l => l.id !== id);
  salvar();
  atualizar();
}

/* =========================
   UTIL
========================= */
function salvar() {
  localStorage.setItem("lancamentos", JSON.stringify(lancamentos));
}

function limparCampos() {
  document.getElementById("descricao").value = "";
  document.getElementById("valor").value = "";
}

function formatarData(dataISO) {
  const d = new Date(dataISO);
  return d.toLocaleDateString("pt-BR");
}

/* =========================
   FILTROS
========================= */
function filtrarLancamentos() {
  const mes = document.getElementById("filtroMes").value;
  const busca = document.getElementById("busca")?.value?.toLowerCase() || "";
  
  return lancamentos.filter(l => {
    let ok = true;
    
    if (mes) {
      const data = new Date(l.data);
      const mesLanc = data.toISOString().slice(0, 7);
      if (mes !== mesLanc) ok = false;
    }
    
    if (busca) {
      if (!l.descricao.toLowerCase().includes(busca)) ok = false;
    }
    
    return ok;
  });
}

/* =========================
   ATUALIZAR TUDO
========================= */
function atualizar() {
  atualizarLista();
  atualizarResumo();
  atualizarBusca();
  atualizarGrafico();
}

/* =========================
   LISTA
========================= */
function atualizarLista() {
  const lista = document.getElementById("listaLanc");
  lista.innerHTML = "";
  
  const dados = filtrarLancamentos();
  
  dados.forEach(l => {
    const li = document.createElement("li");
    
    li.innerHTML = `
      <div>
        <strong>${l.descricao}</strong><br>
        <small>${formatarData(l.data)}</small>
      </div>
      <div>
        R$ ${l.valor.toFixed(2)}
        <button class="btn-delete" onclick="del(${l.id})">🗑️</button>
      </div>
    `;
    
    lista.appendChild(li);
  });
}

/* =========================
   BUSCA
========================= */
function atualizarBusca() {
  const lista = document.getElementById("listaBusca");
  if (!lista) return;
  
  lista.innerHTML = "";
  
  const dados = filtrarLancamentos();
  
  dados.forEach(l => {
    const li = document.createElement("li");
    li.innerText = `${l.descricao} - R$ ${l.valor.toFixed(2)}`;
    lista.appendChild(li);
  });
}

/* =========================
   RESUMO
========================= */
function atualizarResumo() {
  let entradas = 0;
  let saidas = 0;
  
  lancamentos.forEach(l => {
    if (l.tipo === "receita") entradas += l.valor;
    else saidas += l.valor;
  });
  
  document.getElementById("entradas").innerText = "R$ " + entradas.toFixed(2);
  document.getElementById("saidas").innerText = "R$ " + saidas.toFixed(2);
  document.getElementById("saldo").innerText =
    "R$ " + (entradas - saidas).toFixed(2);
}

/* =========================
   GRÁFICO
========================= */
function atualizarGrafico() {
  const ctx = document.getElementById("grafico");
  
  let entradas = 0;
  let saidas = 0;
  
  lancamentos.forEach(l => {
    if (l.tipo === "receita") entradas += l.valor;
    else saidas += l.valor;
  });
  
  if (grafico) grafico.destroy();
  
  grafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [{
        data: [entradas, saidas],
      }]
    }
  });
}

/* =========================
   BACKUP
========================= */
function exportar() {
  const data = JSON.stringify(lancamentos);
  const blob = new Blob([data], { type: "application/json" });
  
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "backup_financas.json";
  a.click();
}

function importar(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  
  reader.onload = function(e) {
    lancamentos = JSON.parse(e.target.result);
    salvar();
    atualizar();
  };
  
  reader.readAsText(file);
}

/* =========================
   INIT
========================= */
atualizar();
atualizarMenu();