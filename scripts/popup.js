let infoContainerTimer;

window.onload = async () => {
  chrome.storage.local.get("options", function (result) {
    const options = result?.options;
    if (options?.apiKey) {
      document.querySelector("#apiKeyInput").value = options?.apiKey;
    }
  });
};

document.querySelector("#saveApiKey").addEventListener("click", () => {
  const apiKey = document.querySelector("#apiKeyInput").value;

  if (!apiKey) {
    return;
  }
  chrome.storage.local.get("options", function (result) {
    const options = result?.options;
    if (apiKey) {
      options.apiKey = apiKey;
      chrome.storage.local.set({ options });
    }
  });

  document.getElementById("infoContainer").style.display = "flex";
  document.getElementById("progressBar").style.animation =
    "loaderBar 5s linear";

  infoContainerTimer = setTimeout(() => {
    document.getElementById("progressBar").style.animation = "none";
    document.getElementById("infoContainer").style.display = "none";
  }, 4999);
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
  clearTimeout(infoContainerTimer);
  document.getElementById("infoContainer").style.display = "none";
});
