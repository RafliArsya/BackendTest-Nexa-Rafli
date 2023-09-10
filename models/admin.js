import db from "../config/db.config.js";

const m_admin = db.define('admin', {
    username: {
        type: 'VARCHAR(100)'
    },
    password: {
        type: 'VARBINARY(100)'
    }
    
})

export default m_admin