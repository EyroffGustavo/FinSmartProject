namespace FinanceiroInteligenteReal.DTOs;

public class PlanejamentoResponse
{
    public decimal SobraMensal { get; set; }
    public decimal ValorNecessarioPorMes { get; set; }
    public int PrazoRealEstimado { get; set; }
    public bool PlanoViavel { get; set; }
    public string Mensagem { get; set; } = string.Empty;
}