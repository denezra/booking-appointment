import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertsSlice';
import axios from 'axios';
import { Table } from 'antd';
import { toast } from 'react-hot-toast';
import moment from 'moment';

function Appointments() {
	const [appointments, setAppointments] = useState([]);
	const dispatch = useDispatch();

	const columns = [
		{
			title: 'Id',
			dataIndex: '_id',
		},
		{
			title: 'Doctor',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => (
				<span className="normal-text" key={record.doctorInfo._id}>
					{record.doctorInfo.firstName} {record.doctorInfo.lastName}
				</span>
			),
		},
		{
			title: 'Phone',
			dataIndex: 'phoneNumber',
			key: 'phone',
			render: (text, record) => (
				<span className="normal-text" key={record.doctorInfo._id}>
					{record.doctorInfo.phoneNumber}
				</span>
			),
		},
		{
			title: 'Date & Time',
			dataIndex: 'createdAt',
			key: 'dateAndTime',
			render: (text, record) => (
				<span className="normal-text" key={record.doctorInfo._id}>
					{moment(record.date).format('DD-MM-YYYY')}{' '}
					{moment(record.time).format('HH:mm')}
				</span>
			),
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
		},
	];
	useEffect(() => {
		const getAppointmentsData = async () => {
			try {
				dispatch(showLoading());
				const response = await axios.get(
					'/api/user/get-appointments-by-user-id',
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem('token')}`,
						},
					}
				);
				dispatch(hideLoading());
				if (response.data.success) {
					toast.success(response.data.message);
					setAppointments(response.data.data);
				}
			} catch (error) {
				toast.error('Something went wrong');
				dispatch(hideLoading());
			}
		};
		getAppointmentsData();
		return () => {};
	}, [appointments, dispatch]);

	return (
		<Layout>
			<h1 className="page-title">Appointments</h1>
			<hr />
			<Table columns={columns} dataSource={appointments} rowKey="_id" />
		</Layout>
	);
}

export default Appointments;
