import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';

import { Doctor } from '../models/doctor.models.js';
import { User } from '../models/user.models.js';
import { Request } from '../models/request.models.js';
import { Appointment } from '../models/appointment.models.js';

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('./public/uploads'));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName)
    },
});

const upload = multer({ storage: storage })

router.get('/signin', (req, res) => {
    return res.render('signinDoc');
});

router.get('/signup', (req, res) => {
    return res.render('addCard');
});


router.get("/logout", (req, res) => {
    res.clearCookie("token").render("/", { role: " " });
})




router.get("/add-new", (req, res) => {
    return res.render("addCard", {
        user: req.user,
    })
});

router.get("/schedule", async (req, res) => {
    

    const patients = await Appointment.aggregate([
        {
            $match: {
                doctorId: new mongoose.Types.ObjectId(req.params.id), // Convert ID to ObjectId
                requestStatus: 'true',
                approveStatus: 'false', 
            },
        }, 
    ])
    return res.render("scheduleAppointment", {
        patients,
        name: req.query.name,
        role: req.query.role,
        did: req.query.did,
    })
});


 
router.get("/requestBlood/:id", async (req, res) => {
    const doctor = await Doctor.findById(req.params.id);
    console.log(doctor.profileImageURL)
    return res.render("bloodRequest", { 
        user: req.user,
        name: doctor.doctorName,
        role: doctor.role,
        did: doctor._id,
        doctor,
    })
});

router.get('/:id', async (req, res) => {
    const doctor = await Doctor.findById(req.params.id); //call user model in createdBy foeld of blog-model
    return res.render("doctorProfile", {                                            //without populate() createdBy only has objectId
        user: req.user,
        name: doctor.doctorName,
        role: doctor.role,
        did: doctor._id,
        doctor,
        // comments,  
    })
}); 


router.get('/initiateRequest/status', async (req, res) => {
    return true;
})



router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { token, name, role, did } = await Doctor.matchPasswordAndGenerateToken(email, password);
        return res.cookie("token", token).render("home", { name, role, did });
    } catch (error) {
        return res.render("signin", {
            error: "Incorrect email or password",
        });
    }

})

router.post("/signup", upload.single('coverImage'), async (req, res) => {
    const { doctorName, email, password, speciality } = req.body
    const doctor = await Doctor.create({
        doctorName,
        speciality,
        email,
        password, 
        profileImageURL: `/uploads/${req.file.filename}`,
    })
    const name = doctorName
    const role = doctor.role
    return res.render("home", { name, role, did: doctor._id });

})

router.post("/approveAppointment", async (req, res) => {
    const doctor = await Doctor.findById(new mongoose.Types.ObjectId(req.query.doctorId));
    try {
        const status = req.query.status;
        const {datetime} = req.body

        if (status === 'false'){
            datetime = ""
        }
        const updatedAppointment = await Appointment.findOneAndUpdate(
            {

                doctorId: new mongoose.Types.ObjectId(req.query.doctorId),
                patientId: new mongoose.Types.ObjectId(req.query.patientId),
                // approveStatus: false,


            },
            {
                $set: { approveStatus: status,
                        datetime: datetime,
                }
            },
            // { new: true } // Return the updated document (optional)
        );
        console.log(updatedAppointment)
        return res.render("home", {
            name: doctor.doctorName,
            role: doctor.role,
            did: doctor._id
        
        });
    } catch (error) {
        console.log(error, "error while updating entry")
    }
});




router.post("/", upload.single('coverImage'), async (req, res) => {
    const { doctorName, email, password, speciality } = req.body
    const doctor = await Doctor.create({
        doctorName,
        speciality,
        email,
        password,
        coverImageURL: `/uploads/${req.file.filename}`,
    })
    return res.redirect(`/doctor/${doctor._id}`);

})




router.post("/initiateRequest/:id", async (req, res) => {
    const { patientName, location, bloodType } = req.body
    const doctorId = new mongoose.Types.ObjectId(req.params.id); 
    const request = await Request.create({
        doctorId,
        patientName,
        location,
        bloodType,
    })
    console.log("created /initiaterequest")
   
    const potentialDoner = await User.aggregate([
        {
            $match: {
                bloodType: bloodType, // Convert ID to ObjectId
                // requestStatus: true,
            },
        },
    ])
    console.log(potentialDoner)
    return res
        .status(200)
        .json({
            contact: potentialDoner.contact,
        })
})


export default router;