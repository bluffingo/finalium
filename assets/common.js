function error(error) {
    console.error("OpenSB Finalium Frontend Error: " + error);
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

    // container
    var page = document.getElementById("page");

    // guide button
    var guide_button = document.getElementById("guide-toggle");

    if (guide_button) {
        guide_button.addEventListener("click", function () {
            var guide = document.getElementById("guide");
            if (guide) {
                toggleElementDisplay(guide);
                // if we're on homepage (i think this behavior also applies to profiles?)
                // this probably isn't the best way to do this. they made use 
                // of something called content snap widths. this should be looked into later.
                // chaziz -01/21/2025
                if (page.classList.contains("home")) {
                    page.classList.toggle("container-open-guide");
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

    // feed shelf thing
    const feed = document.getElementById('feed');

    if (feed) {
        const shelves = feed.querySelectorAll('.shelf');

        shelves.forEach(shelf => {
            console.debug("initialized shelf", shelf.id);

            const uploads = shelf.querySelector('.shelf-uploads');
            const buttons = shelf.querySelectorAll('.shelf-nav');

            if (!uploads) return;

            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const direction = button.dataset.direction;

                    // scroll amount = width of shelf viewport
                    const scrollAmount = uploads.clientWidth;

                    uploads.scrollBy({
                        left: direction === 'right' ? scrollAmount : -scrollAmount,
                        behavior: 'smooth'
                    });
                });
            });
        });
    }

    /*
    // comments
    // NOTE: this references a bunch of leftovers from the bootstrap frontend.
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
        fetch(`/api/frontend/comment_load?location=${encodeURIComponent(comment_location_type)}&id=${encodeURIComponent(comment_location_id)}`, {
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
                        subscribeBtn.className = "button button-accent";
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
    const subscribeWatchBtn = document.getElementById('subscribe-watch');
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
                        subscribeWatchBtn.className = "button button-accent button-small";
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
            return fetch("/api/frontend/upload_interaction", {
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

// there should be code for replies, but those broke on finalium 1 when i redid the css for it