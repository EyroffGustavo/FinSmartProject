let receitas = JSON.parse(localStorage.getItem("receitas")) || [];
let despesas = JSON.parse(localStorage.getItem("despesas")) || [];
let dividas = JSON.parse(localStorage.getItem("dividas")) || [];
let metas = JSON.parse(localStorage.getItem("metas")) || [];
let planejamentos = JSON.parse(localStorage.getItem("planejamentos")) || [];
let investimentos = JSON.parse(localStorage.getItem("investimentos")) || [];

let fluxoChartInstance = null;
let categoriaChartInstance = null;

const $ = (id) => document.getElementById(id);

const moeda = (valor) => Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
});

function salvar() {
    localStorage.setItem("receitas", JSON.stringify(receitas));
    localStorage.setItem("despesas", JSON.stringify(despesas));
    localStorage.setItem("dividas", JSON.stringify(dividas));
    localStorage.setItem("metas", JSON.stringify(metas));
    localStorage.setItem("planejamentos", JSON.stringify(planejamentos));
    localStorage.setItem("investimentos", JSON.stringify(investimentos));
}

function total(lista, campo = "valor") {
    return lista.reduce((soma, item) => soma + Math.abs(Number(item[campo] || 0)), 0);
}

function normalizarData(data) {
    if (!data) return new Date().toISOString().substring(0, 10);

    if (typeof data === "string" && data.includes("T")) {
        return data.substring(0, 10);
    }

    return data;
}

function calcularScore(totalR, totalD, totalDividas) {
    if (totalR <= 0) return 0;

    let score = 100;
    const percentualGasto = (totalD / totalR) * 100;

    if (percentualGasto > 50) score -= (percentualGasto - 50) * 0.9;
    if (totalDividas > 0) score -= Math.min((totalDividas / totalR) * 12, 25);
    if (metas.length === 0) score -= 10;
    if ((totalR - totalD) <= 0) score -= 25;

    return Math.max(0, Math.min(100, Math.round(score)));
}

function obterMaiorCategoria() {
    if (despesas.length === 0) return "sem despesas cadastradas";

    const grupos = {};

    despesas.forEach(d => {
        const categoria = d.categoria || "Não classificada";
        grupos[categoria] = (grupos[categoria] || 0) + Math.abs(Number(d.valor || 0));
    });

    const ordenado = Object.entries(grupos).sort((a, b) => b[1] - a[1]);
    return ordenado.length ? ordenado[0][0] : "sem despesas cadastradas";
}

function gerarInsight(totalR, totalD, totalDiv, saldo, score) {
    if (totalR === 0) {
        return "Cadastre ou importe suas movimentações para gerar uma análise financeira real.";
    }

    const gastoPercentual = (totalD / totalR) * 100;
    const maiorCategoria = obterMaiorCategoria();

    if (score >= 80) {
        return `Sua saúde financeira está muito boa. Você utiliza ${gastoPercentual.toFixed(1)}% da renda. Maior categoria de gasto: ${maiorCategoria}.`;
    }

    if (score >= 55) {
        return `Você está em atenção. Seus gastos representam ${gastoPercentual.toFixed(1)}% da renda. Revise principalmente: ${maiorCategoria}.`;
    }

    return `Cenário crítico. Seus gastos consomem ${gastoPercentual.toFixed(1)}% da renda. Priorize reduzir despesas e renegociar dívidas.`;
}

