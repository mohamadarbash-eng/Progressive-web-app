var dbPromise = idb.open("feed-store", 1, function (db) {
    if (!db.objectStoreNames.contains("posts")) {
        db.createObjectStore("posts", {keyPath: "id"});
    }
// you creat function to reduce duplicated code
    if (!db.objectStoreNames.contains("sync-post")) {
        db.createObjectStore("sync-post", {keyPath: "id"});
    }
});

function writeData(st, data) {
    return dbPromise.then((db) => {
        var tx = db.transaction(st, "readwrite");
        var store = tx.objectStore(st);
        store.put(data);
        return tx.complete;
    })
}

function readData(st) {
    return dbPromise.then((db) => {
        var tx = db.transaction(st, "readonly");
        var store = tx.objectStore(st);
        return store.getAll();
    })
}

function clearAllData(st) {
    return dbPromise.then((db) => {
        var tx = db.transaction(st, "readwrite");
        var store = tx.objectStore(st);
        store.clear();
        return tx.complete;
    });
}

function deleteItemFromIdb(st, id) {
    return dbPromise.then((db) => {
        var tx = db.transaction(st, "readwrite");
        var store = tx.objectStore(st);
        store.delete(id);
        return tx.complete;
    }).then(() => {
        alert("item is deleted!!")
    })
}


function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
