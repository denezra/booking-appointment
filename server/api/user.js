const express = require('express');
const app = express();
const router = express.Router();
const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const moment = require('moment');

router.post('/register', async (req, res) => {
	try {
		const userExists = await User.findOne({ email: req.body.email });
		if (userExists) {
			return res
				.status(200)
				.send({ message: 'User already exists', success: false });
		}
		const password = req.body.password;
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		req.body.password = hashedPassword;

		const newUser = new User(req.body);

		await newUser.save();

		res
			.status(200)
			.send({ message: 'User created successfully', success: true });
	} catch (error) {
		res.status(500).send({
			message: 'Error creating user',
			success: false,
			error: error.message
		});
	}
});

router.post('/login', async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			return res
				.status(200)
				.send({ message: 'User does not exist', success: false });
		}

		const isMatch = await bcrypt.compare(req.body.password, user.password);
		if (!isMatch) {
			return res
				.status(200)
				.send({ message: 'Password is incorrect', success: false });
		}

		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: '1d'
		});
		res
			.status(200)
			.send({ message: 'Login successful', success: true, data: token });
	} catch (error) {
		res.status(500).send({
			message: 'Error logging in',
			success: false,
			error: error.message
		});
	}
});

router.post('/get-user-info-by-id', authMiddleware, async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.body.userId });
		user.password = undefined;
		const userInfo = user.doc;
		if (!user) {
			return res
				.status(200)
				.send({ message: 'User does not exist', success: false });
		}
		res.status(200).send({
			success: true,
			data: user
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error getting user info  ',
			success: false,
			error: error.message
		});
	}
});

router.post('/apply-doctor-account', authMiddleware, async (req, res) => {
	try {
		const newDoctor = new Doctor({ ...req.body, status: 'Pending' });

		await newDoctor.save();
		const adminUser = await User.findOne({ isAdmin: true });
		const unseenNotifications = adminUser.unseenNotifications;
		unseenNotifications.push({
			type: 'new-doctor-request',
			message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for a doctor account`,
			data: {
				doctorId: newDoctor._id,
				name: `${newDoctor.firstName} ${newDoctor.lastName}`
			},
			onClickPath: '/admin/doctors-list'
		});
		await User.findByIdAndUpdate(adminUser._id, { unseenNotifications });
		res.status(200).send({
			success: true,
			message: 'Doctor account applied successfully'
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error applying this account as doctor',
			success: false,
			error: error.message
		});
	}
});

router.post(
	'/mark-all-notifications-as-seen',
	authMiddleware,
	async (req, res) => {
		try {
			const user = await User.findOne({ _id: req.body.userId });
			const unseenNotifications = user.unseenNotifications;
			const seenNotifications = user.seenNotifications;
			seenNotifications.push(...unseenNotifications);
			user.unseenNotifications = [];
			user.seenNotifications = seenNotifications;
			const updateUser = await user.save();
			updateUser.password = undefined;
			res.status(200).send({
				success: true,
				message: 'All notifications marked as seen',
				data: updateUser
			});
		} catch (error) {
			res.status(500).send({
				message: 'Error when marking the notifications',
				success: false,
				error: error.message
			});
		}
	}
);

router.post('/delete-all-notifications', authMiddleware, async (req, res) => {
	try {
		const user = await User.findOne({ _id: req.body.userId });
		user.seenNotifications = [];
		user.unseenNotifications = [];
		const updateUser = await user.save();
		updateUser.password = undefined;
		res.status(200).send({
			success: true,
			message: 'All notifications cleared',
			data: updateUser
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error when deleting the notifications',
			success: false,
			error: error.message
		});
	}
});

router.get('/get-all-approved-doctors', authMiddleware, async (req, res) => {
	try {
		const doctors = await Doctor.find({ status: 'Approved' }).select(
			'-password'
		);
		res.status(200).send({
			message: 'Doctors fetched successfully',
			success: true,
			data: doctors
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error when fetching the doctors list',
			success: false,
			error: error.message
		});
	}
});

router.post('/book-appointment', authMiddleware, async (req, res) => {
	try {
		req.body.status = 'Pending';
		req.body.date = moment(req.body.date, 'DD-MM-YYYY').toISOString();
		req.body.time = moment(req.body.time, 'HH:mm').toISOString();
		const newAppointment = new Appointment(req.body);
		await newAppointment.save();
		// Pushing notification to doctor based on his userId
		const user = await User.findOne({ _id: req.body.doctorInfo.userId });
		user.unseenNotifications.push({
			type: 'new-appointment-request',
			message: `A new appointment request has been made by ${req.body.userInfo.name}`,
			onClickPath: '/doctor/appointments'
		});
		await user.save();
		res.status(200).send({
			message: 'Booking this appointment is a success',
			success: true
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error booking this appointment',
			success: false,
			error: error.message
		});
	}
});

router.post('/check-booking-availability', authMiddleware, async (req, res) => {
	try {
		const date = moment(req.body.date, 'DD-MM-YYYY').toISOString();
		const fromTime = moment(req.body.time, 'HH:mm')
			.subtract(1, 'hours')
			.toISOString();
		const toTime = moment(req.body.time, 'HH:mm').add(1, 'hours').toISOString();

		const doctorId = req.body.doctorId;
		const appointments = await Appointment.find({
			doctorId,
			date,
			time: { $gte: fromTime, $lte: toTime }
		});

		if (appointments.length > 0) {
			return res.status(200).send({
				message: 'Appointment is not available',
				success: false
			});
		} else {
			return res.status(200).send({
				message: 'Appointment is available',
				success: true
			});
		}
	} catch (error) {
		res.status(500).send({
			message: 'Error booking this appointment',
			success: false,
			error: error.message
		});
	}
});

router.get('/get-appointments-by-user-id', authMiddleware, async (req, res) => {
	try {
		const appointments = await Appointment.find({ userId: req.body.userId });

		res.status(200).send({
			message: 'All appointments fetched successfully',
			success: true,
			data: appointments
		});
	} catch (error) {
		res.status(500).send({
			message: 'Error when fetching the appointments',
			success: false,
			error: error.message
		});
	}
});

module.exports = router;
