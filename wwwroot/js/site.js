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
    return lista.reduce((soma, item) => soma + Number(item[campo] || 0), 0);
}

function calcularScore(totalR, totalD, totalDividas) {
    if (totalR <= 0) return 0;

    const percentualGasto = (totalD / totalR) * 100;
    let score = 100;

    if (percentualGasto > 50) score -= (percentualGasto - 50) * 0.9;
    if (totalDividas > 0) score -= Math.min((totalDividas / totalR) * 12, 25);
    if (metas.length === 0) score -= 10;
    if (totalR - totalD <= 0) score -= 25;

    return Math.max(0, Math.min(100, Math.round(score)));
}

function atualizarDashboard() {
    const totalR = total(receitas);
    const totalD = total(despesas);
    const totalDiv = total(dividas);
    const saldo = totalR - totalD;
    const score = calcularScore(totalR, totalD, totalDiv);

    saldoAtual.innerText = moeda(saldo);
    totalReceitas.innerText = moeda(totalR);
    totalDespesas.innerText = moeda(totalD);
    totalDividas.innerText = moeda(totalDiv);
    totalMetas.innerText = metas.length;

    scoreHero.innerText = score;
    scoreSidebar.innerText = `${score}/100`;
    scoreBar.style.width = `${score}%`;

    saldoStatus.innerText = saldo > 0
        ? `Você possui ${moeda(saldo)} disponíveis após despesas.`
        : saldo < 0
            ? `Seu saldo está negativo em ${moeda(Math.abs(saldo))}.`
            : "Cadastre receitas e despesas para iniciar.";

    const ultimas = [
        ...receitas.map(x => ({ ...x, tipo: "Receita" })),
        ...despesas.map(x => ({ ...x, tipo: "Despesa" }))
    ].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 6);

    ultimasMovimentacoes.innerHTML =
        ultimas.length === 0
            ? `<p style="color:#94a3b8">Nenhuma movimentação cadastrada ainda.</p>`
            : ultimas.map(x => `
                <div class="item">
                    <div>
                        <strong>${x.descricao}</strong><br>
                        <small>${x.tipo} • ${x.categoria} • ${x.data}</small>
                    </div>
                    <strong>${moeda(Number(x.valor))}</strong>
                </div>
            `).join("");

    resumoInteligente.innerHTML = gerarInsight(totalR, totalD, totalDiv, saldo, score);
}

function gerarInsight(totalR, totalD, totalDiv, saldo, score) {
    if (totalR === 0) {
        return "Cadastre sua primeira receita para que o assistente consiga analisar sua saúde financeira.";
    }

    const gastoPercentual = (totalD / totalR) * 100;

    if (score >= 80) {
        return `Sua saúde financeira está muito boa. Você está usando aproximadamente ${gastoPercentual.toFixed(1)}% da sua renda e ainda possui ${moeda(saldo)} disponíveis. Uma boa estratégia seria direcionar parte desse valor para metas ou reserva.`;
    }

    if (score >= 55) {
        return `Você está em uma zona de atenção. Seus gastos representam ${gastoPercentual.toFixed(1)}% da renda. Tente reduzir despesas variáveis e manter uma sobra mensal mais consistente.`;
    }

    return `Seu cenário exige cuidado. Os gastos estão consumindo ${gastoPercentual.toFixed(1)}% da renda. Priorize cortar despesas, renegociar dívidas e evitar novos compromissos financeiros.`;
}

