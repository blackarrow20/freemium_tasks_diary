function convertLuxonToFlatpickr(date, timezone, format) {
    const dateFormatted = date.setZone(timezone).toFormat(format);
    return dateFormatted;
}

function convertTimestampToString(timestamp, timezone, luxonDateformat) {
    const now = DateTime.fromMillis(timestamp * 1000).setZone(timezone);
    var nowString = convertLuxonToFlatpickr(now, timezone, luxonDateformat);
    return nowString;
}

// Format the date using luxonDateformat (which should be 'cccc' for full day names like "Monday" or 
// 'ccc' for short names like "Mon").
function getDayOfWeekFromTimestamp(timestamp, timezone, luxonDateformat = 'cccc') {
    const now = DateTime.fromMillis(timestamp * 1000).setZone(timezone);
    return now.toFormat(luxonDateformat);
}

function getTimestamp(datePickerId) {
    var dateString = $("#" + datePickerId).val();
    if (dateString == "") {
        return null;
    }
    var timestamp = convertToTimestamp(dateString, luxonDateformat, timezone);
    return timestamp;
}
                                    
function convertToTimestamp(dateStr, luxonDateformat, tz) {
    const dateTime = DateTime.fromFormat(dateStr, luxonDateformat, { zone: tz });
    return Math.floor(dateTime.toSeconds());
}

function convertToLuxonDateFormat(dateFormat) {
    if (dateFormat == "d.m.Y H:i:s") {
        return "dd.LL.yyyy HH:mm:ss";
    }
    if (dateFormat == "m/d/Y H:i:s") {
        return "LL/dd/yyyy HH:mm:ss";
    }
}

function convertToFlatpickrDateFormat(dateFormat) {
    if (dateFormat == "d.m.Y H:i:s") {
        return "d.m.Y H:i:S";
    }
    if (dateFormat == "m/d/Y H:i:s") {
        return "m/d/Y H:i:S";
    }
}

var timezone = "Europe/Sarajevo";
var currentTime = Math.floor(Date.now() / 1000);
var dateFormat = "d.m.Y H:i:s";
var luxonDateformat = convertToLuxonDateFormat(dateFormat);
var flatpickrDateFormat = convertToFlatpickrDateFormat(dateFormat);
const { DateTime } = luxon;
const now = DateTime.fromMillis(currentTime * 1000).setZone(timezone);
var nowString = convertLuxonToFlatpickr(now, timezone, luxonDateformat);
    
var fp_datetime = flatpickr("#datetime", {
    enableTime: true,
    time_24hr: true,
    dateFormat: flatpickrDateFormat,
    enableSeconds: true
});

var fp_datetime_edit = flatpickr("#edit-datetime", {
    enableTime: true,
    time_24hr: true,
    dateFormat: flatpickrDateFormat,
    enableSeconds: true
});

