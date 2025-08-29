declare module "clamscan" {
	interface ClamScanOptions {
		removeInfected?: boolean;
		quarantineInfected?: boolean;
		scanLog?: string | null;
		debugMode?: boolean;
		fileList?: string | null;
		scanRecursively?: boolean;
		clamscan?: {
			path?: string;
			scanArchives?: boolean;
			active?: boolean;
		};
		clamdscan?: {
			socket?: string;
			host?: string;
			port?: number;
			timeout?: number;
			localFallback?: boolean;
			active?: boolean;
		};
	}

	interface ScanResult {
		isInfected: boolean;
		viruses?: string[];
		file?: string;
	}

	class NodeClam {
		constructor();
		init(options?: ClamScanOptions): Promise<NodeClam>;
		scanFile(path: string): Promise<ScanResult>;
		scanDir(path: string): Promise<ScanResult>;
	}

	export = NodeClam;
}
