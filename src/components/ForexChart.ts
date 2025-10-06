import { MouseController } from "../interactions/MouseController";
import { ChartDataManager, ForexDataSet } from "../models/ForexData";
import { ChartRenderer } from "./ChartRenderer";
import { Viewport } from "./Viewport";

export class ForexChart {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private dataManager: ChartDataManager | null = null;
	private renderer: ChartRenderer;
	private viewport: Viewport;
	private mouseController: MouseController;
	private animationFrameId: number | null = null;

	constructor(
		container: HTMLElement,
		private width: number,
		private height: number
	) {
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.style.display = "block";
		this.canvas.style.cursor = "crosshair";

		container.appendChild(this.canvas);

		const context = this.canvas.getContext("2d");
		if (!context) {
			throw new Error("Failed to get 2D context");
		}
		this.ctx = context;

		this.renderer = new ChartRenderer(this.ctx, width, height);
		this.viewport = new Viewport(0, width);
		this.mouseController = new MouseController(
			this.canvas,
			this.viewport,
			this.render.bind(this)
		);
	}

	loadData(dataSet: ForexDataSet): void {
		this.dataManager = new ChartDataManager(dataSet);
		this.viewport.updateTotalBars(this.dataManager.getBarCount());
		this.render();
	}

	private render(): void {
		if (this.animationFrameId !== null) {
			return;
		}

		this.animationFrameId = requestAnimationFrame(() => {
			this.draw();
			this.animationFrameId = null;
		});
	}

	private draw(): void {
		this.renderer.clear();

		if (!this.dataManager) {
			return;
		}

		const startIndex = this.viewport.getStartBarIndex();
		const endIndex = this.viewport.getEndBarIndex();

		const visibleBars = this.dataManager.getVisibleBars(startIndex, endIndex);
		const priceRange = this.dataManager.getPriceRange(startIndex, endIndex);

		this.renderer.renderBars(visibleBars, this.viewport, priceRange);
		this.renderer.renderPriceAxis(priceRange);
		this.renderer.renderTimeAxis(visibleBars, this.viewport);
	}

	resize(width: number, height: number): void {
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;

		this.renderer.updateDimensions(width, height);
		this.viewport.updateViewportWidth(width);

		this.render();
	}

	destroy(): void {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
		}

		this.mouseController.destroy();
		this.canvas.remove();
	}
}
