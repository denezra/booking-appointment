import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form, Input } from 'antd';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import { hideLoading, showLoading } from '../redux/alertsSlice';

function Register() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const onFinish = async values => {
		try {
			dispatch(showLoading());
			const response = await axios.post('/api/user/register', values);
			dispatch(hideLoading());
			if (response.data.success) {
				toast.success(response.data.message);
				navigate('/login');
			} else {
				dispatch(hideLoading());
				toast.error(response.data.message);
			}
		} catch (error) {
			dispatch(hideLoading());
			toast.error('Something went wrong');
		}
	};
	return (
		<div className="authentication">
			<div className="authentication-form card p-3">
				<h1 className="card-title">Register New User</h1>
				<Form layout="vertical" onFinish={onFinish}>
					<Form.Item label="Name" name="name">
						<Input placeholder="Name" />
					</Form.Item>
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
							REGISTER
						</Button>
						<Link className="anchor" to="/login">
							Click here to login
						</Link>
					</div>
				</Form>
			</div>
		</div>
	);
}

export default Register;
