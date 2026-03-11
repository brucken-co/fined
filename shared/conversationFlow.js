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

async function handleReturnUser(phone) {
    const clientState = await db.getClientState(phone);
    const goals = clientState.education_goals || '';
    const goalLabel = formatGoalLabel(goals);

    return {
        text: `Olá de novo! 👋 Na última vez você queria *${goalLabel}*.\n\nEsse objetivo ainda é o mesmo?`,
        buttons: [
            { id: "return_same", title: "✅ Sim, continua" },
            { id: "return_change", title: "🔄 Quero mudar" }
        ],
        nextStage: 'awaiting_return_confirmation'
    };
}

async function handleReturnConfirmation(phone, buttonResponse) {
    if (buttonResponse === 'return_change') {
        return {
            text: "Tudo bem! Vamos recomeçar. 🔄\n\nQuais são seus novos objetivos financeiros?",
            buttons: [
                { id: "goal_save", title: "💰 Poupar" },
                { id: "goal_invest", title: "📈 Investir" },
                { id: "goal_debt", title: "💳 Sair de dívidas" }
            ],
            nextStage: 'awaiting_education_goals'
        };
    } else {
        return {
            text: "Ótimo! O que você gostaria?",
            buttons: [
                { id: "rec_previous", title: "📋 Ver anteriores" },
                { id: "rec_new", title: "🔄 Gerar novas" }
            ],
            nextStage: 'awaiting_recommendation_type'
        };
    }
}

async function handleRecommendationType(phone, buttonResponse) {
    if (buttonResponse === 'rec_previous') {
        const clientState = await db.getClientState(phone);
        const recommendations = clientState.last_recommendations ||
            "Não encontrei recomendações anteriores. Por favor, gere novas recomendações.";
        return {
            text: recommendations,
            nextStage: 'completed'
        };
    } else {
        return {
            text: "Vou processar seus dados novamente.\n\nVocê autoriza a consulta via Open Finance?",
            buttons: [
                { id: "consent_yes", title: "✅ Sim, autorizo" },
                { id: "consent_no", title: "❌ Não autorizo" }
            ],
            nextStage: 'awaiting_consent'
        };
    }
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
            nextStage: 'processing_open_finance',
            autoChain: true
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
    // TODO: Integrar com API de Open Finance real
    return {
        text: "Dados processados! 📊\n\nAgora vou gerar suas recomendações personalizadas...",
        nextStage: 'generating_recommendations',
        autoChain: true
    };
}

async function generateRecommendations(phone) {
    const clientState = await db.getClientState(phone);
    const goals = clientState.education_goals || '';

    let recommendations = "📋 *Suas Recomendações Personalizadas*\n\n";

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

    recommendations += "---\n\nPosso te ajudar com mais alguma coisa? 😊";

    await db.saveRecommendations(phone, recommendations);

    return {
        text: recommendations,
        nextStage: 'completed'
    };
}

function formatGoalLabel(goals) {
    if (goals.includes('save') || goals.includes('Poupar')) return 'Poupar';
    if (goals.includes('invest') || goals.includes('Investir')) return 'Investir';
    if (goals.includes('debt') || goals.includes('dívidas')) return 'Sair de dívidas';
    return goals || 'melhorar sua saúde financeira';
}

module.exports = {
    handleNewClient,
    handleReturnUser,
    handleReturnConfirmation,
    handleRecommendationType,
    handleEducationGoals,
    handleConsent,
    processOpenFinance,
    generateRecommendations
};
