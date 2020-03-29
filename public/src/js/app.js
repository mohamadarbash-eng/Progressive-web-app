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

function configurePushSub() {
    if (!('serviceWorker' in navigator)) {
        return;
    }
    var reg;
    navigator.serviceWorker.ready.then((swReady) => {
        reg = swReady;
      return swReady.pushManager.getSubscription()
    }).then((sub) => {
        if(sub === null) {
            var vapidPublicKey = "BBbgF-w2JrciZaebD_50vam6CdFWgQ4bPHXJOpqANW0eKI2N93OwIhEGU_QkwxNTO13p53WWYlReoU_2yXH1Znc";
            var convertedPublicWebKey = urlBase64ToUint8Array(vapidPublicKey);
            reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedPublicWebKey
            });
        } else {

        }
    }).then((newSub) => {
        fetch('https://pwa2020-d6252.firebaseio.com/subscribtions.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newSub)
        }).then((res) => {
           if (res.ok) {
               displayConfirmation();
           }
        }).catch(() => {
            console.error(err);
        })
    });
}

function displayConfirmation() {
    var options = {
        body: 'You are successfully subscribed to our Notifications System',
        icon: '/src/images/icons/app-icon-96x96.png',
        image: '/src/images/sf-boat.jpg',
        dir: 'ltr',
        lang: 'en-US', //BCP 47
        vibrate: [100, 50, 200],
        badge: '/src/images/icons/app-icon-96x96.png',
        tag: 'confirm-notification',
        renotify: true,
        actions: [{
            action: 'confirm',
            title: 'Okay',
            icon: '/src/images/icons/app-icon-96x96.png'
        },{
            action: 'Cancel',
            title: 'cancel',
            icon: '/src/images/icons/app-icon-96x96.png'
        }]
    };
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((swReady) => {
            swReady.showNotification('Thanks! ;) from SW', options)
        });
    }
}

function askForNotificationPermission() {
    Notification.requestPermission((result)=> {
        console.log('result', result);
        if (result !== 'granted') {
            console.log('you are bad user :P');
        } else {
          //  displayConfirmation();
            configurePushSub();
        }

    })
}

if ('Notification' in window) {
    for (var i= 0; i < enableNotificationButtons.length; i++) {
        enableNotificationButtons[i].style.display = 'inline-block';
        enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
    }
}
