var deferredPrompt;
var enableNotificationButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
    window.Promise = Promise;
}


if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js", {scope: "./"})
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

function displayConfirmation() {
    var options = {
        body: 'You are successfully subscribed to our Notifications System'
    };
    new Notification('Thanks! ;)', options);
}

function askForNotificationPermission() {
    Notification.requestPermission((result)=> {
        console.log('result', result);
        if (result !== 'granted') {
            console.log('you are bad user :P');
        } else {
            displayConfirmation();
        }

    })
}

if ('Notification' in window) {
    for (var i= 0; i < enableNotificationButtons.length; i++) {
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
    }
}
