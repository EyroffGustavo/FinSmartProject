namespace FinanceiroInteligenteReal.Models;

public class MovimentacaoImportada
{
    public DateTime Data { get; set; }

    public string Descricao { get; set; } = string.Empty;

    public decimal Valor { get; set; }

    public string Tipo { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public string Origem { get; set; } = string.Empty;
}