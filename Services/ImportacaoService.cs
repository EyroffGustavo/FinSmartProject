using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using FinanceiroInteligenteReal.DTOs;
using FinanceiroInteligenteReal.Models;

namespace FinanceiroInteligenteReal.Services;

public class ImportacaoService : IImportacaoService
{
    public async Task<ImportacaoResponse> ImportarAsync(IFormFile arquivo)
    {
        var extensao = Path.GetExtension(arquivo.FileName).ToLower();

        List<MovimentacaoImportada> movimentacoes = extensao switch
        {
            ".ofx" => await LerOfxAsync(arquivo),
            _ => throw new Exception("Formato não suportado.")
        };

        foreach (var item in movimentacoes)
            Classificar(item);

        return new ImportacaoResponse
        {
            TotalEncontrado = movimentacoes.Count,
            TotalReceitas = movimentacoes.Count(x => x.Tipo == "Receita"),
            TotalDespesas = movimentacoes.Count(x => x.Tipo == "Despesa"),
            Movimentacoes = movimentacoes
        };
    }

    private static async Task<List<MovimentacaoImportada>> LerOfxAsync(IFormFile arquivo)
    {
        using var reader = new StreamReader(arquivo.OpenReadStream(), Encoding.UTF8);

        var conteudo = await reader.ReadToEndAsync();

        var transacoes = Regex.Matches(
            conteudo,
            @"<STMTTRN>(.*?)</STMTTRN>",
            RegexOptions.Singleline);

        var lista = new List<MovimentacaoImportada>();

        foreach (Match transacao in transacoes)
        {
            var bloco = transacao.Groups[1].Value;

            var dataTexto = ExtrairTag(bloco, "DTPOSTED");
            var valorTexto = ExtrairTag(bloco, "TRNAMT");
            var tipoTransacao = ExtrairTag(bloco, "TRNTYPE");
            var descricao = ExtrairTag(bloco, "MEMO");

            if (string.IsNullOrWhiteSpace(descricao))
                descricao = ExtrairTag(bloco, "NAME");

            if (!decimal.TryParse(
                    valorTexto.Replace(",", "."),
                    NumberStyles.Any,
                    CultureInfo.InvariantCulture,
                    out var valor))
                continue;

            descricao ??= "";

            var desc = descricao.ToUpper();

            bool despesa =
                tipoTransacao.Equals("DEBIT", StringComparison.OrdinalIgnoreCase)
                || desc.Contains("DEBITO PIX")
                || desc.Contains("COMPRA")
                || desc.Contains("PAGAMENTO")
                || desc.Contains("PIX ENV")
                || desc.Contains("SAQUE")
                || desc.Contains("TED ENVIADA")
                || desc.Contains("TRANSFERENCIA ENVIADA");

            valor = despesa
                ? -Math.Abs(valor)
                : Math.Abs(valor);

            var data = DateTime.Today;

            if (!string.IsNullOrWhiteSpace(dataTexto) && dataTexto.Length >= 8)
            {
                DateTime.TryParseExact(
                    dataTexto[..8],
                    "yyyyMMdd",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out data);
            }

            lista.Add(new MovimentacaoImportada
            {
                Data = data,
                Descricao = descricao,
                Valor = valor,
                Tipo = despesa ? "Despesa" : "Receita",
                Origem = "OFX"
            });
        }

        return lista;
    }

    private static string ExtrairTag(string texto, string tag)
    {
        var match = Regex.Match(
            texto,
            $@"<{tag}>([^<\r\n]+)",
            RegexOptions.IgnoreCase);

        return match.Success
            ? match.Groups[1].Value.Trim()
            : string.Empty;
    }

    private static void Classificar(MovimentacaoImportada item)
    {
        var desc = item.Descricao.ToUpper();

        item.Categoria =

            // ALIMENTAÇÃO
            Contem(desc,
                "IFOOD", "BURGER KING", "MCDONALD",
                "SUBWAY", "PIZZA", "KALZONE",
                "RESTAURANTE", "LANCH", "REFEICOES",
                "FOOD", "HABIBS", "GIRAFFAS")
            ? "Alimentação"

            // MERCADO
            : Contem(desc,
                "MERCADO", "SUPERMERCADO",
                "GIASSI", "ASSAI", "ATACADAO",
                "CARREFOUR", "FORT", "ANGELONI",
                "KOCH", "BISTEK")
            ? "Mercado"

            // COMBUSTÍVEL
            : Contem(desc,
                "POSTO", "IPIRANGA", "SHELL",
                "COMBUSTIVEL", "PETROBRAS",
                "ALE", "RAIZEN")
            ? "Combustível"

            // TRANSPORTE
            : Contem(desc,
                "UBER", "99", "TAXI",
                "PASSAGEM", "ONIBUS")
            ? "Transporte"

            // SAÚDE
            : Contem(desc,
                "FARMACIA", "DROGARIA",
                "DROGA", "UNIMED",
                "HOSPITAL", "LABORATORIO")
            ? "Saúde"

            // ASSINATURAS
            : Contem(desc,
                "NETFLIX", "SPOTIFY",
                "DISNEY", "PRIME VIDEO",
                "AMAZON PRIME", "YOUTUBE",
                "MAX", "HBO")
            ? "Assinaturas"

            // TELEFONIA
            : Contem(desc,
                "VIVO", "CLARO",
                "TIM", "OI",
                "TELEFONICA")
            ? "Telefonia"

            // RECEITAS
            : item.Valor > 0
            ? "Receita"

            // DESPESAS
            : "Despesa não classificada";
    }

    private static bool Contem(string texto, params string[] termos)
    {
        return termos.Any(texto.Contains);
    }
}