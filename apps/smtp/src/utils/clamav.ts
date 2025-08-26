import { createInboundLog } from "./logs";

const log = createInboundLog("clamav");

export interface ClamAVResult {
	clean: boolean;
	virus?: string;
	error?: string;
}

export abstract class ClamAV {
	/**
	 * Scan a buffer for viruses using ClamAV
	 * @param buffer The file buffer to scan
	 * @param filename Optional filename for logging
	 * @returns ClamAV scan result
	 */
	static async scanBuffer(
		buffer: Buffer,
		filename?: string,
	): Promise<ClamAVResult> {
		try {
			log(
				`Scanning ${filename || "buffer"} with ClamAV (${buffer.length} bytes)`,
			);

			// Try to connect to clamdscan via HTTP API (if available)
			const response = await fetch("http://127.0.0.1:3310/scan", {
				method: "POST",
				headers: {
					"Content-Type": "application/octet-stream",
					"X-Filename": filename || "unknown",
					"Content-Length": buffer.length.toString(),
				},
				body: buffer,
				signal: AbortSignal.timeout(30000), // 30 second timeout
			});

			if (!response.ok) {
				log(
					`ClamAV HTTP API not available (${response.status}), falling back to socket`,
				);
				return await ClamAV.scanBufferSocket(buffer, filename);
			}

			const result = await response.text();
			log(`ClamAV result: ${result}`);

			if (result.includes("FOUND")) {
				const virusMatch = result.match(/: (.+) FOUND/);
				const virusName = virusMatch ? virusMatch[1] : "Unknown virus";

				log(`Virus detected: ${virusName}`);
				return {
					clean: false,
					virus: virusName,
				};
			}

			return { clean: true };
		} catch (error) {
			log(`ClamAV scan error: ${error}`);
			return {
				clean: true, // Default to clean on error to avoid blocking legitimate emails
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Scan using ClamAV socket (fallback method)
	 * @param buffer The file buffer to scan
	 * @param filename Optional filename for logging
	 * @returns ClamAV scan result
	 */
	static async scanBufferSocket(
		buffer: Buffer,
		filename?: string,
	): Promise<ClamAVResult> {
		try {
			const net = await import("node:net");

			return new Promise<ClamAVResult>((resolve) => {
				const socket = net.createConnection({ port: 3310, host: "127.0.0.1" });
				let result = "";

				socket.setTimeout(30000); // 30 second timeout

				socket.on("connect", () => {
					log(`Connected to ClamAV daemon, scanning ${filename || "buffer"}`);

					// Send INSTREAM command
					socket.write("zINSTREAM\0");

					// Send file size (4 bytes, big endian)
					const sizeBuffer = Buffer.allocUnsafe(4);
					sizeBuffer.writeUInt32BE(buffer.length, 0);
					socket.write(sizeBuffer);

					// Send file data
					socket.write(buffer);

					// Send end marker (4 zero bytes)
					socket.write(Buffer.alloc(4));
				});

				socket.on("data", (data) => {
					result += data.toString();
				});

				socket.on("end", () => {
					log(`ClamAV socket result: ${result.trim()}`);

					if (result.includes("FOUND")) {
						const virusMatch = result.match(/: (.+) FOUND/);
						const virusName = virusMatch ? virusMatch[1] : "Unknown virus";

						resolve({
							clean: false,
							virus: virusName,
						});
					} else {
						resolve({ clean: true });
					}
				});

				socket.on("error", (error) => {
					log(`ClamAV socket error: ${error.message}`);
					resolve({
						clean: true, // Default to clean on error
						error: error.message,
					});
				});

				socket.on("timeout", () => {
					log("ClamAV scan timeout");
					socket.destroy();
					resolve({
						clean: true, // Default to clean on timeout
						error: "Scan timeout",
					});
				});
			});
		} catch (error) {
			log(`ClamAV socket scan error: ${error}`);
			return {
				clean: true, // Default to clean on error
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Check if ClamAV daemon is available
	 * @returns True if ClamAV is available
	 */
	static async isAvailable(): Promise<boolean> {
		try {
			// Try HTTP API first
			const response = await fetch("http://127.0.0.1:3310/ping", {
				method: "GET",
				signal: AbortSignal.timeout(5000),
			});

			if (response.ok) {
				return true;
			}

			// Try socket connection
			const net = await import("node:net");

			return new Promise<boolean>((resolve) => {
				const socket = net.createConnection({ port: 3310, host: "127.0.0.1" });
				socket.setTimeout(5000);

				socket.on("connect", () => {
					socket.write("zPING\0");
				});

				socket.on("data", (data) => {
					const result = data.toString().trim();
					socket.end();
					resolve(result === "PONG");
				});

				socket.on("error", () => {
					resolve(false);
				});

				socket.on("timeout", () => {
					socket.destroy();
					resolve(false);
				});
			});
		} catch {
			return false;
		}
	}
}
