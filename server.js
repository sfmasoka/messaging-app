const WebSocket = require("ws");
const wss = new WebSocket.Server({
  host: "0.0.0.0", // Allow external connections
  port: 8081,
});

const users = new Map();
const groups = new Map();

wss.on("connection", (ws) => {
  let username = null;

  ws.on("message", (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case "login":
        username = message.username;
        users.set(username, ws);
        broadcastUserList();
        break;

      case "message":
        if (message.isGroup) {
          const members = groups.get(message.recipient);
          members.forEach((member) => sendMessage(member, message));
        } else {
          sendMessage(message.recipient, message);
        }
        break;

      /* case "createGroup":
        groups.set(message.groupName, new Set(message.members));
        break;

        new code *************************/
      case "createGroup":
        groups.set(message.groupName, new Set(message.members));
        broadcastUserList();
        console.log(`Group created: ${message.groupName}`);
        break;
    }
  });

  ws.on("close", () => {
    if (username) {
      users.delete(username);
      broadcastUserList();
    }
  });
});

function sendMessage(recipient, message) {
  const ws = users.get(recipient);
  ws && ws.send(JSON.stringify(message));
}

/*function broadcastUserList() {
  const userList = Array.from(users.keys());
  users.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: "userList",
        users: userList,
      })
    );
  });
}*/

////new code
function broadcastUserList() {
  const userList = Array.from(users.keys());
  const groupList = Array.from(groups.keys());

  users.forEach((ws) => {
    ws.send(
      JSON.stringify({
        type: "userList",
        users: userList,
        groups: groupList, // Include groups
      })
    );
  });
}

console.log("WebSocket server running on ws://56.228.41.122:8081");
