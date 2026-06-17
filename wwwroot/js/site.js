let receitas = JSON.parse(localStorage.getItem("receitas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];
let dividas = JSON.parse(localStorage.getItem("dividas")) || [];
let metas = JSON.parse(localStorage.getItem("metas")) || [];

const moeda = valor => valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
});

function salvar() {
    localStorage.setItem("receitas", JSON.stringify(receitas));
    localStorage.setItem("despesas", JSON.stringify(despesas));
    localStorage.setItem("dividas", JSON.stringify(dividas));
    localStorage.setItem("metas", JSON.stringify(metas));
}

function total(lista, campo = "valor") {
    return lista.reduce((soma, item) => soma + Number(item[campo]), 0);
}

function atualizarDashboard() {
    const totalR = total(receitas);
    const totalD = total(despesas);
    const totalDiv = total(dividas);
    const saldo = totalR - totalD;

    document.getElementById("saldoAtual").innerText = moeda(saldo);
    document.getElementById("totalReceitas").innerText = moeda(totalR);
    document.getElementById("totalDespesas").innerText = moeda(totalD);
    document.getElementById("totalDividas").innerText = moeda(totalDiv);

    const ultimas = [
        ...receitas.map(x => ({ ...x, tipo: "Receita" })),
        ...despesas.map(x => ({ ...x, tipo: "Despesa" }))
    ].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 6);

    document.getElementById("ultimasMovimentacoes").innerHTML =
        ultimas.length === 0
            ? "<p>Nenhuma movimentação cadastrada.</p>"
            : ultimas.map(x => `
                <div class="item">
                    <div>
                        <strong>${x.descricao}</strong><br>
                        <small>${x.tipo} • ${x.categoria} • ${x.data}</small>
                    </div>
                    <strong>${moeda(Number(x.valor))}</strong>
                </div>
            `).join("");

    const resumo = document.getElementById("resumoInteligente");

    if (totalR === 0) {
        resumo.innerText = "Cadastre suas receitas e despesas para receber uma análise.";
    } else {
        const percentualGasto = (totalD / totalR) * 100;

        if (percentualGasto < 50) {
            resumo.innerText = "Você está com uma boa margem financeira. Pode acelerar metas ou quitar dívidas.";
        } else if (percentualGasto <= 80) {
            resumo.innerText = "Atenção: seus gastos estão moderados. Revise despesas variáveis para melhorar seu saldo.";
        } else {
            resumo.innerText = "Alerta: seus gastos estão muito altos em relação à renda. Priorize cortar despesas e renegociar dívidas.";
        }
    }
}

function renderReceitas() {
    document.getElementById("listaReceitas").innerHTML = receitas.map((x, i) => `
        <div class="item">
            <div>
                <strong>${x.descricao}</strong><br>
                <small>${x.categoria} • ${x.data}</small>
            </div>
            <div>
                <strong>${moeda(Number(x.valor))}</strong>
                <button class="remove" onclick="removerReceita(${i})">Excluir</button>
            </div>
        </div>
    `).join("");
}

function renderDespesas() {
    document.getElementById("listaDespesas").innerHTML = despesas.map((x, i) => `
        <div class="item">
            <div>
                <strong>${x.descricao}</strong><br>
                <small>${x.categoria} • ${x.data}</small>
            </div>
            <div>
                <strong>${moeda(Number(x.valor))}</strong>
                <button class="remove" onclick="removerDespesa(${i})">Excluir</button>
            </div>
        </div>
    `).join("");
}

function renderDividas() {
    document.getElementById("listaDividas").innerHTML = dividas.map((x, i) => {
        const mensal = Number(x.valor) / Number(x.prazo);

        return `
            <div class="item">
                <div>
                    <strong>${x.nome}</strong><br>
                    <small>${moeda(Number(x.valor))} em ${x.prazo} meses</small><br>
                    <small>Guardar aproximadamente ${moeda(mensal)} por mês</small>
                </div>
                <button class="remove" onclick="removerDivida(${i})">Excluir</button>
            </div>
        `;
    }).join("");
}

