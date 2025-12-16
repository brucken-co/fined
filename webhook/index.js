module.exports = async function (context, req) {
    context.log('🔥 Webhook chamado!', req.method);

    // Teste GET
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        context.log('Dados recebidos:', { mode, token, challenge });
        context.log('Token esperado:', process.env.VERIFY_TOKEN);

        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
            context.log('✅ Token correto!');
            context.res = {
                status: 200,
                body: parseInt(challenge)
            };
        } else {
            context.log('❌ Token incorreto!');
            context.res = {
                status: 403,
                body: 'Forbidden - Token mismatch'
            };
        }
        return;
    }

    // Teste POST
    if (req.method === 'POST') {
        context.log('📨 POST recebido:', JSON.stringify(req.body));
        context.res = { 
            status: 200, 
            body: 'OK - Recebido' 
        };
        return;
    }

    context.res = {
        status: 405,
        body: 'Method not allowed'
    };
};