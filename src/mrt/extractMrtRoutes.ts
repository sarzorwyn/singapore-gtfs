// src/extractMrtRoutes.ts
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { format } from '@fast-csv/format';

type RouteRow = {
	route_id: string;
	route_short_name: string;
	route_long_name: string;
	route_type: string; // string from CSV, will parseInt
};

const inputPath = path.join(__dirname, '../data/original-gtfs/routes.txt');
const outputPath = path.join(__dirname, '../data/output-gtfs/mrt_routes.txt');

async function extractMrtRoutes() {
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
			.on('end', () => {
				const ws = fs.createWriteStream(outputPath);
				const csvStream = format({ headers: ['route_id', 'route_short_name', 'route_long_name', 'route_type'], delimiter: '\t' });

				csvStream.pipe(ws);
				mrtRoutes.forEach((r) => csvStream.write(r));
				csvStream.end();

				console.log('✅ MRT routes written to', outputPath);
				resolve();
			})
			.on('error', reject);
	});
}

extractMrtRoutes().catch(console.error);
