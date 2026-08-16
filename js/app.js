"use strict";

const STORAGE_KEY = "subtrack_subscriptions";
const THEME_STORAGE_KEY = "subtrack_theme";
const subscriptions = [];

const state = {
    editingId: null,
    search: "",
    filters: { category: "", billingCycle: "", status: "" }
};

const el = {
    navLinks: document.querySelectorAll(".nav-link"),
    sections: document.querySelectorAll(".page-section"),
    form: document.getElementById("subscription-form"),
    subscriptionGrids: document.querySelectorAll("[data-subscription-grid]"),
    categoryList: document.getElementById("category-analysis-list"),
    cancelEditButton: document.getElementById("cancel-edit-button"),
    monthlyValue: document.getElementById("monthly-spending-value"),
    yearlyValue: document.getElementById("yearly-spending-value"),
    activeValue: document.getElementById("active-subscriptions-value"),
    searchInput: document.getElementById("subscription-search-input"),
    categoryFilter: document.getElementById("category-filter"),
    billingCycleFilter: document.getElementById("billing-cycle-filter"),
    statusFilter: document.getElementById("status-filter"),
    clearFiltersButton: document.getElementById("clear-filters-button"),
    themeToggle: document.getElementById("theme-toggle")
};

const monthlyFromCycle = {
    weekly: (price) => (price * 52) / 12,
    monthly: (price) => price,
    yearly: (price) => price / 12
};

const yearlyFromCycle = {
    weekly: (price) => price * 52,
    monthly: (price) => price * 12,
    yearly: (price) => price
};

function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function formatMoney(value) {
    return `KSh ${Number(value).toFixed(2)}`;
}

function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);

    if (saved === "dark" || saved === "light") {
        return saved;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
    document.body.dataset.theme = theme;

    if (el.themeToggle) {
        const isDark = theme === "dark";
        el.themeToggle.textContent = isDark ? "Day Mode" : "Night Mode";
        el.themeToggle.setAttribute("aria-pressed", String(isDark));
    }
}

function setTheme(theme) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
}

function isUpcomingPayment(nextPaymentDate, days = 7) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const paymentDate = new Date(`${nextPaymentDate}T00:00:00`);

    if (Number.isNaN(paymentDate.getTime())) {
        return false;
    }

    const diffDays = (paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= days;
}

function validateSubscriptionData(data) {
    const errors = {};
    const name = String(data.name || "").trim();
    const price = Number(data.price);

    if (!name) {
        errors.name = "Subscription name is required.";
    }

    if (data.price === "" || data.price === null || data.price === undefined || !Number.isFinite(price) || price <= 0) {
        errors.price = "Price must be greater than zero.";
    }

    if (!SUBSCRIPTION_CATEGORIES.includes(data.category)) {
        errors.category = "Please select a valid category.";
    }

    if (!BILLING_CYCLES.includes(data.billingCycle)) {
        errors.billingCycle = "Please select a valid billing cycle.";
    }

    if (!data.nextPaymentDate) {
        errors.nextPaymentDate = "Next payment date is required.";
    } else {
        const date = new Date(`${data.nextPaymentDate}T00:00:00`);
        const [year, month, day] = data.nextPaymentDate.split("-").map(Number);

        if (Number.isNaN(date.getTime()) || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
            errors.nextPaymentDate = "Please enter a valid payment date.";
        }
    }

    if (!SUBSCRIPTION_STATUSES.includes(data.status)) {
        errors.status = "Please select a valid status.";
    }

    return errors;
}

function isValidSubscription(subscription) {
    return Object.keys(validateSubscriptionData(subscription)).length === 0;
}

function loadSubscriptions() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        if (!Array.isArray(parsed)) {
            return;
        }

        const valid = parsed.filter(
            (item) => item && typeof item === "object" && typeof item.id === "string" && isValidSubscription(item)
        );

        subscriptions.push(...valid);

        if (valid.length !== parsed.length) {
            saveSubscriptions();
        }
    } catch (error) {
        console.error("Failed to load subscriptions:", error);
    }
}

function saveSubscriptions() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
    } catch (error) {
        console.error("Failed to save subscriptions:", error);
    }
}

function getMonthlyTotal() {
    return subscriptions.reduce((total, sub) => total + (monthlyFromCycle[sub.billingCycle]?.(Number(sub.price)) || 0), 0);
}

function getYearlyTotal() {
    return subscriptions.reduce((total, sub) => total + (yearlyFromCycle[sub.billingCycle]?.(Number(sub.price)) || 0), 0);
}

