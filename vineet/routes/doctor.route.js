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

router.get("/add-new", (req, res) => {
    return res.render("addCard", {
        user: req.user,
    })
});

router.get("/schedule/:id", async (req, res) => {
    // const appointment = await Appointment.find({doctorName:req.params.id});
    const patients = await Appointment.aggregate([
        {
            $match: {
                doctorId: new mongoose.Types.ObjectId(req.params.id), // Convert ID to ObjectId
                requestStatus: true,
            },
        },
    ])
    return res.render("scheduleAppointment", {
        patients,
    })
});



router.get("/requestBlood", (req, res) => {
    return res.render("bloodRequest", {
        user: req.user,
    })
});

router.get('/:id', async (req, res) => {
    const doctor = await Doctor.findById(req.params.id); //call user model in createdBy foeld of blog-model
    return res.render("doctorProfile", {                                            //without populate() createdBy only has objectId
        user: req.user,
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
        coverImageURL: `/uploads/${req.file.filename}`,
    })
    const name = doctorName
    const role = doctor.role
    return res.render("home", { name, role, did: doctor._id });

})

router.post("/approveAppointment", async (req, res) => {
    // const doctor = await Doctor.findById(req.query.doctorId);
    try {
        const status = req.query.status;
        const {datetime} = req.body
        console.log(status, datetime)
        if (status === false){
            datetime = ""
        }
        const updatedAppointment = await Appointment.findOneAndUpdate(
            {

                doctorId: new mongoose.Types.ObjectId(req.query.doctorId),
                patientId: new mongoose.Types.ObjectId(req.query.patientId),


            },
            {
                $set: { approveStatus: status,
                        datetime: datetime,
                }
            },
            // { new: true } // Return the updated document (optional)
        );

        return res.json({
            "status": `${status}`
        });
    } catch (error) {
        console.log(error, "error while updating entry")
    }
});

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
    return res.json({ "requestSent": "true" });
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




router.post("/initiateRequest", async (req, res) => {
    const { doctorName, patientName, location, bloodType } = req.body
    const request = await Request.create({
        doctorName,
        patientName,
        location,
        bloodType,
    })
    console.log("created /initiaterequest")
    const potentialDoner = await User.aggregate([
        {
            // Lookup users based on matching bloodType from the request collection
            $lookup: {
                from: 'users', // Name of the second collection (users)
                localField: 'bloodType', // Field in the request collection to match
                foreignField: 'bloodType', // Field in the user collection to match
                as: 'matchedUsers', // Name for the resulting array of matched users
                let: { bloodType: bloodType } // Define a variable for bloodType
            },
            $match: { // Filter requests based on the dynamic bloodType
                bloodType: { $eq: "$$bloodType" } // Match against the defined variable
            }
        },
        {
            // Unwind the matchedUsers array to access individual user documents
            $unwind: '$matchedUsers'
        },
        {
            // Project desired fields: userName and contact from matchedUsers
            $project: {
                _id: 0, // Exclude unnecessary _id field
                userName: '$matchedUsers.userName',
                contact: '$matchedUsers.contact'
            }
        }
    ]);

    return res
        .status(200)
        .json({
            potentialDoner
        })
})


export default router;