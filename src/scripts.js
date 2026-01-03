import { marked } from "marked";
import postsData from "/src/posts.json";

// fetch json from strapi API 
// and populate the list
const listContainer = document.querySelector(".list-wr ul")
if (listContainer) {
    const posts = postsData.data || [];
    listContainer.innerHTML = "";
    posts.forEach((post) => {
      const li = document.createElement("li");
      const title = post.Title || "Untitled";
      const slug = post.Slug || "#";
      li.innerHTML = `<a href="/posts/${slug}.html">${title}</a>`;
      listContainer.appendChild(li);
    });
  }
  
// populate content for each post
const container = document.querySelector(".container");
if (container) {
    const path = window.location.pathname;
    const slug = path.split('/').pop().replace(".html", "");

    const post = (postsData.data || []).find(p => p.Slug === slug);
    console.log(post)

    if (!post) {
        container.innerHTML = "<p>Post not Found.</p>";
    } else {
        const htmlContent = marked.parse(post.Content || "");
        document.title = post.Title;
        container.innerHTML = `
            <article class="post">
            <h1>${post.Title}</h1>
            <div class="post-body">
                ${htmlContent}
            </div>
            </article>
        `;
        }
}