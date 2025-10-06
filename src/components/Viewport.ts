export class Viewport {
	private barWidth: number = 10;
	private barSpacing: number = 2;
	private startBarIndex: number = 0;

	constructor(private totalBars: number, private viewportWidth: number) {
		this.startBarIndex = 0;
	}

	getBarWidth(): number {
		return this.barWidth;
	}

	getBarSpacing(): number {
		return this.barSpacing;
	}

	getFullBarWidth(): number {
		return this.barWidth + this.barSpacing;
	}

	getStartBarIndex(): number {
		return Math.floor(this.startBarIndex);
	}

	getEndBarIndex(): number {
		return Math.min(
			this.totalBars,
			Math.ceil(this.startBarIndex + this.getVisibleBarCount())
		);
	}

	getVisibleBarCount(): number {
		return Math.ceil(this.viewportWidth / this.getFullBarWidth());
	}

	zoom(factor: number, centerX: number): void {
		const oldBarWidth = this.barWidth;
		this.barWidth = Math.max(2, Math.min(50, this.barWidth * factor));

		const barAtCenter = this.getBarIndexAtX(centerX);
		const newBarWidth = this.barWidth;

		if (oldBarWidth !== newBarWidth) {
			const centerRatio = centerX / this.viewportWidth;
			const newVisibleBars = this.getVisibleBarCount();
			this.startBarIndex = barAtCenter - newVisibleBars * centerRatio;
			this.clampStartIndex();
		}
	}

	scroll(delta: number): void {
		const barsDelta = delta / this.getFullBarWidth();
		this.startBarIndex += barsDelta;
		this.clampStartIndex();
	}

	private clampStartIndex(): void {
		const maxStartIndex = Math.max(
			0,
			this.totalBars - this.getVisibleBarCount()
		);
		this.startBarIndex = Math.max(
			0,
			Math.min(maxStartIndex, this.startBarIndex)
		);
	}

	getBarIndexAtX(x: number): number {
		return this.startBarIndex + x / this.getFullBarWidth();
	}

	getXForBarIndex(barIndex: number): number {
		return (barIndex - this.startBarIndex) * this.getFullBarWidth();
	}

	updateViewportWidth(width: number): void {
		this.viewportWidth = width;
		this.clampStartIndex();
	}

	updateTotalBars(totalBars: number): void {
		this.totalBars = totalBars;
		this.clampStartIndex();
	}
}
