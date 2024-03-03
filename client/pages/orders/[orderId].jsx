import { useEffect, useState } from "react";
import Router from "next/router";
import StripeChceckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";

const OrderShow = ({ order, currentUser }) => {
	const [timeleft, setTimeLeft] = useState(0);
	const { doRequest, errors } = useRequest({
		url: "/api/payments",
		method: "post",
		body: {
			orderId: order.id,
		},
		onSuccess: () => Router.push("/orders"),
	});

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};

		findTimeLeft();
		const timerId = setInterval(findTimeLeft, 1000);

		return () => {
			clearInterval(timerId);
		};
	}, []);

	if (timeleft < 0) return <div>Order Expired</div>;

	return (
		<div>
			Time left to pay: {timeleft} seconds
			<StripeChceckout
				key="stripecheckout"
				token={({ id }) => doRequest({ token: id })}
				stripeKey="pk_test_51JY2oKSBDWD8nnrADmJqux2JixTsNLigKGX2ONsgGXSiophp3kNPvPf6Sv5sv27kWKZ9F97oyives3gAxtcBDIR200uX6OZkFd"
				amount={order.ticket.price * 100}
				email={currentUser.email}
			/>
			{errors}
		</div>
	);
};

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data } = await client.get(`/api/orders/${orderId}`);

	return { order: data };
};

export default OrderShow;
