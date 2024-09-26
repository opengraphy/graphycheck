window.onload = async () => {
  chrome.storage.local.get("options", function (result) {
    const options = result?.options;
    if (options?.apiKey) {
      document.querySelector("#apiKeyInput").value = options?.apiKey;
    }
    document.querySelector("#model").value = options.model;
    document.querySelector("#overlineInput").checked = options.overline;
  });
};

document.querySelector("#saveOption").addEventListener("click", () => {
  const apiKey = document.querySelector("#apiKeyInput").value;
  const model = document.querySelector("#model").value;
  const overline = document.querySelector("#overlineInput").checked;

  const options = { apiKey, model, overline };
  chrome.storage.local.set({ options });

  document.getElementById("infoContainer").style.display = "flex";
});

document.querySelector("#resetApiKey").addEventListener("click", () => {
  chrome.storage.local.get("options", function (result) {
    const options = result?.options;
    delete options?.apiKey;
    chrome.storage.local.set({ options });
  });
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
