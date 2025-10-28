/**
 * ClamAV virus scanning client
 * Provides methods for scanning files and email attachments
 */

import { connect } from "node:net";

export interface ClamAVConfig {
	host: string;
	port: number;
	timeout?: number;
}

export interface ClamAVScanResult {
	isInfected: boolean;
	viruses: string[];
	file?: string;
}

export class ClamAVClient {
	private config: Required<ClamAVConfig>;

	constructor(config: ClamAVConfig) {
		this.config = {
			host: config.host,
			port: config.port,
			timeout: config.timeout ?? 10000,
		};
	}

	/**
	 * Scan a buffer (file content) for viruses
	 * This is the main method for scanning email attachments
	 */
	async scanBuffer(
		buffer: Buffer,
		filename?: string,
	): Promise<ClamAVScanResult> {
		return new Promise((resolve, reject) => {
			const socket = connect(this.config.port, this.config.host);
			let response = "";

			const timeoutId = setTimeout(() => {
				socket.destroy();
				reject(new Error("ClamAV scan timed out"));
			}, this.config.timeout);

			socket.on("connect", () => {
				// Send INSTREAM command to scan data stream
				socket.write("nINSTREAM\n");

				// Send the file size in network byte order (4 bytes, big-endian)
				const size = Buffer.alloc(4);
				size.writeUInt32BE(buffer.length, 0);
				socket.write(size);

				// Send the actual file data
				socket.write(buffer);

				// Send zero-length chunk to indicate end of stream
				const endChunk = Buffer.alloc(4);
				endChunk.writeUInt32BE(0, 0);
				socket.write(endChunk);
			});

			socket.on("data", (data) => {
				response += data.toString();
			});

			socket.on("end", () => {
				clearTimeout(timeoutId);
				resolve(this.parseResponse(response, filename));
			});

			socket.on("error", (error) => {
				clearTimeout(timeoutId);
				reject(new Error(`ClamAV connection error: ${error.message}`));
			});
		});
	}

	/**
	 * Scan multiple buffers (multiple attachments) in parallel
	 */
	async scanBuffers(
		buffers: Array<{ buffer: Buffer; filename?: string }>,
	): Promise<ClamAVScanResult[]> {
		return Promise.all(
			buffers.map((item) => this.scanBuffer(item.buffer, item.filename)),
		);
	}

	/**
	 * Scan a stream of data
	 * Useful for large files that shouldn't be loaded entirely into memory
	 */
	async scanStream(
		stream: NodeJS.ReadableStream,
		filename?: string,
	): Promise<ClamAVScanResult> {
		return new Promise((resolve, reject) => {
			const socket = connect(this.config.port, this.config.host);
			let response = "";

			const timeoutId = setTimeout(() => {
				socket.destroy();
				if ("destroy" in stream && typeof stream.destroy === "function") {
					stream.destroy();
				}
				reject(new Error("ClamAV scan timed out"));
			}, this.config.timeout);

			socket.on("connect", () => {
				// Send INSTREAM command
				socket.write("nINSTREAM\n");

				stream.on("data", (chunk: Buffer) => {
					// Send chunk size
					const size = Buffer.alloc(4);
					size.writeUInt32BE(chunk.length, 0);
					socket.write(size);
					// Send chunk data
					socket.write(chunk);
				});

				stream.on("end", () => {
					// Send zero-length chunk to indicate end of stream
					const endChunk = Buffer.alloc(4);
					endChunk.writeUInt32BE(0, 0);
					socket.write(endChunk);
				});

				stream.on("error", (error) => {
					clearTimeout(timeoutId);
					socket.destroy();
					reject(new Error(`Stream error: ${error.message}`));
				});
			});

			socket.on("data", (data) => {
				response += data.toString();
			});

			socket.on("end", () => {
				clearTimeout(timeoutId);
				resolve(this.parseResponse(response, filename));
			});

			socket.on("error", (error) => {
				clearTimeout(timeoutId);
				if ("destroy" in stream && typeof stream.destroy === "function") {
					stream.destroy();
				}
				reject(new Error(`ClamAV connection error: ${error.message}`));
			});
		});
	}

	/**
	 * Test connection to ClamAV server
	 */
	async ping(): Promise<boolean> {
		return new Promise((resolve) => {
			const socket = connect(this.config.port, this.config.host);

			const timeoutId = setTimeout(() => {
				socket.destroy();
				resolve(false);
			}, this.config.timeout);

			socket.on("connect", () => {
				socket.write("PING\n");
			});

			socket.on("data", (data) => {
				clearTimeout(timeoutId);
				const response = data.toString().trim();
				socket.end();
				resolve(response === "PONG");
			});

			socket.on("error", () => {
				clearTimeout(timeoutId);
				resolve(false);
			});
		});
	}

	/**
	 * Get ClamAV version information
	 */
	async version(): Promise<string> {
		return new Promise((resolve, reject) => {
			const socket = connect(this.config.port, this.config.host);
			let response = "";

			const timeoutId = setTimeout(() => {
				socket.destroy();
				reject(new Error("ClamAV version check timed out"));
			}, this.config.timeout);

			socket.on("connect", () => {
				socket.write("VERSION\n");
			});

			socket.on("data", (data) => {
				response += data.toString();
			});

			socket.on("end", () => {
				clearTimeout(timeoutId);
				resolve(response.trim());
			});

			socket.on("error", (error) => {
				clearTimeout(timeoutId);
				reject(new Error(`ClamAV connection error: ${error.message}`));
			});
		});
	}

	/**
	 * Parse ClamAV response
	 */
	private parseResponse(response: string, filename?: string): ClamAVScanResult {
		const trimmed = response.trim();

		// ClamAV responses:
		// - "stream: OK" - clean file
		// - "stream: VIRUS_NAME FOUND" - infected file
		// - "stream: ERROR" - scanning error

		if (trimmed.includes("ERROR")) {
			throw new Error(`ClamAV scan error: ${trimmed}`);
		}

		if (trimmed.includes("FOUND")) {
			// Extract virus name(s)
			const virusMatch = trimmed.match(/stream: (.+) FOUND/);
			const virusName = virusMatch?.[1] || "Unknown";

			return {
				isInfected: true,
				viruses: [virusName],
				file: filename,
			};
		}

		// Clean file
		return {
			isInfected: false,
			viruses: [],
			file: filename,
		};
	}
}
