namespace FinanceiroInteligenteReal.Models;

public class Divida
{
    public string Nome { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public int PrazoMeses { get; set; }
}