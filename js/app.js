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
    saveSubscriptions();
    displayMonthlySpending();
    displayYearlySpending();

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

function isUpcomingPayment(nextPaymentDate, days = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paymentDate = new Date(`${nextPaymentDate}T00:00:00`);

    if (Number.isNaN(paymentDate.getTime())) {
        return false;
    }

    const differenceInMilliseconds =
        paymentDate.getTime() - today.getTime();
    const differenceInDays =
        differenceInMilliseconds / (1000 * 60 * 60 * 24);

    return differenceInDays >= 0 && differenceInDays <= days;
}

function displaySubscriptions() {
    const subscriptionGrid =
        document.getElementById("subscription-grid");

    if (!subscriptionGrid) {
        return;
    }

    subscriptionGrid.innerHTML = "";

    const filteredSubscriptions =
        subscriptions.filter((subscription) => {
            const matchesSearch =
                subscription.name
                    .toLowerCase()
                    .includes(
                        subscriptionSearchQuery.toLowerCase()
                    );

            const matchesCategory =
                !subscriptionFilters.category ||
                subscription.category ===
                    subscriptionFilters.category;

            const matchesBillingCycle =
                !subscriptionFilters.billingCycle ||
                subscription.billingCycle ===
                    subscriptionFilters.billingCycle;

            const matchesStatus =
                !subscriptionFilters.status ||
                subscription.status ===
                    subscriptionFilters.status;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesBillingCycle &&
                matchesStatus
            );
        });

    if (filteredSubscriptions.length === 0) {
        const emptyMessage =
            document.createElement("p");
        emptyMessage.className =
            "subscription-search-empty";
        emptyMessage.textContent =
            subscriptionSearchQuery
                ? `No subscriptions found for "${subscriptionSearchQuery}".`
                : "No subscriptions added yet.";
        subscriptionGrid.appendChild(emptyMessage);
        return;
    }

    filteredSubscriptions.forEach((subscription) => {
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

        if (isUpcomingPayment(subscription.nextPaymentDate)) {
            nextPayment.classList.add("upcoming-payment");
        }

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

const SUBSCRIPTIONS_STORAGE_KEY =
    "subtrack_subscriptions";
const subscriptions = [];

function loadSubscriptions() {
    const storedSubscriptions =
        localStorage.getItem(
            SUBSCRIPTIONS_STORAGE_KEY
        );

    if (!storedSubscriptions) {
        return;
    }

    try {
        const parsedSubscriptions =
            JSON.parse(storedSubscriptions);

        if (!Array.isArray(parsedSubscriptions)) {
            return;
        }

        const validSubscriptions =
            parsedSubscriptions.filter((subscription) =>
                subscription &&
                typeof subscription === "object" &&
                typeof subscription.id === "string" &&
                typeof subscription.name === "string"
            );

        subscriptions.push(...validSubscriptions);
    } catch (error) {
        console.error(
            "Failed to load subscriptions:",
            error
        );
    }
}

function saveSubscriptions() {
    localStorage.setItem(
        SUBSCRIPTIONS_STORAGE_KEY,
        JSON.stringify(subscriptions)
    );
}

function calculateMonthlySpending() {
    return subscriptions.reduce((total, subscription) => {
        const price = Number(subscription.price);

        if (subscription.billingCycle === "weekly") {
            return total + (price * 52) / 12;
        }

        if (subscription.billingCycle === "monthly") {
            return total + price;
        }

        if (subscription.billingCycle === "yearly") {
            return total + price / 12;
        }

        return total;
    }, 0);
}

function calculateYearlySpending() {
    return subscriptions.reduce((total, subscription) => {
        const price = Number(subscription.price);

        if (subscription.billingCycle === "weekly") {
            return total + price * 52;
        }

        if (subscription.billingCycle === "monthly") {
            return total + price * 12;
        }

        if (subscription.billingCycle === "yearly") {
            return total + price;
        }

        return total;
    }, 0);
}

function displayMonthlySpending() {
    const monthlySpendingValue =
        document.getElementById("monthly-spending-value");

    if (!monthlySpendingValue) {
        return;
    }

    const monthlySpending =
        calculateMonthlySpending();

    monthlySpendingValue.textContent =
        `KSh ${monthlySpending.toFixed(2)}`;
}

function displayYearlySpending() {
    const yearlySpendingValue =
        document.getElementById("yearly-spending-value");

    if (!yearlySpendingValue) {
        return;
    }

    const yearlySpending =
        calculateYearlySpending();

    yearlySpendingValue.textContent =
        `KSh ${yearlySpending.toFixed(2)}`;
}
let editingSubscriptionId = null;
let subscriptionSearchQuery = "";
let subscriptionFilters = {
    category: "",
    billingCycle: "",
    status: ""
};

const subscriptionForm = document.getElementById("subscription-form");
const subscriptionSearchInput =
    document.getElementById("subscription-search-input");
const categoryFilter =
    document.getElementById("category-filter");
const billingCycleFilter =
    document.getElementById("billing-cycle-filter");
const statusFilter =
    document.getElementById("status-filter");
const clearFiltersButton =
    document.getElementById("clear-filters-button");
const cancelEditButton = document.getElementById("cancel-edit-button");

loadSubscriptions();
displaySubscriptions();
displayMonthlySpending();
displayYearlySpending();

if (subscriptionSearchInput) {
    subscriptionSearchInput.addEventListener(
        "input",
        (event) => {
            subscriptionSearchQuery =
                event.target.value.trim();
            displaySubscriptions();
        }
    );
}

if (categoryFilter) {
    categoryFilter.addEventListener(
        "change",
        (event) => {
            subscriptionFilters.category =
                event.target.value;
            displaySubscriptions();
        }
    );
}

if (billingCycleFilter) {
    billingCycleFilter.addEventListener(
        "change",
        (event) => {
            subscriptionFilters.billingCycle =
                event.target.value;
            displaySubscriptions();
        }
    );
}

if (statusFilter) {
    statusFilter.addEventListener(
        "change",
        (event) => {
            subscriptionFilters.status =
                event.target.value;
            displaySubscriptions();
        }
    );
}

if (clearFiltersButton) {
    clearFiltersButton.addEventListener(
        "click",
        () => {
            subscriptionSearchQuery = "";
            subscriptionFilters = {
                category: "",
                billingCycle: "",
                status: ""
            };

            if (subscriptionSearchInput) {
                subscriptionSearchInput.value = "";
            }

            if (categoryFilter) {
                categoryFilter.value = "";
            }

            if (billingCycleFilter) {
                billingCycleFilter.value = "";
            }

            if (statusFilter) {
                statusFilter.value = "";
            }

            displaySubscriptions();
        }
    );
}

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

        saveSubscriptions();
        displaySubscriptions();
        displayMonthlySpending();
        displayYearlySpending();

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