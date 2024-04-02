import { Router } from 'express';
import multer from 'multer';
import path from 'path';

import Doctor from '../models/doctor.models.js';
// const Comment = require('../models/comments.models.js');

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


router.get("/requestAppointment/:id", async (req, res) => { 
    const doctor = await Doctor.findById(req.params.id).populate("request");
    return res.render("doctorAppointment", {
        user: req.user,
        doctor,
    })
});
  
router.get("/add-new", (req, res) => { 
    return res.render("addCard", {
        user: req.user,
    })
});
  
router.get('/:id', async (req, res) => {
    const doctor = await Doctor.findById(req.params.id).populate("request"); //call user model in createdBy foeld of blog-model
    return res.render("modals", {                                            //without populate() createdBy only has objectId
        user: req.user,
        doctor,
        // comments, 
    })
});

// router.post('/comment/:blogId', async (req, res) => {
//     await Comment.create({
//         content: req.body.content,
//         blogId: req.params.blogId,
//         createdBy: req.user._id,
//     });
//     return res.redirect(`/blog/${req.params.blogId}`);
// });

router.post("/", upload.single('coverImage'), async (req, res) => {
    const { doctorName, speciality } = req.body
    const doctor = await Doctor.create({
        doctorName,
        speciality,
        request: req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`, 
    })
    return res.redirect(`/doctor/${user._id}`); 
  
}) 


export default router;