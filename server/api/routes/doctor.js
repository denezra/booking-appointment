const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const router = express.Router();

router.post('/get-doctor-info-by-user-id', authMiddleware, async (req, res) => {
	try {
		const doctor = await Doctor.findOne({ userId: req.body.userId });
		res.status(200).send({
			success: true,
			message: 'Doctor info fetch successfully',
			data: doctor,
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error getting doctor info',
			success: false,
			error: error.message,
		});
	}
});

router.post('/get-doctor-info-by-id', authMiddleware, async (req, res) => {
	try {
		const doctor = await Doctor.findOne({ _id: req.body.doctorId });
		res.status(200).send({
			success: true,
			message: 'Doctor info fetch successfully',
			data: doctor,
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error getting doctor info',
			success: false,
			error: error.message,
		});
	}
});

router.post('/update-doctor-profile', authMiddleware, async (req, res) => {
	try {
		const doctor = await Doctor.findOneAndUpdate(
			{ userId: req.body.userId },
			req.body
		);
		res.status(200).send({
			success: true,
			message: 'Doctor info update successfully',
			data: doctor,
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error updating doctor info',
			success: false,
			error: error.message,
		});
	}
});

router.get(
	'/get-appointments-by-doctor-id',
	authMiddleware,
	async (req, res) => {
		try {
			const doctor = await Doctor.findOne({ userId: req.body.userId });
			const appointments = await Appointment.find({
				doctorId: doctor._id,
			});

			res.status(200).send({
				message: 'All appointments fetched successfully',
				success: true,
				data: appointments,
			});
		} catch (error) {
			res.status(500).send({
				message: 'Error when fetching the appointments',
				success: false,
				error: error.message,
			});
		}
	}
);

router.post('/change-appointment-status', authMiddleware, async (req, res) => {
	try {
		const { appointmentId, status } = req.body;
		const appointment = await Appointment.findByIdAndUpdate(appointmentId, {
			status,
		});

		const user = await User.findOne({ _id: appointment.userId });
		const unseenNotifications = user.unseenNotifications;
		unseenNotifications.push({
			type: 'appointment-status-changed',
			message: `Your appointment status has been ${status.toLowerCase()}`,
			onClickPath: '/appointments',
		});

		await user.save();

		res.status(200).send({
			message: 'Appointments status updated successfully',
			success: true,
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error when changing the appointments status',
			success: false,
			error: error.message,
		});
	}
});

module.exports = router;
