import { Header } from "./components/Header";
import { ChartDashboard } from "./components/ChartDashboard";

function App() {
	return (
		<div className='min-h-screen bg-gray-950 text-gray-100'>
			<Header />
			<ChartDashboard />
		</div>
	);
}

export default App;
