import { ForexDataSet } from "../models/ForexData";

export class ForexDataService {
	async fetchData(url: string): Promise<ForexDataSet> {
		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Failed to fetch data: ${response.statusText}`);
			}

			const data = await response.json();

			if (Array.isArray(data)) {
				return this.mergeChunks(data);
			}

			if (!this.validateDataSet(data)) {
				throw new Error("Invalid data format");
			}

			return data as ForexDataSet;
		} catch (error) {
			console.error("Error fetching Forex data:", error);
			throw error;
		}
	}

	private mergeChunks(chunks: unknown[]): ForexDataSet {
		if (chunks.length === 0) {
			throw new Error("No data chunks found");
		}

		const validChunks = chunks.filter((chunk) =>
			this.validateDataSet(chunk)
		) as ForexDataSet[];

		if (validChunks.length === 0) {
			throw new Error("No valid data chunks found");
		}

		const firstChunk = validChunks[0];
		const allBars = validChunks.flatMap((chunk) => chunk.Bars);

		return {
			ChunkStart: firstChunk.ChunkStart,
			Bars: allBars,
		};
	}

	private validateDataSet(data: unknown): data is ForexDataSet {
		if (typeof data !== "object" || data === null) {
			return false;
		}

		const dataset = data as Partial<ForexDataSet>;

		if (typeof dataset.ChunkStart !== "number") {
			return false;
		}

		if (!Array.isArray(dataset.Bars)) {
			return false;
		}

		return dataset.Bars.every(
			(bar) =>
				typeof bar.Time === "number" &&
				typeof bar.Open === "number" &&
				typeof bar.High === "number" &&
				typeof bar.Low === "number" &&
				typeof bar.Close === "number" &&
				typeof bar.TickVolume === "number"
		);
	}
}
