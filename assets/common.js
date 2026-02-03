function error(error) {
    console.error("OpenSB Finalium Skin Error: " + error);
}

function handleCommentEvents() {
    commentContents = document.getElementById('commentContents');
    postButton = document.getElementById('post');
    commentSection = document.getElementById('comment');

    // post comment
    if (postButton) {
        postButton.addEventListener('click', function () {
            const commentText = commentContents ? commentContents.value.trim() : '';
            if (!commentText) {
                return alert('You must enter a comment before posting.');
            }

            fetch("/api/legacy/comment", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `comment=${encodeURIComponent(commentText)}&vidid=${upload_id}&really=ofcourse&type=video`
            })
                .then(response => response.text())
                .then(data => {
                    console.log("Commented " + commentText);
                    if (commentSection) {
                        commentSection.insertAdjacentHTML('afterbegin', data);
                    }
                    if (commentContents) {
                        commentContents.value = '';
                    }
                })
        });
    }
}

function toggleNotAvailable() {
    const watch_not_available = document.getElementById('watch-not-available');

    if (watch_not_available) {
        toggleElementDisplay(watch_not_available);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // ported from trinium
    // Get all menu buttons
    const menuButtons = document.querySelectorAll('.menu-button');

    // Add event listeners for each menu button
    menuButtons.forEach(button => {
        const menuId = button.getAttribute('data-menu-id');
        const menu = document.getElementById(menuId);

        // check if this menu button is the one in the header.
        const isThisTheHeaderUserMenu = button.classList.contains("user-menu-button");

        // get the caret if that exists. this is primarily for the one in the header.
        const menuCaret = button.getElementsByClassName("menu-caret");

        // TODO: make this use bootstrap icons or some shit i dont know
        let menuCaretOff = "icon caret-closed menu-caret";
        let menuCaretOn = "icon caret-open menu-caret";

        let actualCaret;
        if (menuCaret.length === 1) {
            actualCaret = menuCaret.item(0);
        } else if (menuCaret.length > 1) {
            // this shouldn't happen. if it does then i fucked this up. -chaziz 6/28/2024
            console.warn("There's a menu that has more than one caret? Huh?")
            actualCaret = menuCaret.item(0);
        }

        // initialize all menus with "none"
        menu.style.display = 'none';

        button.addEventListener('mousedown', (e) => {
            e.stopPropagation();

            if (menu.style.display === 'none') {
                if (actualCaret) {
                    actualCaret.className = menuCaretOn;
                }
                if (isThisTheHeaderUserMenu) {
                    button.classList.add("selected");
                }
                menu.style.display = 'block';
            } else {
                closeMenu();
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (!menu.contains(e.target) && !button.contains(e.target)) {
                closeMenu();
            }
        });

        document.querySelectorAll('[onclick]').forEach(element => {
            element.addEventListener('click', () => {
                closeMenu();
            });
        });

        function closeMenu() {
            if (actualCaret) {
                actualCaret.className = menuCaretOff;
            }
            if (isThisTheHeaderUserMenu) {
                button.classList.remove("selected");
            }
            menu.style.display = 'none';
        }

        /*
        document.querySelectorAll('.menu-item-button').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
                
                const action = item.dataset.action;
                if (action && menuActions[action]) {
                    menuActions[action]();
                }
            });
        });
        */
    });

    // Get all tab groups
    const tabGroups = document.querySelectorAll(".tab-group");
    tabGroups.forEach(tabGroup => {
        // Get all tab links in the tab group
        const tabLinks = tabGroup.querySelectorAll(".tablink")

        // open the first tab automatically
        if (tabLinks.length > 0) {
            const firstTab = tabLinks.item(0);

            if (firstTab) {
                const tabId = firstTab.getAttribute("data-tab");
                if (tabId) {
                    const firstTabId = document.getElementById(tabId);
                    if (firstTabId) {
                        firstTabId.style.display = "block";
                        firstTab.classList.add("active");
                    } else {
                        error(`Tab ${tabId} is missing contents.`)
                    }
                }
            } else {
                error("THIS SHOULD NOT HAPPEN.");
            }
        }

        tabLinks.forEach(tabLink => {
            // check if this tab has "data-tab". if it doesn't then don't bother.
            const tabId = tabLink.getAttribute("data-tab");

            if (tabId) {
                tabLink.addEventListener("click", function () {
                    // Hide all tab content
                    const tabContents = tabGroup.querySelectorAll(".tabcontent");
                    tabContents.forEach(tabContent => {
                        tabContent.style.display = "none";
                    });

                    // Remove 'active' class from all tab links
                    tabLinks.forEach(link => {
                        link.classList.remove("active");
                    });

                    // Show the selected tab content and mark the button as active
                    const selectedTabId = document.getElementById(tabId);

                    if (selectedTabId) {
                        selectedTabId.style.display = "block";
                        this.classList.add("active");
                    } else {
                        error(`Tab ${tabId} is missing contents.`)
                    }
                });
            }
        });
    });

    // tooltip start
    // tooltip states
    var tooltipEl = null;
    var showTimer = null;

    // tooltip helper
    function createTooltip(text) {
        var el = document.createElement("div");
        el.className = "tooltip";
        el.appendChild(document.createTextNode(text));
        document.body.appendChild(el);

        // force reflow for transition
        el.offsetHeight;
        el.style.opacity = "1";

        return el;
    }

    function destroyTooltip() {
        if (!tooltipEl) return;
        tooltipEl.parentNode.removeChild(tooltipEl);
        tooltipEl = null;
    }

    function positionTooltip(target) {
        if (!tooltipEl) return;

        var rect = target.getBoundingClientRect();
        var tipRect = tooltipEl.getBoundingClientRect();

        var top = rect.top - tipRect.height - 8;
        var left = rect.left + (rect.width / 2) - (tipRect.width / 2);

        // flip if needed
        if (top < 8) top = rect.bottom + 8;
        if (left < 8) left = 8;

        tooltipEl.style.top = top + "px";
        tooltipEl.style.left = left + "px";
    }

    function findTooltipTarget(node) {
        while (node && node !== document) {
            if (
                node.nodeType === 1 &&
                node.classList &&
                node.classList.contains("uix-tooltip")
            ) {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    // tooltip events
    document.addEventListener("mouseover", function (e) {
        var el = findTooltipTarget(e.target);
        if (!el || tooltipEl) return;

        // ignore moves inside the same tooltip target
        if (el.contains(e.relatedTarget)) return;

        var title = el.getAttribute("title");
        if (!title) return;

        // suppress native tooltip
        el.setAttribute("data-tooltip-title", title);
        el.removeAttribute("title");

        showTimer = setTimeout(function () {
            tooltipEl = createTooltip(title);
            positionTooltip(el);
        });
    });

    document.addEventListener("mouseout", function (e) {
        var el = findTooltipTarget(e.target);
        if (!el) return;

        // ignore moves inside the same element
        if (el.contains(e.relatedTarget)) return;

        clearTimeout(showTimer);
        destroyTooltip();

        // restore title fallback
        var oldTitle = el.getAttribute("data-tooltip-title");
        if (oldTitle) {
            el.setAttribute("title", oldTitle);
            el.removeAttribute("data-tooltip-title");
        }
    });

    document.addEventListener("scroll", destroyTooltip, true);
    // tooltip end

    // container
    var page = document.getElementById("page");

    // guide button
    var guide_button = document.getElementById("guide-toggle");

    if (guide_button) {
        guide_button.addEventListener("click", function () {
            var guide = document.getElementById("guide");
            if (guide) {
                toggleElementDisplay(guide);

                // if we're on the homepage or on a profile, toggle show-guide in <html>
                if (page.classList.contains("home") 
                 || page.classList.contains("user")
                 || page.classList.contains("members") // should be channels
                 || page.classList.contains("browse")
                ) {
                    document.documentElement.classList.toggle("show-guide");
                }
            } else {
                error("where the fuck is the guide???")
            }
        });
    }

    // user button
    /*
    var masthead_user_button = document.getElementById("masthead-loggedin");

    if (masthead_user_button) {
        masthead_user_button.addEventListener("click", function () {
            var masthead_user_menu = document.getElementById("masthead-below");
            if (masthead_user_menu) {
                toggleElementDisplay(masthead_user_menu);
            } else {
                error("where the fuck is the user menu???")
            }
        });
    }
    */

    // logged out error?
    const actionUnlogged = document.getElementById('action_unlogged');
    if (actionUnlogged) {
        actionUnlogged.addEventListener('click', function () {
            alert('You cannot proceed with this action.');
        });
    }

    // shelf slider (hardcoded to feed)
    const feed = document.getElementById('feed');

    function normalizeScroll(slider) {
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

    if (feed) {
        feed.querySelectorAll('.shelf').forEach(shelf => {
            const slider = shelf.querySelector('.shelf-slider');
            const buttons = shelf.querySelectorAll('.shelf-slider-nav');

            if (slider) {
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

                        setTimeout(() => {
                            normalizeScroll(slider);
                            isScrolling = false;
                            buttons.forEach(b => b.disabled = false);
                        }, 350);
                    });
                });

                console.debug("initialized shelf slider", shelf.id);
            }
        });
    }

    /*
    // comments
    // NOTE: this references a bunch of leftovers from the bootstrap skin.
    const commentContents = document.getElementById('commentContents');
    // stupid: should be merged into one.
    const postButton = document.getElementById('post');
    */

    const postUserButton = document.getElementById('post-user');
    const postJournalButton = document.getElementById('post-journal');
    const commentPostingSpinner = document.getElementById('commentPostingSpinner');
    const commentSection2 = document.getElementById('comment');

    const watch_not_available = document.getElementById('watch-not-available');
    const watch_not_available_close = document.getElementById('watch-not-available-close');

    if (watch_not_available) {
        watch_not_available_close.addEventListener('click', function () {
            toggleElementDisplay(watch_not_available);
        });
    }

    // load comments
    const comments = document.getElementById('comments');
    if (comments) {
        fetch(`/api/skin/comment_load?location=${encodeURIComponent(comment_location_type)}&id=${encodeURIComponent(comment_location_id)}`, {
            method: "GET",
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
            .then(response => response.json())
            .then(json => {
                commentContents = document.getElementById('commentContents');
                postButton = document.getElementById('post');
                commentSection = document.getElementById('comment');

                console.log("Loaded comments");
                comments.innerHTML = json.html;

                handleCommentEvents();
            })
    }

    // post comment (profile)
    if (postUserButton) {
        postUserButton.addEventListener('click', function () {
            if (commentPostingSpinner) {
                commentPostingSpinner.classList.remove('d-none');
            }

            const commentText = commentContents ? commentContents.value.trim() : '';
            fetch("/api/legacy/comment", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `comment=${encodeURIComponent(commentText)}&uid=${user_id}&really=ofcourse&type=profile`
            })
                .then(response => response.text())
                .then(data => {
                    console.log("Commented " + commentText);
                    if (commentSection2) {
                        commentSection2.insertAdjacentHTML('afterbegin', data);
                    }
                    if (commentContents) {
                        commentContents.value = '';
                    }
                    if (postButton) {
                        postButton.classList.add('disabled');
                    }
                    if (commentPostingSpinner) {
                        commentPostingSpinner.classList.add('d-none');
                    }
                })
        });
    }

    // post comment (journal)
    if (postJournalButton) {
        postJournalButton.addEventListener('click', function () {
            if (commentPostingSpinner) {
                commentPostingSpinner.classList.remove('d-none');
            }

            const commentText = commentContents ? commentContents.value.trim() : '';
            fetch("/api/legacy/comment", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `comment=${encodeURIComponent(commentText)}&jid=${journal_id}&really=ofcourse&type=journal`
            })
                .then(response => response.text())
                .then(data => {
                    console.log("Commented " + commentText);
                    if (commentSection2) {
                        commentSection2.insertAdjacentHTML('afterbegin', data);
                    }
                    if (commentContents) {
                        commentContents.value = '';
                    }
                    if (postButton) {
                        postButton.classList.add('disabled');
                    }
                    if (commentPostingSpinner) {
                        commentPostingSpinner.classList.add('d-none');
                    }
                })
        });
    }

    // follow/subscribe buttons
    const followButtons = document.querySelectorAll(".button-follow");

    followButtons.forEach(button => {
        console.log("Button userId: " + button.dataset.userId);
    });

    /*
    // subscribe button (main)
    const subscribeBtn = document.getElementById('subscribe');
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', function () {
            fetch("/api/legacy/subscribe", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `subscription=${user_id}`
            })
                .then(response => response.text())
                .then(data => {
                    if (data === subscribe_string) {
                        subscribeBtn.textContent = subscribe_string;
                        subscribeBtn.className = "button button-follow";
                    } else if (data === unsubscribe_string) {
                        subscribeBtn.textContent = unsubscribe_string;
                        subscribeBtn.className = "button button-secondary";
                    } else {
                        error('Failed to subscribe to user', user_id);
                    }
                })
        });
    }

    // subscribe button (watch page variant?)
    const subscribeWatchBtn = document.getElementById('follow-watch');
    if (subscribeWatchBtn) {
        subscribeWatchBtn.addEventListener('click', function () {
            fetch("/api/legacy/subscribe", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `subscription=${user_id}`
            })
                .then(response => response.text())
                .then(data => {
                    if (data === subscribe_string) {
                        subscribeWatchBtn.textContent = subscribe_string;
                        subscribeWatchBtn.className = "button button-follow button-small";
                        console.log("Unsubscribed " + user_id);
                    } else if (data === unsubscribe_string) {
                        subscribeWatchBtn.textContent = unsubscribe_string;
                        subscribeWatchBtn.className = "button button-secondary button-small";
                        console.log("Subscribed " + user_id);
                    } else {
                        error('Failed to subscribe to user', user_id);
                    }
                })
        });
    }
    */

    // like/dislike 
    const likeButton = document.getElementById('like');
    const dislikeButton = document.getElementById('dislike');
    const likeCount = document.getElementById('like-count');
    const dislikeCount = document.getElementById('dislike-count');

    if (likeButton && dislikeButton && likeCount && dislikeCount) {

        const buttons = {
            like: likeButton,
            dislike: dislikeButton,
        };

        const counts = {
            like: likeCount,
            dislike: dislikeCount,
        };

        function getState() {
            if (likeButton.classList.contains('button-toggled')) return 'like';
            if (dislikeButton.classList.contains('button-toggled')) return 'dislike';
            return null;
        }

        function updateCount(el, delta) {
            el.textContent = Math.max(0, (parseInt(el.textContent, 10) || 0) + delta);
        }

        function applyState(prev, next) {
            if (prev) {
                buttons[prev].classList.remove('button-toggled');
                updateCount(counts[prev], -1);
            }

            if (next) {
                buttons[next].classList.add('button-toggled');
                updateCount(counts[next], +1);
            }
        }

        function sendInteraction(action) {
            return fetch("/api/skin/upload_interaction", {
                method: "POST",
                headers: { "Content-Type": "application/json; charset=UTF-8" },
                body: JSON.stringify({
                    action,
                    upload: upload_int_id,
                }),
            }).then(res => {
                if (!res.ok) throw new Error("request failed");
                return res.json().catch(() => null);
            });
        }

        function handleClick(type) {
            const prev = getState();
            const next = prev === type ? null : type;
            const action = next ? type : 'unrate';

            sendInteraction(action)
                .then(() => applyState(prev, next))
                .catch(() => {
                    alert('Failed to rate upload. Please try again later.');
                    error('Failed to rate upload.')
                });
        }

        likeButton.addEventListener('click', () => handleClick('like'));
        dislikeButton.addEventListener('click', () => handleClick('dislike'));
    }

    let debug_button = (document.getElementById('debug-button'));
    let debug_dialog = (document.getElementById('debug-dialog'));

    if (debug_button) {
        debug_button.addEventListener("click", () => {
            debug_dialog.showModal();
        });
    }
});

// some weird fucking shit that was defined like this
let index = 0;

function showReplies(id) {
    fetch("/api/legacy/get_replies", {
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `comment_id=${id}`
    })
        .then(response => response.text())
        .then(data => {
            const commentElement = document.getElementById(id);
            if (commentElement) {
                commentElement.insertAdjacentHTML('beforeend', data);
            }
        })
}

/*
function showMoreVideos() {
    const fromUserVideoList = document.getElementById('fromUserVideoList');
    if (!fromUserVideoList) return;

    if (!fromUserVideoList.classList.contains('card-body')) {
        fetch("/api/legacy/ajax_watch", {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `from=${index}&limit=10`
        })
            .then(response => response.text())
            .then(data => {
                index += 10;
                fromUserVideoList.insertAdjacentHTML('beforeend', data);
                fromUserVideoList.classList.remove("collapsed");

                const fromUserElement = document.getElementById('fromUser');
                if (fromUserElement) {
                    fromUserElement.remove();
                }
            })
    } else {
        fromUserVideoList.innerHTML = '';
        fromUserVideoList.classList.add("collapsed");
    }
}
*/

// there should be code for replies, but those broke on finalium 1 when i redid the css for it