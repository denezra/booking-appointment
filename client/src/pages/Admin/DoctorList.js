import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../redux/alertsSlice';
import axios from 'axios';
import { Table } from 'antd';
import { toast } from 'react-hot-toast';
import moment from 'moment';

function DoctorList() {
	const [doctors, setDoctors] = useState([]);
	const dispatch = useDispatch();
	const getDoctorsData = useCallback(async () => {
		try {
			dispatch(showLoading());
			const response = await axios.get('/api/admin/get-all-doctors', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				setDoctors(response.data.data);
			}
		} catch (error) {
			toast.error('Something went wrong');
			dispatch(hideLoading());
		}
	}, [dispatch]);
	const changeDoctorStatus = async (record, status) => {
		try {
			dispatch(showLoading());
			const response = await axios.post(
				'/api/admin/change-doctor-account-status',
				{ doctorId: record._id, status: status },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				getDoctorsData();
			} else {
			}
		} catch (error) {
			toast.error('Something went wrong');
			dispatch(hideLoading());
		}
	};
	useEffect(() => {
		getDoctorsData();
		return () => {};
	}, [getDoctorsData]);
	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
			render: (text, record) => (
				<span className="normal-text" key={record._id}>
					{record.firstName} {record.lastName}
				</span>
			),
		},
		{
			title: 'Phone',
			dataIndex: 'phoneNumber',
			key: 'phone',
			responsive: ['md'],
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (record, text) => moment(record.createdAt).format('DD-MM-YYYY'),
			responsive: ['md'],
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
						<h1
							className="anchor"
							onClick={() => changeDoctorStatus(record, 'Approved')}>
							Approve
						</h1>
					)}
					{record.status === 'Approved' && (
						<h1
							className="anchor"
							onClick={() => changeDoctorStatus(record, 'Blocked')}>
							Block
						</h1>
					)}
				</div>
			),
		},
	];
	return (
		<Layout>
			<h1 className="page-title">Doctors List</h1>
			<hr />
			<Table columns={columns} dataSource={doctors} rowKey="_id" />
		</Layout>
	);
}

export default DoctorList;