function getCategoryTotals() {
    return subscriptions.reduce((totals, sub) => {
        const amount = monthlyFromCycle[sub.billingCycle]?.(Number(sub.price)) || 0;
        totals[sub.category] = (totals[sub.category] || 0) + amount;
        return totals;
    }, {});
}

function getActiveCount() {
    return subscriptions.filter((sub) => sub.status === "active").length;
}

function clearValidationErrors() {
    document.querySelectorAll(".validation-error").forEach((node) => node.remove());
    document.querySelectorAll(".input-error").forEach((node) => node.classList.remove("input-error"));
}

function displayValidationErrors(errors) {
    clearValidationErrors();

    Object.entries(errors).forEach(([field, message]) => {
        const input = document.querySelector(`[name="${field}"]`);

        if (!input) {
            return;
        }

        input.classList.add("input-error");

        const msg = document.createElement("p");
        msg.className = "validation-error";
        msg.textContent = message;
        input.parentElement?.appendChild(msg);
    });
}

function setFormMode(isEditing) {
    if (!el.form) {
        return;
    }

    const submit = el.form.querySelector('button[type="submit"]');

    if (submit) {
        submit.textContent = isEditing ? "Update Subscription" : "Add Subscription";
    }

    if (el.cancelEditButton) {
        el.cancelEditButton.hidden = !isEditing;
    }
}

function resetFormState() {
    state.editingId = null;

    if (el.form) {
        el.form.reset();
    }

    clearValidationErrors();
    setFormMode(false);
}

function renderSummary() {
    if (el.monthlyValue) {
        el.monthlyValue.textContent = formatMoney(getMonthlyTotal());
    }

    if (el.yearlyValue) {
        el.yearlyValue.textContent = formatMoney(getYearlyTotal());
    }

    if (el.activeValue) {
        el.activeValue.textContent = String(getActiveCount());
    }
}

function matchesFilters(sub) {
    return sub.name.toLowerCase().includes(state.search.toLowerCase())
        && (!state.filters.category || sub.category === state.filters.category)
        && (!state.filters.billingCycle || sub.billingCycle === state.filters.billingCycle)
        && (!state.filters.status || sub.status === state.filters.status);
}

function renderSubscriptions() {
    if (!el.subscriptionGrids.length) {
        return;
    }

    const filtered = subscriptions.filter(matchesFilters);

    if (filtered.length === 0) {
        const message = state.search
            ? `No subscriptions found for "${escapeHtml(state.search)}".`
            : "No subscriptions added yet.";

        const emptyHtml = `<p class="subscription-search-empty">${message}</p>`;
        el.subscriptionGrids.forEach((grid) => {
            grid.innerHTML = emptyHtml;
        });
        return;
    }

    const cardsHtml = filtered.map((sub, index) => {
        const upcomingClass = isUpcomingPayment(sub.nextPaymentDate) ? " upcoming-payment" : "";

        return `
            <article class="subscription-card reveal" style="--i:${index}">
                <div class="subscription-card-header">
                    <div>
                        <h4>${escapeHtml(sub.name)}</h4>
                        <span class="subscription-category">${escapeHtml(sub.category)}</span>
                    </div>
                    <span class="subscription-status ${escapeHtml(sub.status)}">${escapeHtml(sub.status)}</span>
                </div>
                <div class="subscription-card-body">
                    <p class="subscription-price">
                        KSh ${Number(sub.price).toLocaleString()}<span> / ${escapeHtml(sub.billingCycle)}</span>
                    </p>
                    <p class="subscription-next-payment${upcomingClass}">
                        Next payment: <strong>${escapeHtml(sub.nextPaymentDate)}</strong>
                    </p>
                    <div class="subscription-card-actions">
                        <button type="button" class="edit-subscription-button" data-action="edit" data-id="${sub.id}">Edit</button>
                        <button type="button" class="delete-subscription-button" data-action="delete" data-id="${sub.id}">Delete</button>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    el.subscriptionGrids.forEach((grid) => {
        grid.innerHTML = cardsHtml;
    });
}

function renderCategorySpending() {
    if (!el.categoryList) {
        return;
    }

    const rows = Object.entries(getCategoryTotals()).sort(([, a], [, b]) => b - a);

    if (rows.length === 0) {
        el.categoryList.innerHTML = "<p>No subscription spending data available.</p>";
        return;
    }

    el.categoryList.innerHTML = rows
        .map(([category, amount], index) => `
            <div class="category-analysis-item reveal" style="--i:${index}">
                <span class="category-analysis-name">${escapeHtml(category)}</span>
                <strong class="category-analysis-amount">${formatMoney(amount)} / month</strong>
            </div>
        `)
        .join("");
}

function replaySectionAnimation(section) {
    if (!section) {
        return;
    }

    section.style.animation = "none";
    void section.offsetWidth;
    section.style.animation = "";
}

function renderAll() {
    renderSubscriptions();
    renderSummary();
    renderCategorySpending();
}

function deleteSubscription(subscriptionId) {
    const subscription = subscriptions.find((item) => item.id === subscriptionId);

    if (!subscription) {
        return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete "${subscription.name}"?`);

    if (!confirmed) {
        return;
    }

    const index = subscriptions.findIndex((item) => item.id === subscriptionId);

    if (index === -1) {
        return;
    }

    subscriptions.splice(index, 1);

    if (state.editingId === subscriptionId) {
        resetFormState();
    }

    saveSubscriptions();
    renderAll();
}

function startEditingSubscription(subscriptionId) {
    const subscription = subscriptions.find((item) => item.id === subscriptionId);

    if (!subscription || !el.form) {
        return;
    }

    state.editingId = subscriptionId;

    document.getElementById("subscription-name").value = subscription.name;
    document.getElementById("subscription-category").value = subscription.category;
    document.getElementById("subscription-price").value = subscription.price;
    document.getElementById("billing-cycle").value = subscription.billingCycle;
    document.getElementById("next-payment-date").value = subscription.nextPaymentDate;
    document.getElementById("subscription-status").value = subscription.status;

    setFormMode(true);

    el.form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindNavigation() {
    el.navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            const targetSection = link.dataset.section;

            el.sections.forEach((section) => {
                section.classList.toggle("hidden", section.id !== targetSection);
            });

            el.navLinks.forEach((item) => item.classList.remove("active"));
            link.classList.add("active");

            const visibleSection = document.getElementById(targetSection);
            replaySectionAnimation(visibleSection);
        });
    });
}

