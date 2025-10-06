import { TrendingUp } from 'lucide-react';

export function Header() {
	return (
		<header className='bg-gray-900 border-b border-gray-800 px-6 py-4'>
			<div className='max-w-7xl mx-auto flex items-center justify-between'>
				<div className='flex items-center gap-3 pl-5'>
					<TrendingUp className='w-8 h-8 text-emerald-500' />
					<div>
						<h1 className='text-2xl font-bold'>Forex Chart Viewer</h1>
						<p className='text-sm text-gray-400'>
							Professional trading chart with zoom and scroll
						</p>
					</div>
				</div>
			</div>
		</header>
	);
}
