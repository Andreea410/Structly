import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { generateFakeDataStructures } from "./utils/generateFakeData.js";
import { monitorLogs } from "./lib/monitorLogs.js";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let interval;
let sendingEnabled = false;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server);

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("TOGGLE_SENDING", (enabled) => {
      sendingEnabled = enabled;
      console.log("Sending status:", enabled ? "ENABLED" : "DISABLED");
    });

    if (!interval) {
      interval = setInterval(() => {
        if (!sendingEnabled) return;

        const entity = generateFakeDataStructures(100)[0];
        io.emit("NEW_ENTITY", entity);
      }, 10000);
    }

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  setInterval(() => {
    monitorLogs().catch((err) => {
      console.error("Monitoring error:", err);
    });
  }, 60000);

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