function bindThemeToggle() {
    if (!el.themeToggle) {
        return;
    }

    el.themeToggle.addEventListener("click", () => {
        const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
    });
}

function bindFilters() {
    if (el.searchInput) {
        el.searchInput.addEventListener("input", (event) => {
            state.search = event.target.value.trim();
            renderSubscriptions();
        });
    }

    [
        [el.categoryFilter, "category"],
        [el.billingCycleFilter, "billingCycle"],
        [el.statusFilter, "status"]
    ].forEach(([node, key]) => {
        if (!node) {
            return;
        }

        node.addEventListener("change", (event) => {
            state.filters[key] = event.target.value;
            renderSubscriptions();
        });
    });

    if (el.clearFiltersButton) {
        el.clearFiltersButton.addEventListener("click", () => {
            state.search = "";
            state.filters = { category: "", billingCycle: "", status: "" };

            if (el.searchInput) {
                el.searchInput.value = "";
            }

            if (el.categoryFilter) {
                el.categoryFilter.value = "";
            }

            if (el.billingCycleFilter) {
                el.billingCycleFilter.value = "";
            }

            if (el.statusFilter) {
                el.statusFilter.value = "";
            }

            renderSubscriptions();
        });
    }
}

function bindSubscriptionActions() {
    document.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        const { action, id } = button.dataset;

        if (action === "edit") {
            startEditingSubscription(id);
            return;
        }

        if (action === "delete") {
            deleteSubscription(id);
        }
    });
}

function bindForm() {
    if (!el.form) {
        return;
    }

    ["input", "change"].forEach((eventName) => {
        el.form.addEventListener(eventName, clearValidationErrors);
    });

    el.form.addEventListener("submit", (event) => {
        event.preventDefault();

        const data = Object.fromEntries(new FormData(el.form).entries());
        const errors = validateSubscriptionData(data);

        if (Object.keys(errors).length > 0) {
            displayValidationErrors(errors);
            return;
        }

        clearValidationErrors();

        const subscription = createSubscription(data);

        if (state.editingId) {
            const index = subscriptions.findIndex((item) => item.id === state.editingId);

            if (index !== -1) {
                subscriptions[index] = { ...subscription, id: state.editingId };
            }
        } else {
            subscriptions.push(subscription);
        }

        saveSubscriptions();
        renderAll();
        resetFormState();
    });

    if (el.cancelEditButton) {
        el.cancelEditButton.addEventListener("click", resetFormState);
    }
}

function init() {
    applyTheme(getPreferredTheme());
    bindNavigation();
    bindThemeToggle();
    bindFilters();
    bindSubscriptionActions();
    bindForm();
    loadSubscriptions();
    renderAll();
    setFormMode(false);
    console.log("SubTrack initialized.");
}

init();
