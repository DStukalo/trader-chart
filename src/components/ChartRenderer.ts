import { NormalizedBar } from "../models/ForexData";
import { Viewport } from "./Viewport";

export interface RenderConfig {
	backgroundColor: string;
	gridColor: string;
	textColor: string;
	bullishColor: string;
	bearishColor: string;
	axisWidth: number;
	priceAxisWidth: number;
	timeAxisHeight: number;
}

export class ChartRenderer {
	private config: RenderConfig = {
		backgroundColor: "#1a1a1a",
		gridColor: "#2a2a2a",
		textColor: "#a0a0a0",
		bullishColor: "#26a69a",
		bearishColor: "#ef5350",
		axisWidth: 1,
		priceAxisWidth: 80,
		timeAxisHeight: 30,
	};

	constructor(
		private ctx: CanvasRenderingContext2D,
		private width: number,
		private height: number
	) {}

	clear(): void {
		this.ctx.fillStyle = this.config.backgroundColor;
		this.ctx.fillRect(0, 0, this.width, this.height);
	}

	getChartArea(): { x: number; y: number; width: number; height: number } {
		return {
			x: 0,
			y: 0,
			width: this.width - this.config.priceAxisWidth,
			height: this.height - this.config.timeAxisHeight,
		};
	}

	renderBars(
		bars: NormalizedBar[],
		viewport: Viewport,
		priceRange: { min: number; max: number }
	): void {
		const chartArea = this.getChartArea();
		const priceScale = chartArea.height / (priceRange.max - priceRange.min);

		const startIndex = viewport.getStartBarIndex();

		bars.forEach((bar, index) => {
			const barIndex = startIndex + index;
			const x = viewport.getXForBarIndex(barIndex);

			if (x < -viewport.getFullBarWidth() || x > chartArea.width) {
				return;
			}

			const openY = chartArea.height - (bar.open - priceRange.min) * priceScale;
			const closeY =
				chartArea.height - (bar.close - priceRange.min) * priceScale;
			const highY = chartArea.height - (bar.high - priceRange.min) * priceScale;
			const lowY = chartArea.height - (bar.low - priceRange.min) * priceScale;

			const isBullish = bar.close >= bar.open;
			this.ctx.strokeStyle = isBullish
				? this.config.bullishColor
				: this.config.bearishColor;
			this.ctx.fillStyle = isBullish
				? this.config.bullishColor
				: this.config.bearishColor;

			const centerX = x + viewport.getFullBarWidth() / 2;

			this.ctx.beginPath();
			this.ctx.moveTo(centerX, highY);
			this.ctx.lineTo(centerX, lowY);
			this.ctx.stroke();

			const bodyTop = Math.min(openY, closeY);
			const bodyHeight = Math.abs(closeY - openY) || 1;

			this.ctx.fillRect(
				x + viewport.getBarSpacing() / 2,
				bodyTop,
				viewport.getBarWidth(),
				bodyHeight
			);
		});
	}

	renderPriceAxis(priceRange: { min: number; max: number }): void {
		const chartArea = this.getChartArea();
		const axisX = chartArea.width;

		this.ctx.fillStyle = this.config.backgroundColor;
		this.ctx.fillRect(axisX, 0, this.config.priceAxisWidth, chartArea.height);

		this.ctx.strokeStyle = this.config.gridColor;
		this.ctx.beginPath();
		this.ctx.moveTo(axisX, 0);
		this.ctx.lineTo(axisX, chartArea.height);
		this.ctx.stroke();

		const priceStep = this.calculatePriceStep(priceRange.max - priceRange.min);
		const startPrice = Math.ceil(priceRange.min / priceStep) * priceStep;

		this.ctx.fillStyle = this.config.textColor;
		this.ctx.font = "11px monospace";
		this.ctx.textAlign = "left";
		this.ctx.textBaseline = "middle";

		for (let price = startPrice; price <= priceRange.max; price += priceStep) {
			const y =
				chartArea.height -
				((price - priceRange.min) / (priceRange.max - priceRange.min)) *
					chartArea.height;

			this.ctx.strokeStyle = this.config.gridColor;
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(chartArea.width, y);
			this.ctx.stroke();

			this.ctx.fillStyle = this.config.textColor;
			this.ctx.fillText(price.toFixed(5), axisX + 5, y);
		}
	}

	renderTimeAxis(bars: NormalizedBar[], viewport: Viewport): void {
		const chartArea = this.getChartArea();
		const axisY = chartArea.height;

		this.ctx.fillStyle = this.config.backgroundColor;
		this.ctx.fillRect(0, axisY, this.width, this.config.timeAxisHeight);

		this.ctx.strokeStyle = this.config.gridColor;
		this.ctx.beginPath();
		this.ctx.moveTo(0, axisY);
		this.ctx.lineTo(chartArea.width, axisY);
		this.ctx.stroke();

		if (bars.length === 0) return;

		this.ctx.fillStyle = this.config.textColor;
		this.ctx.font = "11px monospace";
		this.ctx.textBaseline = "top";

		const minSpacing = 120;
		const barStep = Math.ceil(minSpacing / viewport.getFullBarWidth());
		const startIndex = viewport.getStartBarIndex();

		const padding = 30;
		const minLabelSpacing = 80;

		let lastDrawX = -Infinity;

		for (let i = 0; i < bars.length; i += barStep) {
			const bar = bars[i];
			const barIndex = startIndex + i;
			const centerX =
				viewport.getXForBarIndex(barIndex) + viewport.getFullBarWidth() / 2;

			const date = new Date(bar.timestamp * 1000);
			const timeStr = this.formatTime(date);

			if (i === 0) {
				this.ctx.textAlign = "left";
				this.ctx.fillText(timeStr, Math.max(2, centerX), axisY + 8);
				lastDrawX = centerX;
				continue;
			}

			if (i + barStep >= bars.length) {
				this.ctx.textAlign = "center";

				let x = Math.min(chartArea.width - 2, centerX);
				if (x - lastDrawX < minLabelSpacing) {
					x = lastDrawX + minLabelSpacing;
					if (x > chartArea.width - 2) {
						x = chartArea.width - 2;
					}
				}

				this.ctx.fillText(timeStr, x, axisY + 8);
				lastDrawX = x;
				continue;
			}

			if (
				centerX >= padding &&
				centerX <= chartArea.width - padding &&
				centerX - lastDrawX >= minLabelSpacing
			) {
				this.ctx.textAlign = "center";
				this.ctx.fillText(timeStr, centerX, axisY + 8);
				lastDrawX = centerX;
			}
		}
	}

	private calculatePriceStep(range: number): number {
		const steps = [
			0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1,
			5, 10,
		];
		const targetLines = 10;
		const targetStep = range / targetLines;

		for (const step of steps) {
			if (step >= targetStep) return step;
		}

		return steps[steps.length - 1];
	}

	private formatTime(date: Date): string {
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");

		return `${month}/${day} ${hours}:${minutes}`;
	}

	updateDimensions(width: number, height: number): void {
		this.width = width;
		this.height = height;
	}
}
