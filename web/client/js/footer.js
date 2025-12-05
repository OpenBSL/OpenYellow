// Footer component
function renderFooter() {
    const currentYear = new Date().getFullYear();
    const yearRange = currentYear > 2024 ? `2024-${currentYear}` : '2024';
    
    return `
        <div class="container">
            <p>
                <a href="https://github.com/OpenBSL/OpenYellow" target="_blank" style="color: var(--accent-primary);">OpenYellow</a> 
                by 
                <a href="https://github.com/Bayselonarrend" target="_blank" style="color: var(--accent-primary);">Bayselonarrend</a>, 
                ${yearRange}
            </p>
            <p class="footer-links">
                <a href="https://github.com/OpenBSL" target="_blank">GitHub</a>
                <span>•</span>
                <a href="https://t.me/openyellowproject" target="_blank">Telegram</a>
                <span>•</span>
                <a href="https://boosty.to/bayselonarrend" target="_blank">Boosty</a>
            </p>
            <p class="footer-disclaimer">
                All trademarks, logos and brand names are the property of their respective owners. 
                All company, product and service names used in this website are for identification purposes only. 
                Use of these names, trademarks and brands does not imply endorsement.
            </p>
        </div>
    `;
}

// Initialize footer on page load
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('.footer');
    if (footer) {
        footer.innerHTML = renderFooter();
    }
});
