using System.Security.Claims;

namespace FinanceiroInteligenteReal.Helpers;

public static class UserHelper
{
    public static int GetUsuarioId(ClaimsPrincipal user)
    {
        return int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
    }
}