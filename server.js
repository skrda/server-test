const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // Laat iedereen toe

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Dit is de sleutel: IEDEREEN mag verbinden (dus ook suleyman.be)
        methods: ["GET", "POST"]
    }
});

app.get("/", (req, res) => {
    res.send("Server van Suleyman draait!");
});

io.on("connection", (socket) => {
    console.log("Nieuwe verbinding: " + socket.id);

    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        // Vertel de anderen in de kamer dat er iemand is
        socket.to(roomId).emit("user-connected", userId);

        // Chatberichten doorsturen
        socket.on("send-chat-message", (data) => {
            // Stuur naar iedereen in de kamer behalve de verzender
            socket.to(roomId).emit("receive-chat-message", data);
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
