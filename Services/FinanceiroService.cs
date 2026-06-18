using FinanceiroInteligenteReal.DTOs;

namespace FinanceiroInteligenteReal.Services;

public class FinanceiroService : IFinanceiroService
{
    public DiagnosticoResponse GerarDiagnostico(DiagnosticoRequest request)
    {
        var totalReceitas = request.Receitas.Sum(x => x.Valor);
        var totalDespesas = request.Despesas.Sum(x => x.Valor);
        var totalDividas = request.Dividas.Sum(x => x.Valor);
        var saldo = totalReceitas - totalDespesas;

        var score = CalcularScore(totalReceitas, totalDespesas, totalDividas, request.Metas.Count);

        return new DiagnosticoResponse
        {
            TotalReceitas = totalReceitas,
            TotalDespesas = totalDespesas,
            TotalDividas = totalDividas,
            Saldo = saldo,
            Score = score,
            SaudeFinanceira = ObterSaudeFinanceira(score),
            NivelRisco = ObterNivelRisco(score),
            Recomendacao = GerarRecomendacao(totalReceitas, totalDespesas, totalDividas, saldo, score),
            ReservaEmergenciaIdeal = totalDespesas * 6,
            Necessidades50 = totalReceitas * 0.50m,
            Desejos30 = totalReceitas * 0.30m,
            Investimentos20 = totalReceitas * 0.20m
        };
    }

    public PlanejamentoResponse SimularPlanejamento(PlanejamentoRequest request)
    {
        if (request.PrazoMeses <= 0)
            throw new ArgumentException("O prazo precisa ser maior que zero.");

        var sobra = request.RendaMensal - request.GastosFixos - request.GastosVariaveis;
        var necessarioPorMes = request.ObjetivoFinanceiro / request.PrazoMeses;

        var prazoReal = sobra > 0
            ? (int)Math.Ceiling(request.ObjetivoFinanceiro / sobra)
            : 0;

        var viavel = sobra >= necessarioPorMes;

        return new PlanejamentoResponse
        {
            SobraMensal = sobra,
            ValorNecessarioPorMes = necessarioPorMes,
            PrazoRealEstimado = prazoReal,
            PlanoViavel = viavel,
            Mensagem = GerarMensagemPlanejamento(sobra, necessarioPorMes, prazoReal, viavel)
        };
    }

    private static int CalcularScore(decimal receitas, decimal despesas, decimal dividas, int quantidadeMetas)
    {
        if (receitas <= 0)
            return 0;

        var score = 100;
        var percentualGasto = despesas / receitas * 100;

        if (percentualGasto > 50)
            score -= (int)((percentualGasto - 50) * 0.9m);

        if (dividas > 0)
            score -= Math.Min((int)((dividas / receitas) * 15), 25);

        if (quantidadeMetas == 0)
            score -= 10;

        if (receitas - despesas <= 0)
            score -= 25;

        return Math.Clamp(score, 0, 100);
    }

    private static string ObterSaudeFinanceira(int score)
    {
        return score switch
        {
            >= 80 => "Excelente",
            >= 60 => "Boa",
            >= 40 => "Atenção",
            _ => "Crítica"
        };
    }

    private static string ObterNivelRisco(int score)
    {
        return score switch
        {
            >= 80 => "Baixo",
            >= 60 => "Moderado",
            >= 40 => "Alto",
            _ => "Muito alto"
        };
    }

    private static string GerarRecomendacao(decimal receitas, decimal despesas, decimal dividas, decimal saldo, int score)
    {
        if (receitas <= 0)
            return "Cadastre suas receitas para iniciar uma análise financeira real.";

        if (saldo <= 0)
            return "Seu saldo está negativo ou zerado. Priorize reduzir despesas fixas e variáveis antes de assumir novas metas.";

        if (dividas > 0 && score < 70)
            return "Você possui dívidas relevantes. O ideal é direcionar parte da sobra mensal para quitação antes de aumentar gastos.";

        if (score >= 80)
            return "Sua situação financeira está saudável. Considere criar uma reserva de emergência e investir parte da sobra mensal.";

        return "Seu cenário é controlável, mas exige atenção. Revise categorias de gasto e tente aumentar sua sobra mensal.";
    }

    private static string GerarMensagemPlanejamento(decimal sobra, decimal necessario, int prazoReal, bool viavel)
    {
        if (sobra <= 0)
            return "Seu orçamento não possui sobra mensal. Antes de assumir uma meta, reduza gastos ou aumente a renda.";

        if (viavel)
            return $"Plano viável. Você consegue cumprir o objetivo dentro do prazo informado. Prazo estimado real: {prazoReal} meses.";

        return $"Plano apertado. Sua sobra atual é menor que o necessário. No ritmo atual, o prazo real estimado será de {prazoReal} meses.";
    }
}