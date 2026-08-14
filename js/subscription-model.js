"use strict";

const SUBSCRIPTION_CATEGORIES = [
    "Entertainment",
    "Music",
    "Software",
    "Education",
    "Fitness",
    "News",
    "Other"
];

const BILLING_CYCLES = [
    "weekly",
    "monthly",
    "yearly"
];

const SUBSCRIPTION_STATUSES = [
    "active",
    "paused",
    "cancelled"
];

function createSubscription({
    name,
    category,
    price,
    billingCycle,
    nextPaymentDate,
    status = "active"
}) {
    if (!name || !category) {
        throw new Error("Subscription name and category are required.");
    }

    if (!BILLING_CYCLES.includes(billingCycle)) {
        throw new Error("Invalid billing cycle.");
    }

    if (!SUBSCRIPTION_STATUSES.includes(status)) {
        throw new Error("Invalid subscription status.");
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
        throw new Error("Subscription price must be a valid positive number.");
    }

    return {
        id: crypto.randomUUID(),
        name: name.trim(),
        category,
        price: numericPrice,
        billingCycle,
        nextPaymentDate,
        status
    };
}