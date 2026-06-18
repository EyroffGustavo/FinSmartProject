namespace FinanceiroInteligenteReal.DTOs;

public class PlanejamentoRequest
{
    public decimal RendaMensal { get; set; }
    public decimal GastosFixos { get; set; }
    public decimal GastosVariaveis { get; set; }
    public decimal ObjetivoFinanceiro { get; set; }
    public int PrazoMeses { get; set; }
}