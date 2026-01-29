const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Vervang dit door jouw ECHTE domeinnaam, anders werkt het niet!
const JOUW_WEBSITE = "https://www.suleyman.be/"; 

app.use(cors({ origin: JOUW_WEBSITE }));

const io = new Server(server, {
    cors: {
        origin: JOUW_WEBSITE,
        methods: ["GET", "POST"]
    }
});

// Simpele test om te zien of het werkt
app.get("/", (req, res) => {
    res.send("De Video Server draait! Ga naar je website om te bellen.");
});

// De logica voor het bellen
io.on("connection", (socket) => {
    console.log("Gebruiker verbonden: " + socket.id);

    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit("user-connected", userId);

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
});
