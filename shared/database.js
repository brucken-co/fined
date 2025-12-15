const sql = require('mssql');

const sqlConfig = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool = null;

async function getPool() {
    if (!pool) {
        pool = await sql.connect(sqlConfig);
    }
    return pool;
}

async function getClientState(phone) {
    const pool = await getPool();
    const result = await pool.request()
        .input('phone', sql.VarChar, phone)
        .query(`
            SELECT 
                phone_number,
                current_stage,
                education_goals,
                consent_given,
                consent_timestamp,
                context_data,
                last_interaction
            FROM ClientConversations
            WHERE phone_number = @phone
        `);
    
    return result.recordset[0];
}

async function updateClientState(phone, stage, contextData = null) {
    const pool = await getPool();
    await pool.request()
        .input('phone', sql.VarChar, phone)
        .input('stage', sql.VarChar, stage)
        .input('contextData', sql.NVarChar, contextData ? JSON.stringify(contextData) : null)
        .input('lastInteraction', sql.DateTime, new Date())
        .query(`
            MERGE ClientConversations AS target
            USING (SELECT @phone AS phone_number) AS source
            ON target.phone_number = source.phone_number
            WHEN MATCHED THEN
                UPDATE SET 
                    current_stage = @stage,
                    context_data = COALESCE(@contextData, context_data),
                    last_interaction = @lastInteraction
            WHEN NOT MATCHED THEN
                INSERT (phone_number, current_stage, context_data, last_interaction)
                VALUES (@phone, @stage, @contextData, @lastInteraction);
        `);
}

async function saveEducationGoals(phone, goals) {
    const pool = await getPool();
    await pool.request()
        .input('phone', sql.VarChar, phone)
        .input('goals', sql.NVarChar, goals)
        .query(`
            UPDATE ClientConversations 
            SET education_goals = @goals
            WHERE phone_number = @phone
        `);
}

async function saveConsent(phone, consentGiven) {
    const pool = await getPool();
    await pool.request()
        .input('phone', sql.VarChar, phone)
        .input('consent', sql.Bit, consentGiven)
        .input('timestamp', sql.DateTime, new Date())
        .query(`
            UPDATE ClientConversations 
            SET 
                consent_given = @consent,
                consent_timestamp = @timestamp
            WHERE phone_number = @phone
        `);
}

async function logMessage(phone, messageType, content) {
    const pool = await getPool();
    await pool.request()
        .input('phone', sql.VarChar, phone)
        .input('type', sql.VarChar, messageType)
        .input('content', sql.NVarChar, content)
        .query(`
            INSERT INTO MessageLog (phone_number, message_type, message_content)
            VALUES (@phone, @type, @content)
        `);
}

module.exports = {
    getClientState,
    updateClientState,
    saveEducationGoals,
    saveConsent,
    logMessage
};