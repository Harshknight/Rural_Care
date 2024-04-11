import { Router } from 'express';
import {User} from '../models/user.models.js';

const router = Router();

router.get('/signin', (req, res) => {
    return res.render('signin');
});

router.get('/signup', (req, res) => {
    return res.render('signup');
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const {token, name, role} = await User.matchPasswordAndGenerateToken(email, password);
        return res.cookie("token", token).render("home", {name, role});
    } catch (error) {
        return res.render("signin", {
            error: "Incorrect email or password",
        });
    }

})

router.post("/signup", async (req, res) => { 
    const { fullName, email, password } = req.body;
    const user = await User.create({
        fullName,
        email,
        password,
    });
    const name = fullName;
    const role = user.role;
    return res.render("home", {name,role});
});
 
router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/");
})

export default router;