function atualizarDashboard() {
    const totalR = total(receitas);
    const totalD = total(despesas);
    const totalDiv = total(dividas);
    const saldo = totalR - totalD;
    const score = calcularScore(totalR, totalD, totalDiv);

    if ($("saldoAtual")) $("saldoAtual").innerText = moeda(saldo);
    if ($("totalReceitas")) $("totalReceitas").innerText = moeda(totalR);
    if ($("totalDespesas")) $("totalDespesas").innerText = moeda(totalD);
    if ($("totalDividas")) $("totalDividas").innerText = moeda(totalDiv);
    if ($("totalMetas")) $("totalMetas").innerText = metas.length;

    if ($("scoreHero")) $("scoreHero").innerText = score;
    if ($("scoreSidebar")) $("scoreSidebar").innerText = `${score}/100`;
    if ($("scoreBar")) $("scoreBar").style.width = `${score}%`;

    if ($("saldoStatus")) {
        $("saldoStatus").innerText =
            saldo > 0
                ? `Você possui ${moeda(saldo)} disponíveis após despesas.`
                : saldo < 0
                    ? `Seu saldo está negativo em ${moeda(Math.abs(saldo))}.`
                    : "Cadastre receitas e despesas para iniciar.";
    }

    const ultimas = [
        ...receitas.map(x => ({ ...x, tipo: "Receita" })),
        ...despesas.map(x => ({ ...x, tipo: "Despesa" }))
    ].sort((a, b) => new Date(normalizarData(b.data)) - new Date(normalizarData(a.data))).slice(0, 8);

    if ($("ultimasMovimentacoes")) {
        $("ultimasMovimentacoes").innerHTML =
            ultimas.length === 0
                ? `<p style="color:#94a3b8">Nenhuma movimentação cadastrada ainda.</p>`
                : ultimas.map(x => `
                    <div class="item">
                        <div>
                            <strong>${x.descricao}</strong><br>
                            <small>${x.tipo} • ${x.categoria || "Sem categoria"} • ${normalizarData(x.data)}</small>
                        </div>
                        <strong class="${x.tipo === "Receita" ? "valor-receita" : "valor-despesa"}">
                            ${x.tipo === "Despesa" ? "-" : "+"}${moeda(x.valor)}
                        </strong>
                    </div>
                `).join("");
    }

    if ($("resumoInteligente")) {
        $("resumoInteligente").innerHTML = gerarInsight(totalR, totalD, totalDiv, saldo, score);
    }
}

function renderReceitas() {
    const lista = $("listaReceitas");
    if (!lista) return;

    lista.innerHTML = receitas.length === 0
        ? `<p style="color:#94a3b8">Nenhuma receita cadastrada.</p>`
        : receitas.map((x, i) => `
            <div class="item">
                <div>
                    <strong>${x.descricao}</strong><br>
                    <small>${x.categoria || "Sem categoria"} • ${normalizarData(x.data)}</small>
                </div>
                <div>
                    <strong class="valor-receita">${moeda(x.valor)}</strong>
                    <button class="remove" onclick="removerReceita(${i})">Excluir</button>
                </div>
            </div>
        `).join("");
}

function renderDespesas() {
    const lista = $("listaDespesas");
    if (!lista) return;

    lista.innerHTML = despesas.length === 0
        ? `<p style="color:#94a3b8">Nenhuma despesa cadastrada.</p>`
        : despesas.map((x, i) => `
            <div class="item">
                <div>
                    <strong>${x.descricao}</strong><br>
                    <small>${x.categoria || "Sem categoria"} • ${normalizarData(x.data)}</small>
                </div>
                <div>
                    <strong class="valor-despesa">-${moeda(x.valor)}</strong>
                    <button class="remove" onclick="removerDespesa(${i})">Excluir</button>
                </div>
            </div>
        `).join("");
}

function renderDividas() {
    const lista = $("listaDividas");
    if (!lista) return;

    lista.innerHTML = dividas.length === 0
        ? `<p style="color:#94a3b8">Nenhuma dívida cadastrada.</p>`
        : dividas.map((x, i) => {
            const prazo = Number(x.prazo || x.prazoMeses || 1);
            const mensal = Number(x.valor || 0) / prazo;

            return `
                <div class="item">
                    <div>
                        <strong>${x.nome}</strong><br>
                        <small>${moeda(x.valor)} em ${prazo} meses</small><br>
                        <small>Reserva sugerida: ${moeda(mensal)} por mês</small>
                    </div>
                    <button class="remove" onclick="removerDivida(${i})">Excluir</button>
                </div>
            `;
        }).join("");
}

function renderMetas() {
    const lista = $("listaMetas");
    if (!lista) return;

    lista.innerHTML = metas.length === 0
        ? `<p style="color:#94a3b8">Nenhuma meta cadastrada.</p>`
        : metas.map((x, i) => {
            if (!x.historico) x.historico = [];

            const objetivo = Number(x.objetivo || 0);
            const atual = Number(x.atual || 0);
            const percentual = objetivo > 0 ? Math.min((atual / objetivo) * 100, 100) : 0;
            const falta = Math.max(objetivo - atual, 0);

            return `
                <div class="item">
                    <div style="width:100%">
                        <strong>${x.nome}</strong><br>
                        <small>${moeda(atual)} de ${moeda(objetivo)} • faltam ${moeda(falta)}</small>
                        <div class="progress">
                            <div class="progress-bar" style="width:${percentual}%"></div>
                        </div>
                    </div>

                    <div style="display:flex;gap:8px;">
                        <button onclick="adicionarValorMeta(${i})">+ Depositar</button>
                        <button class="remove" onclick="removerMeta(${i})">Excluir</button>
                    </div>
                </div>
            `;
        }).join("");
}

