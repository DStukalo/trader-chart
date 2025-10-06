import { Viewport } from "../components/Viewport";

export class MouseController {
	private isDragging: boolean = false;
	private lastMouseX: number = 0;
	private lastMouseY: number = 0;
	private dragStartX: number = 0;
	private dragThreshold: number = 5;

	constructor(
		private canvas: HTMLCanvasElement,
		private viewport: Viewport,
		private onUpdate: () => void
	) {
		this.attachEventListeners();
	}

	private attachEventListeners(): void {
		this.canvas.addEventListener("wheel", this.handleWheel.bind(this), {
			passive: false,
		});
		this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
		this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
		this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
		this.canvas.addEventListener(
			"mouseleave",
			this.handleMouseLeave.bind(this)
		);
	}

	private handleWheel(event: WheelEvent): void {
		event.preventDefault();

		const rect = this.canvas.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;

		if (event.ctrlKey || event.metaKey) {
			const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
			this.viewport.zoom(zoomFactor, mouseX);
		} else {
			this.viewport.scroll(event.deltaY);
		}

		this.onUpdate();
	}

	private handleMouseDown(event: MouseEvent): void {
		if (event.button === 0) {
			const rect = this.canvas.getBoundingClientRect();
			this.lastMouseX = event.clientX - rect.left;
			this.lastMouseY = event.clientY - rect.top;
			this.dragStartX = this.lastMouseX;
			this.isDragging = false;
		}
	}

	private handleMouseMove(event: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		if (event.buttons === 1) {
			const dragDistance = Math.abs(mouseX - this.dragStartX);

			if (!this.isDragging && dragDistance > this.dragThreshold) {
				this.isDragging = true;
			}

			if (this.isDragging) {
				const deltaX = mouseX - this.lastMouseX;
				this.viewport.scroll(-deltaX);
				this.onUpdate();
			}
		}

		this.lastMouseX = mouseX;
		this.lastMouseY = mouseY;
	}

	private handleMouseUp(event: MouseEvent): void {
		if (event.button === 0) {
			this.isDragging = false;
		}
	}

	private handleMouseLeave(): void {
		this.isDragging = false;
	}

	destroy(): void {
		this.canvas.removeEventListener("wheel", this.handleWheel.bind(this));
		this.canvas.removeEventListener(
			"mousedown",
			this.handleMouseDown.bind(this)
		);
		this.canvas.removeEventListener(
			"mousemove",
			this.handleMouseMove.bind(this)
		);
		this.canvas.removeEventListener("mouseup", this.handleMouseUp.bind(this));
		this.canvas.removeEventListener(
			"mouseleave",
			this.handleMouseLeave.bind(this)
		);
	}
}
