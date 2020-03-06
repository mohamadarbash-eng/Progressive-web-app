var deferredPrompt;

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", {scope: "/help/"})
        .then(function () {
            console.log("sw is registered")
        });
}

window.addEventListener("beforeinstallpromt", function (event) {
    console.log("prompt");
    deferredPrompt = event;
    event.preventDefault();
    return false;
});
