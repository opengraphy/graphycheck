//open options page on install
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.set({ options: { model: "gpt-4o", overline: true } });

  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }
});

//create context menu
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "convertToChatGPT",
    title: "Corriger le texte",
    contexts: ["selection"],
  });
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
          <p class="brand-footer">
            By Opengraphy 
          </p>
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
                <p class="spellingCorrection">Correction orthographique</p>
                <p class="grammarCorrection">Correction grammaticale</p>
              </div>` + displayText;
          }
          document.querySelector(".modal-container-body").innerHTML =
            displayText;

          document
            .getElementById("confirmButton")
            .addEventListener("click", () => {
              replaceSelectionWithText(range, text);
              closeModal();
            });
        }
      });
    } else {
      document.querySelector(".modal-container-body").innerHTML =
        '<div style="text-align:center;"><p class="error" style="margin:0;">Veuillez renseigner une clé API valide dans les options de l\'extension</p><button id="goToOption" class="button is-primary" style="margin-top:12px;">Go to options</button></div>';
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
    const { apiKey, overline, model } = options;

    let content = `Tu es un assistant qui corrige l'orthographe et la grammaire dans du HTML. 
        Pour les éléments ayant l'attribut aria-invalid="spelling", supprime tous les attributs de cet élément. 
        Pour les éléments ayant l'attribut aria-invalid="grammar", supprime tous les attributs de cet élément. 
        Corrige également les erreurs d'orthographe et de grammaire dans le texte tout en conservant le formatage d'origine.
        sans entourer la réponse de blocs de code comme \`\`\` ou \`\`\`html`;

    if (overline) {
      content = `Tu es un assistant qui corrige l'orthographe et la grammaire dans du HTML. 
        Pour les éléments ayant l'attribut aria-invalid="spelling", supprime tous les attributs de cet élément et leur rajouter la classe "spellingCorrection". 
        Pour les éléments ayant l'attribut aria-invalid="grammar", supprime tous les attributs de cet élément et leur rajouter la classe "grammarCorrection". 
        Corrige également les erreurs d'orthographe et de grammaire dans le texte tout en conservant le formatage d'origine.
        sans entourer la réponse de blocs de code comme \`\`\` ou \`\`\`html`;
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
          chrome.runtime.sendMessage({ action: "openOptions" });
        });
        return;
      }
    }

    const data = await response.json();

    return data.choices[0].message.content;
  }
}
