namespace FinanceiroInteligenteReal.DTOs;

public class DiagnosticoResponse
{
    public decimal TotalReceitas { get; set; }
    public decimal TotalDespesas { get; set; }
    public decimal TotalDividas { get; set; }
    public decimal Saldo { get; set; }

    public int Score { get; set; }
    public string SaudeFinanceira { get; set; } = string.Empty;
    public string NivelRisco { get; set; } = string.Empty;
    public string Recomendacao { get; set; } = string.Empty;

    public decimal ReservaEmergenciaIdeal { get; set; }
    public decimal Necessidades50 { get; set; }
    public decimal Desejos30 { get; set; }
    public decimal Investimentos20 { get; set; }
}