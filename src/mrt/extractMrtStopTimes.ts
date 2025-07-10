import fs from 'fs-extra';
import path from 'path';
import csv from 'csv-parser';
import { format } from '@fast-csv/format';

type StopTimeRow = {
	trip_id: string;
	arrival_time: string;
	departure_time: string;
	stop_id: string;
	stop_sequence: string;
	shape_dist_traveled: string;
};

const inputPath = path.join(__dirname, '../../data/original-gtfs/stop_times.txt');
const outputPath = path.join(__dirname, '../../data/output-gtfs/stop_times.txt');

const MRT_TRIP_ID_REGEX = /^[A-Z]{2}:WD:[01]$/;

function isMrtTripId(tripId: string): boolean {
	return MRT_TRIP_ID_REGEX.test(tripId);
}

export async function extractMrtStopTimes(): Promise<void> {
	const mrtStopTimes: StopTimeRow[] = [];

	await new Promise<void>((resolve, reject) => {
		fs.createReadStream(inputPath)
			.pipe(csv())
			.on('data', (row: StopTimeRow) => {
				if (isMrtTripId(row.trip_id)) {
					mrtStopTimes.push(row);
				}
			})
			.on('end', resolve)
			.on('error', reject);
	});

	if (mrtStopTimes.length === 0) {
		console.warn('⚠️ No MRT stop_times found to append.');
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
	mrtStopTimes.forEach(stopTime => csvStream.write(stopTime));
	csvStream.end();

	console.log(`✅ Appended ${mrtStopTimes.length} MRT stop_times to ${outputPath}`);
}
