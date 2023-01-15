import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { Row, Col } from 'antd';
import Doctor from '../components/Doctor';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/alertsSlice';
import { toast } from 'react-hot-toast';
import apiConfig from '../config/apiConfig';

function Home()
{
	const [ doctors, setDoctors ] = useState(null);
	const dispatch = useDispatch();

	useEffect(() =>
	{
		const controller = new AbortController();
		const getData = async () =>
		{
			try
			{
				dispatch(showLoading());
				const response = await apiConfig.get('/user/get-all-approved-doctors', {
					signal: controller.signal,
					headers: {
						Authorization: `Bearer ${localStorage.getItem('token')}`,
					},
				});
				dispatch(hideLoading());
				if (response.data.success)
				{
					setDoctors(response.data.data);
				}
			} catch (error)
			{
				dispatch(hideLoading());
				toast.error(error.message);
			}
		};
		getData();
		return () =>
		{
			controller.abort()
		};
	}, [ dispatch ]);
	return (
		<Layout>
			{doctors && (
				<div>
					<h1 className="page-title">List of Dentist</h1>
					<hr />
					<Row gutter={20}>
						{doctors?.map(doctor => (
							<Col span={8} xs={24} sm={24} lg={8} key={doctor?._id}>
								<Doctor doctor={doctor} />
							</Col>
						))}
					</Row>
				</div>
			)}
		</Layout>
	);
}

export default Home;
