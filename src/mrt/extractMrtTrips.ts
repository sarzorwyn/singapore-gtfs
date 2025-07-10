import fs from 'fs-extra';
import path from 'path';
import csv from 'csv-parser';
import { format } from '@fast-csv/format';
import { GtfsTrip } from '../types/types';


const inputPath = path.join(__dirname, '../../data/original-gtfs/trips.txt');
const outputPath = path.join(__dirname, '../../data/output-gtfs/trips.txt');

const MRT_TRIP_ID_REGEX = /^[A-Z]{2}:WD:[01]$/;

function isMrtTrip(tripId: string): boolean {
	return MRT_TRIP_ID_REGEX.test(tripId);
}

export async function extractMrtTrips(): Promise<void> {
	const mrtTrips: GtfsTrip[] = [];

	await new Promise<void>((resolve, reject) => {
		fs.createReadStream(inputPath)
			.pipe(csv())
			.on('data', (row: GtfsTrip) => {
				if (isMrtTrip(row.trip_id)) {
					mrtTrips.push(row);
				}
			})
			.on('end', resolve)
			.on('error', reject);
	});

	if (mrtTrips.length === 0) {
		console.warn('⚠️ No MRT trips found to append.');
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
	mrtTrips.forEach(trip => csvStream.write(trip));
	csvStream.end();

	console.log(`✅ Appended ${mrtTrips.length} MRT trips to ${outputPath}`);
}