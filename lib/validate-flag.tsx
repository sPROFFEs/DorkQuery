// Función para validar flags en los desafíos CTF
export function validateFlag(challengeId: string, flag: string): boolean {
  // Mapa de flags para cada desafío
  const flags: Record<string, string> = {
    desafio1: "CTF{xss_alert_executed}",
    desafio2: "CTF{input_validation_bypassed}",
    desafio3: "CTF{sql_injection_master}",
    desafio4: "CTF{auth_bypass_complete}",
  }

  // Verificar si el desafío existe y si la flag es correcta
  return flags[challengeId] && flags[challengeId] === flag
}
