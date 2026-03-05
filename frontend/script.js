function appendMessage(role, text) {
  const replySection = document.getElementById("reply");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}`;
  msgDiv.innerText = text;
  replySection.appendChild(msgDiv);
  replySection.scrollTop = replySection.scrollHeight;
}

function showLoading() {
  const replySection = document.getElementById("reply");
  const loadingDiv = document.createElement("div");
  loadingDiv.id = "loading-indicator";
  loadingDiv.className = "message system loading";
  loadingDiv.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  replySection.appendChild(loadingDiv);
  replySection.scrollTop = replySection.scrollHeight;
}

function removeLoading() {
  const loadingDiv = document.getElementById("loading-indicator");
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

async function sendMessage() {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();
  if (!message) return;

  // Append user message
  appendMessage('user', message);
  messageInput.value = "";

  showLoading();

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    removeLoading();
    appendMessage('bot', data.reply);
  } catch (error) {
    removeLoading();
    appendMessage('error', "❌ Error: Backend not reachable");
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const messageInput = document.getElementById("message");
  if (messageInput) {
    messageInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        sendMessage();
      }
    });
  }

  // Drag and Drop Logic
  const dropzone = document.getElementById("image-dropzone");
  const fileInput = document.getElementById("image-input");

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        handleImageUpload(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length) {
        handleImageUpload(e.target.files[0]);
      }
    });
  }
});

async function handleImageUpload(file) {
  if (!file.type.startsWith("image/")) {
    appendMessage("error", "Please upload a valid image file.");
    return;
  }

  appendMessage("user", `[Uploaded Image: ${file.name}]`);
  showLoading();

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch("/detect", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    removeLoading();
    appendMessage("bot", data.reply);
  } catch (error) {
    removeLoading();
    appendMessage("error", "❌ Error: Failed to process image.");
    console.error(error);
  }
}
