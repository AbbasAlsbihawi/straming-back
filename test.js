// // const express = require('express');
// // const fs = require('fs');
// // const multer = require('multer');
// import cors from "cors";
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import express from 'express';
// const app = express();
// // const upload = multer({ dest: 'uploads/' });
// app.use(cors());
// // app.post('/upload', upload.single('file'), (req, res) => {
// //     const tempPath = req.file.path;
// //     const targetPath = `uploads/${req.file.originalname}`;

// //     // Stream the file from tempPath to targetPath
// //     const src = fs.createReadStream(tempPath);
// //     const dest = fs.createWriteStream(targetPath);

// //     src.pipe(dest);
// //     src.on('end', () => {
// //         res.status(200).send('File uploaded successfully');
// //     });
// //     src.on('error', (err) => {
// //         res.status(500).send('An error occurred during the upload');
// //     });
// // });


// // Ensure 'uploads/' directory exists
// if (!fs.existsSync('uploads/')) {
//     fs.mkdirSync('uploads/');
// }

// // Set up Multer with a higher file size limit
// const upload = multer({ 
//     dest: 'uploads/',
//     limits: { fileSize: 1024 * 1024 * 1024 * 10 } // 10GB limit
// });

// app.post('/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).send('No file uploaded.');
//     }

//     const tempPath = req.file.path;
//     const targetPath = `uploads/${req.file.originalname}`;

//     const src = fs.createReadStream(tempPath);
//     const dest = fs.createWriteStream(targetPath);

//     src.pipe(dest);
//     src.on('end', () => {
//         // Optionally, you can delete the temp file here if you want
//         res.status(200).send('File uploaded successfully');
//     });
//     src.on('error', (err) => {
//         console.error('Error during file upload:', err);
//         res.status(500).send('An error occurred during the upload');
//     });
// });

 
// app.listen(30013, () => {
//     console.log('Server started on port 3000');
// });



const path = require('path')
require('dotenv').config()
const express = require("express");
const app = express();
require('./api/models/organizationalStructureAndRole/Session')
const cors = require('cors');
const sharedsession = require("express-socket.io-session");
const http = require('http');
const constants = require('./config/constants.json');
// const app = require('./app')
const PORT = process.env.PORT || 3001

const server = http.createServer(app);
// import { Server } from "socket.io";

// const io = new Server({
//   cors: {
//     origin: "http://localhost:3001",
//   },
// });
// console.log(require('dotenv').config())



server.listen(PORT, () => console.log(`server is starting on port http://localhost:${PORT} ..`));

const io = require('socket.io')(server
  //   ,   {
  //   path: '/socket.io', // added this line of code
  // }
);
 

// ? import Routes functions

 
//? ========================


function extendDefaultFields(defaults, session) {
  return {
    data: defaults.data,
    expires: defaults.expires,
    sid: session.sid,
    isAuth: session.isAuth,
    user: session.user,
    userAgent: session.userAgent,
    UserId: session.UserId
  };
}

var store = new SequelizeStore({
  db: sequelize,
  table: "Session",
  extendDefaultFields: extendDefaultFields,
});


const session = require("express-session")({
  secret: process.env.S_KEY,
  store: store,
  saveUninitialized: true,
  resave: false, // we support the touch method so per the express-session docs this should be set to false
  proxy: true, // if you do SSL outside of node.
}
)

// configure express

app.use(cors({
  origin: "http://localhost:3001",
},
));
app.use(express.json({
  limit: '100mb'
}));
app.use(express.urlencoded({
  extended: true
}));
var compression = require('compression')

app.use(compression())

// Attach session
app.use(session);

// Share session with io sockets

io.use(sharedsession(session));

const sessionHandler = require('./socketIo/sessionHandler');
const { isAuthSocket } = require('./api/middlewares/isAuth');

io.use(isAuthSocket)
const onConnection = (socket) => {
  let userRome = socket.handshake.session.user.username

  socket.join(userRome)

  sessionHandler(io, socket, userRome)


  socket.on("disconnect", () => {
    socket.leave(userRome);
  });

}

io.on("connection", onConnection);

// io.on("connection", function (socket) { 
//   let userRome = socket.handshake.session.user.username
//   socket.join(userRome)
//   socket.on("newUser", ({ data, isAuth }) => {
//     // socket.join(username)
//     if (!isAuth)
//       socket.to(userRome).emit("getNotification", {
//         message: " تم التسجيل الدخول من جهاز آخر",
//         data
//       }) 
//   });


//   // socket.on("sendNotification", ({ senderName, receiverName, type }) => {
//   //   const receiver = getUser(receiverName);
//   //   io.to(receiver.socketId).emit("getNotification", {
//   //     senderName,
//   //     type,
//   //   });
//   // });

