using FinanceiroInteligenteReal.Models;

namespace FinanceiroInteligenteReal.DTOs;

public class ImportacaoResponse
{
    public int TotalEncontrado { get; set; }

    public int TotalReceitas { get; set; }

    public int TotalDespesas { get; set; }

    public List<MovimentacaoImportada> Movimentacoes { get; set; } = new();
}