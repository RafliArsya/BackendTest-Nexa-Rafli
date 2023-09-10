import db from "../config/db.config.js";

const m_token = db.define('admin_token', {  
    id_admin: {
        type: "INT(24)",
        references: {
           model: 'admin', // 'fathers' refers to table name
           key: 'id', // 'id' refers to column name in fathers table
        }
    },
    token: {
        type: 'TEXT'
    },
    expired_at: {
        type: 'TIMESTAMP'
    }    
});

export default m_token