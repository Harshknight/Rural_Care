import { Router } from 'express';

import {User} from '../models/user.models.js';
import {Doctor} from '../models/doctor.models.js';
import {Appointment} from '../models/appointment.models.js';


const router = Router();

router.get('/signin', (req, res) => {
    return res.render('signin');
});

router.get('/signup', (req, res) => {
    return res.render('signup');
});

router.get("/doctorList/:id",async (req, res) => {
    const user = await User.findById(req.params.id);
    const allDoctors = await Doctor.find({});
    res.render("doctor", { 
        user: req.user,
        name: user.fullName,
        role: user.role,
        did: req.params.id,
        doctors: allDoctors,
    });
});

router.get("/requestAppointment/:id", async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    const doctorAppointment = await Appointment.findOne({ doctorId: req.params.id });
    if (doctorAppointment?.requestStatus) {
        return res.render("doctorAppointment", {
            patientName: doctorAppointment.patientName,
            user: req.user,
            doctor,
            doctorAppointment,
            
        }) 
    } else {
        return res.render("doctorAppointment", {
            patientName: doctorAppointment?.patientName,
            user: req.user,
            doctor,
            
        })
    }
});


router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const {token, name, role, uid} = await User.matchPasswordAndGenerateToken(email, password);
        return res.cookie("token", token).render("home", {name, role, uid});
    } catch (error) {
        return res.render("signin", {
            error: "Incorrect email or password",
        });
    }

})

router.post("/signup", async (req, res) => { 
    const { fullName, bloodType, contact, address, email, password } = req.body;
    const user = await User.create({
        fullName,
        email,
        contact,
        address,
        bloodType,
        password,
    });
    const name = fullName;
    const role = user.role;
    return res.render("home", {name,role, uid: user._id});
});
 
router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/");
})

router.post("/requestAppointment", async (req, res) => {
    // const doctor = await Doctor.findById(req.query.doctorId);
    const user = await User.findById(req.query.userId1);
    const patientName = user.fullName;

    const appointment = await Appointment.create({
        doctorId: req.query.doctorId,
        patientId: req.query.userId1,
        patientName: patientName,
        requestStatus: true,
    })
    return res.redirect('/user/doctorList', {
        name: user.fullName,
        role: user.role
    });
});

export default router;