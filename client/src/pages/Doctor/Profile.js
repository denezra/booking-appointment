import React, { useMemo } from 'react';
import Layout from '../../components/Layout';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { hideLoading, showLoading } from '../../redux/alertsSlice';
import { useDispatch, useSelector } from 'react-redux';
import DoctorForm from '../../components/DoctorForm';
import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import apiConfig from '../../config/apiConfig';

function Profile()
{
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { user } = useSelector(state => state.user);
	const [ doctor, setDoctor ] = useState(null);
	const controller = useMemo(
		() => new AbortController(), []);
	const onFinish = async values =>
	{
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.post(
				'/doctor/update-doctor-profile',
				{
					...values,
					userId: user._id,
					timings: [
						moment(values.timings[ 0 ]).format('HH:mm'),
						moment(values.timings[ 1 ]).format('HH:mm'),
					],
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
				navigate('/');
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
	const getDoctorData = useCallback(async () =>
	{
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.post(
				'/doctor/get-doctor-info-by-user-id',
				{ userId: user._id },
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
				setDoctor(response.data.data);
			}
		} catch (error)
		{
			dispatch(hideLoading());
		}
	}, [ controller.signal, dispatch, user._id ]);

	useEffect(() =>
	{
		getDoctorData();
		return () => { controller.abort() };
	}, [ getDoctorData, controller ]);
	return (
		<Layout>
			<h1 className="page-title">Doctors Profile</h1>
			<hr />
			{doctor && <DoctorForm onFinish={onFinish} initialValues={doctor} />}
		</Layout>
	);
}

export default Profile;
