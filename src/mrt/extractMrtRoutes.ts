import fs from 'fs-extra';
import path from 'path';
import csv from 'csv-parser';
import { format } from '@fast-csv/format';

type RouteRow = {
	route_id: string;
	route_short_name: string;
	route_long_name: string;
	route_type: string;
};

const inputPath = path.join(__dirname, '../../data/original-gtfs/routes.txt');
const outputPath = path.join(__dirname, '../../data/output-gtfs/routes.txt');

export async function extractMrtRoutes() {
	return new Promise<void>((resolve, reject) => {
		const mrtRoutes: RouteRow[] = [];

		fs.createReadStream(inputPath)
			.pipe(csv())
			.on('data', (row: RouteRow) => {
				const type = parseInt(row.route_type);
				if (type !== 3) {
					mrtRoutes.push({
						route_id: row.route_id,
						route_short_name: row.route_short_name || row.route_id,
						route_long_name: row.route_long_name,
						route_type: row.route_type
					});
				}
			})
			.on('end', async () => {
				const fileExists = await fs.pathExists(outputPath);
				const contents = fileExists ? await fs.readFile(outputPath, 'utf-8') : '';
				const isEmpty = contents.trim().length === 0;

				const ws = fs.createWriteStream(outputPath, { flags: 'a' });

				if (!isEmpty) {
					ws.write('\n');
				}

				const csvStream = format({ headers: isEmpty, delimiter: ',' });

				csvStream.pipe(ws);
				mrtRoutes.forEach((r) => csvStream.write(r));
				csvStream.end();

				console.log(`✅ Appended ${mrtRoutes.length} MRT routes to ${outputPath}`);
				resolve();
			})
			.on('error', reject);
	});
}