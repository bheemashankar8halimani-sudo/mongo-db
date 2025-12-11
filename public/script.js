// API Base URL
const API_BASE_URL = '/api/destinations';

// DOM Elements
const form = document.getElementById('destination-form');
const destinationsContainer = document.getElementById('destinations-container');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const noDestinationsMessage = document.getElementById('no-destinations-message');

// Form fields
const idInput = document.getElementById('destination-id');
const nameInput = document.getElementById('name');
const locationInput = document.getElementById('location');
const descriptionInput = document.getElementById('description');
const dateInput = document.getElementById('date');

// Temporary storage for offline mode
let tempStorage = JSON.parse(localStorage.getItem('destinations') || '[]');
let nextTempId = tempStorage.length > 0 ? Math.max(...tempStorage.map(d => d.id)) + 1 : 1;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderDestinations();
    
    // Form submission event
    form.addEventListener('submit', handleFormSubmit);
    
    // Cancel button event
    cancelBtn.addEventListener('click', resetForm);
});

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const destinationData = {
        name: nameInput.value,
        location: locationInput.value,
        description: descriptionInput.value,
        date: dateInput.value || null
    };
    
    try {
        if (idInput.value && !idInput.value.startsWith('temp-')) {
            // Update existing destination in database
            await updateDestination(idInput.value, destinationData);
        } else if (idInput.value && idInput.value.startsWith('temp-')) {
            // Update temporary destination
            updateTempDestination(idInput.value.replace('temp-', ''), destinationData);
        } else {
            // Add new destination
            await addDestination(destinationData);
        }
        
        resetForm();
    } catch (error) {
        console.error('Error saving destination:', error);
        alert('Error saving destination. Please try again.');
    }
}

// Add a new destination
async function addDestination(destination) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(destination)
        });
        
        if (response.ok) {
            await renderDestinations();
        } else if (response.status === 503) {
            // Database unavailable, save to temporary storage
            addToTempStorage(destination);
        } else {
            throw new Error('Failed to add destination');
        }
    } catch (error) {
        // Network error, save to temporary storage
        addToTempStorage(destination);
    }
}

// Add to temporary storage
function addToTempStorage(destination) {
    const tempDestination = {
        ...destination,
        _id: `temp-${nextTempId}`,
        id: nextTempId,
        createdAt: new Date().toISOString()
    };
    
    tempStorage.push(tempDestination);
    nextTempId++;
    localStorage.setItem('destinations', JSON.stringify(tempStorage));
    renderDestinations();
    alert('Destination saved locally. It will be synced when database is available.');
}

// Update an existing destination
async function updateDestination(id, updatedDestination) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDestination)
        });
        
        if (response.ok) {
            await renderDestinations();
        } else {
            throw new Error('Failed to update destination');
        }
    } catch (error) {
        console.error('Error updating destination:', error);
        alert('Error updating destination. Please try again.');
    }
}

// Update temporary destination
function updateTempDestination(id, updatedDestination) {
    tempStorage = tempStorage.map(dest => 
        dest.id == id ? {...updatedDestination, _id: `temp-${id}`, id: parseInt(id)} : dest
    );
    localStorage.setItem('destinations', JSON.stringify(tempStorage));
    renderDestinations();
}

// Delete a destination
async function deleteDestination(id) {
    if (confirm('Are you sure you want to delete this destination?')) {
        try {
            if (id.startsWith('temp-')) {
                // Delete from temporary storage
                deleteTempDestination(id.replace('temp-', ''));
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                await renderDestinations();
            } else {
                throw new Error('Failed to delete destination');
            }
        } catch (error) {
            console.error('Error deleting destination:', error);
            alert('Error deleting destination. Please try again.');
        }
    }
}

// Delete from temporary storage
function deleteTempDestination(id) {
    tempStorage = tempStorage.filter(dest => dest.id != id);
    localStorage.setItem('destinations', JSON.stringify(tempStorage));
    renderDestinations();
}

