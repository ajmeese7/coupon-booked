// These are all needed across various functions, so defined in the global scope
var book, previousBook, nav, book, profile, backButtonTarget, _this; // https://stackoverflow.com/a/1338622

/** True means book will be published to template database; false is normal */
var development = false;

// TODO: Switch to better close animation when library is updated;
// also transition hacky way of animating to officially supported option (DL new commit)
var notificationOptions = { fadeout: 500, closeButton: false, removeAllOnDisplay: true, duration: 3000 };