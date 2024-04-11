import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db/index.db.js';
import path from 'path';
import cookieParser from 'cookie-parser';

import { checkForAuthenticationCookie } from './middleware/auth.middleware.js';

import userRoute from './routes/user.route.js';
import doctorRoute from './routes/doctor.route.js';

import {Doctor} from './models/doctor.models.js';

dotenv.config({
    path: './.env'
}) 

const app = express(); 
const PORT = process.env.PORT || 3000;

connectDB()
.then((e) => console.log("Mongodb connected"))
.catch((error) => console.log("error connecting to mongodb", error));


app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token")) 
app.use('/public/', express.static(path.resolve('./public'))) 
app.use(express.static(path.resolve('./public')))

app.get("/",async (req, res) => { 
    res.render("home",{
        user: req.user,
    });
});

app.get("/doctorList",async (req, res) => {
    const allDoctors = await Doctor.find({});
    res.render("doctor", { 
        user: req.user,
        doctors: allDoctors,
    });
});

app.use("/user", userRoute);
app.use("/doctor", doctorRoute);


app.listen(PORT, () => console.log(`server running at port: ${PORT}`));