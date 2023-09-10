import m_admin from "../models/admin.js";
import m_token from "../models/token.js";
import m_user from "../models/user.js";
import myaes from "../my_modules/aes/myaes.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import { Sequelize } from "sequelize";

const Op = Sequelize.Op;

function containsSpecialChars(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
}

//const toTimestamp = (strDate) => {
//    const dt = moment(strDate).unix();
//    return dt;
//};

//TODO: Create tokenexpired check rather than write it every controller?

export const Signin = async(req, res) => {
    try {   
        var Now = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');
        const admin = await m_admin.findAll({            
            where:{
                username: req.body.username
            }
        });
        const colfirstadmin = admin[0].dataValues;
        const pwbuff = myaes.encrypt(req.body.password, process.env.AES_KEY, "hex");
        const pwbstr = pwbuff.toString();
        const found = pwbstr === colfirstadmin.password.toString("hex");      
        if (!found) {
            return res.status(400).json({msg:"Password Salah"});   
        };
        const id = colfirstadmin.id;
        //console.log(id);
        const uname = colfirstadmin.username;
        const passwd = colfirstadmin.password.toString("hex");
        const tkuser = await m_token.findAll({
            where: {
                id_admin: id
            },
            order: [
                ['id', 'DESC'],
            ],
        });
        if(tkuser.length>0){
            //const tk_exp = toTimestamp(tkuser[0].dataValues.expired_at);
            //const iNow = toTimestamp(Now);
            //toTimestamp more like to unix time i forgot to rename
            //Anyway I use the Date function while we can use moment to unix I don't know which
            //one is better one
            const iexp=new Date(tkuser[0].dataValues.expired_at).getTime();
            const iNow=new Date(Now).getTime();
            if(iexp > iNow){
                return res.json({msg: `Token login sudah ada ${tkuser[0].dataValues.token}`});
            }
        }
       
        const actoken = jwt.sign({uname, passwd}, process.env.JWT_AC_KEY, {expiresIn: "1d"});
        var date = moment().add(1, 'days').tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');
        
        try {
            await m_token.create({
                id_admin: id,
                token: actoken,
                expired_at: date,
            });
            res.json({msg: `Token login ${actoken}`});
        } catch (error) {
            res.send(error);
        }       
    }catch (error) {
        res.status(404).json({msg:"Terjadi kendala dalam operasi!"});
    }
}

export const Uread = async(req, res) => {    
    try {         
        var Now = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');
        const token = req.headers['x-access-token'];     
        
        const tkuser = await m_token.findAll({
            where: {
                token: token
            }
        });

        const tkusrdt = tkuser[0].dataValues
        var exp = tkusrdt.expired_at;

        const iexp=new Date(exp).getTime();
        const iNow=new Date(Now).getTime();

        if (iexp<iNow){
            return res.status(401).json({msg:"Token tidak valid!"});
        }

        const start = req.body.start
        const count = req.body.count 
        const keyword = req.body.keyword
        
        if(containsSpecialChars(keyword)) {
            //console.log("Contain symbols!!")
            return res.status(400).json({msg:"Data mengandung simbol!"})
        }

        var bodyrequest = {
            offset: start,
            limit: count,
        };

        if (keyword){
            bodyrequest['where'] = {
                nama: { [Op.substring]: keyword },
            }
        };
        //console.log(bodyrequest);

        const empl = await m_user.findAll(bodyrequest);
        
        if (empl.length==0) {
            return res.json("Data Tidak ada!");   
        }
        res.json(empl);
    } catch (error) {
        res.status(500).json(error);
    }
}

