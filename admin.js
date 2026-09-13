const loginView = document.querySelector("[data-login-view]");
const dashboard = document.querySelector("[data-dashboard]");
const loginForm = document.querySelector("[data-login-form]");
const loginError = document.querySelector("[data-login-error]");
const editorForm = document.querySelector("[data-editor-form]");
const toast = document.querySelector("[data-toast]");
const focusEditor = document.querySelector("[data-focus-editor]");
const researchEditor = document.querySelector("[data-research-editor]");
const publicationEditor = document.querySelector("[data-publication-editor]");

let content = window.EPSRContent.loadContent();

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.setTimeout(() => {
    toast.hidden = true;
  }, 2200);
}

function valueAt(path) {
  return path.split(".").reduce((target, key) => target?.[key], content) ?? "";
}

function setAt(path, value) {
  const parts = path.split(".");
  let target = content;
  parts.slice(0, -1).forEach((part) => {
    if (!(part in target)) target[part] = {};
    target = target[part];
  });
  target[parts.at(-1)] = value;
}

function field(name) {
  return editorForm?.elements.namedItem(name);
}

function fillSimpleFields() {
  editorForm?.querySelectorAll("[name]").forEach((input) => {
    if (input.name.startsWith("settings.")) return;
    input.value = valueAt(input.name);
  });
}

function itemCard(title, innerHtml, removeType, index) {
  return `
    <article class="repeater-item">
      <div class="repeater-title">
        <strong>${title}</strong>
        <button class="remove-button" type="button" data-remove="${removeType}" data-index="${index}">Remove</button>
      </div>
      ${innerHtml}
    </article>
  `;
}

function renderRepeaters() {
  if (focusEditor) {
    focusEditor.innerHTML = content.focusAreas
      .map((item, index) =>
        itemCard(
          `Focus area ${index + 1}`,
          `
            <div class="field-grid">
              <label>Label <input data-array="focusAreas" data-index="${index}" data-key="label" value="${escapeAttr(item.label)}"></label>
              <label>Description <textarea data-array="focusAreas" data-index="${index}" data-key="text" rows="3">${escapeHtml(item.text)}</textarea></label>
            </div>
          `,
          "focusAreas",
          index
        )
      )
      .join("");
  }

  if (researchEditor) {
    researchEditor.innerHTML = content.research.posts
      .map((item, index) =>
        itemCard(
          `Research post ${index + 1}`,
          `
            <label>Title <input data-array="research.posts" data-index="${index}" data-key="title" value="${escapeAttr(item.title)}"></label>
            <label>Summary <textarea data-array="research.posts" data-index="${index}" data-key="summary" rows="3">${escapeHtml(item.summary)}</textarea></label>
          `,
          "research.posts",
          index
        )
      )
      .join("");
  }

  if (publicationEditor) {
    publicationEditor.innerHTML = content.publication.posts
      .map((item, index) =>
        itemCard(
          `Publication ${index + 1}`,
          `
            <div class="field-grid">
              <label>Type <input data-array="publication.posts" data-index="${index}" data-key="type" value="${escapeAttr(item.type)}"></label>
              <label>Date label <input data-array="publication.posts" data-index="${index}" data-key="date" value="${escapeAttr(item.date)}"></label>
            </div>
            <label>Title <input data-array="publication.posts" data-index="${index}" data-key="title" value="${escapeAttr(item.title)}"></label>
            <label>Machine date <input data-array="publication.posts" data-index="${index}" data-key="datetime" value="${escapeAttr(item.datetime)}"></label>
          `,
          "publication.posts",
          index
        )
      )
      .join("");
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function collectionFor(path) {
  if (path === "focusAreas") return content.focusAreas;
  if (path === "research.posts") return content.research.posts;
  if (path === "publication.posts") return content.publication.posts;
  return [];
}

function readArrayEditors() {
  editorForm?.querySelectorAll("[data-array]").forEach((input) => {
    const collection = collectionFor(input.dataset.array);
    const item = collection[Number(input.dataset.index)];
    if (item) item[input.dataset.key] = input.value;
  });
}

function readSimpleFields() {
  editorForm?.querySelectorAll("[name]").forEach((input) => {
    if (input.name.startsWith("settings.")) return;
    setAt(input.name, input.value);
  });
}

function saveAll() {
  readSimpleFields();
  readArrayEditors();

  const passwordInput = field("settings.password");
  if (passwordInput?.value.trim()) {
    window.EPSRContent.setPassword(passwordInput.value.trim());
    passwordInput.value = "";
  }

  content = window.EPSRContent.saveContent(content);
  fillSimpleFields();
  renderRepeaters();
  showToast("Saved. Refresh the public site to see the changes.");
}

function showDashboard() {
  loginView.hidden = true;
  dashboard.hidden = false;
  fillSimpleFields();
  renderRepeaters();
}

function showLogin() {
  loginView.hidden = false;
  dashboard.hidden = true;
}

loginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const password = new FormData(loginForm).get("password");
  if (!window.EPSRContent.login(String(password))) {
    loginError.hidden = false;
    return;
  }
  loginError.hidden = true;
  showDashboard();
});

document.querySelector("[data-logout]")?.addEventListener("click", () => {
  window.EPSRContent.logout();
  showLogin();
});

document.querySelector("[data-save]")?.addEventListener("click", saveAll);

document.querySelector("[data-add-focus]")?.addEventListener("click", () => {
  content.focusAreas.push({ label: "New focus area", text: "Describe this focus area." });
  renderRepeaters();
});

document.querySelector("[data-add-research]")?.addEventListener("click", () => {
  content.research.posts.push({ title: "New research post", summary: "Write a short summary." });
  renderRepeaters();
});

document.querySelector("[data-add-publication]")?.addEventListener("click", () => {
  content.publication.posts.push({
    type: "Article",
    title: "New publication title",
    date: "September 2026",
    datetime: "2026-09",
  });
  renderRepeaters();
});

editorForm?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  const collection = collectionFor(button.dataset.remove);
  collection.splice(Number(button.dataset.index), 1);
  renderRepeaters();
});

document.querySelector("[data-export]")?.addEventListener("click", () => {
  readSimpleFields();
  readArrayEditors();
  const output = document.querySelector("[data-export-output]");
  output.value = JSON.stringify(content, null, 2);
  output.hidden = false;
  showToast("Export ready.");
});

document.querySelector("[data-import]")?.addEventListener("click", () => {
  const input = field("settings.import");
  if (!input?.value.trim()) return;
  try {
    content = JSON.parse(input.value);
    content = window.EPSRContent.saveContent(content);
    input.value = "";
    fillSimpleFields();
    renderRepeaters();
    showToast("Imported and saved.");
  } catch (error) {
    showToast("Import failed. Check the JSON format.");
  }
});

document.querySelector("[data-reset]")?.addEventListener("click", () => {
  if (!confirm("Reset all local content to the default version?")) return;
  content = window.EPSRContent.resetContent();
  fillSimpleFields();
  renderRepeaters();
  showToast("Content reset.");
});

if (window.EPSRContent.isLoggedIn()) {
  showDashboard();
} else {
  showLogin();
}