function renderPlanejamentoFuturo() {
    const lista = $("listaFuturo");
    if (!lista) return;

    let totalEntradas = 0;
    let totalSaidas = 0;

    planejamentos.forEach(p => {
        if (!p.checks) p.checks = Array(Number(p.meses || 0)).fill(false);

        const restantes = p.checks.filter(x => !x).length;
        const valorRestante = restantes * Number(p.valor || 0);

        if (p.tipo === "entrada") {
            totalEntradas += valorRestante;
        } else {
            totalSaidas += valorRestante;
        }
    });

    if ($("futuroEntradas")) $("futuroEntradas").innerText = moeda(totalEntradas);
    if ($("futuroSaidas")) $("futuroSaidas").innerText = moeda(totalSaidas);
    if ($("futuroSaldo")) $("futuroSaldo").innerText = moeda(totalEntradas - totalSaidas);

    lista.innerHTML = planejamentos.length === 0
        ? `<p style="color:#94a3b8">Nenhum planejamento cadastrado.</p>`
        : planejamentos.map((p, i) => {
            const meses = Number(p.meses || 0);
            const concluidos = p.checks.filter(x => x).length;
            const restantes = Math.max(meses - concluidos, 0);
            const percentual = meses > 0 ? (concluidos / meses) * 100 : 0;

            return `
                <div class="future-card">
                    <div class="future-head">
                        <div>
                            <strong>${p.descricao}</strong>
                            <small>${p.tipo === "entrada" ? "Entrada recorrente" : "Parcela / Saída"} • ${moeda(p.valor)} por mês</small>
                        </div>

                        <button class="remove" onclick="removerPlanejamento(${i})">Excluir</button>
                    </div>

                    <div class="progress">
                        <div class="progress-bar" style="width:${percentual}%"></div>
                    </div>

                    <p>${concluidos} de ${meses} meses concluídos • Restam ${restantes} meses • Valor restante: ${moeda(restantes * Number(p.valor || 0))}</p>

                    <div class="month-checks">
                        ${p.checks.map((check, index) => `
                            <button
                                class="month-check ${check ? "checked" : ""}"
                                onclick="alternarCheckPlanejamento(${i}, ${index})">
                                ${index + 1}
                            </button>
                        `).join("")}
                    </div>
                </div>
            `;
        }).join("");
}

function renderGraficos() {
    if (typeof Chart === "undefined") return;

    const fluxoCanvas = $("fluxoChart");
    const categoriaCanvas = $("categoriaChart");

    if (fluxoCanvas) {
        if (fluxoChartInstance) fluxoChartInstance.destroy();

        fluxoChartInstance = new Chart(fluxoCanvas, {
            type: "bar",
            data: {
                labels: ["Atual"],
                datasets: [
                    {
                        label: "Receitas",
                        data: [total(receitas)]
                    },
                    {
                        label: "Despesas",
                        data: [total(despesas)]
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: "#f8fafc" } }
                },
                scales: {
                    x: { ticks: { color: "#94a3b8" } },
                    y: { ticks: { color: "#94a3b8" } }
                }
            }
        });
    }

    if (categoriaCanvas) {
        if (categoriaChartInstance) categoriaChartInstance.destroy();

        const grupos = {};

        despesas.forEach(d => {
            const categoria = d.categoria || "Não classificada";
            grupos[categoria] = (grupos[categoria] || 0) + Math.abs(Number(d.valor || 0));
        });

        categoriaChartInstance = new Chart(categoriaCanvas, {
            type: "doughnut",
            data: {
                labels: Object.keys(grupos),
                datasets: [{
                    data: Object.values(grupos)
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: "#f8fafc" } }
                }
            }
        });
    }
}

