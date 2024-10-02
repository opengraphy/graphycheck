//open options page on install
chrome.runtime.onInstalled.addListener((details) => {
  chrome.contextMenus.create({
    id: "convertToChatGPT",
    title: "Corriger le texte",
    contexts: ["selection"],
  });

  chrome.storage.local.set({
    options: { model: "gpt-4o", overline: true, errorTooltip: true },
  });

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }
});

//open modal on context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "convertToChatGPT") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: showCustomModalWithSelection,
      args: [info.menuItemId],
    });
  }
});

//open options page function for button from modal
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "openOptions") {
    chrome.runtime.openOptionsPage();
  }
});

function showCustomModalWithSelection() {
  const modalHTML = `
  <div class="orthoGraphyModal">
    <div id="customModal" class="modal">
      <article class="modal-container">
        <header class="modal-container-header">
          <h1 class="modal-container-title">
            Correction du texte
          </h1>
          <button id="closeButton" class="icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <path fill="none" d="M0 0h24v24H0z" />
              <path fill="currentColor" d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
            </svg>
          </button>
        </header>
        <section class="modal-container-body rtf">
          <div class="loaderContainer">
            <span class="orthoBotLoader"></span>
            <p>Chargement</p>
          </div>
        </section>
        <footer class="modal-container-footer">
          <a
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              text-decoration: none;
            "
            href="https://www.opengraphy.com/" 
            target="_blank"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 600 600"
              width="32"
              height="32"
              preserveAspectRatio="xMidYMid meet"
            >
              <g>
                <path
                  fill="#444444"
                  d="M361.06 178.18c.55-.52 1.09-1.04 1.63-1.58 16.69-16.5 26.09-39 26.09-62.47.14-48.76-39.43-88.58-88.21-88.72h-.26c-48.66 0-88.32 39.52-88.45 88.21a88.189 88.189 0 0 0 26.81 63.62L166.9 300.73a88.295 88.295 0 0 0-24.07-3.4h-.25c-48.66 0-88.32 39.52-88.45 88.21s39.43 88.57 88.2 88.71h.25c41.04 0 75.68-28.13 85.6-66.14l142.53.41c9.82 38.01 44.35 66.23 85.41 66.35h.27c48.85-.51 88.04-40.53 87.53-89.38-.5-48.04-39.25-86.9-87.29-87.53h-.24a87.926 87.926 0 0 0-24.61 3.46m-199.3-187.74c.15-37.37 30.46-67.59 67.83-67.64h.2c37.46.56 67.37 31.38 66.81 68.83-.55 36.74-30.26 66.37-67 66.82h-.23c-37.43-.16-67.67-30.58-67.61-68.01zm-89.92 339.95h-.19c-37.46-.56-67.37-31.38-66.81-68.84.55-36.75 30.26-66.37 67.01-66.81h.19c37.46.56 67.37 31.38 66.81 68.84-.55 36.74-30.26 66.37-67.01 66.81zm270.06-144.07c-27.55 15.69-44.61 44.92-44.72 76.62v1.72l-136.9-.39v-1.45a88.54 88.54 0 0 0-44.96-77.26l69.12-118.89a87.975 87.975 0 0 0 44.9 12.42h.26c15.47.03 30.68-4.01 44.08-11.73m159.8 243.93a67.36 67.36 0 0 1-47.82 19.73h-.2c-37.46-.56-67.37-31.38-66.81-68.84.55-36.75 30.26-66.37 67.01-66.81h.19c37.46.11 67.75 30.56 67.64 68.02a67.818 67.818 0 0 1-20.01 47.91v-.01z"
                />
              </g>
              <g>
                <path
                  fill="#27ae5f" 
                  d="M542.02 155.38c-9.6-16.78-30.99-22.6-47.77-12.99-13.47 7.71-20.25 23.36-16.67 38.46l-164.53 94.36a23.873 23.873 0 0 0-26.6.76l-163.92-95.26c4.17-18.88-7.75-37.56-26.63-41.73-18.88-4.17-37.56 7.75-41.73 26.63-4.17 18.88 7.75 37.56 26.63 41.73 11.3 2.5 23.11-.76 31.54-8.69l164.14 95.39c0 .43-.04.86-.04 1.29a23.89 23.89 0 0 0 13.85 21.73l-.54 189.14c-18.43 5.83-28.65 25.5-22.82 43.93 5.83 18.43 25.5 28.65 43.93 22.82 18.43-5.83 28.65-25.5 22.82-43.93a35.005 35.005 0 0 0-23.31-22.97l.54-189.27a23.889 23.889 0 0 0 13.27-21.32c0-.93-.05-1.85-.16-2.78l163.99-94.05c14.25 13.06 36.4 12.09 49.46-2.16 10.31-11.24 12.15-27.87 4.55-41.09z"
                />
              </g>
            </svg>
            <p class="brand-footer">
              By Opengraphy 
            </p>
          </a>
          <div>
            <button id="cancelButton" class="button is-ghost">Annuler</button>
            <button id="confirmButton" class="button is-primary">Confirmer</button>
          </div>
        </footer>
      </article>
    </div>
  </div>
  `;

  const { range, selectedHtml } = getSelectionHtml();

  if (!range) return;

  const modalWrapper = document.createElement("div");
  modalWrapper.innerHTML = modalHTML;
  document.body.appendChild(modalWrapper);

  document.getElementById("cancelButton").addEventListener("click", closeModal);
  document.getElementById("closeButton").addEventListener("click", closeModal);

  chrome.storage.local.get("options", async function (result) {
    const options = result?.options;
    if (options?.apiKey) {
      let text = "";
      callChatGPT(selectedHtml, options).then((response) => {
        if (response) {
          text = response;
          displayText = text;
          if (options.overline) {
            displayText =
              `<div class="tagContainer">
                <p class="correction">Correction effectuée</p>
              </div>` + displayText;
          }
          document.querySelector(".modal-container-body").innerHTML =
            displayText;
          if (options.errorTooltip) {
            // Attacher les événements aux éléments contenant l'attribut data-fault
            document.querySelectorAll("[data-fault]").forEach((element) => {
              element.addEventListener("mouseover", showTooltip);
              element.addEventListener("mouseout", hideTooltip);
            });
          }

          document
            .getElementById("confirmButton")
            .addEventListener("click", () => {
              replaceSelectionWithText(range, text);
              closeModal();
              document.querySelectorAll("[data-fault]").forEach((element) => {
                element.removeEventListener("mouseover", showTooltip);
                element.removeEventListener("mouseout", hideTooltip);
              });
            });
        }
      });
    } else {
      document.querySelector(".modal-container-body").innerHTML =
        '<div style="text-align:center;"><p class="error" style="margin:0;">Veuillez renseigner une clé API valide dans les options de l\'extension</p><button id="goToOption" class="button is-primary" style="margin-top:12px;">Ouvrir les options</button></div>';
      document.getElementById("goToOption").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "openOptions" });
      });
    }
  });

  function getSelectionHtml() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    if (range.toString().trim() !== "") {
      const fragment = range.cloneContents();
      const div = document.createElement("div");
      div.appendChild(fragment);
      return {
        range: range,
        selectedHtml: div.innerHTML,
      };
    }
    closeModal();
    return {
      range: null,
      selectedHtml: "",
    };
  }

  function closeModal() {
    const modal = document.getElementById("customModal");
    if (modal) {
      modal.remove();
    }
  }

  function replaceSelectionWithText(range, newHtml) {
    if (newHtml.trim() === "") return;
    range.deleteContents();
    const div = document.createElement("div");
    div.innerHTML = newHtml;
    const fragment = document.createDocumentFragment();
    let node;
    while ((node = div.firstChild)) {
      fragment.appendChild(node);
    }
    range.insertNode(fragment);
  }

  async function callChatGPT(prompt, options) {
    const url = "https://api.openai.com/v1/chat/completions";
    const { apiKey, overline, model, errorTooltip } = options;

    let content = `Tu es un assistant qui corrige l'orthographe et la grammaire dans du HTML. 
        Supprime tous les attributs "aria-invalid" de tous les éléments ainsi que les classes "Lm ng" et "LI ng".
        Corrige également les erreurs d'orthographe et de grammaire dans le texte tout en conservant le formatage d'origine.
        sans entourer la réponse de blocs de code comme \`\`\` ou \`\`\`html`;

    if (overline) {
      content = `Tu es un assistant chargé de corriger l'orthographe et la grammaire dans du HTML.
        Supprime tous les attributs "aria-invalid" de tous les éléments ainsi que les classes "Lm ng" et "LI ng".
        Corrige également toutes les erreurs d'orthographe et de grammaire dans le texte, tout en conservant le formatage d'origine.  
        Encadre toutes les parties du texte corrigées avec un élément <span> ayant la classe "correction" et un attribut "data-fault" contenant le mot erroné d'origine.  
        Ne renvoie pas la réponse entourée de blocs de code comme  \`\`\` ou \`\`\`html`;
    }

    if (overline && errorTooltip) {
      content = `Tu es un assistant chargé de corriger l'orthographe et la grammaire dans du HTML.
        Supprime tous les attributs "aria-invalid" de tous les éléments ainsi que les classes "Lm ng" et "LI ng".
        Corrige également toutes les erreurs d'orthographe et de grammaire dans le texte, tout en conservant le formatage d'origine.  
        Encadre toutes les parties du texte corrigées avec un élément <span> ayant la classe "correction helpCursor" et un attribut "data-fault" contenant le mot erroné d'origine.  
        Ne renvoie pas la réponse entourée de blocs de code comme  \`\`\` ou \`\`\`html`;
    }

    const body = {
      model,
      messages: [
        {
          role: "system",
          content,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 4096,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 401) {
        document.querySelector(".modal-container-body").innerHTML =
          '<div style="text-align:center;"><p class="error" style="margin:0;">Veuillez renseigner une clé API valide dans les options de l\'extension</p><button id="goToOption" class="button is-primary" style="margin-top:12px;">Go to options</button></div>';
        document.getElementById("goToOption").addEventListener("click", () => {
          closeModal();
          chrome.runtime.sendMessage({ action: "openOptions" });
        });
        return;
      }
    }

    const data = await response.json();

    return data.choices[0].message.content;
  }

  // Fonction d'affichage du tooltip
  function showTooltip(event) {
    const target = event.currentTarget;
    const fault = target.getAttribute("data-fault");

    if (!fault) return;

    // Créer un élément tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "orthoGraphyModalTooltip";
    tooltip.innerText = fault;
    document.body.appendChild(tooltip);

    // Positionner le tooltip
    const rect = target.getBoundingClientRect();
    tooltip.style.position = "absolute";
    tooltip.style.left = `${
      rect.left + window.scrollX + target.offsetWidth / 2
    }px`;
    tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight}px`;

    // Sauvegarder la référence du tooltip dans l'élément
    target._tooltip = tooltip;
  }

  // Fonction de masquage du tooltip
  function hideTooltip(event) {
    const target = event.currentTarget;
    const tooltip = target._tooltip;

    if (tooltip) {
      document.body.removeChild(tooltip);
      target._tooltip = null;
    }
  }
}
