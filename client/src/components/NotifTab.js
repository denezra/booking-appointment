import React from 'react';
import { useNavigate } from 'react-router-dom';

function NotifTab({ user, task, label, property }) {
	const navigate = useNavigate();
	return (
		<div>
			<div className="d-flex justify-content-end">
				<h1
					className="anchor"
					onClick={() => {
						task();
					}}>
					{label}
				</h1>
			</div>
			{property?.map((notification, index) => (
				<div
					className="card p-2 mb-2"
					role="button"
					onClick={() => navigate(notification.onClickPath)}
					key={index}>
					<div className="card-text">{notification.message}</div>
				</div>
			))}
		</div>
	);
}

export default NotifTab;
