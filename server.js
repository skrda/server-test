const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

app.get("/", (req, res) => res.send("Suleyman Server V3"));

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);
        
        // 1. Iemand komt binnen -> Vertel het de Admin
        socket.to(roomId).emit("user-connected", userId);

        // 2. Chat berichten
        socket.on("send-chat-message", (data) => {
            socket.to(roomId).emit("receive-chat-message", data);
        });

        // 3. NIEUW: Admin zegt "Ik begin met delen"
        socket.on("admin-start-share", () => {
            // Vertel iedereen in de kamer dat de stream begint
            socket.to(roomId).emit("stream-started-signal");
        });

        // 4. NIEUW: Admin zegt "Ik stop"
        socket.on("admin-stop-share", () => {
            socket.to(roomId).emit("stream-stopped-signal");
        });

        // 5. NIEUW: Een kijker vraagt om de stream (omdat hij er al was)
        socket.on("request-stream", (userId) => {
            // Stuur dit verzoek naar de Admin zodat die kan terugbellen
            socket.to(roomId).emit("connect-to-user", userId);
        });

        socket.on("disconnect", () => {
            socket.to(roomId).emit("user-disconnected", userId);
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log(`Server draait op poort ${PORT}`); });
