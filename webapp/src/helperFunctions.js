// Need some whitespace here, so :)

function getAllBySelector(arg) {
  return document.querySelectorAll(arg);
}

function getBySelector(arg) {
  return document.querySelector(arg);
}

function getById(id) {
  return document.getElementById(id);
}

function getAllByClassName(className) {
  return document.getElementsByClassName(className);
}

/**
 * Function to fade between elements so it is easy to adjust
 * the timings without changing in multiple places.
 * @param {string} fadeOut - the selector of the element to disappear
 * @param {string} fadeIn - the selector of the element to appear
 * @param {boolean} instant - whether to take the time to fade or just switch
 */
function fadeBetweenElements(fadeOut, fadeIn, instant) {
  if (instant) {
    $(fadeOut).hide(1, function() {
      $(fadeIn).show(1);
    });
  } else {
    $(fadeOut).fadeOut(150, function() {
      // Optionally allows all elements to just fade out if no valid fadeIn
      // parameter is passed
      if ($(fadeIn)) $(fadeIn).fadeIn(400);
    });
  }
}

/**
 * After modifying the stats localStorage, functions call this
 * to update the data on the server to reflect the changes.
 */
function updateStats() {
  let userId = localStorage.getItem("user_id");
  let stats = localStorage.getItem("stats");
  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/updateUserStats",
    data: { userId: userId, stats: stats },
    crossDomain: true,
    cache: false,
    success: function(success) {
      console.warn("Successfully updated stats...");
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in updateStats:", XMLHttpRequest.responseText);
    }
  });
}

// https://stackoverflow.com/a/8845823/6456163
function getUrlVars() {
  let vars = [], hash;
  let hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (let i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');                        
    vars[hash[0]] = hash[1];
  }
  return vars;
}

/**
 * Gets the name of the current user.
 * @returns {string}
 */
function getUserName() {
  let displayName = localStorage.getItem("display_name");
  if (displayNameExists()) {
    console.warn("Using display name:", displayName);
    return displayName;
  } else if (profile.name) {
    console.warn("Using profile name:", profile.name);

    // Through Google; name should be whole name
    return profile.name;
  } else if (profile.nickname) {
    console.warn("Using profile nickname:", profile.nickname);

    // Through Auth0; nickname should be first part of email
    return profile.nickname;
  } else {
    console.error("There is no available userName!");
    return null;
  }
}

/**
 * Need to use this nasty code in two places, so figured I'd go ahead
 * and make a function out of it.
 */
function displayNameExists() {
  let displayName = localStorage.getItem("display_name");
  if (displayName && displayName != "" && !!displayName && displayName != null && displayName != "null") {
    return true;
  } else {
    return false;
  }
}

/**
 * Performs deep object comparison between obj1 and obj2.
 * Shamelessly stolen from https://gist.github.com/nicbell/6081098
 * @param {object} obj1 
 * @param {object} obj2 
 */
function isSameObject(obj1, obj2) {
  // Loop through properties in object 1
  for (let p in obj1) {
    // Check property exists on both objects
    if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

    switch (typeof (obj1[p])) {
      // Deep compare objects
      case 'object':
        if (!isSameObject(obj1[p], obj2[p])) return false;
        break;
      // Compare function code
      case 'function':
        if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
        break;
      // Compare values
      default:
        if (obj1[p] != obj2[p]) return false;
    }
  }

  return true;
};

/**
 * Deep clones specified object to the returned object.
 * Copied from https://stackoverflow.com/a/4460624/6456163 
 * @param {object} item - object to be cloned
 */
function clone(item) {
  // null, undefined values check
  if (!item) return item;

  let types = [ Number, String, Boolean ], 
      result;

  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  types.forEach(function(type) {
    if (item instanceof type) {
      result = type( item );
    }
  });

  if (typeof result == "undefined") {
    if (Object.prototype.toString.call( item ) === "[object Array]") {
      result = [];
      item.forEach(function(child, index, array) { 
        result[index] = clone( child );
      });
    } else if (typeof item == "object") {
        // testing that this is DOM
        if (item.nodeType && typeof item.cloneNode == "function") {
            result = item.cloneNode( true );    
        } else if (!item.prototype) { // check that this is a literal
            if (item instanceof Date) {
              result = new Date(item);
            } else {
              // it is an object literal
              result = {};
              for (var i in item) {
                result[i] = clone( item[i] );
              }
            }
        } else {
            // depending what you would like here,
            // just keep the reference, or create new object
            if (false && item.constructor) {
              // would not advice to do that, reason? Read below
              result = new item.constructor();
            } else {
              result = item;
            }
        }
    } else {
      result = item;
    }
  }

  return result;
}

// This is a general function that removes one class and adds another
function toggleClass(target, addedClass) {
  // If target is an element rather than a list, it is converted to array form
  if (!NodeList.prototype.isPrototypeOf(target)) {
    target = [target];
  }

  // Allows for multiple elements to be toggled, such as by using the querySelectorAll() method
  [].forEach.call(target, (element) => {
    if (element.classList.contains(addedClass)) {
      element.classList.remove(addedClass);
    } else {
      element.classList.add(addedClass);
    }
  });
};

// TODO: Edit order button that makes things draggable
function reorganizeBooks() {
  var fixHelperModified = function(e, tr) {
    var $originals = tr.children();
    var $helper = tr.clone();
    $helper.children().each(function(index) {
      $(this).width($originals.eq(index).width())
    });
    return $helper;
  },
  updateIndex = function(e, ui) {
    // data-index
    $('td.index', ui.item.parent()).each(function(i) {
      $(this).html(i + 1);
    });
  };

  $("#sort tbody").sortable({
    helper: fixHelperModified,
    stop: updateIndex
  }).disableSelection();
}