function renderReservaEmergencia() {
    const reservaIdealEl = $("reservaIdeal");
    if (!reservaIdealEl) return;

    const totalD = total(despesas);
    const saldo = total(receitas) - totalD;
    const ideal = totalD * 6;
    const percentual = ideal > 0 ? Math.min((saldo / ideal) * 100, 100) : 0;

    reservaIdealEl.innerText = moeda(ideal);

    if ($("reservaBarra")) $("reservaBarra").style.width = `${Math.max(percentual, 0)}%`;

    if ($("reservaTexto")) {
        $("reservaTexto").innerText =
            ideal <= 0
                ? "Cadastre despesas para calcular sua reserva ideal."
                : `Sua reserva ideal é de ${moeda(ideal)}. Você está em aproximadamente ${percentual.toFixed(1)}% desse objetivo.`;
    }
}

function renderCalendarioFinanceiro() {
    const calendario = $("calendarioFinanceiro");
    if (!calendario) return;

    const eventos = [];

    receitas.forEach(r => eventos.push({ ...r, tipo: "Receita" }));
    despesas.forEach(d => eventos.push({ ...d, tipo: "Despesa" }));

    planejamentos.forEach(p => {
        if (!p.checks) p.checks = Array(Number(p.meses || 0)).fill(false);

        p.checks.forEach((check, index) => {
            eventos.push({
                descricao: `${p.descricao} (${index + 1}/${p.meses})`,
                categoria: p.tipo === "entrada" ? "Entrada prevista" : "Parcela prevista",
                valor: p.valor,
                data: `Mês ${index + 1}`,
                tipo: p.tipo === "entrada" ? "Receita" : "Despesa",
                concluido: check
            });
        });
    });

    calendario.innerHTML = eventos.length === 0
        ? `<p style="color:#94a3b8">Nenhum evento financeiro encontrado.</p>`
        : eventos.map(e => `
            <div class="item">
                <div>
                    <strong>${e.descricao}</strong><br>
                    <small>${e.data} • ${e.categoria} ${e.concluido ? "• concluído" : ""}</small>
                </div>
                <strong class="${e.tipo === "Receita" ? "valor-receita" : "valor-despesa"}">
                    ${e.tipo === "Despesa" ? "-" : "+"}${moeda(e.valor)}
                </strong>
            </div>
        `).join("");
}

function renderInvestimentos() {
    const lista = $("listaInvestimentos");
    if (!lista) return;

    if ($("totalInvestido")) $("totalInvestido").innerText = moeda(total(investimentos));

    lista.innerHTML = investimentos.length === 0
        ? `<p style="color:#94a3b8">Nenhum investimento cadastrado.</p>`
        : investimentos.map((i, index) => `
            <div class="item">
                <div>
                    <strong>${i.nome}</strong><br>
                    <small>${i.tipo}</small>
                </div>
                <div>
                    <strong>${moeda(i.valor)}</strong>
                    <button class="remove" onclick="removerInvestimento(${index})">Excluir</button>
                </div>
            </div>
        `).join("");
}

document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
        document.querySelectorAll(".page").forEach(x => x.classList.remove("active"));

        btn.classList.add("active");

        const page = btn.dataset.page;
        const section = $(page);
        if (section) section.classList.add("active");

        const titles = {
            dashboard: "Dashboard",
            receitas: "Receitas",
            despesas: "Despesas",
            dividas: "Dívidas",
            metas: "Metas",
            futuro: "Planejamento Futuro",
            planejador: "Simulador",
            importacao: "Importação Inteligente",
            relatorios: "Relatórios",
            calendario: "Calendário Financeiro",
            investimentos: "Investimentos"
        };

        if ($("pageTitle")) $("pageTitle").innerText = titles[page] || "FinSmart";

        renderGraficos();
    });
});

const formReceita = $("formReceita");
if (formReceita) {
    formReceita.addEventListener("submit", e => {
        e.preventDefault();

        receitas.push({
            descricao: $("receitaDescricao").value,
            categoria: $("receitaCategoria").value,
            valor: Number($("receitaValor").value),
            data: $("receitaData").value
        });

        e.target.reset();
        salvar();
        carregar();
    });
}

const formDespesa = $("formDespesa");
if (formDespesa) {
    formDespesa.addEventListener("submit", e => {
        e.preventDefault();

        despesas.push({
            descricao: $("despesaDescricao").value,
            categoria: $("despesaCategoria").value,
            valor: Number($("despesaValor").value),
            data: $("despesaData").value
        });

        e.target.reset();
        salvar();
        carregar();
    });
}

