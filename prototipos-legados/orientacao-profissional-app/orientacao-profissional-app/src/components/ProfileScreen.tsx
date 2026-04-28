import { FormEvent, useState } from 'react';
import type { UserProfile } from '../types/test';

interface ProfileScreenProps {
  initialProfile: UserProfile;
  onSubmit: (profile: UserProfile) => void;
}

const momentOptions = [
  { value: 'escolhendoFaculdade', label: 'Estou escolhendo faculdade ou curso' },
  { value: 'migracaoCarreira', label: 'Quero migrar de carreira' },
  { value: 'insatisfacaoProfissional', label: 'Estou em dúvida sobre minha profissão atual' },
  { value: 'autoconhecimento', label: 'Busco autoconhecimento profissional' },
  { value: 'outro', label: 'Outro momento' }
] as const;

export function ProfileScreen({ initialProfile, onSubmit }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(profile);
  }

  return (
    <main className="center-layout">
      <form className="form-card glass-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Antes de começar</span>
        <h1>Personalize o relatório</h1>
        <p>Essas informações não alteram o cálculo, apenas ajudam a deixar a leitura final mais contextualizada.</p>

        <label className="field">
          <span>Nome</span>
          <input
            type="text"
            value={profile.name}
            placeholder="Ex: Ana, João, Maria..."
            onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>

        <label className="field">
          <span>Momento atual</span>
          <select
            value={profile.moment}
            onChange={(event) => setProfile((prev) => ({ ...prev, moment: event.target.value as UserProfile['moment'] }))}
          >
            {momentOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>O que você espera descobrir?</span>
          <textarea
            value={profile.goal}
            placeholder="Ex: Quero entender quais áreas combinam comigo antes de escolher um curso."
            onChange={(event) => setProfile((prev) => ({ ...prev, goal: event.target.value }))}
            rows={4}
          />
        </label>

        <button className="primary-btn" type="submit">Começar perguntas</button>
      </form>
    </main>
  );
}
