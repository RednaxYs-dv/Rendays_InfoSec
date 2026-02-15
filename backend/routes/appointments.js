const express = require('express');
const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

const router = express.Router();

// ─── Service Price Map ────────────────────────────────────────────────────────
const PRICES = {
  'Haircut': 200,
  'Beard Trim': 150,
  'Massage': 600,
  'Full Service': 999
};
const VALID_SERVICES = Object.keys(PRICES);
const VALID_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

function getServicePrice(service) {
  return PRICES[service] || 200;
}

// ─── Validation helpers ───────────────────────────────────────────────────────
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function isValidDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d.getTime());
}

function isValidTime(timeStr) {
  return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeStr);
}

function isValidPhone(phone) {
  return /^[0-9+\-\s()]{7,20}$/.test(phone);
}

// ─── GET /api/appointments ────────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { customer: req.user.id };
    const appointments = await Appointment.find(query)
      .populate('customer', 'username email')
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

// ─── POST /api/appointments ───────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { phone, service, date, time, notes } = req.body;

    // Validate required fields
    if (!phone || !service || !date || !time) {
      return res.status(400).json({ success: false, message: 'Phone, service, date, and time are required' });
    }

    // Type checks to prevent injection
    if (typeof phone !== 'string' || typeof service !== 'string' || typeof date !== 'string' || typeof time !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid input types' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format' });
    }

    if (!VALID_SERVICES.includes(service)) {
      return res.status(400).json({ success: false, message: `Invalid service. Must be one of: ${VALID_SERVICES.join(', ')}` });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    if (!isValidTime(time)) {
      return res.status(400).json({ success: false, message: 'Invalid time format (use HH:MM)' });
    }

    // Don't allow past appointments
    const aptDate = new Date(date);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (aptDate < today) {
      return res.status(400).json({ success: false, message: 'Appointment date cannot be in the past' });
    }

    const appointment = new Appointment({
      customer: req.user.id,
      customerName: req.user.username,
      phone: phone.trim(),
      service,
      appointmentDate: date,
      appointmentTime: time,
      amount: getServicePrice(service),
      notes: notes ? String(notes).trim().slice(0, 500) : ''
    });

    await appointment.save();
    res.status(201).json({ success: true, message: 'Appointment booked successfully', appointment });
  } catch (error) {
    console.error('Error creating appointment:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
});

// ─── PUT /api/appointments/:id ────────────────────────────────────────────────
// BUG FIX: The original used `notes || appointment.notes` which would fail to
// clear notes (empty string is falsy). Now uses explicit undefined checks.
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Authorization check
    if (appointment.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this appointment' });
    }

    const { phone, service, date, time, notes, status } = req.body;

    // Validate only fields that were provided
    if (phone !== undefined) {
      if (typeof phone !== 'string' || !isValidPhone(phone)) {
        return res.status(400).json({ success: false, message: 'Invalid phone number' });
      }
    }

    if (service !== undefined) {
      if (!VALID_SERVICES.includes(service)) {
        return res.status(400).json({ success: false, message: `Invalid service. Must be one of: ${VALID_SERVICES.join(', ')}` });
      }
    }

    if (date !== undefined) {
      if (typeof date !== 'string' || !isValidDate(date)) {
        return res.status(400).json({ success: false, message: 'Invalid date format' });
      }
    }

    if (time !== undefined) {
      if (typeof time !== 'string' || !isValidTime(time)) {
        return res.status(400).json({ success: false, message: 'Invalid time format (use HH:MM)' });
      }
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
      }
    }

    // BUG FIX: Use explicit `!== undefined` so empty string clears the field correctly
    // The old code used `field || existing` which broke when clearing a field with ""
    const updateFields = {
      phone:            phone !== undefined ? phone.trim() : appointment.phone,
      service:          service !== undefined ? service : appointment.service,
      appointmentDate:  date !== undefined ? date : appointment.appointmentDate,
      appointmentTime:  time !== undefined ? time : appointment.appointmentTime,
      notes:            notes !== undefined ? String(notes).trim().slice(0, 500) : appointment.notes,
      status:           status !== undefined ? status : appointment.status,
      amount:           service !== undefined ? getServicePrice(service) : appointment.amount,
    };

    const updated = await Appointment.findByIdAndUpdate(id, { $set: updateFields }, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, message: 'Appointment updated successfully', appointment: updated });
  } catch (error) {
    console.error('Error updating appointment:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
});

// ─── DELETE /api/appointments/:id ────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid appointment ID' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this appointment' });
    }

    await Appointment.deleteOne({ _id: id });
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    console.error('Error deleting appointment:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete appointment' });
  }
});

module.exports = router;
