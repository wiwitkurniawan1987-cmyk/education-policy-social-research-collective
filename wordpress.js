const WORDPRESS_API = "https://public-api.wordpress.com/wp/v2/sites/eposrforum.wordpress.com";
const publicationRoot = document.querySelector("[data-wordpress-publications]");
const publicationStatus = document.querySelector("[data-wordpress-status]");

const decodeEntities = (value = "") => {
  const element = document.createElement("textarea");
  element.innerHTML = value;
  return element.value;
};

const plainText = (html = "") => {
  const element = document.createElement("div");
  element.innerHTML = html;
  return (element.textContent || "").replace(/\u00a0/g, " ").trim();
};

const postCategory = (post) => {
  const terms = post._embedded?.["wp:term"]?.flat() || [];
  const category = terms.find((term) => term.taxonomy === "category" && term.slug !== "uncategorized");
  return category?.name || "Article";
};

const postImage = (post) => {
  return (
    post.jetpack_featured_media_url ||
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
    "assets/bloomington-study-hero.png"
  );
};

const postUrl = (post) => `article.html?slug=${encodeURIComponent(post.slug)}`;

const postDate = (post) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(post.date));
};

const featureMarkup = (post) => `
  <article class="publication-feature">
    <a class="publication-photo" href="${postUrl(post)}">
      <img src="${postImage(post)}" alt="" loading="lazy">
    </a>
    <div>
      <span>${postCategory(post)}</span>
      <h3><a href="${postUrl(post)}">${plainText(post.title.rendered)}</a></h3>
      <p>${plainText(post.excerpt.rendered)}</p>
      <a class="text-link" href="${postUrl(post)}">Read article <span aria-hidden="true">&rarr;</span></a>
    </div>
  </article>
`;

const itemMarkup = (post) => `
  <article class="publication-item">
    <a class="publication-item-photo" href="${postUrl(post)}">
      <img src="${postImage(post)}" alt="" loading="lazy">
    </a>
    <div>
      <span>${postCategory(post)}</span>
      <h3><a href="${postUrl(post)}">${plainText(post.title.rendered)}</a></h3>
    </div>
    <time datetime="${post.date_gmt || post.date}">${postDate(post)}</time>
  </article>
`;

const legacyItem = `
  <article class="publication-item">
    <a class="publication-item-photo" href="articles/american-philosophy-the-basics.html">
      <img src="assets/american-philosophy-cover.png" alt="Cover of American Philosophy: The Basics" loading="lazy">
    </a>
    <div>
      <span>Book discussion</span>
      <h3><a href="articles/american-philosophy-the-basics.html">Bedah Buku: <em>American Philosophy: The Basics</em></a></h3>
    </div>
    <time datetime="2026-09-25">September 25, 2026</time>
  </article>
`;

const loadWordPressPosts = async () => {
  if (!publicationRoot) return;

  try {
    const response = await fetch(`${WORDPRESS_API}/posts?_embed&per_page=10`);
    if (!response.ok) throw new Error(`WordPress returned ${response.status}`);

    const posts = (await response.json()).filter((post) => post.slug !== "hello-world");
    if (!posts.length) return;

    publicationRoot.innerHTML = `
      ${featureMarkup(posts[0])}
      <div class="publication-list">
        ${posts.slice(1).map(itemMarkup).join("")}
        ${legacyItem}
      </div>
    `;
  } catch (error) {
    console.warn("WordPress posts could not be loaded.", error);
    if (publicationStatus) publicationStatus.textContent = "Showing locally archived publications.";
  }
};

loadWordPressPosts();

