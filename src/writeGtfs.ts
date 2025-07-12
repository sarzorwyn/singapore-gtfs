import fs from 'fs-extra';
import path from 'path';
import { format } from '@fast-csv/format';
import { GtfsFrequency, GtfsRoute, GtfsStop, GtfsStopTime, GtfsTrip } from './types/types';

export async function writeGtfsFiles(data: {
	routes: GtfsRoute[];
	trips: GtfsTrip[];
	stops: GtfsStop[];
	stopTimes: GtfsStopTime[];
	freqs: GtfsFrequency[];
}) {
	await writeCsv('routes.txt', data.routes, [
		'route_id',
		'agency_id',
		'route_short_name',
		'route_type'
	]);

    await writeCsv('trips.txt', data.trips, [
        'trip_id',
		'shape_id',
        'route_id',
        'service_id',
        'direction_id'
    ]);

	await writeCsv('stops.txt', data.stops, [
		'stop_id',
		'stop_name',
		'stop_lat',
		'stop_lon'
	]);

	await writeCsv('stop_times.txt', data.stopTimes, [
		'trip_id',
		'arrival_time',
		'departure_time',
		'stop_id',
		'stop_sequence',
		'shape_dist_traveled'
	]);

	await writeCsv('frequencies.txt', data.freqs, [
		'trip_id',
		'start_time',
		'end_time',
		'headway_secs'
	]);
}

async function writeCsv<T>(filename: string, rows: T[], headers: string[]) {
	const outputPath = path.join(__dirname, '../data/output-gtfs', filename);
	const ws = fs.createWriteStream(outputPath);
	const csvStream = format({ headers }); // defaults to comma

	csvStream.pipe(ws);
	rows.forEach((row) => csvStream.write(row));
	csvStream.end();

	return new Promise<void>((resolve, reject) => {
		ws.on('finish', resolve);
		ws.on('error', reject);
	});
}