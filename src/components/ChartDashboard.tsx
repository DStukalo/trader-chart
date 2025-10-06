import { useState } from "react";
import { ChartContainer } from "./ChartContainer";

export function ChartDashboard() {
	const [dataUrl, setDataUrl] = useState("");
	const [inputUrl, setInputUrl] = useState(dataUrl);
	const [customMode, setCustomMode] = useState(false);

	const presetUrls = [
		{
			label: "Dataset #1",
			value:
				"https://beta.forextester.com/data/api/Metadata/bars/chunked?Broker=Advanced&Symbol=EURUSD&Timeframe=1&Start=57674&End=59113&UseMessagePack=false",
		},
		{
			label: "Dataset #2",
			value:
				"https://beta.forextester.com/data/api/Metadata/bars/chunked?Broker=Advanced&Symbol=USDJPY&Timeframe=1&Start=57674&End=59113&UseMessagePack=false",
		},
		{ label: "Custom URL", value: "custom" },
	];

	const handleLoadData = () => {
		if (inputUrl.trim()) {
			setDataUrl(inputUrl.trim());
		}
	};

	const handleSelectChange = (value: string) => {
		if (value === "custom") {
			setCustomMode(true);
			setInputUrl("");
		} else {
			setCustomMode(false);
			setInputUrl(value);
			setDataUrl(value);
		}
	};
	return (
		<main className='max-w-7xl mx-auto px-6 py-6'>
			<div className='mb-6 bg-gray-900 rounded-lg p-4 border border-gray-800'>
				<label className='block text-sm font-medium text-gray-300 mb-2'>
					Select Dataset
				</label>
				<div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
					<select
						className='flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
						onChange={(e) => handleSelectChange(e.target.value)}
						value={customMode ? "custom" : inputUrl || ""}
					>
						<option value=''>-- Select dataset --</option>
						{presetUrls.map((opt) => (
							<option
								key={opt.value}
								value={opt.value}
							>
								{opt.label}
							</option>
						))}
					</select>

					{customMode && (
						<input
							type='text'
							value={inputUrl}
							onChange={(e) => setInputUrl(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleLoadData()}
							className='flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
							placeholder='Enter custom JSON URL...'
						/>
					)}

					<button
						onClick={handleLoadData}
						className='px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors'
					>
						Load Chart
					</button>
				</div>

				<p className='mt-2 text-xs text-gray-500'>
					Mouse wheel to scroll, Ctrl+wheel to zoom, or click and drag to pan
				</p>
			</div>

			<div className='bg-gray-900 rounded-lg border border-gray-800 overflow-hidden'>
				<ChartContainer
					key={dataUrl}
					dataUrl={dataUrl}
					height={600}
				/>
			</div>
		</main>
	);
}
