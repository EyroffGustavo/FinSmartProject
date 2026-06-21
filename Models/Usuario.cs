using System.ComponentModel.DataAnnotations;

namespace FinanceiroInteligenteReal.Models;

public class Usuario
{
    public int Id { get; set; }


[Required]
    public string Nome { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string SenhaHash { get; set; } = string.Empty;

    [Required]
    public bool EmailConfirmado { get; set; } = false;

    public DateTime DataCadastro { get; set; } = DateTime.Now;

    [StringLength(10)]
    public string? CodigoConfirmacao { get; set; }

    public DateTime? ExpiracaoCodigo { get; set; }


}
