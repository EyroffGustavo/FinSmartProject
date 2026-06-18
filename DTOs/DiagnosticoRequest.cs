using FinanceiroInteligenteReal.Models;

namespace FinanceiroInteligenteReal.DTOs;

public class DiagnosticoRequest
{
    public List<Receita> Receitas { get; set; } = new();
    public List<Despesa> Despesas { get; set; } = new();
    public List<Divida> Dividas { get; set; } = new();
    public List<MetaFinanceira> Metas { get; set; } = new();
}