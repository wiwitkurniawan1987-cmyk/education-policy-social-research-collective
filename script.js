const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const header = document.querySelector("[data-header]");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const content = window.EPSRContent?.loadContent();

const text = (selector, value) => {
  const element = document.querySelector(selector);
  if (element && value !== undefined) element.textContent = value;
};

function renderPublicContent() {
  if (!content) return;

  document.title = content.site.title;
  document.querySelector("[data-site-title-aria]")?.setAttribute("aria-label", content.site.title);
  text("[data-site-title]", content.site.title);
  text("[data-site-location]", content.site.location);
  text("[data-hero-kicker]", content.site.kicker);
  text("[data-hero-title]", content.site.heroTitle);
  text("[data-hero-lead]", content.site.heroLead);
  text("[data-primary-action]", content.site.primaryAction);
  text("[data-secondary-action]", content.site.secondaryAction);
  text("[data-profile-kicker]", content.profile.kicker);
  text("[data-profile-title]", content.profile.title);
  text("[data-profile-note-title]", content.profile.noteTitle);
  text("[data-profile-note-body]", content.profile.noteBody);
  text("[data-research-kicker]", content.research.kicker);
  text("[data-research-title]", content.research.title);
  text("[data-research-intro]", content.research.intro);
  text("[data-publication-kicker]", content.publication.kicker);
  text("[data-publication-title]", content.publication.title);
  text("[data-publication-intro]", content.publication.intro);
  text("[data-footer-title]", content.site.title);
  text("[data-footer-note]", content.site.footerNote);

  const footerEmail = document.querySelector("[data-footer-email]");
  if (footerEmail) {
    footerEmail.textContent = content.site.email;
    footerEmail.href = `mailto:${content.site.email}`;
  }

  const profileParagraphs = document.querySelector("[data-profile-paragraphs]");
  if (profileParagraphs) {
    profileParagraphs.innerHTML = content.profile.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  }

  const focusList = document.querySelector("[data-focus-list]");
  if (focusList) {
    focusList.innerHTML = content.focusAreas
      .map((item) => `<article><span>${escapeHtml(item.label)}</span><p>${escapeHtml(item.text)}</p></article>`)
      .join("");
  }

  const researchList = document.querySelector("[data-research-list]");
  if (researchList) {
    researchList.innerHTML = content.research.posts
      .map(
        (item, index) => `
          <article class="research-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
          </article>
        `
      )
      .join("");
  }

  const publicationList = document.querySelector("[data-publication-list]");
  if (publicationList) {
    publicationList.innerHTML = content.publication.posts
      .map(
        (item) => `
          <article class="publication-item">
            <div>
              <span>${escapeHtml(item.type)}</span>
              <h3>${escapeHtml(item.title)}</h3>
            </div>
            <time datetime="${escapeHtml(item.datetime)}">${escapeHtml(item.date)}</time>
          </article>
        `
      )
      .join("");
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

renderPublicContent();

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  {
    rootMargin: "-30% 0px -55% 0px",
    threshold: [0.15, 0.35, 0.55],
  }
);

document.querySelectorAll("main section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

window.addEventListener("scroll", () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
});