//   // socket.on("sendText", ({ senderName, receiverName, text }) => {
//   //   const receiver = getUser(receiverName);
//   //   io.to(receiver.socketId).emit("getText", {
//   //     senderName,
//   //     text,
//   //   });
//   // }); 
//   // console.log(onlineUsers)

//   socket.on("terminateAll", ({ username, data }) => {
//     socket.to(username).emit("isTerminate", data)

//   })
//   socket.on("terminate", ({ username , data }) => {
//     io.sockets.in(username).emit("isTerminate", data) 
//   });
//   socket.on("logout", (username, data) => {
//     const receiver = getUserByUsernameAndSessionId(username, data.sessionID);
//     const rece = getUser(data.sessionID);

//     rece.forEach((item) => { removeUser(item.socketId) })

//     if (receiver) {
//       receiver.forEach((item) => {
//         io.to(item.socketId).emit("getNotification", {
//           message: " تم تسجيل الخروج من جهاز ",
//           data
//         });
//       })
//     }
//   });

//   socket.on("disconnect", (data) => { 
//     socket.leave(userRome);  
//   });

//   // // Accept a login event with user's data
//   // socket.on("login", function(userdata) {
//   //   console.log('userdata',socket.handshake.session);
//   //     // socket.handshake.session.userdata = userdata;
//   //     // socket.handshake.session.save();

//   //     // io.emit('isAuth', userdata);
//   // });


// });


//?============= Start Routes ===============

app.use('/api/logger', LoggerRoutes);
app.use('/api/setting', SettingRoutes);


//* =========== Start of organizationalStructureAndRole =============
app.use('/api/user', UserRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/userRole', userRoleRoutes);
app.use('/api/designation', DesignationRoutes);
app.use('/api/commission', CommissionRoutes);
app.use('/api/staff', StaffRoutes);
app.use('/api/assistant', AssistantRoutes);
app.use('/api/directorate', DirectorateRoutes);
app.use('/api/department', DepartmentRoutes);
app.use('/api/division', DivisionRoutes);
//* ============ End of organizationalStructureAndRole ============

//* =========== Start of humanResources =============
app.use('/api/employee', EmployeeRoutes);
app.use('/api/certificate', CertificateRoutes);
app.use('/api/jobStatus', JobStatusRoutes);
app.use('/api/beneficiary', BeneficiaryRoutes);
app.use('/api/document', DocumentRoutes);
app.use('/api/wife', wifeRoutes);
app.use('/api/course', CourseRoutes);
app.use('/api/documentType', DocumentTypeRoutes);
app.use('/api/employeeCourses', EmployeeCoursesRoutes);
app.use('/api/worklocation', WorkLocationRoutes);
app.use('/api/Employeepunishment', EmployeepunishmentRoutes);
app.use('/api/Punishment', PunishmentRoutes);


//* ============ End of humanResources ============

//* =========== Start of attendance =============
app.use('/api/duty', DutyRoutes);
app.use('/api/holiday', HolidayRoutes);
app.use('/api/vacation', VacationRoutes);
app.use('/api/employeeSchedule', EmployeeScheduleRoutes);
app.use('/api/shiftDay', ShiftDayRoutes);
app.use('/api/shiftHour', ShiftHourRoutes);
app.use('/api/employeeShift', EmployeeShiftRoutes);
app.use('/api/EmployeeHoliday', EmployeeHolidayRoutes);


//* ============ End of attendance ============

//* =========== Start of WorkSystem =============

app.use('/api/ws/holiday', WS_HolidayRoutes);
app.use('/api/ws/report', WS_ReportRoutes);
app.use('/api/ws/shiftWork', WS_ShiftWorkRoutes);
app.use('/api/ws/vacation', WS_VacationRoutes);
//* ============ End of WorkSystem ============

//?============= End Routes ===============

app.use('/profile', express.static(constants.assets_loc.users))
app.use('/duties', express.static(constants.assets_loc.duties))
app.use('/courses', express.static(constants.assets_loc.courses))
app.use('/vacations', express.static(constants.assets_loc.vacations))
app.use('/employees', express.static(constants.assets_loc.employees))
app.use('/punishments', express.static(constants.assets_loc.punishments))
app.use('/certificates', express.static(constants.assets_loc.certificates))


//* Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, './build')));


//* All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './build', 'index.html'));
});



//? ================================================
// !! =========== ERROR Handling URL ========= !! //
//? ================================================

app.use((req, res, next) => {
  const error = new Error('Not Found!');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});