export const Ucreate = async(req, res) => {
    try { 
        var Now = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');
        const token = req.headers['x-access-token'];     
        
        const tkuser = await m_token.findAll({
            where: {
                token: token
            }
        });

        const tkusrdt = tkuser[0].dataValues
        var id = tkusrdt.id_admin;
        var exp = tkusrdt.expired_at;

        const iexp=new Date(exp).getTime();
        const iNow=new Date(Now).getTime();

        if (iexp<iNow){
            return res.status(401).json({msg:"Token tidak valid!"});
        }
        
        const aduser = await m_admin.findAll({
            where: {
                id: id
            }
        });
        const adusrdt = aduser[0].dataValues;
        const uname = adusrdt.username;

        if (!req.body.nama || !req.body.nip){
            return res.status(400).json({msg:"Ada data kosong atau salah!"});
        }

        if (typeof(req.body.nip) != "number"){
            return res.status(400).json({msg:"Data NIP salah!"});
        }

        if (req.body.nip.length > 8 ||req.body.nip.length < 8){
            return res.status(400).json({msg:"Data NIP kosong atau salah!"});
        }
        
        var rnip = req.body.nip || null;
        if (rnip){
            const nipyr = rnip.toString().slice(0,3);
            const Ynow = parseInt(moment().year());
            const nipyri = parseInt(nipyr, 10);

            if(nipyri>Ynow){
                //console.log("Time traveller???");don't mind! its 1 in the morning!
                return res.status(400).json({msg:"Data NIP salah!"});
            }
        }
        
        const nip_check = await m_user.findAll({
            where:{
                nip: rnip
            } 
        });
        if (nip_check.length>0) {
            return res.json("NIP Sudah ada!");   
        }
        
        if( containsSpecialChars(req.body.nama)){
            //console.log("Hayo input apa");
            return res.status(400).json({msg:"Data mengandung simbol!"});
        }
       
        if (req.body.alamat && containsSpecialChars(req.body.alamat)){
            return res.status(400).json({msg:"Data mengandung simbol!"});
        }
        
        const genderchk = req.body.gender?req.body.gender.toUpperCase():null;
        if (genderchk && genderchk != "L" && genderchk != "P"){
            //console.log("Hayo input apa"); don't mind me coding at 2am
            return res.status(400).json({msg:"Masukan data gender dengan benar!"}); //Hope it's not offensive.
        }
        
        const rnama = req.body.nama;
        const ralamat = req.body.alamat;
        const rgend = genderchk;
        //Note: I don't know if this uploaded file, url, or already binary. atleast we buffer it to base64 in case it's url/path
        var rphoto = !req.body.photo? null : new Buffer.from(req.body.photo).toString('base64');
        const rtgl_lahir = req.body.tgl_lahir;

        var bodyrequest = {
            nip: rnip,
            nama: rnama,
            insert_at: Now,
            insert_by: uname
        };
        if (ralamat){
            bodyrequest['alamat'] = ralamat;
        }
        if (genderchk){
            bodyrequest['gend'] = rgend;
        }
        if (rtgl_lahir){
            bodyrequest['tgl_lahir'] = rtgl_lahir;
        }
        if (rphoto){
            bodyrequest['photo'] = rphoto;
        }
        
        //I don't know if I supposed to use the procedure or nah. Is it ok to create function in remote db--that i don't own?
        //so I just hardcoded it la. Otherwise use this
        //var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl; //either full
        //var uapi = req.originalUrl; // api only
        //TBC it's not sequelize its db var because already sequelize in db.config.js
        //await sequelize.query("CALL sp_add_kary_rafli(:user_id, :nama, :alamat, :gend, :photo, :tgl_lahir, :insert_at, :api)",
        //{ replacements:{
        //    user_id: id,
        //    nama: rnama,
        //    alamat: ralamat,
        //    gend: rgend,
        //    photo: rphoto,
        //    tgl_lahir: rtgl_lahir,
        //    insert_at: Now,
        //    api: uapi
        //}}).then(v=>console.log(v)););
        const results = await m_user.create(bodyrequest);
        //console.log(results);
        res.status(200).json({results});
    } catch (error) {
        //console.log(error)
        res.status(500).json({error});;
    }
}

