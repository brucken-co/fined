const axios = require('axios');

async function sendWhatsAppMessage(to, messageContent) {
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
    
    const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
    
    let data = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: to
    };

    if (messageContent.buttons && messageContent.buttons.length > 0) {
        data.type = "interactive";
        data.interactive = {
            type: "button",
            body: { text: messageContent.text },
            action: {
                buttons: messageContent.buttons.slice(0, 3).map(btn => ({
                    type: "reply",
                    reply: {
                        id: btn.id,
                        title: btn.title.substring(0, 20)
                    }
                }))
            }
        };
    } else {
        data.type = "text";
        data.text = {
            preview_url: false,
            body: messageContent.text
        };
    }

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data;
        
    } catch (error) {
        console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    sendWhatsAppMessage
};