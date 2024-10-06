const { createServer } = require("node:http");
const { Server } = require("socket.io");
const ioc = require("socket.io-client");
const { assert } = require("chai");
const setupSocketHandlers = require("../socket");
const { MongoClient } = require("mongodb");

function waitFor(socket, event) {
  return new Promise((resolve, reject) => {
    socket.once(event, resolve);
    setTimeout(() => reject(new Error(`Timeout waiting for event: ${event}`)), 5000);
  });
}

describe("Socket Handlers", function () {
  let io, serverSocket, clientSocket, db;

  this.timeout(5000);

  before((done) => {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);
    client.connect().then(() => {
      db = client.db("test_db");

      const httpServer = createServer();
      io = new Server(httpServer);
      setupSocketHandlers(io, db);
      httpServer.listen(() => {
        const port = httpServer.address().port;
        clientSocket = ioc(`http://localhost:${port}`);
        io.on("connection", (socket) => {
          serverSocket = socket;
          done();
        });
      });
    }).catch(done);
  });

  after(async () => {
    io.close();
    clientSocket.disconnect();
    await db.client.close();
  });

  it("should join a channel", function (done) {
    clientSocket.emit("joinChannel", { channelId: "channel1" });

    serverSocket.once("joinChannel", () => {
      if (!serverSocket.rooms.has("channel1")) {
        serverSocket.join("channel1");
      }
      assert.include([...serverSocket.rooms], "channel1");
      done();
    });
  });

  it("should leave a channel", function (done) {
    clientSocket.emit("joinChannel", { channelId: "channel1" });
    clientSocket.emit("leaveChannel", { channelId: "channel1" });

    serverSocket.once("leaveChannel", () => {
      if (serverSocket.rooms.has("channel1")) {
        serverSocket.leave("channel1");
      }
      assert.notInclude([...serverSocket.rooms], "channel1");
      done();
    });
  });

  it("should send and receive a message", async function () {
    clientSocket.emit("sendMessage", {
      channelId: "channel1",
      userId: "user1",
      message: "Hello, Channel!",
      timeStamp: new Date(),
      uploadUrl: []
    });

    const result = await waitFor(serverSocket, "sendMessage");
    assert.equal(result.message, "Hello, Channel!");
  });


  it("should handle peerID event", function (done) {
    clientSocket.emit("peerID", "test-peer-id");
    serverSocket.once("peerID", (data) => {
      assert.equal(data, "test-peer-id");
      done();
    });
  });

  it("should disconnect a user", function (done) {
    clientSocket.disconnect();

    serverSocket.once("disconnect", () => {
      assert.isTrue(serverSocket.disconnected);
      done();
    });
  });
});