document.addEventListener("DOMContentLoaded", function() {
    const homeTab = document.getElementById("home-tab");
    const home = document.getElementById("home");
    const activityForm = document.getElementById("activity-form");
    const activityList = document.getElementById("activity-list");
    const archiveTab = document.getElementById("archive-tab");
    const archive = document.getElementById("archive");
    const archiveList = document.getElementById("archive-list");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");
    const searchDataInput = document.getElementById("search-data");

    activityForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const datetime = getTimestamp("datetime");
        const title = document.getElementById("title").value;
        const content = document.getElementById("content").value;
        const category = document.getElementById("category").value;

        const activity = { id: Date.now(), datetime, title, content, category };
        saveActivity(activity);
        var categories = [];
        if (searchDataInput.value != "") {        
            categories = searchDataInput.value.split(",").map(category => category.trim());
        }
        displaySavedActivities(categories);
        activityForm.reset();
    });

    homeTab.addEventListener("click", function() {
        home.style.display = "block";
        archive.style.display = "none";
        var categories = [];
        if (searchDataInput.value != "") {        
            categories = searchDataInput.value.split(",").map(category => category.trim());
        }
        displaySavedActivities(categories);
    });

    archiveTab.addEventListener("click", function() {
        home.style.display = "none";
        archive.style.display = "block";
        var categories = [];
        if (searchDataInput.value != "") {        
            categories = searchDataInput.value.split(",").map(category => category.trim());
        }
        displayArchiveActivities(categories);
    });

    searchDataInput.addEventListener("input", function() {
        var categories = [];
        if (searchDataInput.value != "") {        
            categories = searchDataInput.value.split(",").map(category => category.trim());
        }
        if (home.style.display !== "none") {
            displaySavedActivities(categories);
        } else if (archive.style.display !== "none") {
            displayArchiveActivities(categories);
        }
    });

    function openEditModal(activity) {        
        modal.style.display = "block";
        const datetimeInput = document.getElementById("edit-datetime");
        const titleInput = document.getElementById("edit-title");
        const contentInput = document.getElementById("edit-content");
        const categoryInput = document.getElementById("edit-category");

        datetimeInput.value = convertTimestampToString(activity.datetime, timezone, luxonDateformat);
        fp_datetime_edit = flatpickr("#edit-datetime", {
            enableTime: true,
            time_24hr: true,
            dateFormat: flatpickrDateFormat,
            enableSeconds: true
        });
        titleInput.value = activity.title;
        contentInput.value = activity.content;
        categoryInput.value = activity.category;

        const saveButton = document.getElementById("save-btn");
        saveButton.onclick = function() {
            const newDatetime = getTimestamp("edit-datetime");
            const newTitle = titleInput.value;
            const newContent = contentInput.value;
            const newCategory = categoryInput.value;

            if (newDatetime && newTitle && newContent && newCategory) {
                const editedActivity = { id: activity.id, datetime: newDatetime, title: newTitle, content: newContent, category: newCategory };
                updateActivity(editedActivity);
                var categories = [];
                if (searchDataInput.value != "") {        
                    categories = searchDataInput.value.split(",").map(category => category.trim());
                }
                if (home.style.display !== "none") {
                    displaySavedActivities(categories);
                } else if (archive.style.display !== "none") {
                    displayArchiveActivities(categories);
                }
                modal.style.display = "none"; // Close the modal after saving
            } else {
                alert("Please fill out all fields.");
            }
        };

        const closeButton = document.getElementById("close-btn");
        closeButton.onclick = function() {
          modal.style.display = "none";
        };
    }

    function updateActivity(activity) {
        const activities = JSON.parse(localStorage.getItem("activities")) || [];
        const index = activities.findIndex(act => act.id === activity.id);
        if (index !== -1) {
            activities[index] = activity;
            localStorage.setItem("activities", JSON.stringify(activities));
        }
    }

    function deleteActivity(activity) {
        const activityDiv = document.querySelector(`[data-id="${activity.id}"]`);
        if (activityDiv) {
            activityDiv.remove();
            deleteActivityFromLocalStorage(activity);
            var categories = [];
            if (searchDataInput.value != "") {        
                categories = searchDataInput.value.split(",").map(category => category.trim());
            }
            if (home.style.display !== "none") {
                displaySavedActivities(categories); // Redisplay saved activities after deletion
            } else if (archive.style.display !== "none") {
                displayArchiveActivities(categories); // Redisplay archive activities after deletion
            }
        }
    }

    function deleteActivityFromLocalStorage(activity) {
        const activities = JSON.parse(localStorage.getItem("activities")) || [];
        const updatedActivities = activities.filter(act => act.id !== activity.id);
        localStorage.setItem("activities", JSON.stringify(updatedActivities));
    }

    function saveActivity(activity) {
        const activities = JSON.parse(localStorage.getItem("activities")) || [];
        activities.push(activity);
        activities.sort((a, b) => a.datetime - b.datetime);
        localStorage.setItem("activities", JSON.stringify(activities));
    }

    function addActivity(activity) {
        const activityDiv = document.createElement("div");
        activityDiv.classList.add("activity");
        activityDiv.dataset.id = activity.id;
        const formattedDateTime = convertTimestampToString(activity.datetime, timezone, luxonDateformat) + " " + getDayOfWeekFromTimestamp(activity.datetime, timezone);
        activityDiv.innerHTML = `
            <p>Date & Time: ${formattedDateTime}</p>
            <p>Category: ${activity.category}</p>
            <p>Title: ${activity.title}</p>
            <p>Content: ${activity.content}</p>      
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
            <button class="archive-btn">Send to Archive</button>
        `;
        activityList.appendChild(activityDiv);

        const editButton = activityDiv.querySelector(".edit-btn");
        editButton.addEventListener("click", function() {
            openEditModal(activity);
        });

        const deleteButton = activityDiv.querySelector(".delete-btn");
        deleteButton.addEventListener("click", function() {
            deleteActivity(activity);
        });

        const archiveButton = activityDiv.querySelector(".archive-btn");
        archiveButton.addEventListener("click", function() {
            sendToArchive(activity);
        });
    }

    function sendToArchive(activity) {
        const archivedActivity = { ...activity };
        archivedActivity.id = "archive-" + archivedActivity.id; // Prefixing id to differentiate from regular activities
        saveArchiveActivity(archivedActivity);
        deleteActivity(activity);
    }

    function saveArchiveActivity(activity) {
        const archiveActivities = JSON.parse(localStorage.getItem("archiveActivities")) || [];
        archiveActivities.push(activity);
        archiveActivities.sort((a, b) => a.datetime - b.datetime);
        localStorage.setItem("archiveActivities", JSON.stringify(archiveActivities));
    }

    function displaySavedActivities(categories = []) {   
        activityList.innerHTML = ""; // Clear the existing activity list
        const activities = JSON.parse(localStorage.getItem("activities")) || [];
        const filteredActivities = filterActivitiesByCategories(activities, categories);
        filteredActivities.forEach(activity => {
            addActivity(activity);
        });
        updateDisplayedListOfCategories();
    }

    function displayArchiveActivities(categories = []) {
        archiveList.innerHTML = ""; // Clear the existing archive list
        const archiveActivities = JSON.parse(localStorage.getItem("archiveActivities")) || [];
        const filteredArchiveActivities = filterActivitiesByCategories(archiveActivities, categories);
        filteredArchiveActivities.forEach(activity => {
            addArchiveActivity(activity);
        });
        updateDisplayedListOfCategories();
    }

    function addArchiveActivity(activity) {
        const activityDiv = document.createElement("div");
        activityDiv.classList.add("activity");
        activityDiv.dataset.id = activity.id;
        const formattedDateTime = convertTimestampToString(activity.datetime, timezone, luxonDateformat) + " " + getDayOfWeekFromTimestamp(activity.datetime, timezone);
        activityDiv.innerHTML = `
            <p>Date & Time: ${formattedDateTime}</p>
            <p>Category: ${activity.category}</p>
            <p>Title: ${activity.title}</p>
            <p>Content: ${activity.content}</p>      
            <button class="send-back-btn">Send back</button>
        `;
        archiveList.appendChild(activityDiv);

        const sendBackButton = activityDiv.querySelector(".send-back-btn");
        sendBackButton.addEventListener("click", function() {
            sendBackToActivities(activity);
        });
    }

    function sendBackToActivities(activity) {
        const regularActivity = { ...activity };
        regularActivity.id = regularActivity.id.replace("archive-", ""); // Remove prefix to get original ID
        saveActivity(regularActivity);
        deleteArchiveActivity(activity);
    }

    function deleteArchiveActivity(activity) {
        const archiveActivities = JSON.parse(localStorage.getItem("archiveActivities")) || [];
        const updatedArchiveActivities = archiveActivities.filter(act => act.id !== activity.id);
        localStorage.setItem("archiveActivities", JSON.stringify(updatedArchiveActivities));
        displayArchiveActivities();
    }

    function filterActivitiesByCategories(activities, categories) {
        activities.sort((a, b) => a.datetime - b.datetime);
        if (categories.length === 0) {
            return activities;
        } else if (categories.length === 1) {
            activities = activities.filter(activity => activity.category.startsWith(categories[0]));
            return activities;
        } else {   
            activities = activities.filter(activity => categories.includes(activity.category));
            return activities;
        }
    }

    function updateDisplayedListOfCategories() {
        var activities = JSON.parse(localStorage.getItem("activities")) || [];
        activities.sort((a, b) => a.datetime - b.datetime);
        var listOfCategories = [];
        activities.forEach(activity => {
            if (!listOfCategories.includes(activity.category)) {
                listOfCategories.push(activity.category);
            }
        });
        if (listOfCategories.length == 0) {
            $("#list-of-categories-home").text("No categories at home for now, please add some activities...");
        } else {
            $("#list-of-categories-home").text(listOfCategories.join(', '));
        }
        
        activities = JSON.parse(localStorage.getItem("archiveActivities")) || [];
        activities.sort((a, b) => a.datetime - b.datetime);
        listOfCategories = [];
        activities.forEach(activity => {
            if (!listOfCategories.includes(activity.category)) {
                listOfCategories.push(activity.category);
            }
        });
        if (listOfCategories.length == 0) {
            $("#list-of-categories-archive").text("No categories at archive for now, please add some activities...");
        } else {
            $("#list-of-categories-archive").text(listOfCategories.join(', '));
        }        
    }
    
    displaySavedActivities();

    const exportBtn = document.getElementById("export-btn");
    const importBtn = document.getElementById("import-btn");
    const fileInput = document.getElementById("file-input");

    exportBtn.addEventListener("click", function() {
        const data = JSON.stringify(localStorage);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ActivityTrackerData.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    importBtn.addEventListener("click", function() {
        fileInput.click();
    });

    fileInput.addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const data = JSON.parse(e.target.result);
                for (let key in data) {
                    localStorage.setItem(key, data[key]);
                }
                // Optionally, you can refresh the page or update the displayed data
                location.reload();
            };
            reader.readAsText(file);
        }
    });
});
