import fs from 'fs';
import path from 'path';

// Path to the reservations JSON file
const reservationsFilePath = path.join(process.cwd(), 'data', 'reservations', 'reservations.json');

// Helper function to read reservations from the JSON file
export function getReservations() {
  try {
    // Check if the file exists
    if (!fs.existsSync(reservationsFilePath)) {
      // Create the file with an empty reservations array if it doesn't exist
      fs.writeFileSync(reservationsFilePath, JSON.stringify({ reservations: [] }));
      return { reservations: [] };
    }

    // Read the file and parse the JSON data
    const jsonData = fs.readFileSync(reservationsFilePath, 'utf8');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading reservations:', error);
    return { reservations: [] };
  }
}

// Helper function to save reservations to the JSON file
function saveReservations(data) {
  try {
    // Ensure the directory exists
    const dir = path.dirname(reservationsFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write the data to the file
    fs.writeFileSync(reservationsFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving reservations:', error);
    return false;
  }
}

// Create a new reservation
export function createReservation(reservation) {
  try {
    const data = getReservations();
    
    // Generate a new ID
    const newId = data.reservations.length > 0 
      ? Math.max(...data.reservations.map(r => r.id)) + 1 
      : 1;
    
    // Add the new reservation with the generated ID and timestamp
    const newReservation = {
      id: newId,
      ...reservation,
      createdAt: new Date().toISOString(),
      status: 'confirmed'
    };
    
    data.reservations.push(newReservation);
    
    // Save the updated data
    saveReservations(data);
    
    return newReservation;
  } catch (error) {
    console.error('Error creating reservation:', error);
    return null;
  }
}

// Get a specific reservation by ID
export function getReservationById(id) {
  try {
    const data = getReservations();
    return data.reservations.find(reservation => reservation.id === parseInt(id)) || null;
  } catch (error) {
    console.error('Error getting reservation by ID:', error);
    return null;
  }
}

// Update a reservation
export function updateReservation(id, updates) {
  try {
    const data = getReservations();
    const index = data.reservations.findIndex(reservation => reservation.id === parseInt(id));
    
    if (index === -1) {
      return null;
    }
    
    // Update the reservation
    data.reservations[index] = {
      ...data.reservations[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save the updated data
    saveReservations(data);
    
    return data.reservations[index];
  } catch (error) {
    console.error('Error updating reservation:', error);
    return null;
  }
}

// Delete a reservation
export function deleteReservation(id) {
  try {
    const data = getReservations();
    const index = data.reservations.findIndex(reservation => reservation.id === parseInt(id));
    
    if (index === -1) {
      return false;
    }
    
    // Remove the reservation
    data.reservations.splice(index, 1);
    
    // Save the updated data
    saveReservations(data);
    
    return true;
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return false;
  }
}
