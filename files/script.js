/* =====================================================
   ★作品データ：ここを書き換えるだけで作品を追加・差し替えできます
   category : "3dcg" | "movie" | "image"
   thumb    : サムネイル画像（picsum.photosはダミー → 自分の画像パスに差し替え）
   src      : image→大きい画像 / movie→動画ファイル(.mp4)
   embed    : YouTube等の埋め込みURL（あれば srcより優先）
   ===================================================== */
const WORKS = [
  { title:"Neon Alley",   category:"3dcg",  thumb:"https://picsum.photos/seed/w1/800/600", src:"https://picsum.photos/seed/w1/1600/900", desc:"Blenderで制作した夜の路地の背景モデル。" },
  { title:"Mecha Unit 07",category:"3dcg",  thumb:"https://picsum.photos/seed/w2/800/600", src:"https://picsum.photos/seed/w2/1600/900", desc:"ハードサーフェスのロボットモデル。Substance Painterでテクスチャ。" },
  { title:"Orbit Loop",   category:"movie", thumb:"https://picsum.photos/seed/w3/800/600", embed:"https://www.youtube.com/embed/dQw4w9WgXcQ", desc:"ループアニメーション作品。（YouTubeのURLに差し替え）" },
  { title:"Studio Reel",  category:"movie", thumb:"https://picsum.photos/seed/w4/800/600", src:"videos/reel.mp4", desc:"制作リール。（videos/reel.mp4 を配置）" },
  { title:"Glass Bloom",  category:"image", thumb:"https://picsum.photos/seed/w5/800/600", src:"https://picsum.photos/seed/w5/1600/900", desc:"ガラス質感のライティング検証。" },
  { title:"Quiet Room",   category:"image", thumb:"https://picsum.photos/seed/w6/800/600", src:"https://picsum.photos/seed/w6/1600/900", desc:"静けさをテーマにしたインテリアレンダー。" },
];

const $ = (s, el = document) => el.querySelector(s);
const grid = $("#grid"), modal = $("#modal");

/* --- ギャラリー描画 --- */
const LABEL = { "3dcg":"3DCG", movie:"Movie", image:"Image" };
function render(filter = "all") {
  grid.innerHTML = "";
  WORKS.map((w, i) => ({ ...w, i }))
    .filter(w => filter === "all" || w.category === filter)
    .forEach((w, n) => {
      const c = document.createElement("button");
      c.className = "card";
      c.style.animationDelay = n * 70 + "ms";
      c.innerHTML = `<img src="${w.thumb}" alt="${w.title}" loading="lazy">
        <span class="card__ov"><b>${w.title}</b><small>${LABEL[w.category]}</small></span>`;
      c.onclick = () => openModal(w.i);
      grid.appendChild(c);
    });
}
render();

/* --- フィルター --- */
document.querySelectorAll(".filters button").forEach(b => b.onclick = () => {
  document.querySelector(".filters .is-active").classList.remove("is-active");
  b.classList.add("is-active");
  render(b.dataset.filter);
});

/* --- モーダル --- */
function openModal(i) {
  const w = WORKS[i];
  $("#mMedia").innerHTML = w.embed
    ? `<iframe src="${w.embed}" allowfullscreen></iframe>`
    : w.category === "movie"
      ? `<video src="${w.src}" controls autoplay playsinline></video>`
      : `<img src="${w.src}" alt="${w.title}">`;
  $("#mTitle").textContent = w.title;
  $("#mDesc").textContent = w.desc;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  $("#mMedia").innerHTML = "";          // 動画の再生を止める
  document.body.style.overflow = "";
}
$("#close").onclick = closeModal;
modal.onclick = e => { if (e.target === modal) closeModal(); };
addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* --- スクロール連動：ナビ背景 & ふわっと表示 --- */
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("is-solid", scrollY > 40), { passive:true });
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}), { threshold:.15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* --- お問い合わせ（メールアプリを開く） ---
   ★ your@example.com を自分のアドレスに変更してください */
$("#form").onsubmit = e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = `${f.get("msg")}\n\n${f.get("name")} (${f.get("email")})`;
  location.href = `mailto:your@example.com?subject=${encodeURIComponent("ポートフォリオより")}&body=${encodeURIComponent(body)}`;
};

/* --- 背景：頂点を線でつないだメッシュ風パーティクル --- */
(() => {
  const cv = $("#bg"), ctx = cv.getContext("2d");
  let W, H, pts = [], mouse = { x:-999, y:-999 };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function size() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    pts = Array.from({ length: Math.min(90, Math.floor(W * H / 16000)) }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3 }));
  }
  addEventListener("resize", size);
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  function frame() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach((p, i) => {
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = "rgba(139,123,255,.7)";
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 140) { ctx.strokeStyle = `rgba(139,123,255,${.18 * (1 - d / 140)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      const m = Math.hypot(p.x - mouse.x, p.y - mouse.y);   // マウス付近は珊瑚色の線で反応
      if (m < 160) { ctx.strokeStyle = `rgba(255,154,139,${.4 * (1 - m / 160)})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    if (!reduce) requestAnimationFrame(frame);
  }
  size(); frame();
})();
