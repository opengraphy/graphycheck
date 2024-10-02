let infoContainerTimer;

window.onload = async () => {
  chrome.storage.local.get("options", function (result) {
    const options = result?.options;
    if (options?.apiKey) {
      document.querySelector("#apiKeyInput").value = options?.apiKey;
    }
    document.querySelector("#model").value = options.model;
    document.querySelector("#overlineInput").checked = options.overline;
    document.querySelector("#errorTooltipInput").checked = options.errorTooltip;

    toggleErrorTooltipVisibility();
  });
};

document.querySelector("#saveOption").addEventListener("click", () => {
  const apiKey = document.querySelector("#apiKeyInput").value;
  const model = document.querySelector("#model").value;
  const overline = document.querySelector("#overlineInput").checked;
  let errorTooltip = document.querySelector("#errorTooltipInput").checked;

  if (!overline) {
    errorTooltip = false;
  }

  const options = { apiKey, model, overline, errorTooltip };
  chrome.storage.local.set({ options });

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

document.getElementById("overlineInput").addEventListener("change", () => {
  toggleErrorTooltipVisibility();
});

function toggleErrorTooltipVisibility() {
  const overline = document.querySelector("#overlineInput").checked;
  if (!overline) {
    document.getElementById("errorTooltipOption").style.display = "none";
  } else {
    document.getElementById("errorTooltipOption").style.display = "flex";
  }
}
