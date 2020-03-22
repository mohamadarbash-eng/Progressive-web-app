var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function (choice) {
      console.log(choice);
    });
    deferredPrompt = null;
  }
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.getRegistrations()
       .then(function(registrations) {
         for (var i = 0; i < registrations.length; i++) {
           registrations[i].unregister();
         }
       })
   }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

function onSaveClicked () {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-request')
        .then((cache) => {
          cache.add('https://httpbin.org/get');
          cache.add('/src/images/sf-boat.jpg');
        });
  }
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard() {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  var cardSaveButton = document.createElement('button');
  cardSaveButton.addEventListener('click', onSaveClicked)
  cardSaveButton.textContent = 'save';
  cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

var networkData = false;
fetch('https://httpbin.org/get')
    .then(function(res) {
      return res.json();
    })
    .then(function(data) {
      networkData = true;
      clearCards();
      createCard();
    });

if ('caches' in window) {
  caches.match('https://httpbin.org/get')
      .then(function (response) {
        if (response) {
          return response.json();
        }
      }).then(function (data) {
        if (!networkData) {
          createCard();
        }
  })
}
