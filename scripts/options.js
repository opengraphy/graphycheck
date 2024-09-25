window.onload = async () => {
  chrome.storage.local.get("apiKey", function (result) {
    if (result?.apiKey) {
      document.querySelector("#apiKeyInput").value = result.apiKey;
    }
  });
};

document.querySelector("#saveApiKey").addEventListener("click", () => {
  const apiKey = document.querySelector("#apiKeyInput").value;
  if (apiKey) {
    chrome.storage.local.set({ apiKey });
    document.getElementById("infoContainer").style.display = "flex";
  }
});

document.querySelector("#resetApiKey").addEventListener("click", () => {
  chrome.storage.local.remove("apiKey");
  document.querySelector("#apiKeyInput").value = "";
});

document
  .querySelector("#toggleApiKeyVisibility")
  .addEventListener("click", () => {
    const apiKeyInput = document.querySelector("#apiKeyInput");
    apiKeyInput.type = apiKeyInput.type === "password" ? "text" : "password";
  });

document.getElementById("closeInfo").addEventListener("click", () => {
  document.getElementById("infoContainer").style.display = "none";
});
