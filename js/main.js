// Header turns solid after scrolling past the top
const bar = document.querySelector(".topbar");
const onScroll = () => bar.classList.toggle("is-solid", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// YouTube: load the real player only when clicked (keeps the page fast)
document.querySelectorAll(".yt").forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = document.createElement("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.id}?autoplay=1&rel=0`;
    f.title = "TWINLΞSS on YouTube";
    f.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    btn.replaceWith(f);
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