export const Uupdate = async(req, res) => {
    try { 
        var Now = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');
        const token = req.headers['x-access-token'];       
        
        const tkuser = await m_token.findAll({
            where: {
                token: token
            }
        });

        const tkusrdt = tkuser[0].dataValues
        var id = tkusrdt.id_admin;
        
        const aduser = await m_admin.findAll({
            where: {
                id: id
            }
        });
        const adusrdt = aduser[0].dataValues;
        const uname = adusrdt.username;
        //console.log(`UNAME = ${uname}`);

        if (!req.body.nip ||req.body.nip.length > 8 || req.body.nip.length < 8){
            return res.status(400).json({msg:"Data NIP kosong atau salah!"});
        }

        if (typeof(req.body.nip) != "number"){
            return res.status(400).json({msg:"Data NIP salah!"});
        }

        const rnip = req.body.nip;
        const nipyr = rnip.toString().slice(0,3);
        const Ynow = parseInt(moment().year());
        var nipyri = parseInt(nipyr, 10);
        
        if(nipyri>Ynow){
            //console.log("Time traveller???");don't mind! its 1 in the morning!
            return res.status(400).json({msg:"Data NIP salah!"});
        }

        var rnama = req.body.nama || null;
        var ralamat = req.body.alamat || null;

        if( containsSpecialChars(rnama) || containsSpecialChars(ralamat)
            ){
            return res.status(400).json({msg:"Data mengandung simbol!"});
        }
        
        var genderchk = !req.body.gender? null : req.body.gender.toUpperCase();
        if (genderchk && genderchk != "L" && genderchk != "P"){
            //console.log("Hayo input apa"); don't mind me coding at 2am
            return res.status(400).json({msg:"Masukan data gender dengan benar!"}); //Hope it's not offensive.
        }
        
        var rphoto = !req.body.photo? null : new Buffer.from(req.body.photo).toString('base64');
        var rtgl_lahir = req.body.tgl_lahir || null;
        
        const empl = await m_user.findAll({
            where: {
                nip: rnip
            }
        });
        
        if (empl.length == 0) {
            return res.status(401).json({msg: "Data tidak ada!"});
        }

        var bodyrequest = {
            update_at: Now,
            update_by: uname
        };
        if (rnama){
            bodyrequest['nama'] = rnama;
        }
        if (ralamat){
            bodyrequest['alamat'] = ralamat;
        }
        if (genderchk){
            bodyrequest['gend'] = genderchk;
        }
        if (rtgl_lahir){
            bodyrequest['tgl_lahir'] = rtgl_lahir;
        }
        if (rphoto){
            bodyrequest['photo'] = rphoto;
        }
        //console.log(bodyrequest);
        const results = await empl[0].update(bodyrequest);
        res.send(results);
    }catch (error){
        res.status(500).json({error});
    }
}

export const Udeact = async(req, res) => {
    try { 
        var Now = moment().tz("Asia/Jakarta").format('YYYY-MM-DD HH:mm:ss');
        const token = req.headers['x-access-token'];       
        
        const tkuser = await m_token.findAll({
            where: {
                token: token
            }
        });

        const tkusrdt = tkuser[0].dataValues
        var id = tkusrdt.id_admin;
        
        const aduser = await m_admin.findAll({
            where: {
                id: id
            }
        });
        const adusrdt = aduser[0].dataValues;
        const uname = adusrdt.username;    
        
        if (!req.body.nip ||req.body.nip.length > 8 || req.body.nip.length < 8){
            return res.status(400).json({msg:"Data NIP kosong atau salah!"});
        }

        if (typeof(req.body.nip) != "number"){
            return res.status(400).json({msg:"Data NIP salah!"});
        }

        const rnip = req.body.nip        
        
        const empl = await m_user.findAll({
            where: {
                nip: rnip
            }
        });
        if (empl.length == 0) {
            return res.status(401).json({msg: "Data tidak ada!"});
        }

        var bodyrequest = {
            status: 9,
            update_at: Now,
            update_by: uname
        };
        const results = await empl[0].update(bodyrequest);
        res.send(results)
    }catch (error) {
        return res.status(500).json({error});
    }
}