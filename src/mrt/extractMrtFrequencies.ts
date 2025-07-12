import fs from 'fs-extra';
import path from 'path';
import csv from 'csv-parser';
import { format } from '@fast-csv/format';

type FrequencyRow = {
	trip_id: string;
	start_time: string;
	end_time: string;
	headway_secs: string;
};

const inputPath = path.join(__dirname, '../../data/original-gtfs/frequencies.txt');
const outputPath = path.join(__dirname, '../../data/output-gtfs/frequencies.txt');

const MRT_TRIP_ID_REGEX = /^[A-Z]{2}:WD:[01]$/;

function isMrtTripId(tripId: string): boolean {
	return MRT_TRIP_ID_REGEX.test(tripId);
}

export async function extractMrtFrequencies(): Promise<void> {
	const mrtFrequencies: FrequencyRow[] = [];

	await new Promise<void>((resolve, reject) => {
		fs.createReadStream(inputPath)
			.pipe(csv())
			.on('data', (row: FrequencyRow) => {
				if (isMrtTripId(row.trip_id)) {
					mrtFrequencies.push(row);
				}
			})
			.on('end', resolve)
			.on('error', reject);
	});

	if (mrtFrequencies.length === 0) {
		console.warn('⚠️ No MRT frequencies found to append.');
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
	mrtFrequencies.forEach(freq => csvStream.write(freq));
	csvStream.end();

	console.log(`✅ Appended ${mrtFrequencies.length} MRT frequencies to ${outputPath}`);
}