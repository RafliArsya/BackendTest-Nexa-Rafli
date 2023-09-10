import { Sequelize } from "sequelize";
import db from "../config/db.config.js";

const m_user = db.define('karyawan', {
    nip: {
        type: 'VARCHAR(50)',
        primaryKey: true
    },
    nama: {
        type: 'VARCHAR(200)'
    },
    alamat: {
        type: 'VARCHAR(200)'
    },
    gend: {
        type: Sequelize.ENUM('L', 'P')
    },
    photo: {
        type: 'TEXT'
    },
    tgl_lahir: {
        type: 'DATE'
    },
    status: {
        type: 'INT(1)'
    },
    insert_at: {
        type: 'TIMESTAMP'
    },
    insert_by: {
        type: 'VARCHAR(50)'
    },
    update_at: {
        type: 'TIMESTAMP'
    },
    update_by: {
        type: 'VARCHAR(50)'
    },

})

export default m_user