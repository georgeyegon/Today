const baseUrl = 'http://localhost:3000/'; // Base URL for your JSON server

// Function to toggle the form visibility
function toggleForm(type) {
    if (type === 'lost') {
        document.getElementById('lost-form').style.display = 'block';
        document.getElementById('found-form').style.display = 'none';
    } else if (type === 'found') {
        document.getElementById('lost-form').style.display = 'none';
        document.getElementById('found-form').style.display = 'block';
    }
}

// Function to hide both forms
function closeForms() {
    document.getElementById('lost-form').style.display = 'none';
    document.getElementById('found-form').style.display = 'none';
}

// Function to fetch and display items (either lost or found) when button is clicked
async function displayItems(type) {
    const response = await fetch(`${baseUrl}${type}Items`);
    const items = await response.json();
    const itemsList = document.getElementById(`${type}-items`);
    const otherType = type === 'lost' ? 'found' : 'lost';

    // Hide the other category's items and clear its content
    document.getElementById(`${otherType}-items`).innerHTML = '';

    // Ensure that the other form is closed
    closeForms();

    itemsList.innerHTML = ''; // Clear previous items

    // Add a heading above the items inside the buttons
    const heading = document.createElement('h2');
    heading.textContent = `Here are ${type} items`;
    heading.classList.add('items-heading');

    // Insert the heading above the items list
    itemsList.appendChild(heading);

    items.forEach(item => displayItem(item, type)); // Display each item
}

// Function to display an item
function displayItem(item, type) {
    const itemList = document.getElementById(`${type}-items`);

    const div = document.createElement('div');
    div.className = 'item';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = `${item.category} image`;

    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = 'item-description';
    descriptionContainer.innerHTML = `<strong>Category:</strong> ${item.category}<br>
                                       <strong>Description:</strong> ${item.description}<br>
                                       <strong>Location:</strong> ${item.location}<br>
                                       <strong>Date:</strong> ${item.date}<br>
                                       <strong>Contact:</strong> ${item.contact}`;

    const editButton = document.createElement('button');
    editButton.className = 'btn-edit';
    editButton.textContent = 'Edit';
    editButton.onclick = () => populateForm(item, type); // Populate the form for editing

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => deleteItem(item.id, type); // Delete item on button click

    div.appendChild(img);
    div.appendChild(descriptionContainer);
    div.appendChild(editButton);
    div.appendChild(deleteButton);

    itemList.appendChild(div);
}

// Function to populate the form with an item's details for editing
function populateForm(item, type) {
    document.getElementById(`${type}-category`).value = item.category;
    document.getElementById(`${type}-description`).value = item.description;
    document.getElementById(`${type}-location`).value = item.location;
    document.getElementById(`${type}-date`).value = item.date;
    document.getElementById(`${type}-contact`).value = item.contact;

    toggleForm(type); // Show the relevant form

    const submitButton = document.querySelector(`#${type}-item-form button[type="submit"]`);
    submitButton.textContent = 'Update Item'; // Change button text to "Update Item"
    submitButton.onclick = () => addItem(type, item.id); // Call addItem with item ID to update the item
}

// Function to add or edit an item (either lost or found)
async function addItem(type, itemId = null) {
    const category = document.getElementById(`${type}-category`).value;
    const description = document.getElementById(`${type}-description`).value;
    const location = document.getElementById(`${type}-location`).value;
    const date = document.getElementById(`${type}-date`).value;
    const contact = document.getElementById(`${type}-contact`).value;
    const imageFile = document.getElementById(`${type}-image`).files[0];

    if (!category || !description || !location || !date || !contact || !imageFile) {
        alert("Please fill all fields before submitting.");
        return;
    }

    // Convert image to base64 string
    const reader = new FileReader();
    reader.onloadend = async () => {
        const newItem = {
            category,
            description,
            location,
            date,
            contact,
            image: reader.result // Base64 string of the image
        };

        if (itemId) {
            // Update existing item
            const response = await fetch(`${baseUrl}${type}Items/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
            });
            if (response.ok) {
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} item updated successfully!`);
            }
        } else {
            // Add new item
            const response = await fetch(`${baseUrl}${type}Items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newItem),
            });
            if (response.ok) {
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} item posted successfully!`);
            }
        }

        document.getElementById(`${type}-item-form`).reset(); // Clear the form
        closeForms(); // Close the form after posting or updating
        displayItems(type); // Refresh the item list
    };

    reader.readAsDataURL(imageFile); // Convert the image to base64 before storing
}

// Function to delete an item
async function deleteItem(itemId, type) {
    if (confirm("Are you sure you want to delete this item?")) {
        const response = await fetch(`${baseUrl}${type}Items/${itemId}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            displayItems(type); // Refresh the item list after deletion
        } else {
            alert("Failed to delete the item.");
        }
    }
}

// Event listeners for displaying lost and found items
document.querySelector('.btn-view-lost').addEventListener('click', () => {
    displayItems('lost'); // Show lost items
});

document.querySelector('.btn-view-found').addEventListener('click', () => {
    displayItems('found'); // Show found items
});
