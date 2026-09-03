const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?/_失去愛戰記憶";

function scrambleElement(el, duration = 800) {
    const original = el.dataset.original || el.textContent;
    let frame = 0;
    const total = Math.max(12, Math.floor(duration / 45));

    el.classList.add("is-active");

    const timer = setInterval(() => {
        const progress = frame / total;

        el.textContent = original
            .split("")
            .map((char, i) => {
                if (char === " ") return " ";
                if (i / original.length < progress) return original[i];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        frame++;

        if (frame > total) {
            clearInterval(timer);
            el.textContent = original;
            el.classList.remove("is-active");
        }
    }, 45);
}

const button = document.getElementById("distortBtn");
const targets = document.querySelectorAll(".scramble");

button.addEventListener("click", () => {
    document.body.classList.remove("distorted");
    void document.body.offsetWidth;
    document.body.classList.add("distorted");

    targets.forEach((target, index) => {
        setTimeout(() => scrambleElement(target, 950), index * 180);
    });
});

targets.forEach(target => {
    target.addEventListener("mouseenter", () => scrambleElement(target, 650));
});
