const faker = require("faker");

const User = require("../models/user");

module.exports = io => {
  const activeSockets = {}; // used to store all active sockets
  
  io.on("connection", socket => {
    io.to(socket.id).emit("activeSockets", activeSockets);

    // add newly connected socket to the store with a random name
    activeSockets[socket.id] = {
      id: socket.id,
      opponentSocketId: null,
      displayName: faker.commerce.productName()
    };

    let token;
    if (socket.request.headers.cookie) {
      token = socket.request.headers.cookie["auth-token"];
    }

    const currentSocket = activeSockets[socket.id];
    User.findByToken(token).then(user => {
      if (user) {
        currentSocket.displayName = user.username;
        io.to(socket.id).emit("signIn", currentSocket);
      }
      // emit to itself
      io.to(socket.id).emit("currentSocket", currentSocket);
      // emit to other sockets
      socket.broadcast.emit("newActiveSocket", currentSocket);
    });

    // routing the challenge to the opponent
    socket.on("challengeSent", opponentSocketId => {
      io
        .to(opponentSocketId)
        .emit("challengeReceived", activeSockets[socket.id]);
    });

    // handling challenge accepted and start game
    socket.on("challengeAccepted", (player1Id, player2Id) => {
      activeSockets[player1Id].opponentSocketId = player2Id;
      activeSockets[player2Id].opponentSocketId = player1Id;
      io.to(player2Id).emit("clearChallenge", player1Id);
      io.to(player1Id).emit("startGame", true); // true === your turn
      io.to(player2Id).emit("startGame", false); // false === not your turn
    });

    // handling challenge refused
    socket.on("challengeDenied", (denierId, challengerId) => {
      io.to(challengerId).emit("clearChallenge", denierId);
    });

    // remove itself from all other socket lists
    socket.on("disconnect", reason => {
      socket.broadcast.emit("removeActiveSocket", activeSockets[socket.id]);
      delete activeSockets[socket.id];

      if (currentSocket.opponentSocketId) {
        socket.to(currentSocket.opponentSocketId).emit("resetGame");
      }
    });

    // --------- chat relay ---------
    socket.on("chatMessage", message => {
      io.to(activeSockets[socket.id].opponentSocketId).emit("chatMessage", {
        sender: activeSockets[socket.id].displayName,
        message
      });
      io.to(socket.id).emit("chatMessage", {
        sender: activeSockets[socket.id].displayName,
        message
      });
    });

    // ---------- auth ---------
    socket.on("signIn", newToken => {
      User.findByToken(newToken).then(user => {
        currentSocket.displayName = user.username;
        io.to(socket.id).emit("currentSocket", currentSocket);
        socket.broadcast.emit("updateActiveSocket", currentSocket);
      });
    });

    socket.on("signOut", () => {
      currentSocket.displayName = faker.commerce.productName();
      io.to(socket.id).emit("currentSocket", currentSocket);
      socket.broadcast.emit("updateActiveSocket", currentSocket);
    });

    //--------------------------------------------- the game
    const sendToOpponent = message =>
      socket.on(message, data => {
        io.to(activeSockets[socket.id].opponentSocketId).emit(message, data);
      });
    const gameplayMessages = [
      "position",
      "moveType",
      "attack",
      "cancel",
      "switchPlayer",
      "resetGame",
      , "turnResult",
       "gameState"
    ];
    for (let i = 0; i < gameplayMessages.length; ++i) {
      sendToOpponent(gameplayMessages[i]);
    }
  });
};
