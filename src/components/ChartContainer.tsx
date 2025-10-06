import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { ForexChart } from "./ForexChart";
import { ForexDataService } from "../services/ForexDataService";

interface ChartContainerProps {
	dataUrl?: string;
	width?: number;
	height?: number;
}

export function ChartContainer({
	dataUrl,
	width = 1250,
	height = 600,
}: ChartContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<ForexChart | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!dataUrl) return;

		const container = containerRef.current;
		if (!container) return;

		const dataService = new ForexDataService();
		let chart: ForexChart | null = null;

		const initChart = async () => {
			try {
				setLoading(true);
				setError(null);

				const data = await dataService.fetchData(dataUrl);
				data.Bars.sort(
					(a, b) => new Date(a.Time).getTime() - new Date(b.Time).getTime()
				);
				chart = new ForexChart(container, width, height);
				chartRef.current = chart;

				chart.loadData(data);
				setLoading(false);
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to load chart data"
				);
				setLoading(false);
			}
		};

		initChart();

		return () => {
			if (chart) {
				chart.destroy();
			}
		};
	}, [dataUrl, width, height]);

	useEffect(() => {
		const handleResize = () => {
			if (chartRef.current && containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				chartRef.current.resize(rect.width, height);
			}
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, [height]);

	return (
		<div
			className='relative'
			style={{ width: "100%", height }}
		>
			<div
				ref={containerRef}
				className='w-full h-full'
			/>

			{!dataUrl && !loading && !error && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75'>
					<span className='text-gray-300 text-sm'>
						Enter or select a data source to load the chart
					</span>
				</div>
			)}

			{loading && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75'>
					<div className='flex flex-col items-center gap-3'>
						<Loader2 className='w-8 h-8 text-blue-500 animate-spin' />
						<span className='text-gray-300 text-sm'>Data loading...</span>
					</div>
				</div>
			)}

			{error && (
				<div className='absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90'>
					<div className='text-red-400 text-center px-6'>
						<p className='text-lg font-semibold mb-2'>Failed to load chart</p>
						<p className='text-sm'>{error}</p>
					</div>
				</div>
			)}
		</div>
	);
}
