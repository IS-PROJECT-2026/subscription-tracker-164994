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

function displaySubscriptions() {
    const subscriptionGrid =
        document.getElementById("subscription-grid");

    if (!subscriptionGrid) {
        return;
    }

    subscriptionGrid.innerHTML = "";

    subscriptions.forEach((subscription) => {
        const card = document.createElement("article");

        card.className = "subscription-card";

        const header = document.createElement("div");
        header.className = "subscription-card-header";

        const details = document.createElement("div");

        const name = document.createElement("h4");
        name.textContent = subscription.name;

        const category = document.createElement("span");
        category.className = "subscription-category";
        category.textContent = subscription.category;

        details.appendChild(name);
        details.appendChild(category);

        const status = document.createElement("span");
        status.className =
            `subscription-status ${subscription.status}`;
        status.textContent = subscription.status;

        header.appendChild(details);
        header.appendChild(status);

        const body = document.createElement("div");
        body.className = "subscription-card-body";

        const price = document.createElement("p");
        price.className = "subscription-price";
        price.textContent =
            `KSh ${subscription.price.toLocaleString()}`;

        const billing = document.createElement("span");
        billing.textContent =
            ` / ${subscription.billingCycle}`;
        price.appendChild(billing);

        const nextPayment = document.createElement("p");
        nextPayment.className =
            "subscription-next-payment";
        nextPayment.textContent = "Next payment: ";

        const date = document.createElement("strong");
        date.textContent = subscription.nextPaymentDate;
        nextPayment.appendChild(date);

        body.appendChild(price);
        body.appendChild(nextPayment);

        card.appendChild(header);
        card.appendChild(body);

        subscriptionGrid.appendChild(card);
    });
}

const subscriptions = [];

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

        subscriptions.push(subscription);
        displaySubscriptions();

        subscriptionForm.reset();
    });
}