import { Server } from "socket.io";

let messages = [];

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: "/api/socket_io", // ✅ custom path
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      const ip =
        socket.handshake.headers["x-forwarded-for"] || socket.handshake.address;

      socket.emit("init", messages);

      socket.on("sendMessage", (text) => {
        const message = {
          text,
          ip,
          time: new Date().toLocaleTimeString(),
        };

        messages.push(message);
        if (messages.length > 20) messages.shift();

        io.emit("newMessage", message);
      });
    });
  }
  res.end();
}
