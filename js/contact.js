// ===================================================================
// Kontakt forma — bez backend servera ova forma samo prikazuje
// poruku o uspehu. Za pravo slanje email-a, povežite je sa servisom
// poput Formspree, EmailJS ili sopstvenim serverom (POST na /api/...).
// ===================================================================
const form = document.getElementById("contactForm");
const success = document.getElementById("formSuccess");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    success.classList.add("show");
    form.reset();
    success.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
