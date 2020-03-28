var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector("#close-create-post-modal-btn");
var sharedMomentsArea = document.querySelector("#shared-moments");
var form = document.querySelector("form");
var titleInput = document.querySelector("#title");
var locationInput = document.querySelector("#title");

function openCreatePostModal() {
    createPostArea.style.display = "block";
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choice) {
            console.log(choice);
        });
        deferredPrompt = null;
    }
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations()
            .then(function (registrations) {
                for (var i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                }
            })
    }
}

function closeCreatePostModal() {
    createPostArea.style.display = "none";
}

function onSaveClicked() {
    console.log("clicked");
    if ("caches" in window) {
        caches.open("user-request")
            .then((cache) => {
                cache.add("https://httpbin.org/get");
                cache.add("/src/images/sf-boat.jpg");
            });
    }
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);


function clearCards() {
    while (sharedMomentsArea.hasChildNodes()) {
        sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    }
}

function createCard(data) {
    var cardWrapper = document.createElement("div");
    cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
    var cardTitle = document.createElement("div");
    cardTitle.className = "mdl-card__title";
    cardTitle.style.backgroundImage = "url(" + data.image + ")";
    cardTitle.style.backgroundSize = "cover";
    cardWrapper.appendChild(cardTitle);
    var cardTitleTextElement = document.createElement("h2");
    cardTitleTextElement.className = "mdl-card__title-text";
    cardTitleTextElement.textContent = data.title;
    cardTitle.appendChild(cardTitleTextElement);
    var cardSupportingText = document.createElement("div");
    cardSupportingText.className = "mdl-card__supporting-text";
    cardSupportingText.textContent = data.location;
    cardSupportingText.style.textAlign = "center";
    var cardSaveButton = document.createElement("button");
    cardSaveButton.addEventListener("click", onSaveClicked)
    cardSaveButton.textContent = "save";
    cardSupportingText.appendChild(cardSaveButton);
    cardWrapper.appendChild(cardSupportingText);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
    for (var i = 0; i < data.length; i++) {
        createCard(data[i]);
    }
}

var networkData = false;
url = "https://pwa2020-d6252.firebaseio.com/posts.json";
fetch(url).then(function (res) {
    return res.json();
})
    .then(function (data) {
        console.log(data);
        networkData = true;
        const dataArray = [];
        for (var key in data) {
            dataArray.push(data[key]);
        }
        updateUI(dataArray)
    });
if ("indexedDB" in window) {
    readData("posts").then((data) => {
        if (!networkData && data) {
            updateUI(data)
        }
    })
}

if ("caches" in window) {
    caches.match(url)
        .then(function (response) {
            if (response) {
                return response.json();
            }
        }).then(function (data) {
        if (!networkData) {
            const dataArray = [];
            for (var key in data) {
                dataArray.push(data[key]);
            }
            updateUI(dataArray)
        }
    })
}

function sendData() {
    fetch("https://pwa2020-d6252.firebaseio.com/posts.json", {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            id: new Date().toISOString(),
            title: titleInput.value,
            location: locationInput.value,
            image: "https://firebasestorage.googleapis.com/v0/b/pwa2020-d6252.appspot.com/o/Download.png?alt=media&token=e718e62b-9bd8-4a23-91dc-32819b9e5223"
        })
    }).then((data) => {
        alert("good job");
        updateUI(data);
    });
}

form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (titleInput.value.trim() === "" && locationInput.value.trim() === "") {
        return;
    }
    closeCreatePostModal();

    if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready.then((sw) => {
            var post = {
                id: new Date().toISOString(),
                title: titleInput.value,
                location: locationInput.value
            };
            writeData("sync-post", post).then(() => {
                return sw.sync.register("syncNewPost");
            }).then(() => {
                var snackBarContainer = document.querySelector("confirmation-toast");
                var data = {message: "your post ist saved for Syncing"};
                snackBarContainer.MaterialSnackbar.show(data);
            }).catch(() => {
                alert("something ist went wrong");
            })
        });
    } else {
        sendData();
    }
});


