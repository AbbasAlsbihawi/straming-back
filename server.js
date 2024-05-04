// import http from "http";

// import app from "./src/app.js";
// import config from "./src/utils/config.js";
// import logger from "./src/utils/log.js";
// import socketIo from "socket.io"

// const log = logger("server");
// const server = http.createServer(app);

// const io = socketIo(server
//   //   ,   {
//   //   path: '/socket.io', // added this line of code
//   // }
// );

// io.on("connection", (socket) => {

//   socket.on("connect", () => {
//     console.log("a user connected");
//   });
//   // let userRome = socket.handshake.session.user.username

//   // socket.join(userRome)




//   socket.on("disconnect", () => {
//     console.log("disconnect", disconnect);
//     // socket.leave(userRome);
//   });

// });

// process.on("uncaughtException", (err) => {
//   log.fatal({ err }, `Unhandled exception ${err}`);
//   server.close();
// });

// process.on("unhandledRejection", (reason) => {
//   log.error(`Unhandled promise rejection: ${reason}`);
// });

// const main = async () => {
//   log.info(`Listening on 0.0.0.0:${config.PORT}`);
//   await server.listen(config.PORT);
// };

// main();


import http from 'http';
import app from './src/app.js';
import config from './src/utils/config.js';
import logger from './src/utils/log.js';
import { Server as SocketIo } from 'socket.io';
import {
  userJoin,
  userLeave,
  getRoomUsers,
  getCurrentUserByRoom,
  users,
} from './src/utils/users.js';
import { formatMessage } from './src/utils/messages.js';

const log = logger('server');
const server = http.createServer(app);

// const io = new SocketIo(server
//   // Uncomment and modify the below options if necessary
//   // , {
//   //   path: '/socket.io', // If you want a custom path for socket.io
//   // }
// );
const io = new SocketIo(server, {
  cors: {
    origin: "*", // Frontend server URL
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    credentials: true
  }
});

const WatchParty = [{
  id: 1,
  users: [
    {
      id: 1,
      name: "user1",
    }
  ],
  videoUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A",
  actionVideo: "play",
  startTime: 0,
  endTime: 0,

}]

const rooms = {}

// io.on('connection', (socket) => {
//   // Log when a user connects
//   console.log('a user connected');
//   console.log("WatchParty", WatchParty);
//   console.log("socket", socket.request._query);

//   // Uncomment the below code if you want to use rooms
//   // let userRoom = socket.handshake.session.user.username;
//   // socket.join(userRoom);

//   socket.on('joinVideo', (data) => {
//     console.log(data);
//     WatchParty.push(data)
//   })
//   socket.on('control', (data) => {

//     const actondata = WatchParty.find(item => item.videoId == data.videoId && item.userId == data.userId)
//     socket.emit('sendControl', actondata)

//   })

//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//     // Uncomment if using rooms
//     // socket.leave(userRoom);
//   });
// });
const botName = "ChatCord Start";

// Run when client connects
io.on("connection", (socket) => {
  console.log("connection");
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    if (user) {
      // console.log("joinRoom", user);
      socket.join(user.room);
    }

    // Welcome current user
    socket.emit("message",
      { action: "startChannel", message: formatMessage(botName, "Welcome to ChatCord!") }

    );

    // Broadcast when a user connects

    if (user) {
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          { action: "startChannel", message: formatMessage(botName, `${user.username} has joined the chat`) }
        );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }

  });

  // console.log("users", users);
  // Listen for chatMessage
  socket.on("chatMessage", ({ room, msg, action }) => {
    console.log("chatMessage", "room");
    const d = getRoomUsers(room);
    console.log("getRoomUsers", d);
    const user = getCurrentUserByRoom(room);

    if (user) {
      console.log("user", user);
      io.to(user.room).emit("message", { action, message: formatMessage(user.username, msg) });
    }

  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});



process.on('uncaughtException', (err) => {
  log.fatal({ err }, `Unhandled exception: ${err}`);
  server.close(() => process.exit(1)); // Exit the process after closing the server
});

process.on('unhandledRejection', (reason) => {
  log.error(`Unhandled promise rejection: ${reason}`);
  // Optionally, you can also shut down the server in case of unhandled rejections
  // server.close(() => process.exit(1));
});

const main = async () => {
  try {
    await server.listen(config.PORT);
    log.info(`Listening on 0.0.0.0:${config.PORT}`);
  } catch (err) {
    log.fatal({ err }, 'Failed to start the server');
    process.exit(1);
  }
};

main();




function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if (room.users[socket.id] != null) names.push(name)
    return names
  }, [])
}
