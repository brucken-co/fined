# Fined — Fluxo Completo de Estados

## Diagrama de Estados

```
                        ┌─────────────────────────────┐
                        │  Usuário envia mensagem      │
                        └──────────────┬──────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │          new             │
                          │  Boas-vindas + objetivos  │
                          └────────────┬────────────┘
                                       │
                   ┌───────────────────▼─────────────────────┐
                   │        awaiting_education_goals          │
                   │  Aguarda escolha: Poupar/Investir/Dívidas│
                   └───────────────────┬─────────────────────┘
                                       │
                   ┌───────────────────▼─────────────────────┐
                   │           awaiting_consent               │
                   │  Aguarda autorização Open Finance         │
                   └──────────┬────────────────┬─────────────┘
                     Sim      │                │ Não
                              │                │
          ┌───────────────────▼──┐    ┌────────▼──────────────┐
          │  processing_open_    │    │      completed         │
          │  finance (auto)      │    │  Dicas gerais + fim    │
          └───────────────────┬──┘    └───────────────────────┘
                              │ (auto-chain)
          ┌───────────────────▼──────────────────┐
          │      generating_recommendations       │
          │      (auto-chain, salva no banco)     │
          └───────────────────┬──────────────────┘
                              │ (auto-chain)
                   ┌──────────▼──────────┐
                   │      completed      │◄──────────────────────┐
                   │   Recomendações     │                        │
                   │   exibidas          │                        │
                   └──────────┬──────────┘                       │
                              │ (nova mensagem)                   │
          ┌───────────────────▼──────────────────┐               │
          │    awaiting_return_confirmation       │               │
          │  "Objetivo ainda é o mesmo?"          │               │
          └──────────┬────────────────┬───────────┘               │
           Sim       │                │ Quero mudar                │
                     │                │                            │
     ┌───────────────▼──┐   ┌─────────▼──────────────────┐       │
     │ awaiting_         │   │   awaiting_education_goals  │       │
     │ recommendation_   │   │   (reinicia fluxo)          │       │
     │ type              │   └─────────────────────────────┘       │
     └───┬───────────┬───┘                                         │
         │           │                                             │
  Ver    │           │ Gerar                                       │
  anteriores         │ novas                                       │
         │           │                                             │
┌────────▼──┐  ┌─────▼──────────────────────────────┐            │
│ Exibe     │  │        awaiting_consent              │            │
│ last_recs │  │  (pede autorização novamente)        │            │
└────────┬──┘  └─────────────────────────────────────┘            │
         │                                                         │
         └─────────────────────────────────────────────────────────┘
```

---

## Tabela de Estados

| Stage | Trigger | Ação do Bot | Próximo Stage |
|-------|---------|-------------|---------------|
| `new` | Primeira mensagem | Boas-vindas + botões de objetivo | `awaiting_education_goals` |
| `awaiting_education_goals` | Escolha de objetivo | Salva objetivo + pede consentimento | `awaiting_consent` |
| `awaiting_consent` | Sim | Avisa que está processando | `processing_open_finance` (auto) |
| `awaiting_consent` | Não | Dicas gerais | `completed` |
| `processing_open_finance` | **auto-chain** | Processa dados Open Finance | `generating_recommendations` (auto) |
| `generating_recommendations` | **auto-chain** | Gera e salva recomendações | `completed` |
| `completed` | Nova mensagem | Pergunta se objetivo continua | `awaiting_return_confirmation` |
| `awaiting_return_confirmation` | Sim, continua | Pergunta: ver antigas ou novas | `awaiting_recommendation_type` |
| `awaiting_return_confirmation` | Quero mudar | Botões de objetivo | `awaiting_education_goals` |
| `awaiting_recommendation_type` | Ver anteriores | Exibe `last_recommendations` | `completed` |
| `awaiting_recommendation_type` | Gerar novas | Pede consentimento novamente | `awaiting_consent` |

---

## Notas de Evolução

### Pendente / Futuro
- **Open Finance real**: substituir mock em `processOpenFinance()` por integração com Pluggy, Belvo ou API do Banco Central
- **Recomendações por IA**: substituir regras fixas em `generateRecommendations()` por chamada ao Claude API
- **Múltiplos objetivos**: permitir seleção de mais de um objetivo simultaneamente
- **Notificações proativas**: enviar alertas periódicos sem o usuário iniciar conversa
- **Reset manual**: comando "reiniciar" a qualquer momento redefine stage para `new`
- **Histórico de conversas**: salvar histórico completo para análise e personalização futura