function renderReceitas() {
    listaReceitas.innerHTML = receitas.length === 0
        ? `<p style="color:#94a3b8">Nenhuma receita cadastrada.</p>`
        : receitas.map((x, i) => `
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
    listaDespesas.innerHTML = despesas.length === 0
        ? `<p style="color:#94a3b8">Nenhuma despesa cadastrada.</p>`
        : despesas.map((x, i) => `
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
    listaDividas.innerHTML = dividas.length === 0
        ? `<p style="color:#94a3b8">Nenhuma dívida cadastrada.</p>`
        : dividas.map((x, i) => {
            const mensal = Number(x.valor) / Number(x.prazo);

            return `
                <div class="item">
                    <div>
                        <strong>${x.nome}</strong><br>
                        <small>${moeda(Number(x.valor))} em ${x.prazo} meses</small><br>
                        <small>Reserva sugerida: ${moeda(mensal)} por mês</small>
                    </div>
                    <button class="remove" onclick="removerDivida(${i})">Excluir</button>
                </div>
            `;
        }).join("");
}

function renderMetas() {
    listaMetas.innerHTML = metas.length === 0
        ? `<p style="color:#94a3b8">Nenhuma meta cadastrada.</p>`
        : metas.map((x, i) => {
            const percentual = Math.min((Number(x.atual) / Number(x.objetivo)) * 100, 100);

            return `
                <div class="item">
                    <div style="width:100%">
                        <strong>${x.nome}</strong><br>
                        <small>${moeda(Number(x.atual))} de ${moeda(Number(x.objetivo))} • ${percentual.toFixed(1)}%</small>
                        <div class="progress">
                            <div class="progress-bar" style="width:${percentual}%"></div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;">
    <button onclick="adicionarValorMeta(${i})">
        + Depositar
    </button>

    <button class="remove"
            onclick="removerMeta(${i})">
        Excluir
    </button>
</div>
                </div>
            `;
        }).join("");
}

document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
        document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.page).classList.add("active");

        const titles = {
            dashboard: "Overview financeiro",
            receitas: "Controle de receitas",
            despesas: "Controle de despesas",
            dividas: "Gestão de dívidas",
            metas: "Metas financeiras",
            planejador: "Planejador inteligente"
        };

        pageTitle.innerText = titles[btn.dataset.page];
    });
});

formReceita.addEventListener("submit", e => {
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

formDespesa.addEventListener("submit", e => {
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

formDivida.addEventListener("submit", e => {
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

formMeta.addEventListener("submit", e => {
    e.preventDefault();

    metas.push({
        nome: metaNome.value,
        objetivo: Number(metaObjetivo.value),
        atual: Number(metaAtual.value),
        historico: []
    });

    e.target.reset();
    salvar();
    carregar();
});

formPlanejador.addEventListener("submit", e => {
    e.preventDefault();

    const renda = Number(planRenda.value);
    const fixos = Number(planFixos.value);
    const variaveis = Number(planVariaveis.value);
    const objetivo = Number(planObjetivo.value);
    const prazo = Number(planPrazo.value);

    const sobra = renda - fixos - variaveis;
    const necessario = objetivo / prazo;
    const mesesReais = sobra > 0 ? Math.ceil(objetivo / sobra) : 0;

    let mensagem;

    if (sobra <= 0) {
        mensagem = "Seu orçamento não possui sobra mensal. Antes de assumir uma meta, reduza gastos ou aumente a renda.";
    } else if (sobra >= necessario) {
        mensagem = `Plano viável. Guardando ${moeda(necessario)} por mês, você consegue atingir o objetivo dentro do prazo.`;
    } else {
        mensagem = `Plano apertado. Sua sobra atual é menor que o necessário. No ritmo atual, o prazo real será de aproximadamente ${mesesReais} meses.`;
    }

    resultadoPlanejador.innerHTML = `
        <strong>Resultado da simulação</strong><br><br>
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
        resultadoPlanejador.innerHTML = "";
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

function adicionarValorMeta(index) {
    const valor = Number(
        prompt("Quanto deseja adicionar à meta?")
    );

    if (!valor || valor <= 0)
        return;

    metas[index].atual += valor;

    if (!metas[index].historico)
        metas[index].historico = [];

    metas[index].historico.push({
        data: new Date().toLocaleDateString("pt-BR"),
        valor: valor
    });

    salvar();
    carregar();
}

carregar();