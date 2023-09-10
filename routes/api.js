import express from "express"
import { 
    Signin,
    Uread,
    Ucreate,
    Uupdate,
    Udeact,
} from "../controllers/cadmin.js"; //differs from already included file name
import { jwtverify } from "../middleware/jwt.js";

const router = express.Router();

router.post('/login', Signin);
//router.post('/register', Signup); no sign up? 
//I guess yeah because I think I should not messing around with the db

router.post('/read', jwtverify, Uread)
router.post('/create', jwtverify, Ucreate) //router.post('/create', ucreate)
router.put('/update', jwtverify, Uupdate) // Should I use put or patch? also post? mehh usually put.
router.put('/deact', jwtverify, Udeact) // Should be delete because CRU"D" you know?

export default router