function renderMetas() {
    document.getElementById("listaMetas").innerHTML = metas.map((x, i) => {
        const percentual = Math.min((Number(x.atual) / Number(x.objetivo)) * 100, 100);

        return `
            <div class="item">
                <div style="width:100%">
                    <strong>${x.nome}</strong><br>
                    <small>${moeda(Number(x.atual))} de ${moeda(Number(x.objetivo))}</small>
                    <div class="progress">
                        <div class="progress-bar" style="width:${percentual}%"></div>
                    </div>
                </div>
                <button class="remove" onclick="removerMeta(${i})">Excluir</button>
            </div>
        `;
    }).join("");
}

document.querySelectorAll(".menu").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".menu").forEach(x => x.classList.remove("active"));
        document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));

        btn.classList.add("active");

        const page = btn.dataset.page;
        document.getElementById(page).classList.add("active");

        document.getElementById("pageTitle").innerText =
            btn.innerText;
    });
});

document.getElementById("formReceita").addEventListener("submit", e => {
    e.preventDefault();

    receitas.push({
        descricao: receitaDescricao.value,
        categoria: receitaCategoria.value,
        valor: Number(receitaValor.value),
        data: receitaData.value
    });

    e.target.reset();
    salvar();
    carregar();
});

document.getElementById("formDespesa").addEventListener("submit", e => {
    e.preventDefault();

    despesas.push({
        descricao: despesaDescricao.value,
        categoria: despesaCategoria.value,
        valor: Number(despesaValor.value),
        data: despesaData.value
    });

    e.target.reset();
    salvar();
    carregar();
});

document.getElementById("formDivida").addEventListener("submit", e => {
    e.preventDefault();

    dividas.push({
        nome: dividaNome.value,
        valor: Number(dividaValor.value),
        prazo: Number(dividaPrazo.value)
    });

    e.target.reset();
    salvar();
    carregar();
});

document.getElementById("formMeta").addEventListener("submit", e => {
    e.preventDefault();

    metas.push({
        nome: metaNome.value,
        objetivo: Number(metaObjetivo.value),
        atual: Number(metaAtual.value)
    });

    e.target.reset();
    salvar();
    carregar();
});

document.getElementById("formPlanejador").addEventListener("submit", e => {
    e.preventDefault();

    const renda = Number(planRenda.value);
    const fixos = Number(planFixos.value);
    const variaveis = Number(planVariaveis.value);
    const objetivo = Number(planObjetivo.value);
    const prazo = Number(planPrazo.value);

    const sobra = renda - fixos - variaveis;
    const necessario = objetivo / prazo;
    const mesesReais = sobra > 0 ? Math.ceil(objetivo / sobra) : 0;

    let mensagem = "";

    if (sobra <= 0) {
        mensagem = "Você não possui sobra mensal no momento. O ideal é reduzir despesas antes de assumir uma nova meta.";
    } else if (sobra >= necessario) {
        mensagem = `Plano viável. Você precisa guardar ${moeda(necessario)} por mês e sua sobra atual é ${moeda(sobra)}. Mantendo esse ritmo, pode concluir em aproximadamente ${mesesReais} meses.`;
    } else {
        mensagem = `Plano apertado. Você precisa guardar ${moeda(necessario)} por mês, mas sua sobra atual é ${moeda(sobra)}. Nesse ritmo, o prazo real será de aproximadamente ${mesesReais} meses.`;
    }

    resultadoPlanejador.innerHTML = `
        <strong>Resultado:</strong><br>
        Renda mensal: ${moeda(renda)}<br>
        Gastos totais: ${moeda(fixos + variaveis)}<br>
        Sobra mensal: ${moeda(sobra)}<br>
        Necessário por mês: ${moeda(necessario)}<br><br>
        ${mensagem}
    `;
});

function removerReceita(i) {
    receitas.splice(i, 1);
    salvar();
    carregar();
}

function removerDespesa(i) {
    despesas.splice(i, 1);
    salvar();
    carregar();
}

function removerDivida(i) {
    dividas.splice(i, 1);
    salvar();
    carregar();
}

function removerMeta(i) {
    metas.splice(i, 1);
    salvar();
    carregar();
}

function limparTudo() {
    if (confirm("Tem certeza que deseja apagar todos os dados?")) {
        localStorage.clear();
        receitas = [];
        despesas = [];
        dividas = [];
        metas = [];
        carregar();
    }
}

function carregar() {
    atualizarDashboard();
    renderReceitas();
    renderDespesas();
    renderDividas();
    renderMetas();
}

carregar();