import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from '../../components/Layout';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../redux/alertsSlice';
import { Table } from 'antd';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import apiConfig from '../../config/apiConfig';

function DoctorAppointments()
{
	const [ appointments, setAppointments ] = useState([]);
	const dispatch = useDispatch();
	const controller = useMemo(
		() => new AbortController(), []);
	const getAppointmentsData = useCallback(async () =>
	{
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.get(
				'/doctor/get-appointments-by-doctor-id',
				{
					signal: controller.signal,
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success)
			{
				toast.success(response.data.message);
				setAppointments(response.data.data);
			}
		} catch (error)
		{
			toast.error('Something went wrong');
			dispatch(hideLoading());
		}
	}, [ controller.signal, dispatch ]);
	const changeAppointmentStatus = async (record, status) =>
	{
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.post(
				'/doctor/change-appointment-status',
				{
					appointmentId: record._id,
					status: status,
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
				getAppointmentsData();
			} else
			{
			}
		} catch (error)
		{
			toast.error(error.message);
			dispatch(hideLoading());
		}
	};
	const columns = [
		{
			title: 'Id',
			dataIndex: '_id',
		},
		{
			title: 'Patient',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => (
				<span className="normal-text" key={record.userInfo._id}>
					{record.userInfo.name}
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
		{
			title: 'Actions',
			dataIndex: 'actions',
			key: 'actions',
			render: (text, record) => (
				<div className="d-flex">
					{record.status === 'Pending' && (
						<div className="d-flex">
							<h1
								className="anchor px-2 mb-0"
								onClick={() => changeAppointmentStatus(record, 'Approved')}>
								Approve
							</h1>
							<h1
								className="anchor mb-0"
								onClick={() => changeAppointmentStatus(record, 'Rejected')}>
								Reject
							</h1>
						</div>
					)}
				</div>
			),
		},
	];
	useEffect(() =>
	{
		getAppointmentsData();
		return () => { controller.abort() };
	}, [ controller, getAppointmentsData ]);

	return (
		<Layout>
			<h1 className="page-title">Appointments</h1>
			<hr />
			<Table columns={columns} dataSource={appointments} rowKey="_id" />
		</Layout>
	);
}

export default DoctorAppointments;
