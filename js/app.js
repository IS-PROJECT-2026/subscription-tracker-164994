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

function deleteSubscription(subscriptionId) {
    const subscription = subscriptions.find(
        (item) => item.id === subscriptionId
    );

    if (!subscription) {
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to delete "${subscription.name}"?`
    );

    if (!confirmed) {
        return;
    }

    const index = subscriptions.findIndex(
        (item) => item.id === subscriptionId
    );

    if (index === -1) {
        return;
    }

    subscriptions.splice(index, 1);

    if (editingSubscriptionId === subscriptionId && subscriptionForm) {
        editingSubscriptionId = null;
        subscriptionForm.reset();

        const submitButton =
            subscriptionForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.textContent = "Add Subscription";

        if (cancelEditButton) {
            cancelEditButton.hidden = true;
        }
    }

    displaySubscriptions();
}

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

        const actions = document.createElement("div");
        actions.className = "subscription-card-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "edit-subscription-button";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            startEditingSubscription(subscription.id);
        });

        actions.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-subscription-button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            deleteSubscription(subscription.id);
        });

        actions.appendChild(deleteButton);
        body.appendChild(actions);

        card.appendChild(header);
        card.appendChild(body);

        subscriptionGrid.appendChild(card);
    });
}

const subscriptions = [];
let editingSubscriptionId = null;

const subscriptionForm = document.getElementById("subscription-form");
const cancelEditButton = document.getElementById("cancel-edit-button");

function startEditingSubscription(subscriptionId) {
    const subscription = subscriptions.find(
        (item) => item.id === subscriptionId
    );

    if (!subscription || !subscriptionForm) {
        return;
    }

    editingSubscriptionId = subscriptionId;

    document.getElementById("subscription-name").value =
        subscription.name;
    document.getElementById("subscription-category").value =
        subscription.category;
    document.getElementById("subscription-price").value =
        subscription.price;
    document.getElementById("billing-cycle").value =
        subscription.billingCycle;
    document.getElementById("next-payment-date").value =
        subscription.nextPaymentDate;
    document.getElementById("subscription-status").value =
        subscription.status;

    const submitButton =
        subscriptionForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.textContent = "Update Subscription";

    if (cancelEditButton) {
        cancelEditButton.hidden = false;
    }

    subscriptionForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

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

        if (editingSubscriptionId) {
            const index = subscriptions.findIndex(
                (item) => item.id === editingSubscriptionId
            );

            if (index !== -1) {
                subscriptions[index] = {
                    ...subscription,
                    id: editingSubscriptionId
                };
            }

            editingSubscriptionId = null;
        } else {
            subscriptions.push(subscription);
        }

        displaySubscriptions();

        subscriptionForm.reset();

        const submitButton =
            subscriptionForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.textContent = "Add Subscription";

        if (cancelEditButton) {
            cancelEditButton.hidden = true;
        }
    });
}

if (cancelEditButton && subscriptionForm) {
    cancelEditButton.addEventListener("click", () => {
        editingSubscriptionId = null;
        subscriptionForm.reset();

        const submitButton =
            subscriptionForm.querySelector(
                'button[type="submit"]'
            );

        submitButton.textContent = "Add Subscription";
        cancelEditButton.hidden = true;
    });
}