export interface ForexBar {
	Time: number;
	Open: number;
	High: number;
	Low: number;
	Close: number;
	TickVolume: number;
}

export interface ForexDataSet {
	ChunkStart: number;
	Bars: ForexBar[];
}

export class NormalizedBar {
	constructor(
		public timestamp: number,
		public open: number,
		public high: number,
		public low: number,
		public close: number,
		public volume: number
	) {}

	static fromForexBar(
		bar: ForexBar,
		chunkStart: string | number
	): NormalizedBar {
		const timestamp = bar.Time + Number(chunkStart);

		return new NormalizedBar(
			timestamp,
			bar.Open,
			bar.High,
			bar.Low,
			bar.Close,
			bar.TickVolume
		);
	}
}

export class ChartDataManager {
	private bars: NormalizedBar[] = [];
	private minPrice: number = Infinity;
	private maxPrice: number = -Infinity;

	constructor(dataSet: ForexDataSet) {
		this.processDataSet(dataSet);
	}

	private processDataSet(dataSet: ForexDataSet): void {
		this.bars = dataSet.Bars.map((bar) =>
			NormalizedBar.fromForexBar(bar, dataSet.ChunkStart)
		);

		this.calculatePriceRange();
	}

	private calculatePriceRange(): void {
		this.bars.forEach((bar) => {
			this.minPrice = Math.min(this.minPrice, bar.low);
			this.maxPrice = Math.max(this.maxPrice, bar.high);
		});
	}

	getBars(): NormalizedBar[] {
		return this.bars;
	}

	getVisibleBars(startIndex: number, endIndex: number): NormalizedBar[] {
		return this.bars.slice(
			Math.max(0, startIndex),
			Math.min(this.bars.length, endIndex)
		);
	}

	getPriceRange(
		startIndex: number,
		endIndex: number
	): { min: number; max: number } {
		const visibleBars = this.getVisibleBars(startIndex, endIndex);

		if (visibleBars.length === 0) {
			return { min: this.minPrice, max: this.maxPrice };
		}

		let min = Infinity;
		let max = -Infinity;

		visibleBars.forEach((bar) => {
			min = Math.min(min, bar.low);
			max = Math.max(max, bar.high);
		});

		return { min, max };
	}

	getBarCount(): number {
		return this.bars.length;
	}

	getTimeRange(): { start: number; end: number } {
		if (this.bars.length === 0) {
			return { start: 0, end: 0 };
		}
		return {
			start: this.bars[0].timestamp,
			end: this.bars[this.bars.length - 1].timestamp,
		};
	}
}
