"use strict";

const navigationLinks = document.querySelectorAll(".nav-link");
const pageSections = document.querySelectorAll(".page-section");

navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();

        const targetSection = link.dataset.section;

        pageSections.forEach((section) => {
            section.classList.toggle(
                "hidden",
                section.id !== targetSection
            );
        });

        navigationLinks.forEach((navLink) => {
            navLink.classList.remove("active");
        });

        link.classList.add("active");
    });
});

console.log("SubTrack initialized.");

const subscriptionForm = document.getElementById("subscription-form");

if (subscriptionForm) {
    subscriptionForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(subscriptionForm);

        const subscription = createSubscription({
            name: formData.get("name"),
            category: formData.get("category"),
            price: formData.get("price"),
            billingCycle: formData.get("billingCycle"),
            nextPaymentDate: formData.get("nextPaymentDate"),
            status: formData.get("status")
        });

        console.log("New subscription:", subscription);

        subscriptionForm.reset();
    });
}