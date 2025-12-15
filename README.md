# Fined - Assistente de Educação Financeira

Assistente automatizado via WhatsApp para educação financeira com integração Open Finance.

## 🚀 Funcionalidades

- ✅ Captura de objetivos financeiros do cliente
- ✅ Coleta de consentimento Open Finance (LGPD compliant)
- ✅ Recomendações personalizadas baseadas em dados
- ✅ Fluxo conversacional inteligente com máquina de estados

## 🛠️ Stack Tecnológica

- **Backend**: Azure Functions (Node.js 18)
- **Banco de Dados**: Azure SQL Database
- **Mensageria**: WhatsApp Business API
- **CI/CD**: GitHub Actions
- **Cloud**: Microsoft Azure

## 📁 Estrutura do Projeto
```
fined/
├── webhook/           # Azure Function (webhook endpoint)
├── shared/            # Módulos compartilhados
│   ├── database.js    # Operações de banco de dados
│   ├── whatsapp.js    # Client WhatsApp API
│   ├── conversationFlow.js  # Lógica de conversação
│   └── openFinance.js # Integração Open Finance (futuro)
└── .github/workflows/ # CI/CD automatizado
```

## 🔧 Configuração

### Variáveis de Ambiente (Azure Function App)
```
WHATSAPP_TOKEN=seu_token_aqui
PHONE_NUMBER_ID=seu_phone_id
VERIFY_TOKEN=fined_webhook_secret_2024
SQL_USER=adminuser
SQL_PASSWORD=sua_senha
SQL_SERVER=fined-sql-server.database.windows.net
SQL_DATABASE=fined-db
```

### Deploy

Push para `main` dispara deploy automático via GitHub Actions.
```bash
git add .
git commit -m "Deploy"
git push origin main
```

## 📊 Banco de Dados

Tabelas necessárias:
- `ClientConversations` - Estado das conversas
- `MessageLog` - Auditoria de mensagens

## 🔗 Webhook URL
```
https://fined-webhook-app.azurewebsites.net/api/webhook
```

## 📝 Licença

Proprietary - Uso interno