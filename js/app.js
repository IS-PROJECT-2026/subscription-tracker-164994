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