const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// LET OP: Zet hier jouw ECHTE domeinnaam!
const JOUW_WEBSITE = "https://www.suleyman.be"; 

app.use(cors({ origin: JOUW_WEBSITE }));

const io = new Server(server, {
    cors: {
        origin: JOUW_WEBSITE,
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => {
    res.send("Discord Server draait!");
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);

        // NIEUW: Luister naar chatberichten
        socket.on("send-chat-message", (message) => {
            // Stuur bericht naar iedereen in de kamer BEHALVE jijzelf
            socket.to(roomId).emit("receive-chat-message", message);
        });

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
});
