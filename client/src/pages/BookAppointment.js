import React from 'react';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { useParams, useNavigate } from 'react-router-dom';
import { hideLoading, showLoading } from '../redux/alertsSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { DatePicker, Row, TimePicker, Col, Button } from 'antd';
import moment from 'moment';
import apiConfig from '../config/apiConfig';

function BookAppointment()
{
	const [ isAvailable, setIsAvailable ] = useState(false);
	const [ date, setDate ] = useState();
	const [ time, setTime ] = useState();
	const [ doctor, setDoctor ] = useState(null);
	const { user } = useSelector(state => state.user);
	const params = useParams();
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const checkAvailability = async () =>
	{
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.post(
				'/user/check-booking-availability',
				{
					doctorId: params.doctorId,
					date: date,
					time: time,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success)
			{
				toast.success(response.data.message);
				setIsAvailable(true);
			} else
			{
				toast.error(response.data.message);
				setIsAvailable(false);
			}
		} catch (error)
		{
			dispatch(hideLoading());
			toast.error('Error booking appointment');
		}
	};

	const bookNow = async () =>
	{
		setIsAvailable(false);
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.post(
				'/user/book-appointment',
				{
					doctorId: params.doctorId,
					userId: user._id,
					doctorInfo: doctor,
					userInfo: user,
					date: date,
					time: time,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success)
			{
				toast.success(response.data.message);
				navigate('/appointments');
			}
		} catch (error)
		{
			dispatch(hideLoading());
			toast.error('Error booking appointment');
		}
	};

	useEffect(() =>
	{
		const getDoctorData = async () =>
		{
			try
			{
				dispatch(showLoading());
				const response = await apiConfig.post(
					'/doctor/get-doctor-info-by-id',
					{ doctorId: params.doctorId },
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					}
				);
				dispatch(hideLoading());
				if (response.data.success)
				{
					setDoctor(response.data.data);
				}
			} catch (error)
			{
				dispatch(hideLoading());
			}
		};
		getDoctorData();
	}, [ dispatch, doctor, params.doctorId ]);
	return (
		<Layout>
			{doctor && (
				<div>
					<h1 className="page-title">
						{doctor?.firstName} {doctor?.lastName}
					</h1>
					<hr />
					<Row gutter={20} className="mt-5" align="middle">
						<Col span={8} sm={24} xs={24} lg={8}>
							<img
								src="https://thumbs.dreamstime.com/b/finger-press-book-now-button-booking-reservation-icon-online-149789867.jpg"
								alt="Book Now"
								width="100%"
								height="100%"
							/>
						</Col>
						<Col span={8} sm={24} xs={24} lg={8}>
							<h1 className="normal-text">
								<b>Schedule: </b>
								{doctor?.timings[ 0 ]} - {doctor?.timings[ 1 ]}
							</h1>
							<p>
								<b>Phone Number: </b>
								{doctor?.phoneNumber}
							</p>
							<p>
								<b>Address: </b>
								{doctor?.address}
							</p>
							<p>
								<b>Fee per visit: </b>
								{doctor?.feePerConsultation}
							</p>
							<p>
								<b>Website: </b>
								{doctor?.website}
							</p>
							<div className="d-flex flex-column pt-2 mt-2">
								<DatePicker
									format="DD-MM-YYYY"
									onChange={value =>
									{
										setIsAvailable(false);
										setDate(moment(value).format('DD-MM-YYYY'));
									}}
								/>
								<TimePicker
									format="HH:mm"
									className="mt-3"
									onChange={value =>
									{
										setIsAvailable(false);
										setTime(moment(value).format('HH:mm'));
									}}
								/>
								{!isAvailable && (
									<Button
										className="primary-button mt-2 full-width-button"
										onClick={() =>
										{
											checkAvailability();
										}}>
										Check Availability
									</Button>
								)}
								{isAvailable && (
									<Button
										className="primary-button mt-2 full-width-button"
										onClick={() =>
										{
											bookNow();
										}}>
										Book Now
									</Button>
								)}
							</div>
						</Col>
					</Row>
				</div>
			)}
		</Layout>
	);
}

export default BookAppointment;
