const db = require('../shared/database');
const whatsapp = require('../shared/whatsapp');
const flow = require('../shared/conversationFlow');

module.exports = async function (context, req) {
    context.log('Webhook chamado:', req.method);

    // Verificação do webhook (GET)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            context.log('✅ Webhook verificado com sucesso!');
            context.res = { status: 200, body: parseInt(challenge) };
        } else {
            context.res = { status: 403, body: 'Forbidden' };
        }
        return;
    }

    // Processar mensagens (POST)
    if (req.method === 'POST') {
        try {
            const body = req.body;

            if (!body.entry?.[0]?.changes) {
                context.res = { status: 200, body: 'OK' };
                return;
            }

            const changes = body.entry[0].changes;
            
            for (const change of changes) {
                if (change.value.messages) {
                    const message = change.value.messages[0];
                    const clientPhone = message.from;
                    
                    let messageText = '';
                    let buttonResponse = null;

                    switch (message.type) {
                        case 'text':
                            messageText = message.text.body;
                            break;
                        case 'interactive':
                            buttonResponse = message.interactive.button_reply.id;
                            messageText = message.interactive.button_reply.title;
                            break;
                        case 'button':
                            buttonResponse = message.button.payload;
                            messageText = message.button.text;
                            break;
                    }

                    // Log da mensagem recebida
                    await db.logMessage(clientPhone, 'received', messageText);

                    // Processar mensagem
                    await processMessage(context, clientPhone, messageText, buttonResponse);
                }
            }

            context.res = { status: 200, body: 'OK' };

        } catch (error) {
            context.log.error('❌ Erro:', error);
            context.res = { status: 500, body: 'Internal Server Error' };
        }
    }
};

async function processMessage(context, clientPhone, messageText, buttonResponse) {
    try {
        // 1. Buscar estado atual
        const clientState = await db.getClientState(clientPhone);
        const currentStage = clientState?.current_stage || 'new';

        context.log(`📱 ${clientPhone} | Stage: ${currentStage} | Msg: "${messageText}"`);

        // 2. Determinar resposta
        let response;

        switch (currentStage) {
            case 'new':
                response = await flow.handleNewClient(clientPhone);
                break;
            case 'awaiting_education_goals':
                response = await flow.handleEducationGoals(clientPhone, messageText, buttonResponse);
                break;
            case 'awaiting_consent':
                response = await flow.handleConsent(clientPhone, messageText, buttonResponse);
                break;
            case 'processing_open_finance':
                response = await flow.processOpenFinance(clientPhone);
                break;
            case 'generating_recommendations':
                response = await flow.generateRecommendations(clientPhone);
                break;
            default:
                response = {
                    text: "Desculpe, ocorreu um erro. Digite 'reiniciar' para começar novamente.",
                    nextStage: 'new'
                };
        }

        // 3. Enviar resposta
        await whatsapp.sendWhatsAppMessage(clientPhone, response);
        
        // Log da mensagem enviada
        await db.logMessage(clientPhone, 'sent', response.text);

        // 4. Atualizar estado
        if (response.nextStage) {
            await db.updateClientState(clientPhone, response.nextStage, response.contextData);
        }

    } catch (error) {
        context.log.error('❌ Erro ao processar:', error);
        await whatsapp.sendWhatsAppMessage(clientPhone, {
            text: "Desculpe, ocorreu um erro temporário. Por favor, tente novamente."
        });
    }
}