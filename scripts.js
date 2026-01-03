import { marked } from "marked";
// fetch json from strapi API 
// and populate the list
const apiURL = "http://localhost:1337/api/posts";
const listContainer = document.querySelector(".list-wr ul")

    fetch(apiURL, {
        headers: {
        "Accept": "application/json"
        }
    })
        .then(res => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Expected JSON, got ${contentType || 'unknown content type'}`);
        }
        return res.json();
        })
        .then(data => {

        const posts = data.data;
        if (!posts.length) {
            listContainer.innerHTML = `<li>No posts available.</li>`;
            return;
        } 

        listContainer.innerHTML = '';

        posts.forEach(post => {
            const li = document.createElement('li');
            const title = post.Title || 'Untitled';
            const slug = post.Slug || '#';

            li.innerHTML = `<a href="/posts/${slug}.html">${title}</a>`;
            listContainer.appendChild(li);
        });
        })
        .catch(err => {
            console.error('Failed to fetch posts:', err);
            listContainer.innerHTML = '<li>Failed to load posts.</li>';
        });

// populate content for each post
document.addEventListener("DOMContentLoaded", () => {

    const container = document.querySelector(".container");
    const path = window.location.pathname;
    const slug = path.split('/').pop().replace(".html", "");

    const apiURL = `http://localhost:1337/api/posts?filters[Slug]=${slug}`;
    fetch(apiURL, {
        heades: {
            "Accept": "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        const post = data.data[0];
        if (!post) {
            container.innerHTML = "<p>Post Not Found.</p>";
            return;
        }
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
    })
    .catch(err => {
        console.error("Failed to load posts:", err)
        container.innerHTML = "<p>Failed to load posts.</p>";
    });
});