const formDivida = $("formDivida");
if (formDivida) {
    formDivida.addEventListener("submit", e => {
        e.preventDefault();

        dividas.push({
            nome: $("dividaNome").value,
            valor: Number($("dividaValor").value),
            prazo: Number($("dividaPrazo").value)
        });

        e.target.reset();
        salvar();
        carregar();
    });
}

const formMeta = $("formMeta");
if (formMeta) {
    formMeta.addEventListener("submit", e => {
        e.preventDefault();

        metas.push({
            nome: $("metaNome").value,
            objetivo: Number($("metaObjetivo").value),
            atual: Number($("metaAtual").value),
            historico: []
        });

        e.target.reset();
        salvar();
        carregar();
    });
}

const formPlanejador = $("formPlanejador");
if (formPlanejador) {
    formPlanejador.addEventListener("submit", e => {
        e.preventDefault();

        const renda = Number($("planRenda").value);
        const fixos = Number($("planFixos").value);
        const variaveis = Number($("planVariaveis").value);
        const objetivo = Number($("planObjetivo").value);
        const prazo = Number($("planPrazo").value);

        const sobra = renda - fixos - variaveis;
        const necessario = prazo > 0 ? objetivo / prazo : 0;
        const mesesReais = sobra > 0 ? Math.ceil(objetivo / sobra) : 0;

        let mensagem;

        if (sobra <= 0) {
            mensagem = "Seu orçamento não possui sobra mensal. Antes de assumir uma meta, reduza gastos ou aumente a renda.";
        } else if (sobra >= necessario) {
            mensagem = `Plano viável. Guardando ${moeda(necessario)} por mês, você consegue atingir o objetivo dentro do prazo.`;
        } else {
            mensagem = `Plano apertado. Sua sobra atual é menor que o necessário. No ritmo atual, o prazo real será de aproximadamente ${mesesReais} meses.`;
        }

        if ($("resultadoPlanejador")) {
            $("resultadoPlanejador").innerHTML = `
                <strong>Resultado da simulação</strong><br><br>
                Renda mensal: ${moeda(renda)}<br>
                Gastos totais: ${moeda(fixos + variaveis)}<br>
                Sobra mensal: ${moeda(sobra)}<br>
                Necessário por mês: ${moeda(necessario)}<br><br>
                ${mensagem}
            `;
        }
    });
}

const formFuturo = $("formFuturo");
if (formFuturo) {
    formFuturo.addEventListener("submit", e => {
        e.preventDefault();

        const meses = Number($("futuroMeses").value);

        planejamentos.push({
            descricao: $("futuroDescricao").value,
            tipo: $("futuroTipo").value,
            valor: Number($("futuroValor").value),
            meses,
            checks: Array(meses).fill(false)
        });

        e.target.reset();
        salvar();
        carregar();
    });
}

const formInvestimento = $("formInvestimento");
if (formInvestimento) {
    formInvestimento.addEventListener("submit", e => {
        e.preventDefault();

        investimentos.push({
            nome: $("investNome").value,
            tipo: $("investTipo").value,
            valor: Number($("investValor").value)
        });

        e.target.reset();
        salvar();
        carregar();
    });
}

function renderResultadoImportacao(data)
{
    const resultado = document.getElementById("resultadoImportacao");

    resultado.innerHTML = `
        <div class="import-result">
            <h3>Importação concluída</h3>

            <p>Total encontrado: ${data.totalEncontrado}</p>
            <p>Receitas: ${data.totalReceitas}</p>
            <p>Despesas: ${data.totalDespesas}</p>

            <button onclick='confirmarImportacao(window.movimentacoesImportadas)'>
                Confirmar importação para o dashboard
            </button>

            <div id="previewImportacao"></div>
        </div>
    `;

    window.movimentacoesImportadas = data.movimentacoes;

    const preview = document.getElementById("previewImportacao");

    preview.innerHTML = data.movimentacoes
        .slice(0, 20)
        .map(x => `
            <div class="item">
                <div>
                    <strong>${x.descricao}</strong><br>
                    <small>${x.data} • ${x.categoria}</small>
                </div>

                <strong class="${
                    x.tipo === "Receita"
                        ? "valor-receita"
                        : "valor-despesa"
                }">
                    ${moeda(Math.abs(x.valor))}
                </strong>
            </div>
        `)
        .join("");
}

