import jwt from "jsonwebtoken"

export const jwtverify = (req, res, next) => {
    //console.log(process.env.JWT_AC_KEY); // I don't know why I logging this key? maybe checking dotenv?
    //Should I add bearer in header access token? I don't know
    //console.log(req.headers['x-access-token']); //In case i forgot adding smth
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.sendStatus(401);
    }      
    jwt.verify(token, process.env.JWT_AC_KEY, (err, decoded) =>{
        if(err) {
            return res.send(err);
        }
        req.uname = decoded.uname;
        next();
    })
}