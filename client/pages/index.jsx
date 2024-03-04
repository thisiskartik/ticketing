import Link from "next/link";

const Index = ({ tickets }) => {
	const ticketList = tickets.map(ticket => (
		<tr key={ticket.id}>
			<td>{ticket.title}</td>
			<td>{ticket.price}</td>
			<td>
				<Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
					View
				</Link>
			</td>
		</tr>
	));

	return (
		<div>
			<h2>Tickets</h2>
			<table className="table">
				<thead>
					<tr>
						<th>Title</th>
						<th>Price</th>
						<th>Link</th>
					</tr>
				</thead>
				<tbody>{ticketList}</tbody>
			</table>
		</div>
	);
};

Index.getInitialProps = async (context, client) => {
	const { data } = await client.get("/api/tickets");
	return { tickets: data };
};

export default Index;