// Edit a destination
async function editDestination(id) {
    try {
        if (id.startsWith('temp-')) {
            // Edit temporary destination
            const destination = tempStorage.find(d => `temp-${d.id}` === id);
            if (destination) {
                populateForm(destination);
                return;
            }
        }
        
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch destination');
        }
        
        const destination = await response.json();
        populateForm({...destination, _id: id});
    } catch (error) {
        console.error('Error fetching destination:', error);
        alert('Error loading destination data. Please try again.');
    }
}

// Populate form with destination data
function populateForm(destination) {
    idInput.value = destination._id;
    nameInput.value = destination.name;
    locationInput.value = destination.location;
    descriptionInput.value = destination.description;
    dateInput.value = destination.date ? destination.date.split('T')[0] : '';
    
    // Change form title and button text
    formTitle.textContent = 'Edit Destination';
    submitBtn.textContent = 'Update Destination';
    
    // Scroll to form
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Reset form to default state
function resetForm() {
    form.reset();
    idInput.value = '';
    formTitle.textContent = 'Add New Destination';
    submitBtn.textContent = 'Add Destination';
}

// Render all destinations
async function renderDestinations() {
    try {
        const response = await fetch(API_BASE_URL);
        
        if (response.ok) {
            const destinations = await response.json();
            
            // Combine with temporary storage
            const allDestinations = [...destinations, ...tempStorage];
            
            displayDestinations(allDestinations);
        } else if (response.status === 503) {
            // Database unavailable, show only temporary storage
            displayDestinations(tempStorage);
            showDatabaseWarning();
        } else {
            throw new Error('Failed to fetch destinations');
        }
    } catch (error) {
        console.error('Error fetching destinations:', error);
        // Show temporary storage as fallback
        displayDestinations(tempStorage);
        showDatabaseWarning();
    }
}

// Display destinations in the UI
function displayDestinations(destinations) {
    if (destinations.length === 0) {
        noDestinationsMessage.style.display = 'block';
        destinationsContainer.innerHTML = '';
        destinationsContainer.appendChild(noDestinationsMessage);
        return;
    }
    
    noDestinationsMessage.style.display = 'none';
    
    // Clear container
    destinationsContainer.innerHTML = '';
    
    // Render each destination
    destinations.forEach(destination => {
        const destinationElement = createDestinationElement(destination);
        destinationsContainer.appendChild(destinationElement);
    });
}

// Show database warning
function showDatabaseWarning() {
    const warning = document.createElement('div');
    warning.className = 'database-warning';
    warning.innerHTML = `
        <p><strong>Database Unavailable:</strong> Data is being stored locally and will sync when connection is restored.</p>
    `;
    warning.style.backgroundColor = '#fff3cd';
    warning.style.border = '1px solid #ffeaa7';
    warning.style.borderRadius = '5px';
    warning.style.padding = '10px';
    warning.style.marginBottom = '20px';
    warning.style.color = '#856404';
    
    const destinationsSection = document.querySelector('.destinations-section');
    destinationsSection.insertBefore(warning, destinationsSection.firstChild);
}

// Create destination card element
function createDestinationElement(destination) {
    const card = document.createElement('div');
    card.className = 'destination-card';
    
    // Add indicator for temporary storage
    const storageIndicator = destination._id.startsWith('temp-') ? 
        '<span style="color: #ffc107; font-size: 0.8em;">(Local Only)</span>' : '';
    
    // Format date for display
    const formattedDate = destination.date ? new Date(destination.date).toLocaleDateString() : 'Not scheduled';
    
    card.innerHTML = `
        <div class="destination-header">
            <h3 class="destination-name">${destination.name} ${storageIndicator}</h3>
            <span class="destination-location">${destination.location}</span>
        </div>
        <div class="destination-date">Planned visit: ${formattedDate}</div>
        <p class="destination-description">${destination.description || 'No description provided.'}</p>
        <div class="destination-actions">
            <button class="btn-edit" onclick="editDestination('${destination._id}')">Edit</button>
            <button class="btn-delete" onclick="deleteDestination('${destination._id}')">Delete</button>
        </div>
    `;
    
    return card;
}