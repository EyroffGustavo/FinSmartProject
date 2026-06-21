namespace FinanceiroInteligenteReal.Models;

public class Despesa
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }

    public string Descricao { get; set; } = "";
    public string Categoria { get; set; } = "";
    public decimal Valor { get; set; }
    public DateTime Data { get; set; }

    public Usuario? Usuario { get; set; }
}