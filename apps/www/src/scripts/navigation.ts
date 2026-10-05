document.addEventListener("click", (event) => {
  const header = document.querySelector("header");
  if (event.target instanceof Node && !header?.contains(event.target)) {
    for (const details of document.querySelectorAll<HTMLDetailsElement>(
      "header details[open]"
    )) {
      details.open = false;
    }
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !(event.target instanceof Element)) {
    return;
  }
  const details = event.target.closest<HTMLDetailsElement>(
    "header details[open]"
  );
  if (!details) {
    return;
  }
  details.open = false;
  details.querySelector("summary")?.focus();
  event.preventDefault();
});
