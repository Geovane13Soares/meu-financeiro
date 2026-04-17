let telaIndex = 0;
const telas = ["home", "lancamentos", "busca", "backup"];

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

/* SWIPE */
let startX = 0;

document.getElementById("telas").addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.getElementById("telas").addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;
  let diff = startX - endX;
  
  if (diff > 50 && telaIndex < telas.length - 1) telaIndex++;
  if (diff < -50 && telaIndex > 0) telaIndex--;
  
  trocarTela(telas[telaIndex]);
});

atualizarMenu();