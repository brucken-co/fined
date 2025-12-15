const db = require('./database');

async function handleNewClient(phone) {
    return {
        text: "Olá! 👋 Bem-vindo ao *Fined* - seu assistente de educação financeira.\n\n" +
              "Vou te ajudar a melhorar sua saúde financeira.\n\n" +
              "Para começar, quais são seus principais objetivos?",
        buttons: [
            { id: "goal_save", title: "💰 Poupar" },
            { id: "goal_invest", title: "📈 Investir" },
            { id: "goal_debt", title: "💳 Sair de dívidas" }
        ],
        nextStage: 'awaiting_education_goals'
    };
}

async function handleEducationGoals(phone, messageText, buttonResponse) {
    const goals = buttonResponse || messageText;
    await db.saveEducationGoals(phone, goals);

    return {
        text: "Perfeito! ✅\n\n" +
              "Para criar recomendações personalizadas, preciso consultar seus dados financeiros via Open Finance.\n\n" +
              "📋 *O que é Open Finance?*\n" +
              "É um sistema seguro que permite compartilhar seus dados bancários de forma autorizada pelo Banco Central.\n\n" +
              "Você autoriza a consulta?",
        buttons: [
            { id: "consent_yes", title: "✅ Sim, autorizo" },
            { id: "consent_no", title: "❌ Não autorizo" }
        ],
        nextStage: 'awaiting_consent'
    };
}

async function handleConsent(phone, messageText, buttonResponse) {
    const consentGiven = buttonResponse === 'consent_yes' || 
                        messageText.toLowerCase().includes('sim') ||
                        messageText.toLowerCase().includes('autorizo');

    await db.saveConsent(phone, consentGiven);

    if (consentGiven) {
        return {
            text: "Excelente! ✅\n\n" +
                  "Estou processando seus dados via Open Finance...\n\n" +
                  "⏳ Isso pode levar alguns segundos.",
            nextStage: 'processing_open_finance'
        };
    } else {
        return {
            text: "Sem problemas! 👍\n\n" +
                  "Posso te ajudar com dicas gerais de educação financeira.\n\n" +
                  "O que você gostaria de saber?",
            nextStage: 'completed'
        };
    }
}

async function processOpenFinance(phone) {
    // TODO: Integrar com sua API de Open Finance
    // Similar ao que você já fez com BigData Corp
    
    return {
        text: "Dados processados! 📊\n\n" +
              "Agora vou gerar suas recomendações personalizadas...",
        nextStage: 'generating_recommendations'
    };
}

async function generateRecommendations(phone) {
    const clientState = await db.getClientState(phone);
    
    // AQUI VAI SUA LÓGICA DE NEGÓCIO
    // Você pode integrar com suas análises de crédito existentes
    
    let recommendations = "📋 *Suas Recomendações Personalizadas*\n\n";
    
    const goals = clientState.education_goals || '';
    
    if (goals.includes('save') || goals.includes('Poupar')) {
        recommendations += "💰 *Poupança:*\n";
        recommendations += "• Reserve 10-15% da renda mensal\n";
        recommendations += "• Crie reserva de 6 meses de despesas\n";
        recommendations += "• Use CDB com liquidez diária\n\n";
    }
    
    if (goals.includes('invest') || goals.includes('Investir')) {
        recommendations += "📈 *Investimentos:*\n";
        recommendations += "• Comece com Tesouro Selic\n";
        recommendations += "• Diversifique em renda fixa e variável\n";
        recommendations += "• Aporte mensalmente\n\n";
    }
    
    if (goals.includes('debt') || goals.includes('dívidas')) {
        recommendations += "💳 *Gestão de Dívidas:*\n";
        recommendations += "• Priorize cartão de crédito e cheque especial\n";
        recommendations += "• Negocie taxas menores\n";
        recommendations += "• Considere portabilidade de crédito\n\n";
    }
    
    recommendations += "---\n\n";
    recommendations += "Posso te ajudar com mais alguma coisa? 😊";

    return {
        text: recommendations,
        nextStage: 'completed'
    };
}

module.exports = {
    handleNewClient,
    handleEducationGoals,
    handleConsent,
    processOpenFinance,
    generateRecommendations
};