// shelf slider (hardcoded to feed for the time being)

function normalizeSliderScroll(slider) {
    const first = slider.firstElementChild;
    if (!first) return;

    const step =
        slider.children[1]
            ? slider.children[1].offsetLeft - first.offsetLeft
            : first.offsetWidth;

    const corrected =
        Math.round(slider.scrollLeft / step) * step;

    slider.scrollLeft = corrected;
}

function updateSliderButtons(slider, buttons, scroll) {
    let leftButton = buttons[0];
    let rightButton = buttons[1];

    if (scroll < 50) {
        leftButton.style.display = "none";
    } else {
        leftButton.style.display = "flex";
    }

    if (scroll > (slider.scrollWidth - slider.clientWidth - 100)) {
        rightButton.style.display = "none";
    } else {
        rightButton.style.display = "flex";
    }
}

// todo: somehow get this to shut up so we dont waste time checking Every Page
// for if theres a feed or not.
document.addEventListener("pageReady", () => {
    const feed = document.getElementById('feed');

    if (feed) {
        updateContentSnap();
        feed.querySelectorAll('.shelf').forEach(shelf => {
            const slider = shelf.querySelector('.shelf-slider');
            const buttons = shelf.querySelectorAll('.shelf-slider-nav');

            if (slider) {
                updateSliderButtons(slider, buttons, slider.scrollLeft);

                let isScrolling = false;

                buttons.forEach(button => {
                    button.addEventListener('click', () => {
                        if (isScrolling) return;

                        isScrolling = true;
                        buttons.forEach(b => b.disabled = true);

                        const dir = button.dataset.direction === 'right' ? 1 : -1;
                        const viewport = slider.clientWidth;

                        slider.scrollBy({
                            left: dir * viewport,
                            behavior: 'smooth'
                        });

                        properScroll = slider.scrollLeft + (dir * viewport);
                        updateSliderButtons(slider, buttons, properScroll);

                        setTimeout(() => {
                            normalizeSliderScroll(slider);
                            isScrolling = false;
                            buttons.forEach(b => b.disabled = false);
                        }, 350);
                    });
                });

                console.debug("initialized shelf slider", shelf.id);
            }
        });
    }
});