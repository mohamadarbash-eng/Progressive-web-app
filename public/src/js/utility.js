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
