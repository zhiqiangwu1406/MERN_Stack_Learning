import dns from "node:dns"; //dns resolve issue fix
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import { configDotenv } from "dotenv";
import { app } from "./app.js";
import { connectdb } from "./db/index.js";
configDotenv({
  path: ".env",
});
const PORT = process.env.PORT || 3000;

connectdb()
  .then(() => {
    app.listen(PORT, "127.0.0.1", () => {
      console.log(`Express server listening on port ${PORT}`);
    });
  })
  .catch((err) => console.log(err));
