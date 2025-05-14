let ws;
let username;
let currentChat = null;

function login() {
  username = document.getElementById("usernameInput").value.trim();
  if (!username) return;

  ws = new WebSocket("ws://56.228.41.122:8081");

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "login", username }));
    document.getElementById("loginContainer").style.display = "none";
    document.getElementById("chatContainer").style.display = "flex";
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case "userList":
        updateContacts(message); // "was"      updateContacts(message.users);
        break;
      case "message":
        displayMessage(message);
        break;
    }
  };
}

/*function updateContacts(users) {
  const contactsList = document.getElementById("contactsList");
  contactsList.innerHTML = `
        <div class="contact new-group" onclick="showGroupCreator()">
            <div class="online-status"></div>
            Create New Group
        </div>
    `;

  users.forEach((user) => {
    if (user !== username) {
      const contact = document.createElement("div");
      contact.className = "contact";
      contact.innerHTML = `
                <div class="online-status"></div>
                ${user}
            `;
      contact.onclick = () => selectChat(user, false);
      contactsList.appendChild(contact);
    }
  });
}*/

function updateContacts(data) {
  const contactsList = document.getElementById("contactsList");
  contactsList.innerHTML = `
        <div class="contact new-group" onclick="showGroupCreator()">
            <div class="online-status"></div>
            Create New Group
        </div>
    `;

  // Add users
  data.users.forEach((user) => {
    if (user !== username) {
      const contact = document.createElement("div");
      contact.className = "contact";
      contact.innerHTML = `
                <div class="online-status"></div>
                ${user}
            `;
      contact.onclick = () => selectChat(user, false);
      contactsList.appendChild(contact);
    }
  });

  // Add groups
  data.groups.forEach((group) => {
    const groupContact = document.createElement("div");
    groupContact.className = "contact group";
    groupContact.innerHTML = `
            <div class="group-icon">👥</div>
            ${group}
        `;
    groupContact.onclick = () => selectChat(group, true);
    contactsList.appendChild(groupContact);
  });
}

/*****************/

function selectChat(recipient, isGroup) {
  currentChat = { recipient, isGroup };
  document.getElementById("chatHeader").textContent = `${
    isGroup ? "Group: " : ""
  }${recipient}`;
  document.getElementById("messagesContainer").innerHTML = "";
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const content = input.value.trim();
  if (!content || !currentChat) return;

  const message = {
    type: "message",
    sender: username,
    recipient: currentChat.recipient,
    content,
    timestamp: new Date().toISOString(),
    isGroup: currentChat.isGroup,
  };

  ws.send(JSON.stringify(message));
  displayMessage({ ...message, self: true });
  input.value = "";
}

function displayMessage(message) {
  const messagesContainer = document.getElementById("messagesContainer");
  const messageDiv = document.createElement("div");

  messageDiv.className = `message ${message.self ? "sent" : "received"}`;
  messageDiv.innerHTML = `
        <div>${message.content}</div>
        <div class="message-time">
            ${message.self ? "You" : message.sender} • 
            ${new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
        </div>
    `;

  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleKeyPress(e) {
  if (e.key === "Enter") sendMessage();
}

/* //Group creation functions (basic implementation)
function showGroupCreator() {
  const groupName = prompt("Enter group name:");
  if (groupName) {
    const members = prompt("Enter members (comma-separated):");
    if (members) {
      ws.send(
        JSON.stringify({
          type: "createGroup",
          groupName,
          members: members.split(","),
        })
      );
    }
  }
}*/

function showGroupCreator() {
  // Create modal elements
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = "50%";
  modal.style.left = "50%";
  modal.style.transform = "translate(-50%, -50%)";
  modal.style.backgroundColor = "white";
  modal.style.padding = "20px";
  modal.style.borderRadius = "8px";
  modal.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  modal.style.zIndex = "1000";

  // Create form elements
  modal.innerHTML = `
        <h3 style="margin-bottom: 15px;">Create New Group</h3>
        <input type="text" id="groupName" placeholder="Group name" 
               style="display: block; width: 100%; margin-bottom: 10px; padding: 8px;">
        <input type="text" id="groupMembers" placeholder="Members (comma-separated)"
               style="display: block; width: 100%; margin-bottom: 15px; padding: 8px;">
        <div style="text-align: right;">
            <button onclick="document.body.removeChild(this.parentElement.parentElement)" 
                    style="margin-right: 10px; padding: 8px 16px;">Cancel</button>
            <button onclick="handleGroupCreation()" 
                    style="padding: 8px 16px; background: #1877f2; color: white; border: none;">Create</button>
        </div>
    `;

  // Add to DOM
  document.body.appendChild(modal);

  // Handle creation
  window.handleGroupCreation = () => {
    const groupName = document.getElementById("groupName").value.trim();
    const members = document.getElementById("groupMembers").value.trim();

    if (groupName && members) {
      ws.send(
        JSON.stringify({
          type: "createGroup",
          groupName,
          members: members.split(",").map((m) => m.trim()),
        })
      );
      document.body.removeChild(modal);
      refreshContacts();
    }
  };
}

///*new code*************************************** */
function refreshContacts() {
  ws.send(JSON.stringify({ type: "userList" }));
}
