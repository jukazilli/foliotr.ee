import type { PersistedState } from '../types/test';

const STORAGE_KEY = 'orientacao-profissional:v1';

export function loadState(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch (error) {
    console.warn('Não foi possível carregar o teste salvo.', error);
    return null;
  }
}

export function saveState(state: PersistedState): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...state,
        updatedAt: new Date().toISOString()
      })
    );
  } catch (error) {
    console.warn('Não foi possível salvar o progresso local.', error);
  }
}

export function clearState(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

// Futuro backend:
// - POST /test-sessions para criar sessão
// - PATCH /test-sessions/:id para salvar respostas parciais
// - POST /test-sessions/:id/finish para enviar respostas e receber resultado calculado
