const WORDPRESS_API = "https://public-api.wordpress.com/wp/v2/sites/eposrforum.wordpress.com";
const articleRoot = document.querySelector("[data-wordpress-article]");
const slug = new URLSearchParams(window.location.search).get("slug");

const plainText = (html = "") => {
  const element = document.createElement("div");
  element.innerHTML = html;
  return (element.textContent || "").trim();
};

const postCategory = (post) => {
  const terms = post._embedded?.["wp:term"]?.flat() || [];
  const category = terms.find((term) => term.taxonomy === "category" && term.slug !== "uncategorized");
  return category?.name || "Article";
};

const postImage = (post) => {
  return post.jetpack_featured_media_url || post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
};

const renderArticle = (post) => {
  const image = postImage(post);
  const author = post._embedded?.author?.[0]?.name || "EPSR Forum";
  const excerpt = plainText(post.excerpt.rendered);

  document.title = `${plainText(post.title.rendered)} | EPSR Forum`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", excerpt || "Article from the Education Policy and Social Research Forum.");

  articleRoot.innerHTML = `
    <header class="article-intro ${image ? "" : "article-intro-no-cover"}">
      <div class="article-intro-copy">
        <p class="section-kicker">${postCategory(post)}</p>
        <h1>${post.title.rendered}</h1>
        ${excerpt ? `<p class="article-deck">${excerpt}</p>` : ""}
        <dl class="book-details article-meta">
          <div><dt>Author</dt><dd>${author}</dd></div>
          <div><dt>Published</dt><dd>${formatDate(post.date)}</dd></div>
          <div><dt>Category</dt><dd>${postCategory(post)}</dd></div>
        </dl>
      </div>
      ${image ? `<figure class="article-cover"><img src="${image}" alt="" fetchpriority="high"></figure>` : ""}
    </header>
    <article class="article-body wordpress-content">${post.content.rendered}</article>
  `;
};

const renderError = () => {
  articleRoot.innerHTML = `
    <section class="article-error">
      <p class="section-kicker">Publication</p>
      <h1>Article not found.</h1>
      <p>The article may still be a draft, or its address may have changed.</p>
      <a class="text-link" href="index.html#publication">Return to Article &amp; Publication <span aria-hidden="true">&rarr;</span></a>
    </section>
  `;
};

const loadArticle = async () => {
  if (!slug || !articleRoot) {
    renderError();
    return;
  }

  try {
    const response = await fetch(`${WORDPRESS_API}/posts?slug=${encodeURIComponent(slug)}&_embed`);
    if (!response.ok) throw new Error(`WordPress returned ${response.status}`);
    const posts = await response.json();
    if (!posts.length) throw new Error("Article not found");
    renderArticle(posts[0]);
  } catch (error) {
    console.warn("WordPress article could not be loaded.", error);
    renderError();
  }
};

loadArticle();
