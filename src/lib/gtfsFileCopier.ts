// src/utils/GtfsFileCopier.ts
import fs from 'fs-extra';
import path from 'path';

export class GtfsExtrasFileCopier {
	constructor(
		private readonly srcDir: string,
		private readonly destDir: string
	) {}

	public async copyStaticFiles(): Promise<void> {
		const filesToCopy = ['agency.txt', 'calendar.txt', 'shapes.txt'];

		await Promise.all(
			filesToCopy.map(async (file) => {
				const srcPath = path.join(this.srcDir, file);
				const destPath = path.join(this.destDir, file);

				if (!(await fs.pathExists(srcPath))) {
					console.warn(`⚠️  File not found: ${srcPath}`);
					return;
				}

				await fs.copy(srcPath, destPath);
				console.log(`✅ Copied ${file} to output`);
			})
		);
	}
}
