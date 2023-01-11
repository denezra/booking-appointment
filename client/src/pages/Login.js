import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Input } from 'antd';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { hideLoading, showLoading } from '../redux/alertsSlice';
import apiConfig from '../config/apiConfig';

function Login()
{
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const onFinish = async values =>
	{
		try
		{
			dispatch(showLoading());
			const response = await apiConfig.post('/user/login', values);
			console.log(response);
			dispatch(hideLoading());
			if (response.data.success)
			{
				toast.success(response.data.message);
				localStorage.setItem('token', response.data.data);
				navigate('/');
			} else
			{
				dispatch(hideLoading());
				toast.error(response.data.message);
			}
		} catch (error)
		{
			dispatch(hideLoading());
			toast.error('Something went wrong', error);
		}
	};
	return (
		<div className="authentication">
			<div className="authentication-form card p-3">
				<h1 className="card-title">Welcome Back</h1>
				<Form layout="vertical" onFinish={onFinish}>
					<Form.Item label="Email" name="email">
						<Input placeholder="Email" />
					</Form.Item>
					<Form.Item label="Password" name="password">
						<Input placeholder="Password" type="password" />
					</Form.Item>
					<div className="d-flex flex-column">
						<Button
							className="primary-button my-3 full-width-button"
							htmlType="submit">
							LOGIN
						</Button>
						<Link className="anchor" to="/register">
							Click here to register
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
}

export default Login;