function lerOFX(texto) {

    const movimentacoes = [];

    const blocos =
        texto.match(/<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi) || [];

    blocos.forEach(bloco => {

        const descricao =
            (bloco.match(/<MEMO>(.*)/i)?.[1]
                || bloco.match(/<NAME>(.*)/i)?.[1]
                || "Sem descrição")
                .trim();

        const valorTexto =
            bloco.match(/<TRNAMT>(.*)/i)?.[1] || "0";

        const valor =
            Number(valorTexto.replace(",", "."));

        movimentacoes.push({

            descricao,

            valor,

            categoria:
                valor > 0
                    ? "Receita"
                    : "Despesa",

            tipo:
                valor > 0
                    ? "Receita"
                    : "Despesa",

            data:
                new Date()
                    .toISOString()
                    .substring(0, 10)
        });
    });

    return movimentacoes;
}

const formImportacao = $("formImportacao");

if (formImportacao) {

    formImportacao.addEventListener("submit", async e => {

        e.preventDefault();

        const arquivo =
            document.getElementById("arquivoExtrato").files[0];

        if (!arquivo) {

            alert("Selecione um arquivo.");
            return;
        }

        const resultado =
            document.getElementById("resultadoImportacao");

        resultado.innerHTML =
            "Lendo extrato...";

        try {

            const texto =
                await arquivo.text();

            const movimentacoes =
                lerOFX(texto);

            renderResultadoImportacao({

                totalEncontrado:
                    movimentacoes.length,

                totalReceitas:
                    movimentacoes.filter(
                        x => x.tipo === "Receita"
                    ).length,

                totalDespesas:
                    movimentacoes.filter(
                        x => x.tipo === "Despesa"
                    ).length,

                movimentacoes
            });

        }
        catch (err) {

            resultado.innerHTML = `
                <div style="color:red">
                    ${err.message}
                </div>
            `;
        }
    });
}

function confirmarImportacao(movimentacoes) {
    movimentacoes.forEach(x => {
        const item = {
            descricao: x.descricao,
            categoria: x.categoria,
            valor: Math.abs(Number(x.valor)),
            data: normalizarData(x.data)
        };

        if (x.tipo === "Despesa" || Number(x.valor) < 0) {
            despesas.push(item);
        } else {
            receitas.push(item);
        }
    });

    salvar();
    carregar();

    alert("Movimentações importadas com sucesso!");
}

function adicionarValorMeta(index) {
    const valor = Number(prompt("Quanto deseja adicionar à meta?"));

    if (!valor || valor <= 0) return;

    metas[index].atual = Number(metas[index].atual || 0) + valor;

    if (!metas[index].historico) metas[index].historico = [];

    metas[index].historico.push({
        data: new Date().toLocaleDateString("pt-BR"),
        valor
    });

    salvar();
    carregar();
}

function alternarCheckPlanejamento(planejamentoIndex, mesIndex) {
    planejamentos[planejamentoIndex].checks[mesIndex] =
        !planejamentos[planejamentoIndex].checks[mesIndex];

    salvar();
    carregar();
}

function removerPlanejamento(index) {
    planejamentos.splice(index, 1);
    salvar();
    carregar();
}

function removerInvestimento(index) {
    investimentos.splice(index, 1);
    salvar();
    carregar();
}

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

    if (!confirm("Tem certeza que deseja apagar todos os dados?"))
        return;

    localStorage.removeItem("receitas");
    localStorage.removeItem("despesas");
    localStorage.removeItem("dividas");
    localStorage.removeItem("metas");
    localStorage.removeItem("planejamentos");
    localStorage.removeItem("investimentos");

    receitas = [];
    despesas = [];
    dividas = [];
    metas = [];
    planejamentos = [];
    investimentos = [];

    if (typeof movimentacoesImportadas !== "undefined")
        movimentacoesImportadas = [];

    carregar();
}

function carregar() {
    atualizarDashboard();
    renderReceitas();
    renderDespesas();
    renderDividas();
    renderMetas();
    renderPlanejamentoFuturo();
    renderGraficos();
    renderReservaEmergencia();
    renderCalendarioFinanceiro();
    renderInvestimentos();
}

carregar();
