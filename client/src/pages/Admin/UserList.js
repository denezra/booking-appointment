import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../../redux/alertsSlice';
import axios from 'axios';
import { Table } from 'antd';
import moment from 'moment';

function UserList() {
	const [users, setUsers] = useState([]);
	const dispatch = useDispatch();
	useEffect(() => {
		const getUsersData = async () => {
			try {
				dispatch(showLoading());
				const response = await axios.get('/api/admin/get-all-users', {
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});
				dispatch(hideLoading());
				if (response.data.success) {
					setUsers(response.data.data);
				} else {
				}
			} catch (error) {
				dispatch(hideLoading());
			}
		};
		getUsersData();
		return () => {};
	}, [dispatch, users]);
	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
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
			title: 'Actions',
			dataIndex: 'actions',
			key: 'actions',
			render: (text, record) => (
				<div className="d-flex">
					<h1 className="anchor" key={record._id}>
						Block
					</h1>
				</div>
			),
		},
	];
	return (
		<Layout>
			<h1 className="page-title">Users List</h1>
			<hr />
			<Table columns={columns} dataSource={users} rowKey="_id" />
		</Layout>
	);
}

export default UserList;
