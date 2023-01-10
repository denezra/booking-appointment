import React, { useCallback, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../redux/userSlice';
import { showLoading, hideLoading } from '../redux/alertsSlice';
import axios from 'axios';

function ProtectedRoute(props) {
	const { user } = useSelector(state => state.user);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const getUser = useCallback(async () => {
		try {
			dispatch(showLoading());
			const response = await axios.post(
				'/api/user/get-user-info-by-id',
				{ token: localStorage.getItem('token') },
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				}
			);
			dispatch(hideLoading());
			if (response.data.success) {
				dispatch(setUser(response.data.data));
			} else {
				localStorage.clear();
				navigate('/login');
			}
		} catch (error) {
			dispatch(hideLoading());
			localStorage.clear();
			navigate('/login');
		}
	}, [navigate, dispatch]);

	useEffect(() => {
		if (!user) {
			getUser();
		}
	}, [user, getUser]);

	if (localStorage.getItem('token')) {
		return props.children;
	} else {
		return <Navigate to="/login" />;
	}
}

export default ProtectedRoute;
