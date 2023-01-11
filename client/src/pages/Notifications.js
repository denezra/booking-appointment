import React from 'react';
import Layout from '../components/Layout';
import { Tabs } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertsSlice';
import toast from 'react-hot-toast';
import { setUser } from '../redux/userSlice';
import NotifTab from '../components/NotifTab';
import apiConfig from '../config/apiConfig';

function Notifications()
{
	const { user } = useSelector(state => state.user);
	const dispatch = useDispatch();
	const markAllAsSeen = async () =>
	{
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.post(
				'/user/mark-all-notifications-as-seen',
				{
					userId: user._id,
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
				dispatch(setUser(response.data.data));
			} else
			{
				dispatch(hideLoading());
				toast.error(response.data.message);
			}
		} catch (error)
		{
			dispatch(hideLoading());
			toast.error('Something went wrong');
		}
	};
	const deleteAll = async () =>
	{
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.post(
				'/user/delete-all-notifications',
				{
					userId: user._id,
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
				dispatch(setUser(response.data.data));
			} else
			{
				dispatch(hideLoading());
				toast.error(response.data.message);
			}
		} catch (error)
		{
			dispatch(hideLoading());
			toast.error('Something went wrong');
		}
	};
	const items = [
		{
			label: 'Unseen',
			key: 'unseen',
			children: (
				<NotifTab
					user={user}
					task={markAllAsSeen}
					label="Mark all as seen"
					property={user?.unseenNotifications}
				/>
			),
		},
		{
			label: 'Seen',
			key: 'seen',
			children: (
				<NotifTab
					user={user}
					task={deleteAll}
					label="Delete all"
					property={user?.seenNotifications}
				/>
			),
		},
	];
	return (
		<Layout>
			<h1 className="page-title">Notifications</h1>
			<hr />
			<Tabs items={items} />
		</Layout>
	);
}

export default Notifications;
