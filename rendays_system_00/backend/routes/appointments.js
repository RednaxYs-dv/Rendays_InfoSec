const express = require('express');
const Appointment = require('../models/Appointment');
// Ensure this path is correct based on your file structure (../middleware/auth)
const auth = require('../middleware/auth'); 

const router = express.Router();

// Helper function to calculate price (kept from your file)
function getServicePrice(service) {
  const prices = {
    'Haircut': 350,
    'Beard Trim': 200,
    'Massage': 500,
    'Full Service': 700
  };
  return prices[service] || 300;
}

// --- GET /api/appointments --- (FETCH ALL/USER APPOINTMENTS)
router.get('/', auth, async (req, res) => {
  try {
    // If user has 'admin' role, fetch all appointments. Otherwise, fetch only their own.
    const query = req.user.role === 'admin' 
      ? {} 
      : { customer: req.user.id };
    
    const appointments = await Appointment.find(query)
      .populate('customer', 'username email')
      .sort({ appointmentDate: -1, appointmentTime: -1 });
    
    res.json({ 
      success: true, 
      data: appointments 
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// --- POST /api/appointments --- (CREATE NEW APPOINTMENT)
router.post('/', auth, async (req, res) => {
  try {
    const { phone, service, date, time, notes } = req.body;

    const appointment = new Appointment({
      customer: req.user.id,
      customerName: req.user.username,
      phone,
      service,
      appointmentDate: date,
      appointmentTime: time,
      amount: getServicePrice(service),
      notes
    });

    await appointment.save();

    res.json({ 
      success: true, 
      message: 'Appointment booked successfully',
      appointment 
    });
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});


// --- PUT /api/appointments/:id --- (UPDATE APPOINTMENT)
router.put('/:id', auth, async (req, res) => {
  try {
    // 1. Find the appointment
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // 2. Authorization Check (Only the customer or an admin can update)
    if (appointment.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }
    
    // 3. Prepare update object
    const { phone, service, date, time, notes } = req.body;
    
    const updateFields = {
      phone: phone || appointment.phone,
      service: service || appointment.service,
      appointmentDate: date || appointment.appointmentDate,
      appointmentTime: time || appointment.appointmentTime,
      notes: notes || appointment.notes,
      // Recalculate amount if the service changed
      amount: service ? getServicePrice(service) : appointment.amount,
    };

    // 4. Update the document
    appointment = await Appointment.findByIdAndUpdate(req.params.id, updateFields, {
      new: true, // Return the updated document
      runValidators: true // Re-run Mongoose schema validation
    });

    res.json({ success: true, message: 'Appointment updated successfully', appointment });

  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, message: 'Appointment not found (Invalid ID format)' });
    }
    console.error('Error updating appointment:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


// --- DELETE /api/appointments/:id --- (DELETE APPOINTMENT)
router.delete('/:id', auth, async (req, res) => {
  try {
    // 1. Find the appointment
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // 2. Authorization Check (Only the customer or an admin can delete)
    if (appointment.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this appointment' });
    }

    // 3. Delete the document
    await Appointment.deleteOne({ _id: req.params.id }); 

    res.json({ success: true, message: 'Appointment deleted successfully' });
    
  } catch (error) {
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ success: false, message: 'Appointment not found (Invalid ID format)' });
    }
    console.error('Error deleting appointment:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;