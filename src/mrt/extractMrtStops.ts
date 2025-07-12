import fs from 'fs-extra';
import path from 'path';
import csv from 'csv-parser';
import { GtfsStop } from '../types/types';
import { format } from '@fast-csv/format';

const inputPath = path.join(__dirname, '../../data/original-gtfs/stops.txt');
const outputPath = path.join(__dirname, '../../data/output-gtfs/stops.txt');

// const MRT_STOP_ID_REGEX = /^[A-Z]{2}\d{1,2}(;[A-Z]{2}\d{1,2})*$/;

// function isMrtStop(stopId: string): boolean {
// 	return MRT_STOP_ID_REGEX.test(stopId);
// }

function splitMulticodeStop(stop: GtfsStop): GtfsStop[] {
	return stop.stop_id.split(';').map((id) => ({
		...stop,
		stop_id: id.trim()
	}));
}

export async function extractMrtStops(): Promise<void> {
	const mrtStops: GtfsStop[] = [];

	await new Promise<void>((resolve, reject) => {
		fs.createReadStream(inputPath)
			.pipe(csv())
			.on('data', (row: GtfsStop) => {
				mrtStops.push(...splitMulticodeStop(row));
				// if (isMrtStop(row.stop_id)) {
				// 	mrtStops.push(...splitMulticodeStop(row));
				// }
			})
			.on('end', resolve)
			.on('error', reject);
	});

	if (mrtStops.length === 0) {
		console.warn('⚠️ No MRT stops found to append.');
		return;
	}

	const fileExists = await fs.pathExists(outputPath);
	const contents = fileExists ? await fs.readFile(outputPath, 'utf-8') : '';
	const isEmpty = contents.trim().length === 0;

	const ws = fs.createWriteStream(outputPath, { flags: 'a' });

	if (!isEmpty) {
		ws.write('\n');
	}

	const csvStream = format({
		headers: isEmpty,
		delimiter: ','
	});

	csvStream.pipe(ws);
	mrtStops.forEach(stop => csvStream.write(stop));
	csvStream.end();

	console.log(`✅ Appended ${mrtStops.length} MRT stops to ${outputPath}`);
}
