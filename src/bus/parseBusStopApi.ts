import 'dotenv/config';
import { RawBusStop, GtfsStop } from '../types/types';
import path from 'path';
import fs from 'fs-extra';

const STOPS_URL = 'https://datamall2.mytransport.sg/ltaodataservice/BusStops';
const API_KEY = process.env.LTA_ACCOUNT_KEY!;

const cachePath = path.join(__dirname, './cache/data/bus_stops_cache.json');

export async function fetchAllBusStops(): Promise<RawBusStop[]> {
	const results: RawBusStop[] = [];

	for (let skip = 0; ; skip += 500) {
		const res = await fetch(`${STOPS_URL}?$skip=${skip}`, {
			headers: {
				AccountKey: API_KEY,
				accept: 'application/json'
			}
		});

		if (!res.ok) throw new Error(`Failed to fetch stops: ${res.statusText}`);
		const data = await res.json();
		const batch = data.value as RawBusStop[];

		results.push(...batch);
		if (batch.length < 500) break;
	}

	return results;
}

export async function fetchGtfsStops(): Promise<GtfsStop[]> {
    let rawStops: RawBusStop[];
	if (fs.existsSync(cachePath)) {
		console.log('⚡ Using cached stops from file');
		rawStops = await fs.readJson(cachePath);
	} else {
	    rawStops = await fetchAllBusStops();
    }

	return rawStops.map((stop) => ({
		stop_id: stop.BusStopCode,
		stop_name: stop.Description.trim() || stop.RoadName,
		stop_lat: stop.Latitude,
		stop_lon: stop.Longitude
	}));
}
