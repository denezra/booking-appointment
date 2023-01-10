const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/get-all-doctors', authMiddleware, async (req, res) => {
	try {
		const doctors = await Doctor.find({}).select('-password');
		doctors.password = undefined;
		res.status(200).send({
			message: 'Doctors fetched successfully',
			success: true,
			data: doctors,
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error when fetching the doctors list',
			success: false,
			error: error.message,
		});
	}
});

router.get('/get-all-users', authMiddleware, async (req, res) => {
	try {
		const users = await User.find({}).select('-password');
		users.password = undefined;
		res.status(200).send({
			message: 'Users fetched successfully',
			success: true,
			data: users,
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error when fetching the users list',
			success: false,
			error: error.message,
		});
	}
});

router.post(
	'/change-doctor-account-status',
	authMiddleware,
	async (req, res) => {
		try {
			const { doctorId, status } = req.body;
			const doctor = await Doctor.findByIdAndUpdate(doctorId, {
				status,
			});

			const user = await User.findOne({ _id: doctor.userId });
			const unseenNotifications = user.unseenNotifications;
			unseenNotifications.push({
				type: 'new-doctor-request-changed',
				message: `Your doctor account has been ${status.toLowerCase()}`,
				onClickPath: '/notifications',
			});
			user.isDoctor = status === 'Approved' ? true : false;
			await user.save();

			res.status(200).send({
				message: 'Doctor status updated successfully',
				success: true,
				data: doctor,
			});
		} catch (error) {
			res.status(500).send({
				message: 'Error when changing the doctor status',
				success: false,
				error: error.message,
			});
		}
	}
);

module.exports = router;
